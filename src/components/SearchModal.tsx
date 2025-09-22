"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Copy, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchIcon from "@/assets/icons/search.svg";
import UserIcon from "@/assets/icons/user.svg";

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

// 模拟搜索数据
const trendingResults: SearchResult[] = [
  {
    id: "1",
    title: "Search Markets.contract address",
    address: "0x1234...5678",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "2",
    title: "Search Markets.contract address",
    address: "0x2345...6789",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "3",
    title: "Search Markets.contract address",
    address: "0x3456...7890",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "4",
    title: "Search Markets.contract address",
    address: "0x4567...8901",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "5",
    title: "Search Markets.contract address",
    address: "0x5678...9012",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "6",
    title: "Search Markets.contract address",
    address: "0x6789...0123",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "7",
    title: "Search Markets.contract address",
    address: "0x7890...1234",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  },
  {
    id: "8",
    title: "Search Markets.contract address",
    address: "0x8901...2345",
    icon: "https://ext.same-assets.com/1276354692/3070211314.svg"
  }
];

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { t } = useLanguage();

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

  const filteredResults = trendingResults.filter(result =>
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[576px] w-full p-[24px] bg-[#051A3D] border-none overflow-hidden rounded-[36px] shadow-2xl shadow-black/50">
        {/* Header with gradient border effect */}
        <div className="relative">
          {/* Search Box with enhanced gradient */}
          <div className="h-[56px] bg-[#010A2C] rounded-[100px] flex items-center">
            <SearchIcon />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/60 focus:ring-0 focus:outline-none text-[16px]"
            />
          </div>

          {/* Trending Title with better styling */}
          <div className="mt-[12px] mb-[8px] h-[24px] leading-[24px] text-[16px] text-white/60">
            {t('search.trending')}
          </div>
        </div>

        {/* Results List with improved styling */}
        <div>
          <div className="space-y-1">
            {filteredResults.map((result, index) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-[8px] hover:bg-white/20 rounded-[8px] transition-all duration-200 group cursor-pointer"
              >
                <div className="w-[32px] h-[32px] rounded-[8px] overflow-hidden">
                  <Image
                    src={result.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="size-full"
                  />
                </div>
                <div className="flex-1 h-[24px] leading-[24px] text-[20px] text-white px-[12px]">{result.title}</div>
                <UserIcon className="text-[12px] text-white/60" />
                <div className="ml-[4px] h-[24px] leading-[24px] text-[14px] text-white/60">155</div>
              </div>
            ))}
          </div>

          {filteredResults.length === 0 && searchQuery && (
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
