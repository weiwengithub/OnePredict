"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from '@/contexts/viewport';
import { type SortBy, type Direction } from "@/lib/api/interface";
import TrendingIcon from '@/assets/icons/trending.svg';
import LiveIcon from '@/assets/icons/live.svg';
import NewIcon from '@/assets/icons/new.svg';
import SortUpIcon from '@/assets/icons/sort-up.svg';
import SortDownIcon from '@/assets/icons/sort-down.svg';
import ConcernIcon from '@/assets/icons/concern.svg';
import FollowedIcon from '@/assets/icons/followed.svg';

// 统一类型，保证 Icon 是一个 React 组件
type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface Props {
  onChange?: (params: { category: string; sortBy: SortBy; direction: Direction; showFollowed: boolean; }) => void;
  initialCategory?: string;
  initialSortBy?: SortBy;
}

export default function CategoryTabs({
  onChange,
  initialCategory = 'trending',
  initialSortBy = 'endTime',
}: Props) {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
  const [expireTimeDirection, setExpireTimeDirection] = useState<Direction>('');
  const [volumeDirection, setVolumeDirection] = useState<Direction>('');
  const [showFollowed, setShowFollowed] = useState(false);

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

  // 点分类按钮时
  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
  };

  // 选排序时
  const handleSortChange = (v: SortBy) => {
    setSortBy(v);
  };

  // 监听变化并通知外层触发查询
  useEffect(() => {
    onChange?.({ category: activeCategory, sortBy, direction: sortBy === 'endTime' ? expireTimeDirection : volumeDirection, showFollowed });
  }, [activeCategory, sortBy, expireTimeDirection, volumeDirection, showFollowed, onChange]);

  return (
    <div className={`flex ${isMobile ? 'flex-col mb-[16px]' : 'justify-between items-center mb-[36px]'}`}>
      <div className={`flex flex-nowrap gap-[4px] border border-white/20 rounded-[8px] px-[4px] py-[2px] ${isMobile ? 'w-full overflow-x-auto overflow-y-hidden' : ''}`}>
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <Button
              key={category.id}
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
              className={`
              flex-none flex items-center space-x-[2px] px-[12px] py-[8px] rounded-lg h-[32px] text-[14px] font-medium transition-colors
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
      <div className={`flex items-center justify-between ${isMobile ? 'mt-[16px]' : ''}`}>
        <div className="h-[36px] flex items-center gap-[16px]">
          <div
            className="flex items-center gap-[4px] cursor-pointer"
            onClick={() => {
              setVolumeDirection('')
              setExpireTimeDirection(expireTimeDirection === 'ASC' ? 'DESC' : expireTimeDirection === 'DESC' ? '' : 'ASC')
            }}
          >
            <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('categories.expireTime')}</div>
            <div className="space-y-[2px]">
              <SortUpIcon className={`${expireTimeDirection === 'ASC' ? 'text-white' : 'text-[#434445]'} text-[8px]`} />
              <SortDownIcon className={`${expireTimeDirection === 'DESC' ? 'text-white' : 'text-[#434445]'} text-[8px]`} />
            </div>
          </div>
          <div
            className="flex items-center gap-[4px] cursor-pointer"
            onClick={() => {
              setExpireTimeDirection('')
              setVolumeDirection(volumeDirection === 'ASC' ? 'DESC' : volumeDirection === 'DESC' ? '' : 'ASC')
            }}
          >
            <div className="h-[18px] leading-[18px] text-[14px] text-white">{t('categories.volume')}</div>
            <div className="space-y-[2px]">
              <SortUpIcon className={`${volumeDirection === 'ASC' ? 'text-white' : 'text-[#434445]'} text-[8px]`} />
              <SortDownIcon className={`${volumeDirection === 'DESC' ? 'text-white' : 'text-[#434445]'} text-[8px]`} />
            </div>
          </div>
        </div>
        <div
          className="ml-[12px] h-[24px] border-l border-white/10 cursor-pointer"
          onClick={() => {setShowFollowed(!showFollowed);}}
        >
          <div className={`ml-[12px] -mt-[2px] h-[28px] flex items-center gap-[8px] text-white px-[10px] ${showFollowed ? 'border border-white/40 rounded-[8px]' : ''}`}>
            {showFollowed ? <FollowedIcon className="text-[12px] text-white" /> : <ConcernIcon className="text-[12px] text-white" />}
            <div className="h-[18px] leading-[18px] text-[14px]">{t('categories.watchlist')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
