"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import Link from 'next/link';
import { ArrowLeft, Clock, Users, TrendingUp, Calendar, DollarSign, MessageCircle, Share2, ChevronDown, BarChart3, Activity } from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

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

  return (
    <div className="min-h-screen bg-[#0a1525] pb-20 md:pb-0">
      {/* Desktop Header */}
      <Header currentPage="details" />

      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory=""
        onCategoryChange={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-8 pt-20 md:pt-32">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Market
            </Button>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-[#152238] rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={prediction.avatar} alt="Prediction" />
                  <AvatarFallback className="bg-blue-600 text-white">?</AvatarFallback>
                </Avatar>
                <div>
                  <Badge className={getCategoryColor(prediction.category)}>
                    {prediction.category}
                  </Badge>
                  {prediction.isLive && (
                    <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-400/30">
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{prediction.question}</h1>
            <p className="text-white/60 text-sm">Closing in {prediction.deadline}</p>
          </div>

          {/* Chart Section */}
          <div className="p-6">
            {/* Chart Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-white/60" />
                <span className="text-white font-semibold">Price History</span>
              </div>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
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

            {/* Yes/No Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                size="lg"
                className={`h-16 ${userVote === 'yes' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white font-bold text-lg`}
                onClick={() => handleVote('yes')}
              >
                <div className="flex flex-col items-center">
                  <span>YES {prediction.chance.toFixed(1)}¢</span>
                  <span className="text-xs opacity-80">{prediction.yesVotes.toLocaleString()} shares</span>
                </div>
              </Button>

              <Button
                size="lg"
                className={`h-16 ${userVote === 'no' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white font-bold text-lg`}
                onClick={() => handleVote('no')}
              >
                <div className="flex flex-col items-center">
                  <span>NO {(100 - prediction.chance).toFixed(1)}¢</span>
                  <span className="text-xs opacity-80">{prediction.noVotes.toLocaleString()} shares</span>
                </div>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-lg font-bold text-white">{prediction.volume}</div>
                <div className="text-xs text-white/60">Volume</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-lg font-bold text-white">{prediction.totalVotes.toLocaleString()}</div>
                <div className="text-xs text-white/60">Traders</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-lg font-bold text-white">$2.3M</div>
                <div className="text-xs text-white/60">Liquidity</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-lg font-bold text-white">0.2%</div>
                <div className="text-xs text-white/60">Fee</div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">About this market</h3>
            <p className="text-white/70 leading-relaxed mb-4">{prediction.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {prediction.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-white/60 border-white/20">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
