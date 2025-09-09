"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TrendingIcon from '@/assets/icons/trending.svg';
import LiveIcon from '@/assets/icons/live.svg';
import NewIcon from '@/assets/icons/new.svg';
import WatchIcon from '@/assets/icons/watch.svg';
import ArrowDownIcon from '@/assets/icons/arrowDown.svg';

// 统一类型，保证 Icon 是一个 React 组件
type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const categories: { id: string; label: string; icon?: SvgComp }[] = [
  { id: "trending", label: "Trending", icon: TrendingIcon },
  { id: "live", label: "Live", icon: LiveIcon },
  { id: "new", label: "New", icon: NewIcon },
  { id: "politics", label: "Politics" },
  { id: "economy", label: "Economy" },
  { id: "crypto", label: "Crypto" },
  { id: "entertainment", label: "Entertainment" },
  { id: "society", label: "Society" },
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("trending");

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-wrap gap-[4px] mt-[40px] mb-[36px] border border-white/20 rounded-[8px] px-[4px] py-[2px]">
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
        <div className="h-[18px] leading-[18px] text-white text-[14px] font-bold">Sort by</div>
        <div className="ml-[12px] h-[36px] w-[170px] border border-[#26282E] rounded-[8px] flex items-center justify-between px-[16px]">
          <span className="inline-block leading-[18px] text-white text-[14px]">Expire Time</span>
          <ArrowDownIcon />
        </div>
        <div className="ml-[16px] h-[36px] border-l border-white/10 flex items-center text-white pl-[16pxs]">
          <WatchIcon className="w-[16px] h-[16px]" />
          <span className="inline-block ml-[5px] leading-[18px] text-[14px] font-bold">Watchlist</span>
        </div>
      </div>
    </div>
  );
}
