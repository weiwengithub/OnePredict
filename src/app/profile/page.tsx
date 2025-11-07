"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import apiService from "@/lib/api/services";
import {useLanguage} from "@/contexts/LanguageContext";
import CopyIcon from "@/assets/icons/copy_1.svg";
import SharePopover from "@/components/SharePopover";
import {useIsMobile} from "@/contexts/viewport";
import {useRouter, useSearchParams} from "next/navigation";
import {MarketPositionOption, MemberCenter} from "@/lib/api/interface";
import WechatIcon from "@/assets/icons/wechat.svg";
import ArrowDownIcon from "@/assets/icons/arrowDown.svg";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/lib/interface";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import {TooltipAmount} from "@/components/TooltipAmount";
import {setSigninOpen, store} from "@/store";
import {onCopyToText} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {tokenIcon} from "@/assets/config";

interface PositionItemApi {
  marketId: string;
  marketName: string;
  marketPrice: string;
}

interface marketListItem {
  marketId: string;
  imageUrl: string;
  marketName: string;
  traderCount: number;
  showPopup: boolean;
  current: number;
  list: MarketPositionOption[]
}

function groupByMarketId(arr: MarketPositionOption[]) {
  const map = new Map();

  for (const item of arr) {
    const id = item.marketId;
    if (!map.has(id)) {
      map.set(id, { marketId: id, imageUrl: item.imageUrl, marketName: item.marketName, traderCount: item.traderCount, showPopup: false, current: 0, list: [] });
    }
    map.get(id).list.push(item);
  }

  return Array.from(map.values());
}

export default function ProfileClient() {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId')
  const userMemberId = store.getState().memberId

  const [userData, setUserData] = useState<MemberCenter | null>(null);
  const [marketList, setMarketList] = useState<marketListItem[]>([]);
  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);

  useEffect(() => {
    if (!memberId) return;

    const controller = new AbortController();
    (async () => {
      try {
        const { data: centerData } = await apiService.getMemberCenter({memberId, address: userAddress || ''});
        console.log('centerData', centerData);
        setUserData(centerData);

        const {data} = await apiService.getMarketPosition({memberId, address: userAddress || ''});
        setMarketList(groupByMarketId(data.rows))
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.log(e);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [memberId, userAddress]);

  const handleFollowClick = async () => {
    if ((zkLoginData || currentAccount) && memberId) {
      const res = await apiService.addMemberFollow({
        followType: 'People',
        followId: Number(memberId),
        address: userAddress || ''
      });
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  const handleFollowingClick = async () => {
    if ((zkLoginData || currentAccount) && memberId) {
      const res = await apiService.delMemberFollow({
        followType: 'People',
        followId: Number(memberId),
        address: userAddress || ''
      });
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  return (
    <div className={`min-h-screen bg-[#051A3D] ${isMobile ? 'pb-20' : ''}`}>
      {isMobile ? (
        <MobileNavigation
          activeCategory=""
          onCategoryChange={() => {}}
        />
      ) : (
        <Header currentPage="details" />
      )}

      <main className={isMobile ? 'w-full px-[16px] py-[24px] relative' : 'max-w-[1312px] min-h-[calc(100vh-332px)] mx-auto pt-[50px] px-[40px]'}>
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center text-white/40 hover:text-white">
              <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">{t('nav.home')}</span>
            </div>
          </Link>
          <ArrowRightIcon className="mx-[16px] text-white/40" />
          <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('nav.profile')}</div>
        </div>

        <div className="mt-[24px]">
          <div className={`flex ${isMobile ? 'flex-col' : 'gap-[24px]'}`}>
            {userData?.avatar ? (
              <Image src={userData.avatar} alt="" width={isMobile ? 80 : 136} height={isMobile ? 80 : 136} />
            ) : (
              <Avatar
                size={isMobile ? 80 : 136}
                name={userData?.loginAddress}
                variant={'marble'}
              />
            )}
            <div>
              <div className="h-[31px] leading-[31px] text-[24px] text-white font-bold">{userData?.nickName}</div>
              {userData?.introduction && (
                <div className="mt-[4px] h-[18px] leading-[18px] text-[14px] text-white truncate">{userData.introduction}</div>
              )}
              <div className={`${userData?.introduction ? 'mt-[7px]' : 'mt-[12px]'} flex gap-[10px] h-[18px] text-[14px] text-white/80`}>
                <span>{userData?.followMeCount || 0} {t('profile.followers')}</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>{userData?.meFollowCount || 0} {t('profile.following')}</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>{userData?.commentCount || 0} {t('profile.opinions')}</span>
              </div>
              <div className={`${isMobile ? 'absolute top-[17px] right-[16px]' : 'mt-[22px]'} flex items-center gap-[12px]`}>
                {memberId && Number(memberId) === userMemberId ? (
                  <div
                    className="h-[32px] leading-[32px] rounded-[24px] border border-white/40 text-[12px] px-[12px] text-white cursor-pointer"
                    onClick={() => {
                      router.push('/setting');
                    }}
                  >{t('profile.editProfile')}</div>
                ) : (
                  <>
                    {userData?.followBySessionMemberId ? (
                      <div
                        className="h-[32px] leading-[32px] rounded-[24px] border border-white/40 text-[12px] px-[12px] text-white cursor-pointer"
                        onClick={handleFollowingClick}
                      >{t('profile.following')}</div>
                    ) : (
                      <div
                        className="h-[32px] leading-[32px] rounded-[24px] border border-white/40 text-[12px] px-[12px] text-white cursor-pointer"
                        onClick={handleFollowClick}
                      >{t('profile.follow')}</div>
                    )}
                  </>
                )}
                <SharePopover
                  trigger={<div className={`${isMobile ? 'size-[32px]' : 'size-[36px]'} flex items-center justify-center rounded-[32px] border border-white/40 text-[12px] text-white`}><ExportIcon /></div>}
                  content={
                    <div className="max-w-[260px] text-sm leading-5">
                      <div
                        className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] cursor-pointer"
                        onClick={() => onCopyToText(window.location.href)}
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
            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-1.png?v=1" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.position')}</div>
              <div className="leading-[24px] text-[24px] text-white font-bold">
                4
              </div>
            </div>

            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-2.png?v=1" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.volume')}</div>
              <div className="flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <span>{
                  userData?.tradeValueNoFee.toFixed(2)
                }</span>
              </div>
            </div>

            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-3.png?v=1" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.rank')}</div>
              <div className="leading-[24px] text-[24px] text-white font-bold">{
                userData?.pnlRank.toFixed(2)
              }</div>
            </div>
          </div>
        ) : (
          <div className="mt-[40px] flex gap-[24px]">
            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-1.png?v=1" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.position')}</div>
              <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">
                {marketList.length}
              </div>
            </div>

            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-2.png?v=1" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.volume')}</div>
              <div className="mt-[24px] flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <span>{userData?.tradeValueNoFee || 0}</span>
              </div>
            </div>

            <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-3.png?v=1" alt="" width={36} height={36} />
              <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.rank')}</div>
              <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">
                {userData?.pnlRank}
              </div>
            </div>
          </div>
        )}

        <div className="mt-[32px] bg-[#04122B] rounded-[16px] p-[24px] overflow-hidden">
          <div className="mb-[24px] leading-[24px] text-[18px] text-white font-bold">{t('profile.allMarkets')}</div>
          <div className="space-y-[12px]">
            {marketList.length > 0 ? (
              <>
                {marketList.map((item, index) => (
                  isMobile ? (
                    <div
                      key={item.marketId}
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        router.push(`/details?marketId=${item.marketId}`);
                      }}
                    >
                      <img src={item.imageUrl} alt=""/>
                      <div className="flex-1 ml-[8px]">
                        <div className="leading-[16px] text-[16px] text-white truncate">{item.marketName}</div>
                        <div className="mt-[4px] flex gap-[8px]">
                          <div className="h-[20px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center px-[4px]">
                            {/*<span className="text-[#28C04E] text-[14px]">{item.marketPrice} Up</span>*/}
                          </div>
                          <div className="mt-[5px] h-[12px] flex items-end">
                            <UserIcon className="text-white text-[12px]"/>
                            <span className="inline-block ml-[7px] h-[12px] leading-[12px] text-[12px] text-white/60">{item.traderCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.marketId}
                      className="flex items-center px-[12px] pt-[14px] pb-[13px] rounded-[16px] hover:bg-white/20 cursor-pointer"
                      onClick={() => {
                        router.push(`/details?marketId=${item.marketId}`);
                      }}
                    >
                      <img src={item.imageUrl} alt="" className="size-[40px]" />
                      <div className="flex-1 ml-[12px]">
                        <div className="leading-[24px] text-[16px] text-white truncate">{item.marketName}</div>
                        <div className="h-[16px] flex items-end"><UserIcon className="text-white text-[14px]"/><span className="inline-block ml-[7px] h-[16px] leading-[22px] text-[12px] text-white/60">{item.traderCount}</span></div>
                      </div>
                      {item.list.length > 1 ? (
                        <Select value={item.current.toString()} onValueChange={(v) => console.log(v)}>
                          <SelectTrigger className="w-auto h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] border-none text-[#28C04E] text-[16px]  px-[8px] py-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none">
                            <SelectValue placeholder={t('categories.pickOne')}>
                              <div className="h-[24px] flex items-center gap-1">
                                <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                                <span>{item.list[item.current].currentOutcome.name}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="mt-[4px] w-full bg-[#010A2C] border-none rounded-[12px] p-[16px] space-y-[16px]">
                            {item.list.map((item, index) => (
                              <SelectItem key={item.id} value={index.toString()} className="h-[32px] rounded-[12px] hover:bg-[#051A3D] focus:bg-[#051A3D]">
                                <div className="flex items-center justify-between px-[12px]">
                                  <span className="text-[16px] text-white">{item.currentOutcome.name}</span>
                                  <span className="h-[24px] leading-[24px] bg-[rgba(40,192,78,0.5)]] text-[#28C04E] text-[16px] rounded-[4px] px-[4px]">{Number(item.shares).toFixed(2)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center gap-1 px-[8px] text-[#28C04E] text-[16px]">
                          <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                          <span>{item.list[item.current].currentOutcome.name}</span>
                          {item.list.length > 1 && <ArrowDownIcon className="text-[12px]" />}
                        </div>
                      )}
                    </div>
                  )
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

      {!isMobile && <Footer />}
    </div>
  );
}


