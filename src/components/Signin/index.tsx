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
import { store, clearLoginData, setIsWalletLogin, disconnect } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import GoogleIcon from '@/assets/icons/google.svg';
import AppleIcon from '@/assets/icons/apple.svg';
import WalletIcon from '@/assets/icons/walletIcon.svg';
import {useLanguage} from "@/contexts/LanguageContext";
import CloseIcon from "@/assets/icons/close_1.svg";

export default () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const currentAccount = useCurrentAccount();
  const [openDown, setOpenDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const { isConnecting } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const pathname = usePathname();
  const zkLoginData = useSelector((state: any) => state.zkLoginData);

  const checkSignandSignin = async (address: string) => {
    try {
      if(localStorage.getItem('rwa-token-'+address)){
        return
      }
      const result: any = await apiService.getLoginNonce({ address: address });
      console.log('result', result)
      const signMessage = result.data;
      console.log('Message to sign:', signMessage);
      //zkLogin 签名交易兼容
      const zkLoginData = store.getState().zkLoginData;
      if(zkLoginData){
        const ephemeralKeyPairSecret = zkLoginData.ephemeralKeyPairSecret;
        if (!ephemeralKeyPairSecret) {
          throw new Error('Ephemeral key pair not found');
        }
        const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(ephemeralKeyPairSecret);
        console.log('ephemeralKeyPair', ephemeralKeyPair.getPublicKey().toSuiAddress())
        const signature = await ephemeralKeyPair.signPersonalMessage(new TextEncoder().encode(signMessage));
        const aud = Array.isArray(zkLoginData.aud) ? zkLoginData.aud[0] : zkLoginData.aud;
        const addressSeed = genAddressSeed(zkLoginData.salt, "sub", zkLoginData.sub, aud).toString();
        const zkLoginSignature = getZkLoginSignature({
          inputs: {
            ...zkLoginData.zkproof,
            addressSeed,
          },
          maxEpoch: zkLoginData.maxEpoch,
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
        const data:any = await apiService.zkLoginBySign({
          address: address,
          zkLoginAccount: zkLoginData.email,
          originalMessage: signMessage,
          signedMessage: zkLoginSignature,
          chain: 'onechain',
          chainNet: Number(process.env.UMI_APP_IS_MAINNET) ? 'mainnet' : 'testnet'
        });
        console.log('data', data)

        localStorage.setItem('rwa-token-'+address, data.data.token);


      } else {
        signPersonalMessage({
            message: new TextEncoder().encode(signMessage),
          },
          {
            onSuccess: async (result: any) => {
              console.log('signature', result.signature);
              console.log('result', result);
              const data:any = await apiService.loginBySign({ address: address, originalMessage: signMessage, signedMessage:result.signature });
              console.log('data', data.data.token)
              localStorage.setItem('rwa-token-'+address, data.data.token);
            }
          });
      }

    } catch (error) {
      console.error('Failed to check sign and signin:', error);
    }
  };

  // Check whitelist when wallet connects
  useEffect(() => {
    if (currentAccount?.address || store.getState().zkLoginData?.zkloginUserAddress) {
      checkSignandSignin(currentAccount?.address || store.getState().zkLoginData?.zkloginUserAddress);
    }
  }, [currentAccount?.address, store.getState().zkLoginData?.zkloginUserAddress, pathname]);

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
      setOpen(false)
      setOpenLoading(false)
    }
  },[zkLoginData, currentAccount ])
  // 检测当前网络
  const checkNetwork = useCallback(async (currentAccount: any) => {
    try {
      if (currentAccount.chains.length > 0 && currentAccount.chains[0] !== rightNetwork) {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
      }
    } catch (error) {
      console.error('Failed to get network info:', error);
    }
  }, [currentAccount]);

  // 组件加载时检测网络
  useEffect(() => {
    if (currentAccount) {
      console.log('currentAccount', currentAccount);
      checkNetwork(currentAccount);
    }
  }, [currentAccount?.chains]);

  useEffect(()=>{
    if(zkLoginData){
      setOpenDropdown(false)
    }
  },[pathname])

  const handleCopyAddress = () => {
    if (currentAccount?.address) {
      onCopyToText(currentAccount.address);
    }
  };

  return (
    <div className="signin-area">
      {
        zkLoginData || currentAccount ? (
          <div  onMouseEnter={() => {
            (currentAccount || zkLoginData) && setOpenDropdown(true)
          }}
                onMouseLeave={() => {
                  setTimeout(() => {
                    setOpenDropdown(false)
                  }, 200)
                }}>
            <button className="signin-btn trans-btn p-l-24 p-r-24 cf fwb pointer flex flex-center gap-10 m-h-30 m-fz-12 m-p-l-12 m-p-r-12" onClick={()=>{
              if(currentAccount){
                handleCopyAddress()
              }
            }}>
              {zkLoginData ? ( zkLoginData?.provider === 'google' ? <GoogleIcon /> : <AppleIcon />) : <WalletIcon />}
              {/*<img src={zkLoginData ? ( zkLoginData?.provider === 'google' ? googleIcon : appleIcon) : walletIcon} alt="" className='w-20 h-20 m-w-16 m-h-16' />*/}
              {(zkLoginData && zkLoginData?.email) ?(addPoint(zkLoginData?.email,3)): addPoint(currentAccount?.address as string)}
              {
                currentAccount &&
                <img
                  className="wallet-copy pointer"
                  src={copyIcon}
                  alt=""
                  title={t('header.copyAddress')}
                />}
            </button>
            {
              openDown ? <div className={`signin-dropdown-menu`}>
                {
                  zkLoginData && (
                    <div className="dropdown-menu-title flex flex-center gap-16">
                      {zkLoginData?.provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
                      {/*<img src={ zkLoginData?.provider === 'google' ? googleIcon : appleIcon} alt="" className='w-20 h-20 m-w-16 m-h-16' />*/}
                      <div className='flex flex-column gap-5'>
                        {zkLoginData?.email ? <span className='m-fz-12 fz-14 cf fwb'>{zkLoginData?.email}</span>:''}
                        <span style={{ cursor: 'pointer' }} onClick={()=>{
                          if(zkLoginData?.zkloginUserAddress){
                            onCopyToText(zkLoginData?.zkloginUserAddress)
                          }
                        }} className='m-fz-12 fz-14 cf flex flex-center gap-5'>{addPoint(zkLoginData?.zkloginUserAddress)}
                          <img src={copyIcon} alt="" className='w-16 h-16 m-w-12 m-h-12 pointer' />
                            </span>
                      </div>
                    </div>
                  )
                }
                <div className="dropdown-menu-list">
                  <Link href="/wallet">
                    <div className="dropdown-menu-item flex align-center m-fz-12">
                      <img src={walletIcon} alt="wallet" className="dropdown-menu-icon" />
                      <span>{t('header.menu')}</span>
                    </div>
                  </Link>
                  {/* <div className="dropdown-menu-item flex align-center">
                  <img src={settingIcon} alt="setting" className="dropdown-menu-icon" />
                  <span>Setting</span>
                </div> */}
                  <Link href="/profile">
                    <div className="dropdown-menu-item flex align-center m-fz-12">
                      <img src={profitIcon} alt="profit" className="dropdown-menu-icon" />
                      <span>{t('profit.title')}</span>
                    </div>
                  </Link>
                </div>
                <div className="dropdown-menu-divider"></div>
                <div className="dropdown-menu-disconnect flex align-center flex-center flex-middle m-fz-12" onClick={()=>{
                  if(zkLoginData){
                    dispatch(clearLoginData())
                    disconnect()
                    window.location.reload()
                  }else{
                    disconnect()
                  }
                }}>
                  <img src={disconnectIcon} alt="disconnect" className="dropdown-menu-icon blue" />
                  <span className="blue">{t('header.disconnect')}</span>
                </div>
              </div> : ''
            }

          </div>
        ) : <button className="ml-[8px] h-[36px] px-[24px] bg-[#467DFF] text-[16px] text-white opacity-50 hover:opacity-100 rounded-[20px] font-medium transition-all duration-200" id="connect-wallet-btn" onClick={() => setOpen(true)}>
          {t('header.signIn')}
        </button>
      }

      <Dialog open={open}>
        <DialogContent className="max-w-[400px] w-full p-[24px] bg-[#051A3D] border-none overflow-hidden rounded-[16px] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between">
            <span className='inline-block h-[16px] leading-[16px] text-[24px] text-white font-bold'>{t('header.signIn')}</span>
            <CloseIcon className="text-[16px] text-white/40 hover:text-white cursor-pointer" onClick={() => setOpen(false)} />
          </div>
          <div className="mt-[24px] h-[16px] leading-[16px] text-[12px] text-white/60">{t('header.desc')}</div>
          <div className="mt-[24px]">
            <Zklogin onJump={() => {
              setOpen(false)
              setOpenLoading(true)
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
}
