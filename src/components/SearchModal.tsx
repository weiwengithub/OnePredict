"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Copy, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <DialogContent className="max-w-[640px] w-full p-0 bg-[#141924] border border-[#363071]/50 overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
        {/* Header with gradient border effect */}
        <div className="relative px-8 pt-8 pb-6">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>

          {/* Search Box with enhanced gradient */}
          <div className="relative mb-8">
            <div className="relative">
              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#467DFF] via-[#B94398] to-[#467DFF] rounded-xl p-[2px] opacity-60">
                <div className="bg-[#141924] rounded-xl h-full w-full"></div>
              </div>

              {/* Search input container */}
              <div className="relative bg-[#1a2332] rounded-xl border border-[#467DFF]/30">
                <div className="flex items-center px-5 py-4">
                  <Image
                    src="/images/icon/icon-search.png"
                    alt="Search"
                    width={20}
                    height={20}
                    className="mr-4 opacity-70"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Markets.contract address"
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus:ring-0 focus:outline-none text-base font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trending Title with better styling */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#467DFF] to-[#B94398] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <h3 className="text-[#4E74B5] text-2xl font-bold">Trending</h3>
          </div>
        </div>

        {/* Results List with improved styling */}
        <div className="max-h-[420px] overflow-y-auto px-8 pb-8">
          <div className="space-y-1">
            {filteredResults.map((result, index) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-[#467DFF]/10 hover:to-[#B94398]/10 rounded-xl transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#467DFF]/20"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#467DFF]/30 to-[#B94398]/30 flex items-center justify-center backdrop-blur-sm">
                    <Image
                      src={result.icon}
                      alt=""
                      width={18}
                      height={18}
                      className="opacity-90"
                    />
                  </div>
                  <div>
                    <div className="text-white/90 text-sm font-medium mb-1">{result.title}</div>
                    <div className="text-white/50 text-xs font-mono bg-[#467DFF]/10 px-2 py-1 rounded">
                      {result.address}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(result.address);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-3 hover:bg-white/10 rounded-lg transition-all duration-200 transform hover:scale-105"
                  title="Copy address"
                >
                  {copied === result.address ? (
                    <div className="w-5 h-5 text-green-400 font-bold">✓</div>
                  ) : (
                    <Copy className="w-5 h-5 text-white/60 hover:text-white" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {filteredResults.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-white/40 text-base mb-2">No results found</div>
              <div className="text-white/30 text-sm">Try searching for "{searchQuery}"</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
