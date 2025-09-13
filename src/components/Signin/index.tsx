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
  useSuiClient,
  useWallets,
} from "@onelabs/dapp-kit";
import { addPoint, onCopyToText } from '@/assets/util';
import { rightNetwork } from '@/assets/config';
import Zklogin from '../Zklogin';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ConnectWallet from '../ConnectWallet';
import Loading from '../Loading';
import googleIcon from '@/assets/icons/google.svg';
import { clearLoginData,  setIsWalletLogin } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import {useLanguage} from "@/contexts/LanguageContext";

export default () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const currentAccount = useCurrentAccount();
  const [openDown, setOpenDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const { isConnecting } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const pathname = usePathname();
  const zkLoginData = useSelector((state: any) => state.zkLoginData);
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
                  <img src={zkLoginData ? googleIcon : walletIcon} alt="" className='w-20 h-20 m-w-16 m-h-16' />
                  {zkLoginData ? (addPoint(zkLoginData?.email,3)) : addPoint(currentAccount?.address as string)}
                  {
                    currentAccount && 
                  <img
                    className="wallet-copy pointer"
                    src={copyIcon}
                    alt=""
                    title={t('wallet.copyAddress')}
                  />}
                </button>
                {
                  openDown ? <div className="signin-dropdown-menu">
                    {
                      zkLoginData && (
                        <div className="dropdown-menu-title flex flex-center gap-16">
                          <img src={googleIcon} alt="" className='w-20 h-20 m-w-16 m-h-16' />
                          <div className='flex flex-column gap-5'>
                            <span className='m-fz-12 fz-14 cf fwb'>{zkLoginData?.email}</span>
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
                          <span>{t('wallet.menu')}</span>
                        </div>
                      </Link>
                      {/* <div className="dropdown-menu-item flex align-center">
                  <img src={settingIcon} alt="setting" className="dropdown-menu-icon" />
                  <span>Setting</span>
                </div> */}
                      <Link href="/profit">
                        <div className="dropdown-menu-item flex align-center m-fz-12">
                          <img src={profitIcon} alt="profit" className="dropdown-menu-icon" />
                          <span>{t('profit.title')}</span>
                        </div>
                      </Link>
                    </div>
                    <div className="dropdown-menu-divider"></div>
                    <div className="dropdown-menu-disconnect align-center flex flex-center flex-middle m-fz-12" onClick={()=>{
                      if(zkLoginData){
                        dispatch(clearLoginData())
                        disconnect()
                        window.location.reload()
                      }else{
                        disconnect()
                      }
                    }}>
                      <img src={disconnectIcon} alt="disconnect" className="dropdown-menu-icon blue" />
                      <span className="blue">{t('common.disconnect')}</span>
                    </div>
                  </div> : ''
                }

              </div>
       ) : <button className="signin-btn p-l-24 p-r-24 cf fwb pointer m-h-30 m-fz-12 m-p-l-12 m-p-r-12" id="connect-wallet-btn" onClick={() => setOpen(true)}>
       {t('signin.signIn')}
     </button>
      }

      <Dialog open={open}>
        <DialogContent className="max-w-[400px] w-full p-0 bg-[#141924] border border-[#363071]/50 overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          <div className="signin-modal-title w100 flex flex-center">
            <span className='fz-24 fwb cf ta w100 flex flex-center'>{t('signin.signIn')}</span>
          </div>
          <div className="signin-modal-desc w100 flex flex-center m-t-10">
            <span className='fz-12 cf06 ta w100 flex flex-center '>{t('signin.desc')}</span>
          </div>
          <div className="signin-modal-content-body w100 p-t-20 p-b-20 gap-10 flex flex-center flex-column w100">
            <Zklogin onJump={() => {
              setOpen(false)
              setOpenLoading(true)
            }}/>
            <div className="signin-modal-content-body-line w100 flex flex-center flex-middle w100">
              <div className="signin-modal-content-body-line-text w100 flex flex-middle gap-10 cf w100">
                {/* <span>——</span> */}
                <span className='m-fz-12 cf ta'>{t('signin.or')}</span>
                {/* <span>——</span> */}
              </div>
            </div>

            <ConnectWallet />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openLoading}>
        <DialogContent className="max-w-[400px] w-full p-0 bg-[#141924] border border-[#363071]/50 overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          <div className="signin-modal-title w100 flex flex-center">
            <span className='fz-18 fwb cf ta w100 flex flex-center flex-middle gap-10 flex-column'>
              <Loading type='spinner'/>
              {t('signin.connectingGoogle')}
              </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
