"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Volume, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import TrendChart from "./TrendChart";
import MarketDetailModal from "./MarketDetailModal";
import PredictionTradingModal from "./PredictionTradingModal";
import { getMiniTrendData } from "@/lib/chartData";
import { useRouter } from 'next/navigation';

interface MobilePredictionCardProps {
  id?: string;
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
  isLive?: boolean;
}

export default function MobilePredictionCard({
  id,
  question,
  chance,
  volume,
  deadline,
  category,
  avatar,
  isLive = false
}: MobilePredictionCardProps) {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const trendData = getMiniTrendData(question);
  const isPositiveTrend = trendData.length > 1 &&
    trendData[trendData.length - 1].value > trendData[0].value;

  const handleCardClick = () => {
    if (id) {
      router.push(`/details/${id}`);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: 'yes' | 'no') => {
    e.stopPropagation();
    // Handle button tap with haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setSelectedOutcome(action);
    setShowTradingModal(true);
  };

  return (
    <>
      <Card
        className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300 group cursor-pointer active:scale-[0.98] touch-manipulation"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          {/* Header - Mobile Optimized */}
          <div className="flex items-start space-x-3 mb-4">
            <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-gray-100">
              <AvatarImage src={avatar} alt="avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold text-sm">
                {category.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
                {question}
              </h3>
              <div className="flex items-center justify-between">
                {isLive && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Live</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu action
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Probability and Trend - Mobile Layout */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-bold text-gray-900">
                {chance.toFixed(1)}%
              </p>
              <div className="flex items-center space-x-1">
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  isPositiveTrend ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveTrend ? '+' : '-'}
                  {Math.abs(
                    trendData.length > 1
                      ? trendData[trendData.length - 1].value - trendData[0].value
                      : 0
                  ).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Mini Chart - Touch Optimized */}
            {trendData.length > 0 && (
              <div className="h-8 mb-3 touch-none">
                <TrendChart
                  data={trendData}
                  color={isPositiveTrend ? "#10b981" : "#ef4444"}
                  height={32}
                  isPositive={isPositiveTrend}
                />
              </div>
            )}
          </div>

          {/* Yes/No Buttons - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant="outline"
              className="bg-green-50 border-green-200 text-green-800 hover:bg-green-100 font-semibold py-3 text-sm min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              onClick={(e) => handleButtonClick(e, 'yes')}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100 font-semibold py-3 text-sm min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              onClick={(e) => handleButtonClick(e, 'no')}
            >
              No
            </Button>
          </div>

          {/* Footer - Compact Mobile Version */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Volume className="w-3 h-3" />
              <span className="font-medium">{volume}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span className="font-medium">{deadline}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Detail Modal */}
      <MarketDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        question={question}
        chance={chance}
        volume={volume}
        deadline={deadline}
        category={category}
        avatar={avatar}
        isLive={isLive}
      />

      {/* Trading Modal */}
      <PredictionTradingModal
        isOpen={showTradingModal}
        onClose={() => setShowTradingModal(false)}
        prediction={{
          question,
          chance,
          volume,
          deadline,
          id
        }}
        initialOutcome={selectedOutcome}
      />
    </>
  );
}
