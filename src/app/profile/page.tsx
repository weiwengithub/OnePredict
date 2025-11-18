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
import * as Popover from '@radix-ui/react-popover';
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
import {getLanguageLabel, onCopyToText} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {tokenIcon} from "@/assets/config";
import {toast} from "sonner";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

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
  const { language, t } = useLanguage();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId')
  const userMemberId = store.getState().memberId

  const [userData, setUserData] = useState<MemberCenter | null>(null);
  const [following, setFollowing] = useState<boolean>(false);
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
        setFollowing(centerData.followBySessionMemberId)

        const {data} = await apiService.getMarketPosition({memberId, address: userAddress || '', pageNum: 1, pageSize: 100});
        const list = data.rows.filter(item => {
          // 不显示持仓数量为0的数据
          if(item.shares === 0) {
            return false;
          }
          // 不显示已领取收益的数据
          if (item.status === 'Redeemed') {
            return false;
          }
          // 不显示已完成且竞猜失败的数据
          if (item.status === 'Completed' && item.winnerId !== item.currentOutcome.outcomeId) {
            return false;
          }
          return true
        })
        setMarketList(groupByMarketId(list))
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

  const updateMarketList = (index: number, current: number) => {
    const newMarketList: marketListItem[] = JSON.parse(JSON.stringify(marketList));
    newMarketList[index].current = current;
    setMarketList(newMarketList)
  }

  const handleFollowClick = async () => {
    if ((zkLoginData || currentAccount) && memberId) {
      try {
        const res = await apiService.addMemberFollow({
          followType: 'People',
          followId: Number(memberId),
          address: userAddress || ''
        });
        toast.success(t('profile.followedSuccess'));
        setFollowing(true)
      } catch (e: any) {
        toast.error(t('profile.followError'));
      }
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  const handleFollowingClick = async () => {
    if ((zkLoginData || currentAccount) && memberId) {
      try {
        const res = await apiService.delMemberFollow({
          followType: 'People',
          followId: Number(memberId),
          address: userAddress || ''
        });
        toast.success(t('profile.unfollowSuccess'));
        setFollowing(false)
      } catch (error) {
        toast.error(t('profile.unfollowError'));
      }
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
                    {following ? (
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
                        className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] whitespace-nowrap cursor-pointer"
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
                {marketList.length}
              </div>
            </div>

            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-2.png?v=1" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.volume')}</div>
              <div className="flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <span>{userData?.tradeValueNoFee || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-[16px] h-[72px] px-[16px] bg-[#04122B] rounded-[16px]">
              <Image src="/images/icon/icon-profile-3.png?v=1" alt="" width={36} height={36} />
              <div className="flex-1 leading-[24px] text-[16px] text-white/60 font-bold">{t('profile.rank')}</div>
              <div className="leading-[24px] text-[24px] text-white font-bold">{userData?.pnlRank}</div>
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

        <div className={`mt-[32px] bg-[#04122B] rounded-[16px] overflow-hidden ${isMobile ? 'px-[14px] py-[16px]' : 'p-[24px]'}`}>
          <div className="mb-[24px] leading-[24px] text-[18px] text-white font-bold">{t('profile.allMarkets')}</div>
          <div className="space-y-[16px]">
            {marketList.length > 0 ? (
              <>
                {marketList.map((item, marketIndex) => (
                  isMobile ? (
                    <div
                      key={item.marketId}
                      className="flex items-center cursor-pointer"
                    >
                      <img src={item.imageUrl} alt="" className="size-[40px] flex-none rounded-[8px]" />
                      <div className="flex-1 ml-[8px] overflow-hidden">
                        <div onClick={() => {router.push(`/details?marketId=${item.marketId}`);}}>
                          <EllipsisWithTooltip
                            text={getLanguageLabel(item.marketName, language)}
                            className="h-[16px] w-full leading-[16px] text-[16px] text-white"

                          />
                        </div>
                        <div className="mt-[4px] flex gap-[8px]">
                          {item.list.length > 1 ? (
                            <Popover.Root>
                              {/* 触发按钮：点击后打开/关闭 */}
                              <Popover.Trigger asChild>
                                <div className="w-auto h-[24px] flex items-center gap-1 bg-[rgba(40,192,78,0.5)] rounded-[4px] text-[#28C04E] text-[16px]  px-[8px] py-0">
                                  <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                                  <EllipsisWithTooltip
                                    text={getLanguageLabel(item.list[item.current].currentOutcome.name, language)}
                                    className="h-[20px] max-w-[120px] leading-[20px] text-[14px] text-[#28C04E]"
                                  />
                                  <ArrowDownIcon className="text-[12px]" />
                                </div>
                              </Popover.Trigger>

                              {/* 气泡内容 */}
                              <Popover.Portal>
                                <Popover.Content
                                  side="top"
                                  align="start"
                                  sideOffset={6}
                                  className="z-50 bg-[#010A2C] border-none rounded-[12px] p-[16px] space-y-[16px] outline-none leading-relaxed"
                                >
                                  {item.list.map((market, index) => (
                                    <Popover.Close asChild key={market.id}>
                                      <div
                                        className="h-[32px] flex items-center justify-between gap-[12px] px-[12px] rounded-[12px] hover:bg-[#051A3D] focus:bg-[#051A3D] cursor-pointer"
                                        onClick={() => updateMarketList(marketIndex, index)}
                                      >
                                        <EllipsisWithTooltip
                                          text={getLanguageLabel(market.currentOutcome.name, language)}
                                          className="h-[20px] max-w-[120px] leading-[20px] text-[14px] text-white"
                                        />
                                        <span className="h-[20px] leading-[20px] bg-[rgba(40,192,78,0.5)] text-[#28C04E] text-[14px] rounded-[4px] px-[4px]">{Number(market.shares).toFixed(2)}</span>
                                      </div>
                                    </Popover.Close>
                                  ))}
                                </Popover.Content>
                              </Popover.Portal>
                            </Popover.Root>
                          ) : (
                            <div className="h-[20px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center gap-1 px-[8px] text-[#28C04E] text-[14px]">
                              <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                              <EllipsisWithTooltip
                                text={getLanguageLabel(item.list[item.current].currentOutcome.name, language)}
                                className="h-[20px] max-w-[120px] leading-[20px] text-[14px] [#28C04E]"
                              />
                              {item.list.length > 1 && <ArrowDownIcon className="text-[12px]" />}
                            </div>
                          )}
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
                    >
                      <img src={item.imageUrl} alt="" className="size-[40px] flex-none rounded-[8px]" />
                      <div
                        className="flex-1 ml-[12px]"
                        onClick={() => {
                          router.push(`/details?marketId=${item.marketId}`);
                        }}
                      >
                        <EllipsisWithTooltip
                          text={getLanguageLabel(item.marketName, language)}
                          className="h-[24px] w-full leading-[24px] text-[16px] text-white"
                        />
                        <div className="h-[16px] flex items-end"><UserIcon className="text-white text-[14px]"/><span className="inline-block ml-[7px] h-[16px] leading-[22px] text-[12px] text-white/60">{item.traderCount}</span></div>
                      </div>
                      {item.list.length > 1 ? (
                        <Popover.Root>
                          {/* 触发按钮：点击后打开/关闭 */}
                          <Popover.Trigger asChild>
                            <div className="w-auto h-[24px] flex items-center gap-1 bg-[rgba(40,192,78,0.5)] rounded-[4px] text-[#28C04E] text-[16px]  px-[8px] py-0">
                              <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                              <EllipsisWithTooltip
                                text={getLanguageLabel(item.list[item.current].currentOutcome.name, language)}
                                className="h-[24px] max-w-[120px] leading-[24px] text-[16px] text-[#28C04E]"
                              />
                              <ArrowDownIcon className="text-[12px]" />
                            </div>
                          </Popover.Trigger>

                          {/* 气泡内容 */}
                          <Popover.Portal>
                            <Popover.Content
                              side="top"
                              align="end"
                              sideOffset={6}
                              className="z-50 bg-[#010A2C] border-none rounded-[12px] p-[16px] space-y-[16px] outline-none leading-relaxed"
                            >
                              {item.list.map((market, index) => (
                                <Popover.Close asChild key={market.id}>
                                  <div
                                    className="h-[32px] flex items-center justify-between gap-[12px] px-[12px] rounded-[12px] hover:bg-[#051A3D] focus:bg-[#051A3D] cursor-pointer"
                                    onClick={() => updateMarketList(marketIndex, index)}
                                  >
                                    <EllipsisWithTooltip
                                      text={getLanguageLabel(market.currentOutcome.name, language)}
                                      className="h-[24px] max-w-[120px] leading-[24px] text-[16px] text-white"
                                    />
                                    <span className="h-[24px] leading-[24px] bg-[rgba(40,192,78,0.5)] text-[#28C04E] text-[16px] rounded-[4px] px-[4px]">{Number(market.shares).toFixed(2)}</span>
                                  </div>
                                </Popover.Close>
                              ))}
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <div className="h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center gap-1 px-[8px] text-[#28C04E] text-[16px]">
                          <TooltipAmount shares={item.list[item.current].shares} decimals={0} precision={2}/>
                          <EllipsisWithTooltip
                            text={getLanguageLabel(item.list[item.current].currentOutcome.name, language)}
                            className="h-[24px] max-w-[120px] leading-[24px] text-[16px] [#28C04E]"
                          />
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


