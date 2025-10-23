"use client";

import React, {useState, useEffect, useRef} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Copy, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchIcon from "@/assets/icons/search.svg";
import UserIcon from "@/assets/icons/user.svg";
import apiService from "@/lib/api/services";
import {MarketOption} from "@/lib/api/interface";
import {useRouter} from "next/navigation";
import {useIsMobile} from "@/contexts/viewport";

interface SearchResult {
  id: string;
  title: string;
  address: string;
  icon: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { t } = useLanguage();
  const router = useRouter();

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
      };
    }
  }, [open]);

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const didFetchRef = useRef(false);
  const [trendingResults, setTrendingResults] = useState<MarketOption[]>([]);
  const [predictionPageNumber, setPredictionPageNumber] = useState(0);
  const [predictionPageSize, setPredictionPageSize] = useState(20);
  useEffect(() => {
    if (didFetchRef.current) return;   // 防止 StrictMode 下的第二次执行
    didFetchRef.current = true;

    (async () => {
      try {
        const {data} = await apiService.getMarketList({
          pageSize: predictionPageSize,
          pageNum: predictionPageNumber,
          projectName: ''
        });
        setTrendingResults(data.rows)
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // const filteredResults = trendingResults.filter(result =>
  //   result.metaJson.title.toLowerCase().includes(searchQuery.toLowerCase())
  // );

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

          {/* Trending Title with better styling */}
          <div className="mt-[12px] mb-[8px] h-[24px] leading-[24px] text-[16px] text-white/60">
            {t('search.trending')}
          </div>
        </div>

        {/* Results List with improved styling */}
        <div>
          <div className="space-y-1">
            {trendingResults.map((result, index) => (
              <div
                key={result.marketId}
                className="flex items-center justify-between p-[8px] hover:bg-white/20 rounded-[8px] transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  router.push(`/details?marketId=${result.marketId}`);
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
                <div className="flex-1 h-[24px] leading-[24px] text-[20px] text-white px-[12px] truncate">{result.marketName}</div>
                <UserIcon className="text-[12px] text-white/60" />
                <div className="ml-[4px] h-[24px] leading-[24px] text-[14px] text-white/60">155</div>
              </div>
            ))}
          </div>

          {trendingResults.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-white/40 text-base mb-2">{t('search.noResults')}</div>
              <div className="text-white/30 text-sm">Try searching for "{searchQuery}"</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
