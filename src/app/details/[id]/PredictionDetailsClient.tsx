"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import { ArrowLeft, Clock, Users, TrendingUp, Calendar, DollarSign, MessageCircle, Share2, ChevronDown, BarChart3, Activity } from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TradingForm from "@/components/predictionTrading/TradingForm";
import TermsAgreement from "@/components/predictionTrading/TermsAgreement";
import HomeIcon from "@/assets/icons/home.svg";
import EditIcon from "@/assets/icons/edit.svg";
import Edit1Icon from "@/assets/icons/edit_1.svg";
import NoteIcon from "@/assets/icons/note.svg";
import ExportIcon from "@/assets/icons/export.svg";
import ExchangeIcon from "@/assets/icons/exchange.svg";
import SettingIcon from "@/assets/icons/setting.svg";
import RefreshIcon from "@/assets/icons/refresh.svg";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import OutcomeProposed from "@/assets/icons/outcomeProposed.svg";
import DisputeWindow from "@/assets/icons/disputeWindow.svg";
import FinalOutcome from "@/assets/icons/finalOutcome.svg";
import WechatIcon from "@/assets/icons/wechat.svg";
import Image from "next/image";

interface PredictionDetail {
  id: string;
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
  isLive?: boolean;
  description: string;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  createdAt: string;
  tags: string[];
  relatedPredictions: string[];
}

interface PredictionDetailsClientProps {
  id: string;
}

export default function PredictionDetailsClient({ id }: PredictionDetailsClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [userVote, setUserVote] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number>(0);
  const [balance] = useState<number>(0);

  const handleTrade = () => {
    // 这里将来会实现实际的交易逻辑
    console.log('Trade:', { tradeType, userVote, amount, prediction });
  };

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
  const getPredictionData = (id: string): PredictionDetail => {
    const predictionMap: { [key: string]: PredictionDetail } = {
      "0": {
        id: "0",
        question: "Will Ethereum Merge be delayed?",
        chance: 31.78,
        volume: "14611.13",
        deadline: "Sep 30, 2025",
        category: "crypto",
        avatar: "https://ext.same-assets.com/1155254500/403630554.png",
        description: "The Ethereum Merge represents a significant transition from Proof of Work to Proof of Stake. Market participants are predicting whether technical challenges or unforeseen issues might cause delays in the timeline.",
        totalVotes: 2847,
        yesVotes: 904,
        noVotes: 1943,
        createdAt: "2024-12-15",
        tags: ["Ethereum", "Merge", "Cryptocurrency", "Technical"],
        relatedPredictions: []
      },
      "1": {
        id: "1",
        question: "Will ETH Break ATH in 2025?",
        chance: 56.74,
        volume: "6008.89",
        deadline: "Dec 31, 2025",
        category: "crypto",
        avatar: "https://ext.same-assets.com/1155254500/2433125264.png",
        description: "Ethereum's potential to break its all-time high in 2025 depends on several factors including ETF adoption, network upgrades, and overall crypto market sentiment.",
        totalVotes: 1854,
        yesVotes: 1052,
        noVotes: 802,
        createdAt: "2024-12-10",
        tags: ["Ethereum", "ATH", "Cryptocurrency", "DeFi"],
        relatedPredictions: []
      },
      "2": {
        id: "2",
        question: "Will Keung To confirm a romantic relationship or scandal by 2025?",
        chance: 55.53,
        volume: "377.65",
        deadline: "Dec 31, 2025",
        category: "entertainment",
        avatar: "https://ext.same-assets.com/1155254500/4107709064.png",
        description: "姜濤作為香港當紅偶像，其感情生活一直備受關注。隨著事業發展和年齡增長，市場預測他可能在2025年公開戀情或面臨感情相關話題。",
        totalVotes: 956,
        yesVotes: 531,
        noVotes: 425,
        createdAt: "2024-12-08",
        tags: ["姜濤", "娛樂圈", "戀情", "香港"],
        relatedPredictions: []
      }
    };

    return predictionMap[id] || predictionMap["0"];
  };

  const prediction = getPredictionData(id);

  const handleVote = (vote: 'yes' | 'no') => {
    setUserVote(vote);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      crypto: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
      entertainment: 'bg-pink-500/20 text-pink-400 border-pink-400/30',
      economy: 'bg-green-500/20 text-green-400 border-green-400/30',
      politics: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      science: 'bg-purple-500/20 text-purple-400 border-purple-400/30'
    };
    return colors[category as keyof typeof colors] || colors.crypto;
  };

  const timeframes = ['1H', '1D', '1W', '1M', '3M', '1Y'];

  // Mock chart data points for the line chart
  const generateChartData = () => {
    const points = [];
    const baseValue = prediction.chance;
    for (let i = 0; i < 50; i++) {
      const x = (i / 49) * 100;
      const variance = (Math.random() - 0.5) * 10;
      const y = Math.max(10, Math.min(90, baseValue + variance));
      points.push({ x, y });
    }
    return points;
  };

  const chartData = generateChartData();

  // SVG Path for the chart line
  const createChartPath = (data: { x: number; y: number }[]) => {
    return data.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x * 4} ${(100 - point.y) * 1.5}`;
    }, '');
  };

  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);

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
      <main className="max-w-[1312px] mx-auto pt-[114px] flex gap-[64px]">
        <div className="flex-1">
          {/* Back Button */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center text-white/40 hover:text-white">
                <HomeIcon /><span className="ml-[8px] h-[18px] leading-[18px] text-[14px]">Home</span>
              </div>
            </Link>
            <ArrowRightIcon className="mx-[16px] text-white/40" />
            <div className="h-[18px] leading-[18px] text-[14px] text-white">Trade</div>
          </div>

          {/* Header */}
          <div className="mt-[24px]">
            <div className="flex gap-3">
              <Avatar className="w-[100px] h-[100px] rounded-[12px]">
                <AvatarImage src={prediction.avatar} alt="Prediction" />
                <AvatarFallback className="bg-blue-600 text-white">?</AvatarFallback>
              </Avatar>
              <div className="ml-[24px] flex flex-col gap-[12px]">
                <div className="h-[24px] leading-[24px] text-[24px] text-white font-bold">{prediction.question}</div>
                <div className="flex items-center gap-1 h-[24px] text-white/60">
                  <span>Volume:</span>
                  <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                  <span>9430.17  Traders:147</span>
                  <Image src="/images/icon/icon-calendar.png" alt="" width={12} height={12} />
                  <span>Jan 1, 2026 7:59 AM</span>
                </div>
                <div className="flex gap-[12px]">
                  <div className="h-[36px] flex items-center gap-[8px] rounded-[32px] border border-white/20 text-[16px] font-bold px-[12px] text-white"><EditIcon className="text-[12px]" />Say something</div>
                  <div className="h-[36px] flex items-center gap-[8px] rounded-[32px] border border-white/20 text-[12px] font-bold px-[12px] text-white"><NoteIcon /></div>
                  <div className="h-[36px] flex items-center gap-[8px] rounded-[32px] border border-white/20 text-[12px] font-bold px-[12px] text-white"><ExportIcon /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mt-[40px]">
            {/* Chart Controls */}
            <div className="flex items-center justify-between mb-[40px]">
              <div className="flex gap-[8px]">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`h-[36px] px-[24px] text-[16px] rounded-[40px] transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-black/20 text-white'
                        : 'text-white/60 hover:text-white hover:bg-black/20'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex gap-[8px]">
                <div className="p-[12px] text-white text-[12px] cursor-pointer"><ExchangeIcon /></div>
                <div className="p-[12px] text-white text-[12px] cursor-pointer"><SettingIcon /></div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-[300px] bg-gradient-to-b from-white/5 to-transparent rounded-lg p-4 mb-6">
              <div className="absolute inset-4">
                <svg width="100%" height="100%" className="overflow-visible">
                  {/* Grid lines */}
                  {[20, 40, 60, 80].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={`${y}%`}
                      x2="100%"
                      y2={`${y}%`}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Chart line */}
                  <path
                    d={createChartPath(chartData)}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />

                  {/* Current price indicator */}
                  <circle
                    cx={`${chartData[chartData.length - 1]?.x * 4 || 0}`}
                    cy={`${(100 - (chartData[chartData.length - 1]?.y || 50)) * 1.5}`}
                    r="4"
                    fill="#22c55e"
                    className="drop-shadow-lg"
                  />
                </svg>

                {/* Price label */}
                <div className="absolute top-4 left-4">
                  <div className="text-2xl font-bold text-white">{prediction.chance.toFixed(1)}¢</div>
                  <div className="text-sm text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2.1% today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="mt-[48px] border border-white/40 rounded-[24px] overflow-hidden">
            <div className="h-[60px] bg-white/40 flex text-[16px] text-white">
              <div className="flex-1 flex items-center px-[24px]">
                <span>Options</span>
              </div>
              <div className="flex-1 flex items-center justify-center px-[24px]">
                <span>Chance</span>
                <RefreshIcon className="ml-[4px]" />
              </div>
              <div className="flex-1 flex items-center justify-end px-[24px]">
                <span>Current Price</span>
              </div>
            </div>
            <div className="h-[96px] flex text-[18px] text-white font-bold">
              <div className="flex-1 flex items-center px-[24px]">
                <Image src="/images/icon/icon-yes.png" alt="" width={36} height={36} />
                <span className="ml-[12px]">Yes</span>
              </div>
              <div className="flex-1 flex items-center justify-center px-[24px]">
                <span>62.87%</span>
              </div>
              <div className="flex-1 flex items-center justify-end px-[24px]">
                <Button
                  className={`h-[48px] w-[162px] ${userVote === 'yes' ? 'bg-[#29C04E] hover:bg-[#29C04E] text-white' : 'bg-[#34503B] hover:bg-[#29C04E] text-[#089C2B] hover:text-white'} font-bold text-[16px] rounded-[8px]`}
                  onClick={() => handleVote('yes')}
                >
                  Buy 0.56
                </Button>
              </div>
            </div>
            <div className="h-[96px] flex text-[18px] text-white font-bold border-t border-white/40">
              <div className="flex-1 flex items-center px-[24px]">
                <Image src="/images/icon/icon-no.png" alt="" width={36} height={36} />
                <span className="ml-[12px]">No</span>
              </div>
              <div className="flex-1 flex items-center justify-center px-[24px]">
                <span>62.87%</span>
              </div>
              <div className="flex-1 flex items-center justify-end px-[24px]">
                <Button
                  className={`h-[48px] w-[162px] ${userVote === 'no' ? 'bg-[#F95D5D] hover:bg-[#F95D5D] text-white' : 'bg-[rgba(249,93,93,0.5)] hover:bg-[#F95D5D] text-[#E04646] hover:text-white'} font-bold text-[16px] rounded-[8px]`}
                  onClick={() => handleVote('no')}
                >
                  Buy 0.44
                </Button>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-[48px]">
            <h3 className="h-[24px] leading-[24px] text-[18px] font-bold text-white mb-[12px]">Rules</h3>
            <div className="border border-white/40 rounded-[24px] overflow-hidden p-[24px] pb-[12px]">
              <p className="leading-[24px] text-[16px] text-white">This market resolves to “Yes” if, at any point between 00:00 UTC on January 1, 2025 and 23:59:59 UTC on December 31, 2025, the price of Ethereum (ETH) on the Binance ETH/USDT spot market strictly exceeds its previous all-time high of $4,868.00 USD.</p>
              <p className="mt-[20px] leading-[24px] text-[16px] text-white">Intraday highs count — the moment ETH trades above $4,868.00 on Binance, the market resolves “Yes.”</p>
              <div className="mt-[24px] h-[24px] flex items-center justify-center text-white text-[48px]">
                <ArrowDownIcon />
              </div>
            </div>
          </div>

          <div className="mt-[24px] border border-white/40 rounded-[24px] overflow-hidden px-[28px] py-[24px]">
            <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
              <OutcomeProposed className="text-[14px]" />
              <span className="inline-block ml-[8px]">Outcome proposed</span>
            </div>
            <div className="my-[-3px] ml-[7px] h-[30px] border-l border-white/60"></div>
            <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
              <DisputeWindow className="text-[14px]" />
              <span className="inline-block ml-[8px]">Dispute window</span>
            </div>
            <div className="my-[-3px] ml-[7px] h-[30px] border-l border-white/60"></div>
            <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
              <FinalOutcome className="text-[14px]" />
              <span className="inline-block ml-[8px]">Final outcome</span>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-[48px]">
            <h3 className="h-[24px] leading-[24px] text-[18px] font-bold text-white mb-[12px]">Trades</h3>
            <div className="border border-white/40 rounded-[24px] overflow-hidden  px-[28px] py-[37px] space-y-[16px]">
              <div className="flex items-center gap-[12px] text-[16px] text-white">
                <div className="size-[32px] bg-gradient-to-r from-[#3EECAC]/45 to-[#EE74E1]/45 rounded-[32px]"></div>
                <div>Nicheng</div>
                <div className="opacity-60">Buy</div>
                <div className="h-[16px] leading-[16px] bg-[rgba(40,192,78,0.5)] text-[#28C04E] px-[4px] rounded-[4px]">37.15 Yes</div>
                <div className="opacity-60">at</div>
                <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                <div>0.75</div>
              </div>
              <div className="flex items-center gap-[12px] text-[16px] text-white">
                <div className="size-[32px] bg-gradient-to-r from-[#3EECAC]/45 to-[#EE74E1]/45 rounded-[32px]"></div>
                <div>NichengNicheng</div>
                <div className="opacity-60">Sell</div>
                <div className="h-[16px] leading-[16px] bg-[rgba(249,93,93,0.5)] text-[#F95D5D] px-[4px] rounded-[4px]">37.15 Yes</div>
                <div className="opacity-60">at</div>
                <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                <div>0.75</div>
              </div>
              {/*分页组件*/}
              <div className="h-[32px] flex items-center justify-between">
                <div className="w-[98px] leading-[32px] text-white text-[16px]">Page 1 of 15</div>
                <div className="flex gap-[8px]">
                  <span className="size-[32px] rounded-[8px] border border-white/40 text-white/40 text-[12px] flex items-center justify-center cursor-pointer hover:bg-white/20 hover:text-white hover:border-transparent"><ArrowLeftIcon /></span>
                  <span className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer ${pageNo === 1 ? 'bg-white/20 text-white border-transparent' : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent'}`}>1</span>
                  <span className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer ${pageNo === 2 ? 'bg-white/20 text-white border-transparent' : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent'}`}>2</span>
                  <span className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer ${pageNo === 3 ? 'bg-white/20 text-white border-transparent' : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent'}`}>3</span>
                  <span className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer ${pageNo === 4 ? 'bg-white/20 text-white border-transparent' : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent'}`}>4</span>
                  <span className={`size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer ${pageNo === 5 ? 'bg-white/20 text-white border-transparent' : 'text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent'}`}>5</span>
                  <span className="size-[32px] rounded-[8px] leading-[32px] text-[16px] text-center border cursor-pointer text-white/40 border-white/40 hover:bg-white/20 hover:text-white hover:border-transparent">...</span>
                  <span className="size-[32px] rounded-[8px] border border-white/40 text-white/40 text-[12px] flex items-center justify-center cursor-pointer hover:bg-white/20 hover:text-white hover:border-transparent"><ArrowRightIcon /></span>
                </div>
                <div className="h-[32px] w-[98px] border border-white/40 rounded-[8px] flex items-center justify-center cursor-pointer text-[16px] text-white/40 hover:text-white">10/page <ArrowDownIcon className="text-[12px]" /></div>
              </div>
            </div>
          </div>

          <div className="mt-[36px] h-[24px] leading-[24px] text-white text-[18px] font-bold">Opinions (0)</div>

          <div className="mt-[45px] bg-white/40 rounded-[12px] px-[24px] py-[14px]">
            <div className="flex items-center justify-between">
              <div className="size-[32px] bg-[#D9D9D9] rounded-full"></div>
              <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white/60 px-[12px]">Say something</div>
              <Edit1Icon className="text-white/60 text-[24px] cursor-pointer hover:text-white" />
            </div>
          </div>

          <div className="mt-[48px]">
            <div className="size-[64px] mx-auto text-[64px] text-white/60"><WechatIcon /></div>
            <div className="mt-[12x] h-[24px] leading-[24px] text-white/80 text-[16px] text-center">Nothing yet</div>
          </div>
        </div>
        <div className="w-[368px] sticky top-[80px] z-50">
          {/* 使用可复用的交易表单组件 */}
          <TradingForm
            tradeType={tradeType}
            onTradeTypeChange={setTradeType}
            outcome={userVote}
            onOutcomeChange={setUserVote}
            amount={amount}
            onAmountChange={setAmount}
            balance={balance}
            onTrade={handleTrade}
            // prediction={prediction}
          />

          {/* 使用可复用的服务条款组件 */}
          <TermsAgreement />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
