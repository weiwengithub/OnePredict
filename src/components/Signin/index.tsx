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
import { store, clearLoginData, setSigninOpen, setSigninLoading } from '@/store';
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

const Signin = () => {
  const { t } = useLanguage();
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
      if(localStorage.getItem('rwa-token-'+address)){
        return
      }
      const result: LoginResponse = await apiService.getLoginNonce({ address: address });
      console.log('result', result)
      const signMessage = (result.data as { data: string }).data;
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
        // let address = await verifyPersonalMessageSignature(new TextEncoder().encode(signMessage), signature.signature);
        // console.log('address', address.toSuiAddress())

        // console.log('zkLoginSignature', zkLoginSignature)
        // let r = parseZkLoginSignature(zkLoginSignature);
        // console.log('r', r)
        // transport.request({
        //     method: 'sui_verifyZkLoginSignature',
        //     params: [
        //             toB64(new TextEncoder().encode(signMessage)),
        //             zkLoginSignature,
        //             'PersonalMessage',
        //             address
        //     ]
        // });
        const data: ApiResult = await apiService.zkLoginBySign({
          address: address,
          zkLoginAccount: (zkLoginData as any).email,
          originalMessage: signMessage,
          signedMessage: zkLoginSignature,
          chain: 'onechain',
          chainNet: Number(process.env.NEXT_PUBLIC_IS_MAINNET) ? 'mainnet' : 'testnet'
        });
        console.log('data', data)

        localStorage.setItem('rwa-token-'+address, (data.data as any).token);


      } else {
        signPersonalMessage({
            message: new TextEncoder().encode(signMessage),
          },
          {
            onSuccess: async (result: { signature: string }) => {
              console.log('signature', result.signature);
              console.log('result', result);
              const data: ApiResult = await apiService.loginBySign({ address: address, originalMessage: signMessage, signedMessage:result.signature });
              console.log('data', (data.data as any).token)
              localStorage.setItem('rwa-token-'+address, (data.data as any).token);
            }
          });
      }

    } catch (error) {
      console.error('Failed to check sign and signin:', error);
    }
  }, [signPersonalMessage]);

  // Check whitelist when wallet connects
  // useEffect(() => {
  //   const zkData = store.getState().zkLoginData as any;
  //   if (currentAccount?.address || zkData?.zkloginUserAddress) {
  //     checkSignandSignin(currentAccount?.address || zkData?.zkloginUserAddress);
  //   }
  // }, [currentAccount?.address, pathname, checkSignandSignin]);

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
                    {/*<Link href="/profile" className="inline-block w-full">*/}
                    {/*  <div className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10">*/}
                    {/*    <ProfileIcon />*/}
                    {/*    <span className="inline-block ml-[12px] h-[16px] leading-[16px]">{t('header.profile')}</span>*/}
                    {/*  </div>*/}
                    {/*</Link>*/}
                    {/*<Link href="/setting" className="inline-block w-full">*/}
                    {/*  <div className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10">*/}
                    {/*    <SettingsIcon />*/}
                    {/*    <span className="inline-block ml-[12px] h-[16px] leading-[16px]">{t('header.settings')}</span>*/}
                    {/*  </div>*/}
                    {/*</Link>*/}
                    <Link href="#" className="inline-block w-full">
                      <div
                        className="flex px-[12px] py-[8px] text-[16px] text-white rounded-[8px] hover:bg-white/10"
                        onClick={() => {
                          if(zkLoginData){
                            dispatch(clearLoginData())
                            disconnect()
                            window.location.reload()
                          }else{
                            disconnect()
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
        ) : <button className="ml-[8px] h-[36px] px-[24px] bg-[#467DFF] text-[16px] text-white opacity-50 hover:opacity-100 rounded-[20px] font-medium transition-all duration-200" id="connect-wallet-btn" onClick={() => dispatch(setSigninOpen(true))}>
          {t('header.signIn')}
        </button>
      }

      <Dialog open={open}>
        <DialogContent className="max-w-[400px] w-full p-[24px] bg-[#051A3D] border-none overflow-hidden rounded-[16px] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between">
            <span className='inline-block h-[16px] leading-[16px] text-[24px] text-white font-bold'>{t('header.signIn')}</span>
            <CloseIcon className="text-[16px] text-white/40 hover:text-white cursor-pointer" onClick={() => dispatch(setSigninOpen(false))} />
          </div>
          <div className="mt-[24px] h-[16px] leading-[16px] text-[12px] text-white/60">{t('header.desc')}</div>
          <div className="mt-[24px]">
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
