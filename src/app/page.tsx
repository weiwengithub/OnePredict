"use client";

import React, { useState, useRef } from "react";
import PredictionCard from "@/components/PredictionCard";
import MobileNavigation from "@/components/MobileNavigation";
import CustomCarousel, { EffectType } from '@/components/CustomCarousel';
import CategoryTabs from "@/components/CategoryTabs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import apiService from "@/lib/api/services";
import { BannerInfo, MarketOption, type SortBy, type Direction } from "@/lib/api/interface";
import { useLanguage } from "@/contexts/LanguageContext";
import { Swiper as SwiperType } from 'swiper';
import { useIsMobile } from '@/contexts/viewport';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("home");

  // 筛选和排序参数
  const [category, setCategory] = useState("trending");
  const [sortBy, setSortBy] = useState<SortBy>("endTime");
  const [direction, setDirection] = useState<Direction>("");
  const [showFollowed, setShowFollowed] = useState(false);

  // 分页参数
  const [predictionPageNumber, setPredictionPageNumber] = useState(1);
  const [predictionPageSize] = useState(8);

  // 使用 useQuery 请求市场列表数据
  const { data: marketData, isLoading, isFetching } = useQuery<{ rows: MarketOption[]; count: number }>({
    queryKey: ['marketList', category, sortBy, direction, showFollowed, predictionPageNumber],
    queryFn: async ({ signal }) => {
      if (showFollowed) {
        // 当 showFollowed 为 true 时，调用 getMarketFollowList
        const { data } = await apiService.getMarketFollowList({
          pageSize: predictionPageSize,
          pageNum: predictionPageNumber,
        }, { signal });
        return data;
      } else {
        // 否则调用 getMarketList
        const { data } = await apiService.getMarketList({
          pageSize: predictionPageSize,
          pageNum: predictionPageNumber,
          orderByColumn: sortBy,
          orderDirection: direction || undefined,
        }, { signal });
        return data;
      }
    },
    // 保持之前的数据，避免重新加载时闪烁
    placeholderData: (previousData) => previousData,
  });

  // 累积数据（用于分页）
  const [accumulatedData, setAccumulatedData] = useState<MarketOption[]>([]);

  // 用 ref 追踪上一次的页码
  const prevPageRef = React.useRef(predictionPageNumber);

  // 当 marketData 变化时，根据页码决定是替换还是追加数据
  React.useEffect(() => {
    if (marketData?.rows) {
      if (predictionPageNumber === 1) {
        // 页码为 1 时，替换数据
        setAccumulatedData(marketData.rows);
      } else if (predictionPageNumber > prevPageRef.current) {
        // 页码增加时，追加数据
        setAccumulatedData(prev => [...prev, ...marketData.rows]);
      }
      prevPageRef.current = predictionPageNumber;
    }
  }, [marketData, predictionPageNumber]);

  // 计算是否还有更多数据
  const hasMore = marketData ? accumulatedData.length < (marketData.count ?? accumulatedData.length) : false;

  // 加载更多
  const getMoreMarketList = () => {
    if (!isFetching && hasMore) {
      setPredictionPageNumber(prev => prev + 1);
    }
  };

  // 处理筛选条件变化 - 使用 useCallback 避免无限循环
  const handleFilterChange = React.useCallback((params: { category: string; sortBy: SortBy; direction: Direction; showFollowed: boolean; }) => {
    setCategory(params.category);
    setSortBy(params.sortBy);
    setDirection(params.direction);
    setShowFollowed(params.showFollowed);
    // 重置页码
    setPredictionPageNumber(1);
    setAccumulatedData([]);
  }, []);

  // Banner 查询
  const { data: bannerData } = useQuery({
    queryKey: ['bannerList'],
    queryFn: async () => {
      const { data } = await apiService.getBannerList();
      return data;
    },
  });

  const bannerList = bannerData?.rows || [];

  const swiperRef = useRef<SwiperType | null>(null);
  const handleSwiperInit = (swiper: SwiperType) => {
    swiperRef.current = swiper;
  };

  return (
    <div className="min-h-screen bg-[#051A3D] pb-20 md:pb-0">
      {/* Header */}
      {isMobile ? (
        <MobileNavigation
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      ) : (
        <Header currentPage="home" />
      )}

      {/* Main Content */}
      <main className={`${isMobile ? 'px-[16px]' : 'max-w-[1728px] mx-auto px-[40px]'}`}>
        {/* Banner Cards - Hidden on small mobile */}
        {bannerList.length > 0 && (
          <CustomCarousel items={bannerList} onSwiper={handleSwiperInit} />
        )}

        {/* Desktop Category Navigation */}
        <CategoryTabs onChange={handleFilterChange} />

        {/* Prediction Cards Grid */}
        {accumulatedData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px] pb-[15px]">
            {accumulatedData.map((prediction, index) => (
              <PredictionCard
                key={prediction.id || index}
                prediction={prediction}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div className="my-[120px] text-center">
            <div className="text-white/60 text-[16px]">{t('common.loading') || 'Loading...'}</div>
          </div>
        ) : (
          <div className="my-[120px]">
            <Image src="/images/empty.png" alt="Points" width={50} height={39} className="mx-auto" />
            <div className="mt-[12px] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">{t('common.nothing')}</div>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div
            className="mt-[15px] flex items-center justify-center bg-[#010A2C] border border-[#26282E] text-center rounded-[16px] py-[9px] cursor-pointer"
            onClick={getMoreMarketList}
          >
            <span className="mr-[4px] text-[14px] text-white/60">{isFetching ? t('common.loading') || 'Loading...' : t('common.loadMore')}</span>
            <Image src="/images/icon/icon-refresh.png" alt="OnePredict" width={14} height={14} />
          </div>
        )}
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
