"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Bell, Menu } from "lucide-react";
import WelcomeModal from "@/components/WelcomeModal";
import PredictionCard from "@/components/PredictionCard";
import MobilePredictionCard from "@/components/MobilePredictionCard";
import MobileNavigation from "@/components/MobileNavigation";
import BannerSlider from '@/components/BannerSlider';
import CategoryTabs from "@/components/CategoryTabs";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Footer from "@/components/Footer";
import { FloatingThemeToggle } from "@/components/ThemeToggle";
import Header from "@/components/Header";
import Image from "next/image";
import apiService from "@/lib/api/services";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
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

  const predictionData = [
    {
      id: "0",
      question: "上海微電子是否會上市？",
      chance: 11.78,
      volume: "14611.13 Vol.",
      deadline: "Sep 30, 2025",
      category: "crypto",
      avatar: "https://ext.same-assets.com/1155254500/403630554.png"
    },
    {
      id: "1",
      question: "Will ETH Break ATH in 2025?",
      chance: 56.74,
      volume: "6008.89 Vol.",
      deadline: "Dec 31, 2025",
      category: "crypto",
      avatar: "https://ext.same-assets.com/1155254500/2433125264.png"
    },
    {
      id: "2",
      question: "Will Keung To confirm a romantic relationship or scandal by 2025?",
      chance: 55.53,
      volume: "377.65 Vol.",
      deadline: "Dec 31, 2025",
      category: "entertainment",
      avatar: "https://ext.same-assets.com/1155254500/4107709064.png"
    },
    {
      id: "3",
      question: "Klarna IPO 2025?",
      chance: 57.42,
      volume: "509.67 Vol.",
      deadline: "Dec 31, 2025",
      category: "economy",
      avatar: "https://ext.same-assets.com/1155254500/2551173646.bin",
      isLive: true
    },
    {
      id: "4",
      question: "美國聯邦儲備局會在任何時間升息嗎？",
      chance: 57.06,
      volume: "1740 Vol.",
      deadline: "Dec 31, 2025",
      category: "economy",
      avatar: "https://ext.same-assets.com/1155254500/3415865673.bin"
    },
    {
      id: "5",
      question: "Will Korea report that 2025 summer was the hottest?",
      chance: 56.7,
      volume: "459.85 Vol.",
      deadline: "Oct 31, 2025",
      category: "science",
      avatar: "https://ext.same-assets.com/1155254500/847220604.bin"
    },
    {
      id: "6",
      question: "Will Korean government publish new official findings on the Itaewon tragedy?",
      chance: 54.65,
      volume: "306 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/420979322.bin"
    },
    {
      id: "7",
      question: "A cult is discovered to have played a role in the Itaewon tragedy?",
      chance: 57.51,
      volume: "500 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/2944589987.bin"
    },
    {
      id: "8",
      question: "Canada to officially recognize the State of Palestine by September?",
      chance: 45.25,
      volume: "1573.43 Vol.",
      deadline: "Sep 30, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/734502197.bin"
    },
    {
      id: "9",
      question: "Australia to officially recognize the State of Palestine this year?",
      chance: 60.9,
      volume: "755 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/93840700.bin"
    },
    {
      id: "10",
      question: "9.0 magnitude earthquake anywhere this year?",
      chance: 49.38,
      volume: "96.92 Vol.",
      deadline: "Dec 31, 2025",
      category: "science",
      avatar: "https://ext.same-assets.com/1155254500/2644321352.bin"
    },
    {
      id: "11",
      question: "Will BRICS add a new member by December 31?",
      chance: 53.32,
      volume: "212 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/1451469159.bin",
      isLive: true
    }
  ];
  const getList = async () => {
    const list = await apiService.getExtProjectList({})
    console.log(list)
  }

  useEffect(() => {
    getList();
  })

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
          <BannerSlider />
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
                {...prediction}
              />
            ) : (
              <PredictionCard
                key={index}
                {...prediction}
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

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

      {/* Footer */}
      <Footer />
    </div>
  );
}
