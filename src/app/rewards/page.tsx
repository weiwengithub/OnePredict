"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import {addPoint, getLanguageLabel, onCopyToText, timeAgoEn} from "@/lib/utils";
import {
  Gift,
  Users,
  Copy,
  Share2,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  Calendar,
  Target,
  Star,
  Coins
} from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import CopyIcon from "@/assets/icons/copy.svg";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import apiService from "@/lib/api/services";
import {useCurrentAccount} from "@onelabs/dapp-kit";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import { useMemo } from "react";
import PredictionCard from "@/components/PredictionCard";
import {MemberMoneyRecord, ResInviteInfo} from "@/lib/api/interface";
import Link from "next/link";
import {TooltipAmount} from "@/components/TooltipAmount";
import {tokenIcon} from "@/assets/config";
import Avatar from "boring-avatars";
import {useGlobalLoading} from "@/hooks/useGlobalLoading";
import {toast} from "sonner";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

export default function Rewards() {
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState<string>("invite");
  const [memberCode, setMemberCode] = useState<string>("");
  const { show, hide } = useGlobalLoading();

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress || '';
  }, [currentAccount, zkLoginData]);
  // Mock user data for invite circle
  const [invitePageSize, setInvitePageSize] = useState<number>(10);
  const [invitePageNumber, setInvitePageNumber] = useState<number>(1)
  const [inviteRecords, setInviteRecords] = useState<ResInviteInfo[]>([]);

  // 获取当前用户邀请码
  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();
    if(!userAddress) return;
    (async () => {
      try {
        const { data } = await apiService.getMemberInfo({
          address: userAddress
        });
        if (!aborted) setMemberCode((data as any)?.memberCode || "");

        const { data: inviteData } = await apiService.getMemberInviteList({pageSize: invitePageSize, pageNum: invitePageNumber, address: userAddress})
        setInviteRecords(inviteData.rows)

        getMemberMoneyRecord(1, false)
      } catch (e: any) {
        if (e?.name === 'AbortError' || e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
        // console.error(e)
      }
    })();
    return () => { aborted = true; controller.abort(); };
  }, [userAddress]);

  const [memberMoneyTotal, setMemberMoneyTotal] = useState({
    avaAmount: 0,
    claimedAmount: 0,
    totalInviteAmount: 0
  });
  const [memberMoneyRecords, setMemberMoneyRecords] = useState<MemberMoneyRecord[]>([]);
  const [memberMoneyPageSize, setMemberMoneyPageSize] = useState(10);
  const [memberMoneyPageNum, setMemberMoneyPageNum] = useState(1);
  const [isFetchingMemberMoney, setIsFetchingMemberMoney] = useState(false);
  const [hasMoreMemberMoney, setHasMoreMemberMoney] = useState<boolean>(true);
  const getMemberMoneyRecord = async (page: number = 1, append: boolean = false) => {
    try {
      setIsFetchingMemberMoney(true);
      const { data } = await apiService.getMemberMoneyRecord({
        pageNum: page,
        pageSize: memberMoneyPageSize,
        address: userAddress
      })
      setMemberMoneyTotal({
        avaAmount: data.avaAmount || 0,
        claimedAmount: data.claimedAmount || 0,
        totalInviteAmount: data.totalInviteAmount || 0
      })
      if (append) {
        setMemberMoneyRecords(prev => [...prev, ...data.rows]);
      } else {
        setMemberMoneyRecords(data.rows);
      }
      setHasMoreMemberMoney(data.count > page * memberMoneyPageSize)
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetchingMemberMoney(false);
    }
  }

  const claimMemberMoney = async () => {
    try {
      show(t('rewards.claiming') || 'Claiming...');
      const { data } = await apiService.claimMemberMoney({coinType: '0x72eba41c73c4c2ce2bcfc6ec1dc0896ba1b5c17bfe7ae7c6c779943f84912b41::usdh::USDH', address: userAddress})
      console.log(data)
      toast.success(t('rewards.claimSuccess'));
      // 刷新数据
      await getMemberMoneyRecord(1, false)
    } catch (error) {
      console.error('Claim failed:', error)
      toast.success(t('rewards.claimError'));
    } finally {
      hide()
    }
  }

  return (
    <div className={`min-h-screen bg-[#051A3D] ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      {isMobile ? (
        <MobileNavigation
          activeCategory="rewards"
          onCategoryChange={() => {}}
        />
      ) : (
        <Header currentPage="rewards" />
      )}

      {/* Main Content */}
      <main className={isMobile? 'w-full p-[16px]' : 'max-w-[1312px] mx-auto pt-[50px] px-[40px]'}>
        {/* Points Brand Section */}
        <div className="relative">
          <div className="h-[24px] leading-[24px] text-[18px] text-white font-bold">{t('rewards.myRewards')}</div>
          <div className="mt-[24px] flex items-center">
            <Image src={tokenIcon} alt="" width={52} height={52} className="size-[52px]" />
            <div className="ml-[12px] h-[40px] leading-[40px] text-[50px] text-white font-bold">
              <TooltipAmount shares={memberMoneyTotal.avaAmount} decimals={0} precision={2} />
            </div>
            <button className="ml-[24px] h-[42px] px-[16px] text-[#010101] text-[16px] font-bold bg-white rounded-[16px]" onClick={claimMemberMoney}>{t('rewards.claim')}</button>
          </div>
          <div className="mt-[12px] leading-[24px] text-white text-[16px]">{t('rewards.onePredictPoints')}</div>
          <div className="mt-[32px] flex gap-[24px]">
            <div
              className={`h-[24px] leading-[24px] ${isMobile? 'text-[20px]' : 'text-[24px]'} font-bold ${currentTab === 'invite' ? 'text-white' : 'text-white/60 cursor-pointer'}`}
              onClick={() => {setCurrentTab('invite')}}
            >
              {t('rewards.inviteToEarn')}
            </div>
            <div
              className={`h-[24px] leading-[24px] ${isMobile? 'text-[20px]' : 'text-[24px]'} font-bold ${currentTab === 'rewards' ? 'text-white' : 'text-white/60 cursor-pointer hover:text-white'}`}
              onClick={() => {
                setCurrentTab('rewards')
              }}
            >
              {t('rewards.rewardRecord')}
            </div>
          </div>
        </div>

        {currentTab === 'invite' && (
          <>
            <Card className={`${isMobile ? 'mt-[24px] bg-[#04122B]' : 'mt-[56px] bg-[linear-gradient(180deg,_#04122B_72.95%,_#051A3D_100%)]'} border-none rounded-[24px]`}>
              <CardContent className={`p-0 ${isMobile ? 'pb-[20px]' : 'pb-[86px]'}`}>
                {/* Circular User Layout */}
                <div className={`relative ${isMobile ? 'p-[12px]' : 'px-[38px] pt-[22px]'}`}>
                  {isMobile ? (
                    <>
                      <Image src="/images/inviteAddEarnMobile.png?v=1" alt="" width={318} height={108} className="w-full h-auto" />
                      <div className="w-full absolute left-0 top-[66px]">
                        <Image src="/images/rewards-points-mobile.png?v=1" alt="Points" width={78} height={78} className="mx-auto" />
                        <div className="text-[40px] text-white font-bold text-center">{t('rewards.inviteEarn')}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Image src="/images/inviteAddEarn.png?v=1" alt="" width={1235} height={287} className="w-full h-auto" />
                      <div className="hidden md:block w-full absolute left-0 top-[22px]">
                        <Image src="/images/rewards-points.png?v=1" alt="Points" width={200} height={200} className="mx-auto" />
                        <div className="mt-[16px] text-[40px] text-white font-bold text-center">{t('rewards.inviteEarn')}</div>
                      </div>
                    </>
                  )}
                </div>
                <p className={`${isMobile ? 'mt-[88px] leading-[24px] text-[16px] mx-[16px]' : 'mt-[-6px] leading-[40px] text-[20px]'} text-white text-center`}>{t('rewards.getRewarded')}</p>

                {/* Invite Code */}
                <div className={`max-w-[480px] ${isMobile ? 'mx-[16px]' : 'mx-auto'} mt-[12px] bg-[#051A3D] rounded-[16px] border border-white/20 pb-[10px]`}>
                  <div className="flex items-center justify-between bg-[#04122B] rounded-[16px] border-b border-white/20 px-[12px]">
                    <div className="h-[80px] pt-[12px]">
                      <div className="h-[12px] leading-[12px] text-[12px] text-white">{t('rewards.inviteCode')}</div>
                      <div className="mt-[16px] h-[20px] leading-[20px] text-[20px] bg-[linear-gradient(90deg,_#FC7266,_#FC884A)] bg-clip-text text-transparent">{memberCode || '—'}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onCopyToText(t('rewards.inviteFriendsCopyText', {code: memberCode || ''}))}
                      className="h-[42px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold px-[12px] rounded-[16px]"
                    >
                      {t('rewards.inviteFriends')}
                    </Button>
                  </div>

                  <div className="mt-[12px] flex items-center justify-between text-white px-[12px]">
                    <p className="flex-1 h-[18px] leading-[18px] text-[16px] pr-[12px] truncate">{typeof window !== 'undefined' ? `${window.location.origin}/?code=${memberCode || ''}` : ''}</p>
                    <div className="cursor-pointer" onClick={() => { onCopyToText(typeof window !== 'undefined' ? `${window.location.origin}/?code=${memberCode || ''}` : '') }}>
                      <CopyIcon />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-[24px]">
                <div className="h-[24px] flex items-center gap-1 flex-nowrap">
                  <span className={`${isMobile ? 'text-[20px]' : 'text-[24px]'} text-white font-bold whitespace-nowrap`}>{t('rewards.inviteRecord')}</span>
                  <span className={`${isMobile ? 'text-[12px]' : 'text-[16px]'} text-white/60 font-bold whitespace-nowrap`}>{t('rewards.totalPerson', {count: inviteRecords.length})}</span>
                </div>
                {inviteRecords.length > 0 ? (
                  <div className="mt-[16px] space-y-[24px]">
                    <div className="h-[24px] flex justify-between leading-[24px] text-[16px] text-white/60 font-bold">
                      <span>{t('rewards.invitee')}</span><span>{t('rewards.date')}</span>
                    </div>
                    {inviteRecords.map((record, index) => (
                      <div key={index} className="flex pb-[16px] border-b border-white/10">
                        {record.avatar ? (
                          <Image src={record.avatar} alt="" width={40} height={40} />
                        ) : (
                          <Avatar
                            size={40}
                            name={record.loginAddress}
                            variant={'marble'}
                          />
                        )}
                        {/*<img src={record.avatar} alt="" className="size-[40px]" />*/}
                        <div className="ml-[12px] flex-1">
                          <Link href={`/profile?memberId=${record.memberId}`}>
                            <div className="leading-[16px] text-[16px] text-white font-bold truncate">{record.nickName}</div>
                          </Link>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white/60 font-bold truncate">{addPoint(record.loginAddress)}</div>
                        </div>
                        <div className="mt-[24px] leading-[16px] text-[16px] text-white">{timeAgoEn(record.inviteTime)}</div>
                      </div>
                    ))}
                    <div className="mt-[40px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                  </div>
                ) : (
                  <div className="mt-[24px] min-h-[464px] flex flex-col items-center">
                    <div className="mt-[128px]">
                      <Image src="/images/empty.png?v=1" alt="Points" width={50} height={39} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 text-center">{t('common.nothing')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === 'rewards' && (
          <>
            <div className={`${isMobile ? 'mt-[24px] gap-[16px]' : 'mt-[40px] gap-[40px]'} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
              <div className="flex items-center justify-center gap-[12px] bg-[#04122B] rounded-[24px] py-[40px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold whitespace-nowrap">{t('rewards.totalRewards')}</div>
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">
                  <TooltipAmount shares={memberMoneyTotal.totalInviteAmount} decimals={0} precision={2} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-[12px] bg-[#04122B] rounded-[24px] py-[40px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold whitespace-nowrap">{t('rewards.claimed')}</div>
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">
                  <TooltipAmount shares={memberMoneyTotal.claimedAmount} decimals={0} precision={2} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-[12px] bg-[#04122B] rounded-[24px] py-[40px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold whitespace-nowrap">{t('rewards.claimable')}</div>
                <Image src={tokenIcon} alt="" width={24} height={24} />
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">
                  <TooltipAmount shares={memberMoneyTotal.avaAmount} decimals={0} precision={2} />
                </div>
              </div>
            </div>
            <Card className={`${isMobile ? 'mt-[24px]' : 'mt-[40px]'} bg-[#04122B] border-none rounded-[24px]`}>
              <CardContent className={isMobile ? 'p-[16px]' : 'p-[24px]'}>
                {memberMoneyRecords.length > 0 ? (
                  <>
                    {isMobile ? (
                      <div className="space-y-[12px]">
                        <div className="flex leading-[16px] text-[16px] text-white/60">
                          <div className="flex-1">{t('rewards.inviteeOrProject')}</div>
                          <div className="flex-1 text-right">{t('rewards.investmentOrBonus')}</div>
                        </div>
                        {memberMoneyRecords.map((record, index) => (
                          <div key={index} className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[8px] border-b border-white/10">
                            <div className="flex-1 overflow-hidden">
                              <div className="leading-[16px] text-[16px] text-white font-bold truncate">{record.fromNickName}</div>
                              <EllipsisWithTooltip
                                text={getLanguageLabel(record.projectName, language)}
                                className="mt-[8px] leading-[16px] text-[16px] text-white/60"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-end gap-[20px]">
                                <div className="flex items-center justify-center gap-[8px]">
                                  <Image src={tokenIcon} alt="" width={16} height={16} />
                                  <TooltipAmount shares={record.totalAmount} decimals={0} precision={2} />
                                </div>
                                <div className="flex items-center justify-center gap-[8px]">
                                  <Image src={tokenIcon} alt="" width={16} height={16} />
                                  <TooltipAmount shares={record.feeAmount} decimals={0} precision={2} />
                                </div>
                              </div>
                              <div className="mt-[8px] leading-[16px] text-[16px] text-white/60 text-right">{timeAgoEn(record.createTime)}</div>
                            </div>
                          </div>
                        ))}
                        {hasMoreMemberMoney ? (
                          <div
                            className="mt-[15px] flex items-center justify-center bg-[#010A2C] border border-[#26282E] text-center rounded-[16px] py-[9px] cursor-pointer"
                            onClick={() => {
                              const pageNumber = memberMoneyPageNum + 1;
                              setMemberMoneyPageNum(pageNumber);
                              getMemberMoneyRecord(pageNumber, true);
                            }}
                          >
                            <span className="mr-[4px] text-[14px] text-white/60">{isFetchingMemberMoney ? t('common.loading') || 'Loading...' : t('common.loadMore')}</span>
                            <Image src="/images/icon/icon-refresh.png?v=1" alt="OnePredict" width={14} height={14} />
                          </div>
                        ) : (
                          <div className="mt-[32px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-[24px]">
                        <div className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[8px]">
                          <div className="flex-[2]">{t('rewards.invitee')}</div>
                          <div className="flex-[3] text-center">{t('rewards.project')}</div>
                          <div className="flex-[3] text-center">{t('rewards.investmentAmount')}</div>
                          <div className="flex-[3] text-center">{t('rewards.amountOfBonus')}</div>
                          <div className="flex-[2] text-right">{t('rewards.date')}</div>
                        </div>
                        {memberMoneyRecords.map((record, index) => (
                          <div key={index} className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[25px] border-b border-white/10">
                            <div className="flex-[2] truncate">{record.fromNickName}</div>
                            <EllipsisWithTooltip
                              text={getLanguageLabel(record.projectName, language)}
                              className="flex-[3] text-center leading-[16px] text-[16px] text-white/60"
                            />
                            <div className="flex-[3] flex items-center justify-center gap-[8px]">
                              <Image src={tokenIcon} alt="" width={16} height={16} />
                              <TooltipAmount shares={record.totalAmount} decimals={0} precision={2} />
                            </div>
                            <div className="flex-[3] flex items-center justify-center gap-[8px]">
                              <Image src={tokenIcon} alt="" width={16} height={16} />
                              <TooltipAmount shares={record.txnAmount} decimals={0} precision={4} />
                            </div>
                            <div className="flex-[2] text-right">{timeAgoEn(record.createTime)}</div>
                          </div>
                        ))}
                        {hasMoreMemberMoney ? (
                          <div
                            className="mt-[15px] flex items-center justify-center bg-[#010A2C] border border-[#26282E] text-center rounded-[16px] py-[9px] cursor-pointer"
                            onClick={() => {
                              const pageNumber = memberMoneyPageNum + 1;
                              setMemberMoneyPageNum(pageNumber);
                              getMemberMoneyRecord(pageNumber, true);
                            }}
                          >
                            <span className="mr-[4px] text-[14px] text-white/60">{isFetchingMemberMoney ? t('common.loading') || 'Loading...' : t('common.loadMore')}</span>
                            <Image src="/images/icon/icon-refresh.png?v=1" alt="OnePredict" width={14} height={14} />
                          </div>
                        ) : (
                          <div className="mt-[32px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-[24px] min-h-[364px] flex flex-col items-center">
                    <div className="mt-[128px]">
                      <Image src="/images/empty.png?v=1" alt="Points" width={50} height={39} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 text-center">{t('common.nothing')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
