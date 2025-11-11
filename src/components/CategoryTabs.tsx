"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from '@/contexts/viewport';
import {type SortBy, type Direction, DictInfo} from "@/lib/api/interface";
import TrendingIcon from '@/assets/icons/trending.svg';
import LiveIcon from '@/assets/icons/live.svg';
import NewIcon from '@/assets/icons/new.svg';
import SortUpIcon from '@/assets/icons/sort-up.svg';
import SortDownIcon from '@/assets/icons/sort-down.svg';
import ConcernIcon from '@/assets/icons/concern.svg';
import FollowedIcon from '@/assets/icons/followed.svg';
import {useCurrentAccount} from "@onelabs/dapp-kit";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import {setSigninOpen} from "@/store";
import InlineOverflowList from "@/components/InlineOverflowList";

// 统一类型，保证 Icon 是一个 React 组件
type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface Props {
  categories: DictInfo[];
  onChange?: (params: { category: string; sortBy: SortBy; direction: Direction; showFollowed: boolean; }) => void;
  initialCategory?: string;
  initialSortBy?: SortBy;
}

export default function CategoryTabs({
  categories,
  onChange,
  initialCategory = '全部',
  initialSortBy = '',
}: Props) {
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();
  const dispatch = useDispatch();

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
  const [expireTimeDirection, setExpireTimeDirection] = useState<Direction>('');
  const [volumeDirection, setVolumeDirection] = useState<Direction>('');
  const [showFollowed, setShowFollowed] = useState(false);

  // 点分类按钮时
  const handleCategoryClick = (id: string) => {
    setShowFollowed(false);
    setActiveCategory(id);
  };

  const handleFollowedClick = () => {
    if (zkLoginData || currentAccount) {
      setShowFollowed(!showFollowed);
    } else {
      dispatch(setSigninOpen(true))
    }
  }

  // 监听变化并通知外层触发查询
  useEffect(() => {
    onChange?.({ category: activeCategory === "全部" ? "" : activeCategory, sortBy, direction: sortBy === 'endTime' ? expireTimeDirection : volumeDirection, showFollowed });
  }, [activeCategory, sortBy, expireTimeDirection, volumeDirection, showFollowed, onChange]);

  const items = categories.map((category) => {
    const isActive = !showFollowed && activeCategory === category.label;

    return (
      <Button
        key={category.value}
        variant="ghost"
        size="sm"
        onClick={() => handleCategoryClick(category.label)}
        className={`
              flex-none flex items-center space-x-[2px] px-[12px] py-[8px] rounded-lg h-[32px] text-[14px] font-medium transition-colors
              ${isActive
          ? "bg-white text-black"
          : "text-white hover:text-black hover:bg-white"
        }
            `}
      >
        {category.labelEn === 'Trending' && <TrendingIcon className="w-[16px] h-[16px]" />}
        {category.labelEn === 'Live' && <LiveIcon className="w-[16px] h-[16px]" />}
        {category.labelEn === 'New' && <NewIcon className="w-[16px] h-[16px]" />}
        <span>{language === 'zh' ? category.label : language === 'zhtw' ? category.label : category.labelEn}</span>
      </Button>
    );
  })

  return (
    <div className={`flex bg-[#051A3D] sticky ${isMobile ? 'flex-col mb-[16px] top-[48px]' : 'justify-between items-center gap-[50px] mb-[36px] top-[64px]'} z-20`}>
      <div className={`flex-1 flex flex-nowrap gap-[4px] rounded-[8px] overflow-hidden`}>
        {isMobile ? (
          <div className={`flex flex-nowrap gap-[4px] border border-white/20 rounded-[8px] px-[4px] py-[2px] ${isMobile ? 'w-full overflow-x-auto overflow-y-hidden' : ''}`}>
            {items}
          </div>
        ) : (
          <InlineOverflowList
            items={items}
            itemGapPx={8}
            openOnHover
          />
        )}
      </div>
      <div className={`flex items-center justify-between ${isMobile ? 'mt-[16px]' : 'flex-none'}`}>
        <div className="h-[36px] flex items-center gap-[16px]">
          <div
            className="flex items-center gap-[4px] cursor-pointer"
            onClick={() => {
              setSortBy('endTime');
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
              setSortBy('tradeVolume');
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
          onClick={handleFollowedClick}
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
