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
// import BannerCards from "@/components/BannerCards";
import CategoryTabs from "@/components/CategoryTabs";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Image from 'next/image';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState("trending");
  const [isMobile, setIsMobile] = useState(false);

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
      question: "上海微電子是否會上市？",
      chance: 41.78,
      volume: "14611.13 Vol.",
      deadline: "Sep 30, 2025",
      category: "crypto",
      avatar: "https://ext.same-assets.com/1155254500/403630554.png"
    },
    {
      question: "Will ETH Break ATH in 2025?",
      chance: 56.74,
      volume: "6008.89 Vol.",
      deadline: "Dec 31, 2025",
      category: "crypto",
      avatar: "https://ext.same-assets.com/1155254500/2433125264.png"
    },
    {
      question: "Will Keung To confirm a romantic relationship or scandal by 2025?",
      chance: 55.53,
      volume: "377.65 Vol.",
      deadline: "Dec 31, 2025",
      category: "entertainment",
      avatar: "https://ext.same-assets.com/1155254500/4107709064.png"
    },
    {
      question: "Klarna IPO 2025?",
      chance: 57.42,
      volume: "509.67 Vol.",
      deadline: "Dec 31, 2025",
      category: "economy",
      avatar: "https://ext.same-assets.com/1155254500/2551173646.bin",
      isLive: true
    },
    {
      question: "美國聯邦儲備局會在任何時間升息嗎？",
      chance: 57.06,
      volume: "1740 Vol.",
      deadline: "Dec 31, 2025",
      category: "economy",
      avatar: "https://ext.same-assets.com/1155254500/3415865673.bin"
    },
    {
      question: "Will Korea report that 2025 summer was the hottest?",
      chance: 56.7,
      volume: "459.85 Vol.",
      deadline: "Oct 31, 2025",
      category: "science",
      avatar: "https://ext.same-assets.com/1155254500/847220604.bin"
    },
    {
      question: "Will Korean government publish new official findings on the Itaewon tragedy?",
      chance: 54.65,
      volume: "306 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/420979322.bin"
    },
    {
      question: "A cult is discovered to have played a role in the Itaewon tragedy?",
      chance: 57.51,
      volume: "500 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/2944589987.bin"
    },
    {
      question: "Canada to officially recognize the State of Palestine by September?",
      chance: 45.25,
      volume: "1573.43 Vol.",
      deadline: "Sep 30, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/734502197.bin"
    },
    {
      question: "Australia to officially recognize the State of Palestine this year?",
      chance: 60.9,
      volume: "755 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/93840700.bin"
    },
    {
      question: "9.0 magnitude earthquake anywhere this year?",
      chance: 49.38,
      volume: "96.92 Vol.",
      deadline: "Dec 31, 2025",
      category: "science",
      avatar: "https://ext.same-assets.com/1155254500/2644321352.bin"
    },
    {
      question: "Will BRICS add a new member by December 31?",
      chance: 53.32,
      volume: "212 Vol.",
      deadline: "Dec 31, 2025",
      category: "politics",
      avatar: "https://ext.same-assets.com/1155254500/1451469159.bin",
      isLive: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#051A3D] pb-20 md:pb-0">
      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Desktop Navigation Header */}
      <header className="hidden md:block bg-[#04122B] px-[40px]">
        <div className="max-w-[1728px] mx-auto flex items-center justify-between">
          {/* Left side - USDC and Points */}
          <div className="flex items-center space-x-4">
            <Image src="/images/logo.png" alt="" width={195} height={64} />
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex gap-[40px]">
              <div className="h-[24px] leading-[24px] text-[16px] text-white/60 hover:text-white cursor-pointer">Home</div>
              <div className="h-[24px] leading-[24px] text-[16px] text-white/60 hover:text-white cursor-pointer">Leaderboard</div>
              <div className="h-[24px] leading-[24px] text-[16px] text-white/60 hover:text-white cursor-pointer">Rewards</div>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center">
            <div>
              <div className="h-[16px] leading-[16px] text-[12px] text-white/40">USDH</div>
              <div className="mt-[4px] flex items-center space-x-[2px]">
                <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                <span className="inline-block h-[16px] leading-[16px] text-[16px] font-bold text-white/60">0</span>
              </div>
            </div>
            <div className="ml-[48px] flex items-center justify-center size-[36px] border-[1px] border-solid border-white/20 hover:border-white rounded-[20px] cursor-pointer">
              <Image src="/images/icon/icon-search.png" alt="" width={16} height={16} />
            </div>
            <div className="ml-[8px] flex items-center h-[36px] border-[1px] border-solid border-white/20 hover:border-white rounded-[20px] px-[16px] cursor-pointer">
              <Image src="/images/icon/icon-language.png" alt="" width={16} height={16} />
              <span className="ml-[8px] mr-[12px] inline-block h-[24px] leading-[24px] text-[16px] text-white/20">English</span>
              <Image src="/images/icon/icon-arrows-down.png" alt="" width={8} height={4} />
            </div>
            <Button variant="ghost" className="ml-[8px] h-[36px] px-[24px] bg-[#467DFF] text-white hover:bg-[#467DFF] hover:text-white rounded-[20px]">
              Sign in
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1728px] mx-auto px-[40px]">
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
        <div className="text-center">
          <Button
            variant="ghost"
            className="text-gray-500 min-h-[44px] px-6"
          >
            Load more
          </Button>
        </div>
      </main>

      {/* Welcome Modal */}
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
