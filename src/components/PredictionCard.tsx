"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SemicircleGauge from "./SemicircleGauge";
import MarketDetailModal from "./MarketDetailModal";
import { getMiniTrendData } from "@/lib/chartData";
import { PredictionTradingModal } from "./predictionTrading";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import * as Tooltip from "@radix-ui/react-tooltip";

interface PredictionCardProps {
  id?: string;
  question: string;
  chance: number;
  volume: string;
  deadline: string;
  category: string;
  avatar: string;
  isLive?: boolean;
}

export default function PredictionCard({
  id,
  question,
  chance,
  volume,
  deadline,
  category,
  avatar,
  isLive = false
}: PredictionCardProps) {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const trendData = getMiniTrendData(question);
  const isPositiveTrend = trendData.length > 1 &&
    trendData[trendData.length - 1].value > trendData[0].value;

  const [percentage, setPercentage] = React.useState(25);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(Number(e.target.value));
  };

  const handleCardClick = () => {
    if (id) {
      router.push(`/details/${id}`);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: 'yes' | 'no') => {
    e.stopPropagation();
    setSelectedOutcome(action);
    setShowTradingModal(true);
  };

  return (
    <>
      <Card
        className="bg-[#010A2C] border border-[#26282E] hover:shadow-lg rounded-[16px] transition-all duration-300 hover:border-[#467DFF] group">
        <CardContent className="p-[24px]">
          {/* Header with avatar and question */}
          <div className="flex items-start space-x-[19px] mb-[20px]">
            <Avatar className="w-[48px] h-[48px] rounded-[8px] flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all">
              <AvatarImage src={avatar} alt="avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
                {category.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className="flex-1 min-w-0 h-[96px] leading-[24px] text-white text-[20px] font-bold overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] cursor-pointer"
              onClick={handleCardClick}
            >
              {question}
            </div>
            <div className="h-[48px] w-[80px]">
              <SemicircleGauge
                percentage={chance}
                label="Chance"
                size={80}
                strokeWidth={4}
                progressColor={chance < 30 ? "#E75655" : chance < 50 ? "#FFC565" : '#31A15A'}
              />
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="grid grid-cols-2 gap-[9px] mb-[12px]">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="outline"
                  className="h-[48px] bg-[rgba(40,192,78,0.5)] border-none text-[#089C2B] text-[16px] hover:bg-[#29C041] hover:text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={(e) => handleButtonClick(e, 'yes')}
                >
                  Yes
                </Button>
              </Tooltip.Trigger>

              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"           // top | right | bottom | left
                  align="center"       // start | center | end
                  sideOffset={8}
                  className="z-50 rounded-[8px] bg-[#5E6064] px-[15px] py-[11px] text-[16px] text-white shadow-lg backdrop-blur
                     border border-[#26282E]"
                >
                  To win:1.96 x
                  <Tooltip.Arrow className="fill-[#5E6064]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="outline"
                  className="h-[48px] bg-[rgba(249,93,93,0.5)] border-none text-[#F95C5C] text-[16px] hover:bg-[#F95D5D] hover:text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={(e) => handleButtonClick(e, 'no')}
                >
                  No
                </Button>
              </Tooltip.Trigger>

              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"           // top | right | bottom | left
                  align="center"       // start | center | end
                  sideOffset={8}
                  className="z-50 rounded-[8px] bg-[#5E6064] px-[15px] py-[11px] text-[16px] text-white shadow-lg backdrop-blur
                     border border-[#26282E]"
                >
                  To win:    x
                  <Tooltip.Arrow className="fill-[#5E6064]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          {/* Footer with volume and deadline */}
          <div className="flex items-center justify-between text-[13px] text-white/60">
            <div className="flex items-center space-x-1">
              <span className="inline-block leading-[24px]">{volume}</span>
            </div>
            <div className="flex items-center space-x-[12px]">
              <Image src="/images/icon/icon-calendar.png" alt="" width={12} height={12} />
              <span className="inline-block leading-[24px]">{deadline}</span>
              <Image src="/images/icon/icon-tag.png" alt="" width={12} height={12} onClick={() => {toast.success('分享成功111')}} />
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

      {/* Trading Modal */}
      <PredictionTradingModal
        isOpen={showTradingModal}
        onClose={() => setShowTradingModal(false)}
        prediction={{
          avatar,
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
