"use client";

import React, { useState, useRef, useEffect } from "react";
import PredictionCard from "@/components/PredictionCard";
import MobileNavigation from "@/components/MobileNavigation";
import CustomCarousel, { EffectType } from '@/components/CustomCarousel';
import CategoryTabs from "@/components/CategoryTabs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import apiService from "@/lib/api/services";
import { BannerInfo, MarketOption, type SortBy } from "@/lib/api/interface";
import { useLanguage } from "@/contexts/LanguageContext";
import { Swiper as SwiperType } from 'swiper';
import { useIsMobile } from '@/contexts/viewport';
import { useQuery } from '@tanstack/react-query';
import WechatIcon from "@/assets/icons/wechat.svg";

export default function Home() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("home");

  const [predictionData, setPredictionData] = useState<MarketOption[]>([]);
  const [predictionPageNumber, setPredictionPageNumber] = useState(1);
  const [predictionPageSize, setPredictionPageSize] = useState(8);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // 防止重复点击造成并发
  const loadingRef = useRef(false);

  // 统一的加载函数：传入要拉取的页码
  const loadPage = async (targetPage: number, replace = false, filter: {category: string; sortBy: SortBy} = { category: 'trending', sortBy: 'endTime'}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    // 每次请求前创建一个 AbortController，卸载时取消
    const ac = new AbortController();
    const { signal } = ac;

    try {
      const {data} = await apiService.getMarketList({
        pageSize: predictionPageSize,
        pageNum: predictionPageNumber,
        orderByColumn: filter.sortBy,
        orderDirection: "ASC"
      }, { signal });
      const newList = data.rows || [];
      setPredictionData(prev =>
        replace ? newList : [...prev, ...newList]
      );
      // 计算是否还有更多
      const loadedTotal = (replace ? 0 : predictionData.length) + newList.length;
      setHasMore(loadedTotal < (data.count ?? loadedTotal)); // 若后端没给 total，则默认还有
      // 下一次请求页码自增
      setPredictionPageNumber(targetPage + 1);
    } catch (e: any) {
      // 被取消的请求不视为错误
      if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
        console.error(e?.message || "请求失败");
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }

    // 返回一个取消函数（仅在需要中途取消时使用）
    return () => ac.abort();
  };

  // 首屏加载：默认请求第 1 页
  useEffect(() => {
    let canceled = false;
    (async () => {
      // replace=true 表示首次加载用新数据替换旧列表
      const cancel = await loadPage(1, true);
      return () => {
        canceled = true;
        cancel?.(); // 组件卸载时取消请求
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMoreMarketList = () => {
    if (!loading && hasMore) {
      loadPage(predictionPageNumber);
    }
  };

  const [bannerList, setBannerList] = useState<BannerInfo[]>([]);
  useEffect(() => {
    (async () => {
      const {data} = await apiService.getBannerList();
      console.log(data);
      setBannerList(data.rows)
    })().catch((e) => {
      if (e?.name !== "AbortError") console.error(e);
    });
  }, []);

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
        <CategoryTabs onChange={({category, sortBy, direction, showFollowed}) => {
          // loadPage(1, true, value);
        }} />

        {/* Prediction Cards Grid */}
        {predictionData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px] pb-[15px]">
            {predictionData.map((prediction, index) => (
              <PredictionCard
                key={index}
                prediction={prediction}
              />
            ))}
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
            className="mt-[15px] flex items-center justify-center bg-[#010A2C] border border-[#26282E] text-center rounded-[16px] py-[9px]"
            onClick={getMoreMarketList}
          >
            <span className="mr-[4px] text-[14px] text-white/60">{t('common.loadMore')}</span>
            <Image src="/images/icon/icon-refresh.png" alt="OnePredict" width={14} height={14} />
          </div>
        )}
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
