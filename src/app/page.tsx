"use client";

import { useState, useRef, useEffect } from "react";
import WelcomeModal from "@/components/WelcomeModal";
import PredictionCard from "@/components/PredictionCard";
import MobilePredictionCard from "@/components/MobilePredictionCard";
import MobileNavigation from "@/components/MobileNavigation";
import CustomCarousel, { EffectType } from '@/components/CustomCarousel';
import CategoryTabs from "@/components/CategoryTabs";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Footer from "@/components/Footer";
import { FloatingThemeToggle } from "@/components/ThemeToggle";
import Header from "@/components/Header";
import Image from "next/image";
import apiService from "@/lib/api/services";
import { MarketOption } from "@/lib/api/interface";
import { useLanguage } from "@/contexts/LanguageContext";
import { Swiper as SwiperType } from 'swiper';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeCategory, setActiveCategory] = useState("trending");
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close welcome modal after delay on mobile
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const didFetchRef = useRef(false);
  const [predictionData, setPredictionData] = useState<MarketOption[]>([]);
  useEffect(() => {
    if (didFetchRef.current) return;   // 防止 StrictMode 下的第二次执行
    didFetchRef.current = true;

    (async () => {
      try {
        const {data} = await apiService.getMarketList();
        setPredictionData(data.item)
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const carouselData = [
    {
      id: 1,
      image: '/images/banners/banner_1.png',
    },
    {
      id: 2,
      image: '/images/banners/banner_2.png',
    },
    {
      id: 3,
      image: '/images/banners/banner_1.png',
    },
    {
      id: 4,
      image: '/images/banners/banner_2.png',
    },
    {
      id: 5,
      image: '/images/banners/banner_1.png',
    },
    {
      id: 6,
      image: '/images/banners/banner_2.png',
    }
  ];
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState(4000);
  const [effect, setEffect] = useState<EffectType>('slide');
  const [height, setHeight] = useState('400px');
  const swiperRef = useRef<SwiperType | null>(null);
  const handleSwiperInit = (swiper: SwiperType) => {
    swiperRef.current = swiper;
  };

  return (
    <div className="min-h-screen bg-[#051A3D] pb-20 md:pb-0">
      {/* Desktop Header */}
      <Header currentPage="home" />

      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main Content */}
      <main className="max-w-[1728px] mx-auto px-[40px] pt-[64px]">
        {/* Banner Cards - Hidden on small mobile */}
        <div className="hidden sm:block">
          <CustomCarousel
            items={carouselData}
            autoplay={autoplay}
            loop={true}
            autoplayDelay={speed}
            effect={effect}
            height={height}
            onSwiper={handleSwiperInit}
          />
        </div>

        {/* Desktop Category Navigation */}
        <div className="hidden md:block">
          <CategoryTabs />
        </div>

        {/* Prediction Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px]">
          {predictionData.map((prediction, index) => (
            isMobile ? (
              <MobilePredictionCard
                key={index}
                prediction={prediction}
              />
            ) : (
              <PredictionCard
                key={index}
                prediction={prediction}
              />
            )
          ))}
        </div>

        {/* Load More */}
        <div className="mt-[15px] flex items-center justify-center bg-[#010A2C] border border-[#26282E] text-center rounded-[16px] py-[9px]">
          <span className="mr-[4px] text-[14px] text-white/60">{t('common.loadMore')}</span>
          <Image src="/images/icon/icon-refresh.png" alt="OnePredict" width={14} height={14} />
        </div>
      </main>

      {/* Welcome Modal */}
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Footer */}
      <Footer />
    </div>
  );
}
