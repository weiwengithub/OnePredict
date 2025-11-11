import React, { useState, useEffect, useCallback } from 'react';
import './index.scss';
import walletIcon from '@/assets/icons/walletIcon.svg';
import profitIcon from '@/assets/icons/profit.svg';
import disconnectIcon from '@/assets/icons/disconnect.svg';
import copyIcon from '@/assets/icons/link.svg';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSignPersonalMessage,
  useSuiClient,
  useWallets,
} from "@onelabs/dapp-kit";
import { genAddressSeed, getZkLoginSignature, parseZkLoginSignature} from '@onelabs/sui/zklogin';
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { addPoint, onCopyToText } from '@/lib/utils';
import apiService from "@/lib/api/services";
import { rightNetwork } from '@/assets/config';
import Zklogin from '../Zklogin';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ConnectWallet from '../ConnectWallet';
import Loading from '../Loading';
import {
  store,
  clearLoginData,
  setSigninOpen,
  setSigninLoading,
  setMemberId,
  setUsdhBalance,
  setUserInfo
} from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import GoogleIcon from '@/assets/icons/google.svg';
import AppleIcon from '@/assets/icons/apple.svg';
import WalletIcon from '@/assets/icons/walletIcon.svg';
import {useLanguage} from "@/contexts/LanguageContext";
import CloseIcon from "@/assets/icons/close_1.svg";
import ProfileIcon from '@/assets/icons/profile.svg';
import SettingsIcon from '@/assets/icons/settings.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import ArrowDownIcon from '@/assets/icons/arrowDown.svg';
import { ZkLoginData, CurrentAccount, RootState, ApiResult, LoginResponse } from "@/lib/interface";
import CopyIcon from "@/assets/icons/copy_1.svg";
import {useIsMobile} from "@/contexts/viewport";
import {toast} from "sonner";

const Signin = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const currentAccount = useCurrentAccount();

  const [openDown, setOpenDropdown] = useState(false);
  const open = useSelector((s: RootState) => s.signinModal.open)
  const openLoading = useSelector((s: RootState) => s.signinModal.openLoading)
  const { isConnecting } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const pathname = usePathname();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);

  const checkSignandSignin = useCallback(async (address: string) => {
    try {
      if(localStorage.getItem('predict-token-'+address)){
        return
      }
      const result: LoginResponse = await apiService.getLoginNonce({ address: address });
      console.log('result', result)
      const signMessage = result.data as string;
      console.log('Message to sign:', signMessage);
      //zkLogin 签名交易兼容
      const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
      if(zkLoginData){
        const ephemeralKeyPairSecret = (zkLoginData as any).ephemeralKeyPairSecret;
        if (!ephemeralKeyPairSecret) {
          throw new Error('Ephemeral key pair not found');
        }
        const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(ephemeralKeyPairSecret);
        console.log('ephemeralKeyPair', ephemeralKeyPair.getPublicKey().toSuiAddress())
        const signature = await ephemeralKeyPair.signPersonalMessage(new TextEncoder().encode(signMessage));
        const aud = Array.isArray((zkLoginData as any).aud) ? (zkLoginData as any).aud[0] : (zkLoginData as any).aud;
        const addressSeed = genAddressSeed((zkLoginData as any).salt, "sub", (zkLoginData as any).sub, aud).toString();
        const zkLoginSignature = getZkLoginSignature({
          inputs: {
            ...(zkLoginData as any).zkproof,
            addressSeed,
          },
          maxEpoch: (zkLoginData as any).maxEpoch,
          userSignature:signature.signature
        });

        const {data} = await apiService.memberLogin({
          address: address,
          zkLoginAccount: (zkLoginData as any).email,
          originalMessage: signMessage,
          signedMessage: zkLoginSignature,
          chain: 'onechain',
          chainNet: Number(process.env.NEXT_PUBLIC_IS_MAINNET) ? 'mainnet' : 'testnet'
        });
        console.log('data', data)
        store.dispatch(setMemberId(data.memberId));
        localStorage.setItem('predict-token-'+address, data.token);

        getUserInfo(data.memberId.toString(), address)

      } else {
        signPersonalMessage({
            message: new TextEncoder().encode(signMessage),
          },
          {
            onSuccess: async (result: { signature: string }) => {
              console.log('signature', result.signature);
              console.log('result', result);
              const {data} = await apiService.memberLogin({
                address: address,
                originalMessage: signMessage,
                signedMessage:result.signature,
                zkLoginAccount: null,
                chain: 'onechain',
                chainNet: Number(process.env.UMI_APP_IS_MAINNET) ? 'mainnet' : 'testnet'
              });
              store.dispatch(setMemberId(data.memberId));
              localStorage.setItem('predict-token-'+address, data.token);

              getUserInfo(data.memberId.toString(), address)
            }
          });
      }
      toast.success(t('header.signSuccess'))
    } catch (error) {
      console.error('Failed to check sign and signin:', error);
      toast.error(t('header.signFailure'));
    }
  }, [signPersonalMessage]);

  const getUserInfo = async (memberId: string, address: string) => {
    try {
      const { data } = await apiService.getMemberCenter({memberId, address});
      store.dispatch(setUserInfo({
        nickName: data.nickName || '',
        avatar: data.avatar || '',
        loginAddress: address
      }));
      console.log(data)
    } catch (e) {
      console.log(e)
    }
  }

  // Check whitelist when wallet connects
  useEffect(() => {
    const zkData = store.getState().zkLoginData as any;
    if (currentAccount?.address || zkData?.zkloginUserAddress) {
      checkSignandSignin(currentAccount?.address || zkData?.zkloginUserAddress);
    }
  }, [currentAccount?.address, pathname, checkSignandSignin, zkLoginData]);

  // 禁止背景滚动
  useEffect(() => {
    if (open || openLoading) {
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open, openLoading]);

  useEffect(()=>{
    if(zkLoginData || currentAccount){
      dispatch(setSigninOpen(false))
      dispatch(setSigninLoading(false))
    }
  },[zkLoginData, currentAccount])
  // 检测当前网络
  const checkNetwork = useCallback(async (currentAccount: CurrentAccount) => {
    try {
      if (currentAccount.chains.length > 0 && currentAccount.chains[0] !== rightNetwork) {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
      }
    } catch (error) {
      console.error('Failed to get network info:', error);
    }
  }, []);

  // 组件加载时检测网络
  useEffect(() => {
    if (currentAccount) {
      console.log('currentAccount', currentAccount);
      checkNetwork(currentAccount);
    }
  }, [currentAccount, checkNetwork]);

  useEffect(()=>{
    if(zkLoginData){
      setOpenDropdown(false)
    }
  },[zkLoginData, pathname])

  const handleCopyAddress = () => {
    if (currentAccount?.address) {
      onCopyToText(currentAccount.address);
    }
  };

  return (
    <div className="signin-area">
      {
        zkLoginData || currentAccount ? (
          <>
            {isMobile ? (
              <></>
              // <div className="flex-none flex items-center justify-between gap-[12px]">
              //   <div className="text-[48px]">
              //     {zkLoginData ? ( (zkLoginData as any)?.provider === 'google' ? <GoogleIcon /> : <AppleIcon />) : <WalletIcon />}
              //   </div>
              //   <div className="flex-1">
              //     {zkLoginData ? (
              //       <div className="leading-[20px] text-[18px] text-white font-bold">{(zkLoginData as any)?.provider === 'google' ? zkLoginData.email : ''}</div>
              //     ) : (
              //       <div className="leading-[20px] text-[18px] text-white font-bold">Wallet address</div>
              //     ) }
              //     <div className="mt-[4px] flex leading-[16px] text-[14px] text-white/60 font-bold">
              //       <span>{addPoint(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')}</span>
              //       <CopyIcon className="ml-[4px] cursor-pointer hover:text-white" onClick={() => onCopyToText(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')} />
              //     </div>
              //   </div>
              // </div>
            ) : (
              <div
                onMouseEnter={() => {
                  if (currentAccount || zkLoginData) {
                    setOpenDropdown(true);
                  }
                }}
                onMouseLeave={() => {
                  setTimeout(() => {
                    setOpenDropdown(false)
                  }, 200)
                }}
              >
                <button className="flex items-center gap-[12px] h-[36px] border border-white/60 text-white
                  hover:border-white rounded-[20px] px-[16px] cursor-pointer transition-all duration-200
                  hover:bg-white/5" onClick={()=>{
                  if(currentAccount){
                    handleCopyAddress()
                  }
                }}>
                  {zkLoginData ? ( (zkLoginData as any)?.provider === 'google' ? <GoogleIcon /> : <AppleIcon />) : <WalletIcon />}
                  {(zkLoginData && zkLoginData?.email) ?(addPoint(zkLoginData?.email,3)): addPoint(currentAccount?.address || zkLoginData?.zkloginUserAddress as string,3)}
                  <ArrowDownIcon className="text-[16px] text-white/60" />
                </button>
                {
                  openDown ? (
                    <div className="absolute top-[36px] w-full pt-[14px]">
                      <div className="bg-[#04122B] rounded-[16px] p-[12px] space-y-[12px]">
                        <Link href={`/profile?memberId=${store.getState().memberId}`} className="inline-block w-full">
                          <div className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10">
                            <ProfileIcon />
                            <span className="inline-block ml-[12px] h-[16px] leading-[16px]">{t('header.profile')}</span>
                          </div>
                        </Link>
                        <Link href="/setting" className="inline-block w-full">
                          <div className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10">
                            <SettingsIcon />
                            <span className="inline-block ml-[12px] h-[16px] leading-[16px]">{t('header.settings')}</span>
                          </div>
                        </Link>
                        <Link href="#" className="inline-block w-full">
                          <div
                            className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10"
                            onClick={() => {
                              try {
                                dispatch(clearLoginData())
                                disconnect()
                                toast.success(t('header.logoutSuccess'))
                                store.dispatch(setMemberId(0));
                                const address = currentAccount?.address || zkLoginData?.zkloginUserAddress
                                localStorage.removeItem('predict-token-'+ address);
                                store.dispatch(setUserInfo({
                                  nickName: '',
                                  avatar: '',
                                  loginAddress: ''
                                }));
                                store.dispatch(setUsdhBalance({
                                  balance: '0.00',
                                  rawBalance: '0',
                                }));
                                router.push('/');
                              } catch (error) {
                                toast.error(t('header.logoutError'))
                              }
                            }}
                          >
                            <LogoutIcon />
                            <span className="inline-block ml-[12px] h-[16px] leading-[16px]">{t('header.logout')}</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ) : ''
                }
              </div>
            )}
          </>
        ) : <button
          className={`ml-[8px] ${isMobile ? 'h-[24px] text-[12px] px-[11px] ml-[16px]' : 'h-[36px] text-[16px] px-[24px]'} bg-[#467DFF] text-white opacity-100 hover:opacity-50 rounded-[20px] font-medium transition-all duration-200`}
          id="connect-wallet-btn"
          onClick={() => dispatch(setSigninOpen(true))}
        >
          {t('header.signIn')}
        </button>
      }

      <Dialog open={open}>
        <DialogContent className={`max-w-[400px] w-full p-[24px] bg-[#051A3D] border-none overflow-hidden rounded-[16px] shadow-2xl shadow-black/50 ${isMobile ? "left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none" : ""}`}>
          <div className="flex items-center justify-between">
            <span className='inline-block h-[16px] leading-[16px] text-[24px] text-white font-bold'>{t('header.signIn')}</span>
            <CloseIcon className="text-[16px] text-white/40 hover:text-white cursor-pointer" onClick={() => dispatch(setSigninOpen(false))} />
          </div>
          <div className="mt-[36px]">
            <Zklogin onJump={() => {
              dispatch(setSigninOpen(false))
              dispatch(setSigninLoading(true))
            }}/>

            <div className="my-[12px] h-[16px] leading-[16px] text-[16px] text-white text-center">{t('header.or')}</div>

            <ConnectWallet />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openLoading}>
        <DialogContent className="max-w-[400px] w-full p-0 bg-[#141924] border border-[#363071]/50 overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          <div className="signin-modal-title w100 flex flex-center">
            <span className='fz-18 fwb cf ta w100 flex flex-center flex-middle gap-10 flex-column'>
              <Loading type='spinner'/>
              {t('header.connectingGoogle')}
              </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

Signin.displayName = 'Signin';

export default Signin;
