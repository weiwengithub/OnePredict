"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeIcon from "@/assets/icons/home.svg";
import ExportIcon from "@/assets/icons/export.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import UserIcon from "@/assets/icons/user.svg";
import Image from "next/image";

interface MarketInfo {
  id: string;
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
}

function MarketsItem(item: MarketInfo) {
  return (
    <div className="flex items-center px-[12px] pt-[14px]">
      <Avatar className="w-[40px] h-[40px] rounded-[8px] transition-all">
        <AvatarImage src={item.avatar} alt="avatar" />
        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
          {item.category.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 ml-[12px]">
        <div className="leading-[24px] text-[16px] text-white">Search Markets,contract address</div>
        <div className="h-[24px] flex items-end"><UserIcon className="text-white text-[14px]"/><span className="inline-block ml-[7px] h-[16px] leading-[24px] text-[12px] text-white/60">15</span></div>
      </div>
      <div className="h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center px-[4px]">
        <span className="text-[#28C04E] text-[16px]">37.15 Up</span>
      </div>
    </div>
  );
}

export default function Profile() {
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

  // Mock prediction data based on ID
  const getPredictionData = (): MarketInfo => {
    const predictionMap: { [key: string]: MarketInfo } = {
      "0": {
        id: "0",
        question: "Will Ethereum Merge be delayed?",
        chance: 31.78,
        volume: "14611.13",
        deadline: "Sep 30, 2025",
        category: "crypto",
        avatar: "https://ext.same-assets.com/1155254500/403630554.png",
      }
    };

    return predictionMap["0"];
  };

  const prediction = getPredictionData();

  const listData = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-20 md:pb-0">
      {/* Desktop Header */}
      <Header currentPage="details" />

      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory=""
        onCategoryChange={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-[1312px] mx-auto pt-[114px]">
        {/* Back Button */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center text-white/40 hover:text-white">
              <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">Home</span>
            </div>
          </Link>
          <ArrowRightIcon className="mx-[16px] text-white/40" />
          <div className="h-[18px] leading-[18px] text-[14px] text-white">Profile</div>
        </div>

        {/* Header */}
        <div className="mt-[24px]">
          <div className="flex gap-3">
            <Avatar className="w-[136px] h-[136px] rounded-full">
              <AvatarImage src={prediction.avatar} alt="Prediction" />
              <AvatarFallback className="bg-blue-600 text-white">?</AvatarFallback>
            </Avatar>
            <div className="ml-[24px]">
              <div className="h-[31px] leading-[31px] text-[24px] text-white font-bold">Kupc</div>
              <div className="mt-[12px] flex gap-[10px] h-[18px] text-[14px] text-white/80">
                <span>1 Followers</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>0 Followers</span>
                <span className="border-l border-white/80 my-[1px]"></span>
                <span>0 Opinions</span>
              </div>
              <div className="mt-[22px] flex items-center gap-[12px]">
                <div className="h-[32px] leading-[32px] rounded-[24px] border border-white/40 text-[12px] px-[12px] text-white">Follow</div>
                <div className="h-[36px] flex items-center rounded-[32px] border border-white/40 text-[12px] px-[12px] text-white"><ExportIcon /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[40px] flex gap-[24px]">
          {/* Position */}
          <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
            <Image src="/images/icon/icon-profile-1.png" alt="" width={36} height={36} />
            <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">Position</div>
            <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">35</div>
          </div>

          {/* Volume Traded */}
          <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
            <Image src="/images/icon/icon-profile-2.png" alt="" width={36} height={36} />
            <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">Volume Traded</div>
            <div className="mt-[24px] flex gap-[8px] leading-[24px] text-[24px] text-white font-bold">
              <Image src="/images/icon/icon-token.png" alt="" width={24} height={24} />
              <span>539</span>
            </div>
          </div>

          {/* PnL Rank */}
          <div className="flex-1 h-[180px] p-[24px] bg-[#04122B] rounded-[16px]">
            <Image src="/images/icon/icon-profile-3.png" alt="" width={36} height={36} />
            <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold">PnL Rank</div>
            <div className="mt-[24px] leading-[24px] text-[24px] text-white font-bold">35</div>
          </div>
        </div>

        {/* All Markets */}
        <div className="mt-[32px] bg-[#04122B] rounded-[16px] p-[24px] overflow-hidden">
          <div className="mb-[24px] leading-[24px] text-[18px] text-white font-bold">All Markets</div>
          <div className="space-y-[12px]">
            {listData.map((prediction, index) => (
              <MarketsItem
                key={index}
                {...prediction}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
