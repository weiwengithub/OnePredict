"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchIcon from "@/assets/icons/search.svg";
import UserIcon from "@/assets/icons/user.svg";
import apiService from "@/lib/api/services";
import { MarketOption } from "@/lib/api/interface";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/contexts/viewport";
import { useQuery } from "@tanstack/react-query";
import {getLanguageLabel} from "@/lib/utils";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const router = useRouter();

  const localeRecent = localStorage.getItem("recentSearches");
  const [recentSearches, setRecentSearches] = useState<string[]>(localeRecent ? localeRecent.split(",") : []);
  // 防抖搜索词
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // 使用 useEffect 实现防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms 防抖延迟

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 禁止背景滚动
  useEffect(() => {
    if (open) {
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
        setSearchQuery('')
      };
    }
  }, [open]);

  const setLocaleRecent = () => {
    if (searchQuery) {
      recentSearches.push(searchQuery)
      localStorage.setItem("recentSearches", recentSearches.join(','));
    }
  }

  const clearLocaleRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  }

  // 使用 useQuery 请求市场列表数据
  const { data: marketData, isLoading } = useQuery<{ rows: MarketOption[]; count: number }>({
    queryKey: ['searchMarketList', debouncedSearchQuery],
    queryFn: async ({ signal }) => {
      const { data } = await apiService.getMarketList({
        pageSize: 10,
        pageNum: 0,
        marketName: debouncedSearchQuery
      }, { signal });
      return data;
    },
    // 只在弹窗打开时启用查询
    enabled: open,
  });

  const trendingResults = marketData?.rows || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[60]">
      <DialogContent className={`bg-[#051A3D] border-none overflow-hidden rounded-[36px] shadow-2xl shadow-black/50 ${isMobile ? 'w-full left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none px-[16px] py-[24px]' : 'max-w-[576px] w-full p-[24px]'}`}>
        {/* Header with gradient border effect */}
        <div className="relative">
          {/* Search Box with enhanced gradient */}
          <div className="h-[56px] bg-[#010A2C] rounded-[100px] flex items-center px-[32px]">
            <SearchIcon className="flex-none text-white text-[16px]" />
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="bg-transparent text-white placeholder:text-white/60 text-[16px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              />
            </div>
          </div>
        </div>
        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="mt-[24px]">
            <div className="flex gap-[12px] h-[16px] leading-[16px] text-[16px]">
              <span className="text-white/60">{t('search.recentSearches')}</span><span className="text-white/40 hover:text-white cursor-pointer" onClick={clearLocaleRecent}>{t('search.clear')}</span>
            </div>
            <div className="mt-[12px] flex flex-wrap gap-x-[16px] gap-y-[8px]">
              {recentSearches.map((recent, index) => (
                <span key={index} className="inline-block h-[32px] bg-[#010A2C] rounded-[16px] leading-[32px] px-[8px] text-[16px] text-white cursor-pointer" onClick={() => setSearchQuery(recent)}>{recent}</span>
              ))}
            </div>
          </div>
        )}
        {/* Results List with improved styling */}
        <div className="mt-[24px]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white/40 text-base">{t('common.loading') || 'Loading...'}</div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {!searchQuery && <div className="mb-[8px] h-[24px] leading-[24px] text-[16px] text-white/60">{t('search.trending')}</div>}
                {trendingResults.map((result, index) => (
                  <div
                    key={result.marketId}
                    className="flex items-center justify-between p-[8px] hover:bg-white/20 rounded-[8px] transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      router.push(`/details?marketId=${result.marketId}`);
                      setLocaleRecent();
                      onOpenChange(false);
                    }}
                  >
                    <div className="w-[32px] h-[32px] rounded-[8px] overflow-hidden">
                      <Image
                        src={result.imageUrl}
                        alt=""
                        width={18}
                        height={18}
                        className="size-full"
                      />
                    </div>
                    <EllipsisWithTooltip
                      text={getLanguageLabel(result.marketName, language)}
                      className="flex-1 h-[24px] leading-[24px] text-[20px] text-white px-[12px]"
                    />
                    {(result.status === 'Resolved' || result.status === 'Completed') && (
                      <div className="mr-[12px] h-[18px] leading-[18px] border border-white/20 rounded-[4px] text-[12px] text-white px-[4px]">{t('search.settlement')}</div>
                    )}
                    {new Date(result.endTime).getTime() < Date.now() && (
                      <div className="mr-[12px] h-[18px] leading-[18px] border border-white/20 rounded-[4px] text-[12px] text-white px-[4px]">{t('search.closed')}</div>
                    )}
                    <UserIcon className="text-[12px] text-white/60" />
                    <div className="ml-[4px] h-[24px] leading-[24px] text-[14px] text-white/60">{result.traderCount}</div>
                  </div>
                ))}
              </div>

              {trendingResults.length === 0 && searchQuery && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-white/40 text-base mb-2">{t('search.noResults')}</div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
