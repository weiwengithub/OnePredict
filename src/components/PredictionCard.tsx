"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Volume, TrendingUp, TrendingDown } from "lucide-react";
import SemiGauge from "./SemiGauge";
import MarketDetailModal from "./MarketDetailModal";
import { getMiniTrendData } from "@/lib/chartData";
import Image from 'next/image';

interface PredictionCardProps {
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
  isLive?: boolean;
}

export default function PredictionCard({
  question,
  chance,
  volume,
  deadline,
  category,
  avatar,
  isLive = false
}: PredictionCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const trendData = getMiniTrendData(question);
  const isPositiveTrend = trendData.length > 1 &&
    trendData[trendData.length - 1].value > trendData[0].value;

  const handleCardClick = () => {
    setShowDetailModal(true);
  };

  const handleButtonClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    // 处理 Yes/No 按钮点击
    console.log(`Clicked ${action} for: ${question}`);
  };

  return (
    <>
      <Card
        className="bg-[#010A2C] border border-[#26282E] hover:shadow-lg rounded-[16px] transition-all duration-300 hover:border-[#467DFF] group cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-[24px]">
          {/* Header with avatar and question */}
          <div className="flex items-start space-x-[19px] mb-[20px]">
            <Avatar className="w-[48px] h-[48px] rounded-[8px] flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all">
              <AvatarImage src={avatar} alt="avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
                {category.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 h-[96px] leading-[24px] text-white text-[20px] font-bold overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
              {question}
            </div>
            <div className="h-[48px] w-[80px]">
              <SemiGauge value={72} max={100} orientation="up" />
              {/*<TrendChart*/}
              {/*  data={trendData}*/}
              {/*  color={isPositiveTrend ? "#10b981" : "#ef4444"}*/}
              {/*  height={40}*/}
              {/*  isPositive={isPositiveTrend}*/}
              {/*/>*/}
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="grid grid-cols-2 gap-[9px] mb-[12px]">
            <Button
              variant="outline"
              className="h-[48px] bg-[rgba(40,192,78,0.5)] border-none text-[#089C2B] text-[16px] hover:bg-green-100 hover:border-green-300 hover:text-green-900 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={(e) => handleButtonClick(e, 'Yes')}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="h-[48px] bg-[rgba(249,93,93,0.5)] border-none text-[#F95C5C] text-[16px] hover:bg-red-100 hover:border-red-300 hover:text-red-900 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={(e) => handleButtonClick(e, 'No')}
            >
              No
            </Button>
          </div>

          {/* Footer with volume and deadline */}
          <div className="flex items-center justify-between text-[13px] text-white/60">
            <div className="flex items-center space-x-1">
              <span className="inline-block leading-[24px]">{volume}</span>
            </div>
            <div className="flex items-center space-x-[12px]">
              <Image src="/images/icon/icon-calendar.png" alt="" width={12} height={12} />
              <span className="inline-block leading-[24px]">{deadline}</span>
              <Image src="/images/icon/icon-tag.png" alt="" width={12} height={12} />
              <Image src="/images/icon/icon-export.png" alt="" width={12} height={12} />
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
    </>
  );
}
