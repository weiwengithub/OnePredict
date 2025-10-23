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
import { useMemo } from "react";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import { RootState } from "@/store";
type TimePeriod = 'all' | 'daily' | 'weekly' | 'monthly';
type SortField = 'pnl' | 'volume' | 'trades'
import Skeleton from "@/components/ui/skeleton";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>('all');
  const [currentSortField, setCurrentSortField] = useState<SortField>('pnl');

  // Time period configurations
  const timePeriods = [
    { key: 'all' as TimePeriod, label: t('leaderboard.all'), description: 'Today\'s Top Performers' },
    { key: 'daily' as TimePeriod, label: t('leaderboard.daily'), description: 'Today\'s Top Performers' },
    { key: 'weekly' as TimePeriod, label: t('leaderboard.weekly'), description: 'This Week\'s Champions' },
    { key: 'monthly' as TimePeriod, label: t('leaderboard.monthly'), description: 'Month\'s Leading Predictors' }
  ];

  // Pagination logic
  const totalPages = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = [];

  const [userRank, setUserRank] = useState<RankInfo | null>(null);
  const [rankList, setRankList] = useState<RankInfo[]>([]);
  const calledOnceRef = useRef(false);
  const currentAccount = useCurrentAccount();
  const [pageSize, setPageSize] = useState(50);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);

  const loadingRef = useRef(false);
  const lastRequestedPageRef = useRef<number>(0); // 防同页重复
  const ioLockRef = useRef(false); // IO触发期间的软锁
  const loadPage = async (targetPage: number, replace = false) => {
    // 防止同页重复请求（某些后端在空数据时会回传同一页）
    if (lastRequestedPageRef.current === targetPage) return;
    lastRequestedPageRef.current = targetPage;

    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const ac = new AbortController();
    const { signal } = ac;

    try {
      const { data } = await apiService.getRankList(
        {
          pageSize,
          pageNum: targetPage,
          type: "All"
        },
        { signal }
      );

      const user = data?.rows?.[0]?.loginUserRank;
      if (user) setUserRank(user);

      const rawList: RankInfo[] = data?.rows?.[0]?.rankList ?? [];
      const newList = user ? rawList.filter(r => r.address !== user.address) : rawList;

      // 合并列表
      setRankList(prev => (replace ? newList : [...prev, ...newList]));

      const total: number | undefined = data?.count;
      const received = newList.length;
      const startOffset = (targetPage - 1) * pageSize;

      const nextHasMore =
        total != null
          ? startOffset + received < total
          : received === pageSize;

      setHasMore(nextHasMore);

      if (received > 0) {
        setPageNumber(targetPage + 1);
      }
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
  };

  // 首屏加载：默认请求第 1 页
  useEffect(() => {
    let canceled = false;
    (async () => {
      const cancel = await loadPage(1, true);
      return () => {
        canceled = true;
        cancel?.(); // 组件卸载时取消请求
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMoreRankList = () => {
    if (!loading && hasMore) {
      loadPage(pageNumber);
    }
  };

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    // 预取触发点提前 200px
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          // 有更多、且没在加载才触发
          if (hasMore && !loading && !loadingRef.current) {
            getMoreRankList();
          }
        }
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, getMoreRankList]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setCurrentPeriod(period);
    if (!loading) {
      setPageNumber(1);
      loadPage(1, true);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Image src="/images/icon/icon-leaderboard-first.png" alt="Search" width={24} height={24} />;
      case 2:
        return <Image src="/images/icon/icon-leaderboard-second.png" alt="Search" width={24} height={24} />;
      case 3:
        return <Image src="/images/icon/icon-leaderboard-thirdly.png" alt="Search" width={24} height={24} />;
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
              onClick={() => handlePeriodChange(period.key)}
              className={`rounded-[40px] font-medium transition-all duration-300 
                ${isMobile ? 'h-[24px] px-[12px] py-[4px] text-[14px]' : 'h-[32px] px-[16px] py-[8px] text-[16px]'}
                ${currentPeriod === period.key ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black border border-white/20'}`}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-[136px] md:pb-0">
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
              <Image src="/images/leaderboard.png" alt="" width={48} height={48} className={isMobile ? 'size-[32px]' : 'size-[48px]'} />
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
                <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("pnl")}>
                  <div className={`text-white ${currentSortField === "pnl" ? 'block' : 'hidden group-hover:block'}`}>
                    <DeclineIcon />
                  </div>
                  <span className={`ml-[4px] ${currentSortField === "pnl" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.pnL')}</span>
                </div>
                <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("volume")}>
                  <div className={`text-white ${currentSortField === "volume" ? 'block' : 'hidden group-hover:block'}`}>
                    <DeclineIcon />
                  </div>
                  <span className={`ml-[4px] ${currentSortField === "volume" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.volume')}</span>
                </div>
                <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("trades")}>
                  <div className={`text-white ${currentSortField === "trades" ? 'block' : 'hidden group-hover:block'}`}>
                    <DeclineIcon />
                  </div>
                  <span className={`ml-[4px] ${currentSortField === "trades" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t('leaderboard.trades')}</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            {rankList.length > 0 ? (
              <div className="min-w-[800px] divide-y divide-white/20">
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
                        <Avatar
                          size={40}
                          name={userRank.address}
                          variant={'marble'}
                        />
                        <span className="ml-[16px] inline-block text[16px]">{userRank.address.slice(-6)}</span>
                        <span className="ml-[12px] mr-[24px] inline-block h-[16px] leading-[16px] px-[10px] border border-[#28C04E] bg-[rgba(40,192,78,0.5)]] rounded-[4px] text-[12px] text-[#28C04E]">{t('leaderboard.me')}</span>
                        <ExportIcon />
                      </div>

                      {/* PnL */}
                      <div className={`w-[120px] text-[16px] text-center ${userRank.profit > 0 ? 'text-[#29C04E]' : userRank.profit < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                        {userRank.profit.toLocaleString()}
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
                        <Avatar
                          size={40}
                          name={rank.address}
                          variant={'marble'}
                        />
                        <span className="ml-[16px] inline-block text[16px]">{rank.address.slice(-6)}</span>
                        {/*<span className="ml-[12px] mr-[24px] inline-block h-[16px] leading-[16px] px-[10px] border border-[#28C04E] bg-[rgba(40,192,78,0.5)]] rounded-[4px] text-[12px] text-[#28C04E]">Me</span>*/}
                        {/*<ExportIcon />*/}
                      </div>

                      {/* PnL */}
                      <div className={`w-[120px] text-[16px] text-center ${rank.profit > 0 ? 'text-[#29C04E]' : rank.profit < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                        {rank.profit.toLocaleString()}
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

                {/* 触底哨兵：用于 IntersectionObserver 观测 */}
                {hasMore && (
                  <div ref={loadMoreRef} className="h-6 w-full" />
                )}

                {/* 兜底“加载更多”按钮（万一 IO 不可用或用户想手动触发） */}
                {hasMore && !loading && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={getMoreRankList}
                      className="px-4 h-9 rounded-md bg-white/10 hover:bg-white/20 transition duration-200"
                    >
                      {t('common.loadMore') ?? 'Load more'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-[37px]">
                <Image src="/images/empty.png" alt="Points" width={50} height={39} className="mx-auto" />
                <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
