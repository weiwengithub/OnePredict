"use client";

import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import Avatar from 'boring-avatars';
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/ImageUploader";
import HomeIcon from "@/assets/icons/home.svg";
import ExportIcon from "@/assets/icons/export.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import UserIcon from "@/assets/icons/user.svg";
import WarningIcon from "@/assets/icons/warning.svg";
import Image from "next/image";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import {MemberInfo} from "@/lib/api/interface";
import apiService from "@/lib/api/services";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/interface";
import {toast} from "sonner";

interface MarketInfo {
  id: string;
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
}

export default function Setting() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const [userData, setUserData] = useState<MemberInfo | null>(null);
  const [avatar, setAvatar] = useState("");
  const [nickName, setNickName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);
  const calledOnceRef = useRef(false);
  const getData = useCallback(async () => {
    const controller = new AbortController();

    try {
      const {data} = await apiService.getMemberInfo({ signal: controller.signal, address: userAddress });
      setUserData(data)
      setNickName(data.nickName);
      setIntroduction(data.introduction)
    } catch (e: any) {
      if (e.name !== 'CanceledError') {
        console.log(e);
      }
    }

    // 卸载时取消请求并阻止 setState
    return () => {
      controller.abort();
    };
  }, [userAddress]);
  useEffect(() => {
    if (calledOnceRef.current || !userAddress) return;
    calledOnceRef.current = true;

    getData()
  }, [userAddress]);

  const updateMemberInfo = async (override?: Partial<{avatar: string; nickName: string; introduction: string}>) => {
    const res = await apiService.updateMemberInfo({
      avatar,
      address: userAddress,
      nickName,
      introduction,
      ...override
    });
    console.log(res);
    getData()
  }

  const bindByInviteCode = async () => {
    const res = await apiService.bindByInviteCode({
      inviteCode: inviteCode,
      address: userAddress || ''
    })
    setInviteCode('')
    toast.success(t('settings.bindSuccess'));
  }

  return (
    <div className={`min-h-screen bg-[#051A3D] ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      {isMobile ? (
        <MobileNavigation
          activeCategory=""
          onCategoryChange={() => {}}
        />
      ) : (
        <Header currentPage="details" />
      )}

      {/* Main Content */}
      <main className={isMobile ? 'w-full p-[16px]' : 'max-w-[1312px] min-h-[calc(100vh-332px)] mx-auto pt-[50px] px-[40px]'}>
        {/* Back Button */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center text-white/40 hover:text-white">
              <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">{t('nav.home')}</span>
            </div>
          </Link>
          <ArrowRightIcon className="mx-[16px] text-white/40" />
          <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('header.settings')}</div>
        </div>

        <div className="mt-[36px] space-y-[36px]">
          <div className="h-[24px] leading-[24px] text=[18px] text-white font-bold">{t('settings.profile')}</div>
          <div className="flex items-center gap-[24px]">
            {userData?.avatar ? (
              <Image src={userData.avatar} alt="" width={64} height={64} />
            ) : (
              <Avatar
                size={64}
                name={userData?.loginAddress}
                variant={'marble'}
              />
            )}
            <ImageUploader showPreview={false} onUploadSuccess={(url) => {
              setAvatar(url)
              updateMemberInfo({ avatar: url });
            }} />
          </div>
          <div>
            <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.username')}</div>
            <div className="mt-[12px] h-[56px] flex items-center bg-[#04122B] rounded-[16px]">
              <Input
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                className="flex-1 px-[24px] text-white text-[18px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                placeholder={t('settings.username')}
              />
              {nickName === userData?.nickName ? (
                <span className="text-[14px] text-white mx-[24px] cursor-pointer">{t('common.edit')}</span>
              ) : (
                <span
                  className={`text-[14px] text-white mx-[24px] ${nickName === '' ? 'opacity-50 cursor-no-drop' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (nickName) updateMemberInfo()
                  }}
                >
                  {t('common.save')}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.bio')}</div>
            <div className="mt-[12px] h-[56px] flex items-center bg-[#04122B] rounded-[16px]">
              <Input
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="flex-1 px-[24px] text-white text-[18px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                placeholder={t('settings.bioPlaceholder')}
              />
              {introduction === userData?.introduction ? (
                <span className="text-[14px] text-white mx-[24px] cursor-pointer">{t('common.edit')}</span>
              ) : (
                <span
                  className={`text-[14px] text-white mx-[24px] ${introduction === '' ? 'opacity-50 cursor-no-drop' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (introduction) updateMemberInfo()
                  }}
                >
                  {t('common.save')}
                </span>
                // <span className={`text-[18px] text-white mx-[24px] ${introduction === '' ? 'opacity-50 cursor-no-drop' : 'cursor-pointer'}`} onClick={updateMemberInfo}>{t('common.save')}</span>
              )}
            </div>
          </div>
          {/*<div>*/}
          {/*  <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.UID')}</div>*/}
          {/*  <div className="mt-[12px] h-[56px] flex items-center bg-[#04122B] rounded-[16px]">*/}
          {/*    <div className="flex-1 px-[24px] text-white text-[18px]"></div>*/}
          {/*    <span className="inline-block h-[32px] leading-[32px] bg-white/40 rounded-[12px] px-[10px] text-[18px] text-white mx-[24px] cursor-pointer">{t('common.copy')}</span>*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div className="h-[24px] leading-[24px] text=[18px] text-white font-bold">{t('settings.account')}</div>*/}
          {/*<div>*/}
          {/*  <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.email')}</div>*/}
          {/*  <div className="mt-[12px] h-[56px] flex items-center bg-[#04122B] rounded-[16px]">*/}
          {/*    <Input className="flex-1 px-[24px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />*/}
          {/*    <span className="inline-block h-[32px] leading-[32px] bg-white/40 rounded-[12px] px-[10px] text-[18px] text-white mx-[24px] cursor-pointer">{t('common.copy')}</span>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="h-[24px] leading-[24px] text=[18px] text-white font-bold">{t('settings.referral')}</div>
          <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.referralTips')}</div>
          <div>
            <div className="h-[24px] leading-[24px] text=[18px] text-white/60">{t('settings.inviteCode')}</div>
            <div className="mt-[12px] h-[56px] flex items-center bg-[#04122B] rounded-[16px]">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 px-[24px] text-white text-[18px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                placeholder={t('settings.inviteCodeTips')}
              />
              <span
                className={`text-[14px] text-white mx-[24px] ${inviteCode === '' ? 'opacity-50 cursor-no-drop' : 'cursor-pointer'}`}
                onClick={bindByInviteCode}
              >{t('common.submit')}</span>
            </div>
          </div>
          {/*<div className="h-[24px] leading-[24px] text=[18px] text-white font-bold">{t('settings.privateKey')}</div>*/}
          {/*<div className="bg-[#04122B] rounded-[16px] p-[24px]">*/}
          {/*  <div className="flex">*/}
          {/*    <WarningIcon className="text-[24px] text-white" />*/}
          {/*    <span className="ml-[24px] leading-[24px] text-[16px] text-white">{t('settings.privateKeyWarning')}</span>*/}
          {/*  </div>*/}
          {/*  <div className="mt-[24px] pl-[48px] leading-[24px] text-[16px] text-white">{t('settings.privateKeyWarningContent')}</div>*/}
          {/*  <div className="mt-[36px] ml-[48px] inline-block h-[32px] leading-[32px] bg-[#A63030] rounded-[12px] text-[18px] text-white px-[12px] cursor-pointer">{t('settings.showPrivateKey')}</div>*/}
          {/*</div>*/}
        </div>
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
