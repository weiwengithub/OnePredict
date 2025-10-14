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
import { useCurrentAccount } from "@onelabs/dapp-kit";
import apiService from "@/lib/api/services";
import { store } from "@/store";

interface PositionItemApi {
  marketId: string;
  userAddr: string;
  outcome: number;
  shares: string;
  buyPrice: string;
  eventMs: number;
  packageId: string;
  coinType: string;
  marketName: string;
  marketImage: string;
  outcomeName: string;
  marketPrice: string;
  entryPrice: string;
  bet: string;
  positionValue: string;
  pnl: string;
  winProfit: string;
  marketState: number;
}

function MarketsItem(item: PositionItemApi) {
  return (
    <div className="flex items-center px-[12px] pt-[14px]">
      <Avatar className="w-[40px] h-[40px] rounded-[8px] transition-all">
        <AvatarImage src={item.marketImage} alt="avatar" />
        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
          {item.marketName?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 ml-[12px]">
        <div className="leading-[24px] text-[16px] text-white truncate">{item.marketName}</div>
        <div className="h-[24px] flex items-end"><UserIcon className="text-white text-[14px]"/><span className="inline-block ml-[7px] h-[16px] leading-[24px] text-[12px] text-white/60">15</span></div>
      </div>
      <div className="h-[24px] bg-[rgba(40,192,78,0.5)] rounded-[4px] flex items-center px-[4px]">
        <span className="text-[#28C04E] text-[16px]">{item.marketPrice} Up</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const [isMobile, setIsMobile] = useState(false);
  const currentAccount = useCurrentAccount();
  const [positions, setPositions] = useState<PositionItemApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock prediction data based on ID（仅用于页面头部展示头像等静态信息）
  const getPredictionData = () => {
    const predictionMap: { [key: string]: any } = {
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

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        setError(null);
        const zkLoginData = store.getState().zkLoginData as any;
        const userAddr = currentAccount?.address || zkLoginData?.zkloginUserAddress;
        if (!userAddr) {
          setPositions([]);
          return;
        }
        const res = await apiService.getMarketPosition(userAddr);
        const items = (res as any)?.data?.items ?? [];
        setPositions(items);
      } catch (e: any) {
        setError(e?.message || 'Failed to load positions');
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, [currentAccount?.address]);

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
            {loading && (
              <div className="text-white/60">Loading...</div>
            )}
            {!loading && error && (
              <div className="text-red-400">{error}</div>
            )}
            {!loading && !error && positions.map((item, index) => (
              <MarketsItem key={`${item.marketId}_${index}`} {...item} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
