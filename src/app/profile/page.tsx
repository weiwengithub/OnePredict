"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Avatar from 'boring-avatars';
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeIcon from "@/assets/icons/home.svg";
import ExportIcon from "@/assets/icons/export.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import UserIcon from "@/assets/icons/user.svg";
import Image from "next/image";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import apiService from "@/lib/api/services";
import { store } from "@/store";
import {useLanguage} from "@/contexts/LanguageContext";
import SettingsIcon from "@/assets/icons/settings.svg";
import {onCopyToText} from "@/lib/utils";
import CopyIcon from "@/assets/icons/copy_1.svg";
import SharePopover from "@/components/SharePopover";
import {useIsMobile} from "@/contexts/viewport";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import {MemberInfo} from "@/lib/api/interface";
import WechatIcon from "@/assets/icons/wechat.svg";

interface PositionItemApi {
  marketId: string;
  marketName: string;
  marketPrice: string;
}

function MarketsItem(item: PositionItemApi) {
  return (
    <div className="flex items-center px-[12px] pt-[14px] pb-[13px] rounded-[16px] hover:bg-white/20">
      <img src="/images/demo.png" alt=""/>
      <div className="flex-1 ml-[12px]">
        <div className="leading-[24px] text-[16px] text-white truncate">{item.marketName}</div>
        <div className="h-[16px] flex items-end"><UserIcon className="text-white text-[14px]"/><span className="inline-block ml-[7px] h-[16px] leading-[22px] text-[12px] text-white/60">15</span></div>
      </div>
      <div className="h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center px-[4px]">
        <span className="text-[#28C04E] text-[16px]">{item.marketPrice} Up</span>
      </div>
    </div>
  );
}

function MobileMarketsItem(item: PositionItemApi) {
  return (
    <div className="flex items-center">
      <img src="/images/demo.png" alt=""/>
      <div className="flex-1 ml-[8px]">
        <div className="leading-[16px] text-[16px] text-white truncate">{item.marketName}</div>
        <div className="mt-[4px] flex gap-[8px]">
          <div className="h-[20px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center px-[4px]">
            <span className="text-[#28C04E] text-[14px]">{item.marketPrice} Up</span>
          </div>
          <div className="mt-[5px] h-[12px] flex items-end">
            <UserIcon className="text-white text-[12px]"/>
            <span className="inline-block ml-[7px] h-[12px] leading-[12px] text-[12px] text-white/60">15</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const [userData, setUserData] = useState<MemberInfo | null>(null);
  const calledOnceRef = useRef(false);

  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);
  useEffect(() => {
    if (calledOnceRef.current || !userAddress) return;
    calledOnceRef.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        console.log('userAddress', userAddress)
        const {data} = await apiService.getMemberInfo({ signal: controller.signal, address: userAddress });
        console.log('data', data)
        setUserData(data)
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.log(e);
        }
      }
    })();

    // 卸载时取消请求并阻止 setState
    return () => {
      controller.abort();
    };
  }, [userAddress]);

  const [positions, setPositions] = useState<PositionItemApi[]>([{
    marketId: '111111',
    marketName: 'text1;',
    marketPrice: '2.58'
  }, {
    marketId: '22222',
    marketName: 'text2;',
    marketPrice: '2.58'
  }]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-20 md:pb-0">
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
      <main className={isMobile ? 'w-full px-[16px] py-[24px] relative' : 'max-w-[1312px] mx-auto pt-[50px]'}>
        {/* Back Button */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center text-white/40 hover:text-white">
              <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">{t('nav.home')}</span>
            </div>
          </Link>
          <ArrowRightIcon className="mx-[16px] text-white/40" />
          <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('nav.profile')}</div>
        </div>

        {/* Header */}
        <div className="mt-[24px]">
          <div className={`flex ${isMobile ? 'flex-col' : 'gap-[24px]'}`}>
            <Avatar
              size={isMobile ? 80 : 136}
              name={userData?.loginAddress}
              variant={'marble'}
            />
            <div>
              <div className="h-[31px] leading-[31px] text-[24px] text-white font-bold">{userData?.nickName}</div>
              <div className="mt-[12px] flex gap-[10px] h-[18px] text-[14px] text-white/80">
                <span>1 {t('profile.followers')}</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>0 {t('profile.following')}</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>0 {t('profile.opinions')}</span>
              </div>
              <div className={`${isMobile ? 'absolute top-[17px] right-[16px]' : 'mt-[22px]'} flex items-center gap-[12px]`}>
                <div
                  className="h-[32px] leading-[32px] rounded-[24px] border border-white/40 text-[12px] px-[12px] text-white"
                  onClick={() => {
                    router.push('/setting');
                  }}
                >{t('profile.follow')}</div>
                <SharePopover
                  trigger={<div className={`${isMobile ? 'size-[32px]' : 'size-[36px]'} flex items-center justify-center rounded-[32px] border border-white/40 text-[12px] text-white`}><ExportIcon /></div>}
                  content={
                    <div className="max-w-[260px] text-sm leading-5">
                      <div
                        className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] cursor-pointer"
                        // onClick={() => onCopyToText(`${window.location.origin}/details?marketId=${prediction.marketId}`)}
                      >
                        <CopyIcon />
                        {t('predictions.copyLink')}
                      </div>
                    </div>
                  }
                  offset={10}
                  lockScroll
                />
              </div>
            </div>
          </div>
        </div>

        {isMobile ? (
          <div className="mt-[24px] space-y-[16px]">
            {/* Position */}
            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-1.png" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.position')}</div>
              <div className="leading-[24px] text-[24px] text-white font-bold">35</div>
            </div>

            {/* Volume Traded */}
            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-2.png" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.volume')}</div>
              <div className="flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
                <Image src="/images/icon/icon-token.png" alt="" width={24} height={24} />
                <span>539</span>
              </div>
            </div>

            {/* PnL Rank */}
            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-3.png" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.rank')}</div>
              <div className="leading-[24px] text-[24px] text-white font-bold">35</div>
            </div>
          </div>
        ) : (
          <div className="mt-[40px] flex gap-[24px]">
            {/* Position */}
            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-1.png" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.position')}</div>
              <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">35</div>
            </div>

            {/* Volume Traded */}
            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-2.png" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.volume')}</div>
              <div className="mt-[24px] flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
                <Image src="/images/icon/icon-token.png" alt="" width={24} height={24} />
                <span>539</span>
              </div>
            </div>

            {/* PnL Rank */}
            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-3.png" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.rank')}</div>
              <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">35</div>
            </div>
          </div>
        )}

        {/* All Markets */}
        <div className="mt-[32px] bg-[#04122B] rounded-[16px] p-[24px] overflow-hidden">
          <div className="mb-[24px] leading-[24px] text-[18px] text-white font-bold">{t('profile.allMarkets')}</div>
          <div className="space-y-[12px]">
            {positions.length > 0 ? (
              <>
                {positions.map((item, index) => (
                  isMobile ? <MobileMarketsItem key={`${item.marketId}_${index}`} {...item} /> : <MarketsItem key={`${item.marketId}_${index}`} {...item} />
                ))}
              </>
            ) : (
              <div className="mt-[37px]">
                <div className="size-[64px] mx-auto text-[64px] text-white/60"><WechatIcon /></div>
                <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
