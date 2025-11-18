"use client";

import React, {useState, useEffect, useRef} from "react";
import { Button } from "@/components/ui/button";
import Avatar from 'boring-avatars';
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "@/components/MobileNavigation";
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import Image from "next/image";
import ExportIcon from "@/assets/icons/export.svg";
import DeclineIcon from "@/assets/icons/decline.svg";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import {MemberInfo, RankInfo} from "@/lib/api/interface";
import apiService from "@/lib/api/services";
import { useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import Link from 'next/link';
import {RootState, store} from "@/store";
type TimePeriod = 'All' | 'Daily' | 'Weekly' | 'Monthly';
type SortField = 'pnl' | 'volume' | 'tradeCount'
import Skeleton from "@/components/ui/skeleton";
import RankingModal from "@/components/RankingModal";

function LeaderboardSkeleton({ isMobile }: { isMobile: boolean }) {
  const Row = ({ highlight = false }: { highlight?: boolean }) => (
    <div className={`min-w-[800px] ${highlight ? "bg-white/[0.02]" : ""}`}>
      <div className="flex items-center py-[12px]">
        <div className="w-[84px] flex items-center justify-center">
          <Skeleton className="h-[24px] w-[24px] rounded-full" />
        </div>
        <div className="flex-1 px-[24px] flex items-center gap-[16px]">
          <Skeleton className="h-[40px] w-[40px] rounded-full" />
          <Skeleton className="h-[16px] w-[120px]" />
          <Skeleton className="h-[16px] w-[48px] rounded-[4px]" />
        </div>
        <div className="w-[120px] flex justify-center">
          <Skeleton className="h-[16px] w-[80px]" />
        </div>
        <div className="w-[120px] flex justify-center">
          <Skeleton className="h-[16px] w-[80px]" />
        </div>
        <div className="w-[120px] flex justify-center">
          <Skeleton className="h-[16px] w-[80px]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-[22px] max-w-[1020px] mx-auto bg-[#04122B] text-white/60 backdrop-blur-sm rounded-[32px] overflow-x-auto overflow-y-hidden shadow-2xl">
      {/* 表头骨架 */}
      <div className="min-w-[800px] bg-[#031026] pt-[23px] pb-[17px]">
        <div className="flex items-center text-[16px] tracking-wider px-[24px]">
          <div className="w-[84px] text-center">
            <Skeleton className="h-[16px] w-[48px] mx-auto" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-[16px] w-[120px]" />
          </div>
          <div className="w-[120px] flex justify-center">
            <Skeleton className="h-[16px] w-[80px]" />
          </div>
          <div className="w-[120px] flex justify-center">
            <Skeleton className="h-[16px] w-[80px]" />
          </div>
          <div className="w-[120px] flex justify-center">
            <Skeleton className="h-[16px] w-[80px]" />
          </div>
        </div>
      </div>

      {/* 行骨架（含“我的排名”占位 + 列表占位） */}
      <div className="min-w-[800px] divide-y divide-white/10">
        <Row highlight />
        {Array.from({ length: 6 }).map((_, i) => (
          <Row key={i} highlight={i % 2 === 0} />
        ))}
      </div>
    </div>
  );
}


export default function Leaderboard() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>('All');
  const [currentSortField, setCurrentSortField] = useState<SortField>('pnl');

  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  // Time period configurations
  const timePeriods = [
    { key: 'All' as TimePeriod, label: t('leaderboard.all'), description: 'Today\'s Top Performers' },
    { key: 'Daily' as TimePeriod, label: t('leaderboard.daily'), description: 'Today\'s Top Performers' },
    { key: 'Weekly' as TimePeriod, label: t('leaderboard.weekly'), description: 'This Week\'s Champions' },
    { key: 'Monthly' as TimePeriod, label: t('leaderboard.monthly'), description: 'Month\'s Leading Predictors' }
  ];

  const [showRanking, setShowRanking] = useState(false);

  const [userRank, setUserRank] = useState<RankInfo | null>(null);
  const [rankList, setRankList] = useState<RankInfo[]>([]);
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);

  const loadingRef = useRef(false);
  const ioLockRef = useRef(false); // IO触发期间的软锁
  const abortRef = useRef<AbortController | null>(null);
  const loadPage = useCallback(async () => {
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const { signal } = ac;

    try {
      const { data } = await apiService.getRankList({
        pageSize,
        pageNum: pageNumber,
        statPeriod: currentPeriod,
        orderByColumn: currentSortField,
        orderDirection: 'DESC',
        address: userAddress || ''
      }, { signal } as any);

      const user = data?.rows?.[0]?.currentUser;
      // const member = data?.rows?.[0]?.currentMember;
      if (user) setUserRank(user);

      const rankList: RankInfo[] = data?.rows?.[0]?.rankList ?? [];

      // 合并列表
      setRankList(prev => ([...prev, ...rankList]));

      const received = rankList.length;

      const nextHasMore = received >= pageSize;

      setHasMore(nextHasMore);
    } catch (e: any) {
      if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
        console.error(e?.message || "请求失败");
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      ioLockRef.current = false;
    }

    return () => ac.abort();
  }, [pageSize, pageNumber, currentPeriod, currentSortField, userAddress]);

  const handlePeriodChange = (period: TimePeriod) => {
    if(currentPeriod === period) return;
    setRankList([]);
    setPageNumber(1);
    setCurrentPeriod(period);
  };

  const handleSortField = (period: SortField) => {
    if(currentSortField === period) return;
    setRankList([]);
    setPageNumber(1);
    setCurrentSortField(period);
  };

  // 时间范围变更时，重置并加载第一页
  useEffect(() => {
    setUserRank(null);
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriod, currentSortField, userAddress, pageNumber]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Image src="/images/icon/icon-leaderboard-first.png?v=1" alt="Search" width={24} height={24} />;
      case 2:
        return <Image src="/images/icon/icon-leaderboard-second.png?v=1" alt="Search" width={24} height={24} />;
      case 3:
        return <Image src="/images/icon/icon-leaderboard-thirdly.png?v=1" alt="Search" width={24} height={24} />;
      default:
        return <span className="h-[24px] leading-[24px] text-white text-center">{rank}</span>;
    }
  };

  // Time period selector component
  const TimePeriodSelector = () => {
    return (
      <div className="mt-[16px]">
        <div className="flex items-center justify-center space-x-[8px]">
          {timePeriods.map((period) => (
            <Button
              key={period.key}
              variant="ghost"
              onClick={() => handlePeriodChange(period.key as TimePeriod)}
              className={`rounded-[40px] font-medium transition-all duration-300 
                ${isMobile ? 'h-[24px] px-[12px] py-[4px] text-[14px]' : 'h-[32px] px-[16px] py-[8px] text-[16px]'}
                ${currentPeriod === period.key as TimePeriod ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black border border-white/20'}`}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] ${isMobile ? 'pb-[136px]' : ''}`}>
        {/* Header */}
        {isMobile ? (
          <MobileNavigation
            activeCategory="leaderboard"
            onCategoryChange={() => {}}
          />
        ) : (
          <Header currentPage="leaderboard" />
        )}

        {/* Main Content */}
        <main className={isMobile ? 'w-full p-[16px]' : 'max-w-[1728px] mx-auto px-[40px] pt-[136px]'}>
          {/* Header Section */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className={`${isMobile ? 'w-[64px] h-[64px]' : 'w-[96px] h-[96px]'} bg-[#483E27] rounded-[24px] flex items-center justify-center`}>
                <Image src="/images/leaderboard.png?v=1" alt="" width={48} height={48} className={isMobile ? 'size-[32px]' : 'size-[48px]'} />
              </div>
            </div>
            <div className={`mt-[16px] text-white tracking-tight ${isMobile ? 'text-[40px] leading-[52px]' : 'text-[56px] leading-[73px]'}`}>{t('header.leaderboard')}</div>
            <p className={`mt-[16px] text-[#A5A6A8] mx-auto ${isMobile ? 'text-[16px] leading-[21px]' : 'text-[32px] leading-[42px]'}`}>{t('leaderboard.title')}</p>
          </div>

          {/* Time Period Selector */}
          <TimePeriodSelector />

          {/* Leaderboard Table */}
          {loading && pageNumber === 1 ? (
            <LeaderboardSkeleton isMobile={isMobile} />
          ) : (
            <div className="mt-[22px] max-w-[1020px] mx-auto bg-[#04122B] text-white/60 backdrop-blur-sm rounded-[32px] overflow-x-auto overflow-y-hidden shadow-2xl">
              {/* Table Header */}
              <div className="min-w-[800px] bg-[#031026] pt-[23px] pb-[17px]">
                <div className="flex text-[16px] tracking-wider">
                  <div className="w-[84px] text-center">{t('leaderboard.rank')}</div>
                  <div className="flex-1 px-[24px]">{t('leaderboard.trader')}</div>
                  <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => handleSortField("pnl")}>
                    <div className={`text-white ${currentSortField === "pnl" ? 'block' : 'hidden'}`}>
                      <DeclineIcon />
                    </div>
                    <span className={`ml-[4px] ${currentSortField === "pnl" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.pnl')}</span>
                  </div>
                  <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => handleSortField("volume")}>
                    <div className={`text-white ${currentSortField === "volume" ? 'block' : 'hidden'}`}>
                      <DeclineIcon />
                    </div>
                    <span className={`ml-[4px] ${currentSortField === "volume" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.volume')}</span>
                  </div>
                  <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => handleSortField("tradeCount")}>
                    <div className={`text-white ${currentSortField === "tradeCount" ? 'block' : 'hidden'}`}>
                      <DeclineIcon />
                    </div>
                    <span className={`ml-[4px] ${currentSortField === "tradeCount" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.trades')}</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              {rankList.length > 0 ? (
                <div className="min-w-[800px] divide-y divide-white/20">
                  {/* User Rank */}
                  {userRank && (
                    <div
                      className="hover:bg-white/[0.03] transition-all duration-300"
                    >
                      <div className="flex items-center py-[12px]">
                        {/* Rank */}
                        <div className="w-[84px] flex items-center justify-center">
                          {getRankIcon(userRank.sort)}
                        </div>

                        {/* Trader */}
                        <div className="flex-1 px-[24px] flex items-center text-white">
                          {userRank.avatar ? (
                            <Image src={userRank.avatar} alt="" width={40} height={40} />
                          ) : (
                            <Avatar
                              size={40}
                              name={userRank.address}
                              variant={'marble'}
                            />
                          )}
                          <Link href={`/profile?memberId=${userRank.memberId}`}>
                            <span className="ml-[16px] inline-block text[16px]">{userRank.nickName ? userRank.nickName : userRank.address.slice(-6)}</span>
                          </Link>
                          <span className="ml-[12px] mr-[24px] inline-block h-[16px] leading-[16px] px-[10px] border border-[#28C04E] bg-[rgba(40,192,78,0.5)]] rounded-[4px] text-[12px] text-[#28C04E]">{t('leaderboard.me')}</span>
                          <ExportIcon className="cursor-pointer" onClick={() => setShowRanking(true)} />
                        </div>

                        {/* PnL */}
                        <div className={`w-[120px] text-[16px] text-center ${userRank.pnl > 0 ? 'text-[#29C04E]' : userRank.pnl < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {userRank.pnl.toLocaleString()}
                        </div>

                        {/* Volume */}
                        <div className={`w-[120px] text-[16px] text-center ${userRank.volume > 0 ? 'text-[#29C04E]' : userRank.volume < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {userRank.volume.toLocaleString()}
                        </div>

                        {/* Trades */}
                        <div className={`w-[120px] text-[16px] text-center ${userRank.tradeCount > 0 ? 'text-[#29C04E]' : userRank.tradeCount < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {userRank.tradeCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {rankList.map((rank, index) => (
                    <div
                      key={`${rank.address}-${index}`}
                      className={`hover:bg-white/[0.03] transition-all duration-300 ${
                        index % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-center py-[12px]">
                        {/* Rank */}
                        <div className="w-[84px] flex items-center justify-center">
                          {getRankIcon(rank.sort)}
                        </div>

                        {/* Trader */}
                        <div className="flex-1 px-[24px] flex items-center text-white">
                          {rank.avatar ? (
                            <Image src={rank.avatar} alt="" width={40} height={40} />
                          ) : (
                            <Avatar
                              size={40}
                              name={rank.address}
                              variant={'marble'}
                            />
                          )}
                          <Link href={`/profile?memberId=${rank.memberId}`}>
                            <span className="ml-[16px] inline-block text[16px]">{rank.nickName ? rank.nickName : rank.address.slice(-6)}</span>
                          </Link>
                        </div>

                        {/* PnL */}
                        <div className={`w-[120px] text-[16px] text-center ${rank.pnl > 0 ? 'text-[#29C04E]' : rank.pnl < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {rank.pnl.toLocaleString()}
                        </div>

                        {/* Volume */}
                        <div className={`w-[120px] text-[16px] text-center ${rank.volume > 0 ? 'text-[#29C04E]' : rank.volume < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {rank.volume.toLocaleString()}
                        </div>

                        {/* Trades */}
                        <div className={`w-[120px] text-[16px] text-center ${rank.tradeCount > 0 ? 'text-[#29C04E]' : rank.tradeCount < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                          {rank.tradeCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`loading-row-${i}`} className="min-w-[800px]">
                          <div className="flex items-center py-[12px]">
                            <div className="w-[84px] flex items-center justify-center">
                              <Skeleton className="h-[24px] w-[24px] rounded-full" />
                            </div>
                            <div className="flex-1 px-[24px] flex items-center gap-[16px]">
                              <Skeleton className="h-[40px] w-[40px] rounded-full" />
                              <Skeleton className="h-[16px] w-[120px]" />
                            </div>
                            <div className="w-[120px] flex justify-center">
                              <Skeleton className="h-[16px] w-[80px]" />
                            </div>
                            <div className="w-[120px] flex justify-center">
                              <Skeleton className="h-[16px] w-[80px]" />
                            </div>
                            <div className="w-[120px] flex justify-center">
                              <Skeleton className="h-[16px] w-[80px]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}



                  {/* 兜底“加载更多”按钮（万一 IO 不可用或用户想手动触发） */}
                  {hasMore && !loading && (
                    <div className="flex justify-center py-4">
                      <button
                        onClick={()=>setPageNumber(pageNumber + 1)}
                        className="px-4 h-9 rounded-md bg-white/10 hover:bg-white/20 transition duration-200"
                      >
                        {t('common.loadMore') ?? 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-[37px]">
                  <Image src="/images/empty.png?v=1" alt="Points" width={50} height={39} className="mx-auto" />
                  <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        {!isMobile && <Footer />}
      </div>

      {/* Ranking Modal */}
      <RankingModal
        open={showRanking}
        rankType={currentSortField}
        value={userRank?.pnl || 0}
        sort={userRank?.sort || 0}
        memberCode={userRank?.memberCode || ''}
        avatar={userRank?.avatar || ''}
        onOpenChange={setShowRanking}
      />
    </>
  );
}
