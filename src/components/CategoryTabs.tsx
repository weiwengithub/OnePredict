"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import TrendingIcon from '@/assets/icons/trending.svg';
import LiveIcon from '@/assets/icons/live.svg';
import NewIcon from '@/assets/icons/new.svg';
import WatchIcon from '@/assets/icons/watch.svg';
import ArrowDownIcon from '@/assets/icons/arrowDown.svg';

// 统一类型，保证 Icon 是一个 React 组件
type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("trending");
  const { t } = useLanguage();

  const categories: { id: string; label: string; icon?: SvgComp }[] = [
    { id: "trending", label: t('categories.trending'), icon: TrendingIcon },
    { id: "live", label: t('categories.live'), icon: LiveIcon },
    { id: "new", label: t('categories.new'), icon: NewIcon },
    { id: "politics", label: t('categories.politics') },
    { id: "economy", label: t('categories.economy') },
    { id: "crypto", label: t('categories.crypto') },
    { id: "entertainment", label: t('categories.entertainment') },
    { id: "society", label: t('categories.society') },
  ];

  return (
    <div className="flex justify-between items-center mb-[36px]">
      <div className="flex flex-wrap gap-[4px] border border-white/20 rounded-[8px] px-[4px] py-[2px]">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <Button
              key={category.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`
              flex items-center space-x-[2px] px-[12px] py-[8px] rounded-lg h-[32px] text-[14px] font-medium transition-colors
              ${isActive
                ? "bg-white text-black"
                : "text-white hover:text-black hover:bg-white"
              }
            `}
            >
              {Icon && <Icon className="w-[16px] h-[16px]" />}
              <span>{category.label}</span>
            </Button>
          );
        })}
      </div>
      <div className="flex items-center">
        <div className="h-[18px] leading-[18px] text-white text-[14px] font-bold">{t('categories.sortBy')}</div>
        <Select onValueChange={(v) => console.log(v)}>
          <SelectTrigger className="ml-[12px] h-[36px] w-[170px] bg-[#010A2C] border border-[#26282E] rounded-[8px] text-white text-[14px] px-[16px]">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent className="mt-[12px] bg-[#04122B] border-none p-[12px] space-y-[4px]">
            <SelectItem value="eth" className="h-[32px] text-white hover:bg-white/10 focus:bg-white/10">Ethereum</SelectItem>
            <SelectItem value="sui" className="h-[32px] text-white hover:bg-white/10 focus:bg-white/10">Sui</SelectItem>
            <SelectItem value="sol" className="h-[32px] text-white hover:bg-white/10 focus:bg-white/10">Solana</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-[16px] h-[36px] border-l border-white/10 flex items-center text-white pl-[16px]">
          <WatchIcon className="w-[16px] h-[16px]" />
          <span className="inline-block ml-[5px] leading-[18px] text-[14px] font-bold">{t('categories.watchlist')}</span>
        </div>
      </div>
    </div>
  );
}
