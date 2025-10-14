"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SemicircleGauge from "./SemicircleGauge";
import MarketDetailModal from "./MarketDetailModal";
import { getMiniTrendData } from "@/lib/chartData";
import { formatShortDate } from "@/lib/utils";
import { MarketOption } from "@/lib/api/interface";
import { PredictionTradingModal } from "./predictionTrading";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";
import BigNumber from "bignumber.js";
import LockIcon from "@/assets/icons/lock.svg";
import Countdown from "@/components/Countdown";

interface PredictionCardProps {
  key: number;
  prediction: MarketOption;
}

export default function PredictionCard({
  prediction,
}: PredictionCardProps) {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(0);

  const yes = new BigNumber(prediction.pProbsJson[0]).shiftedBy(-10)
  const chance = Number(yes.toFixed(2))

  const handleCardClick = () => {
    if (prediction.marketId) {
      router.push(`/details?marketId=${prediction.marketId}`);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent, action: number) => {
    e.stopPropagation();
    setSelectedOutcome(action);
    setShowTradingModal(true);
  };

  return (
    <>
      <Card
        className="bg-[#010A2C] border border-[#26282E] hover:shadow-lg rounded-[16px] transition-all duration-300 hover:border-[#467DFF]">
        <CardContent className="p-[24px]">
          {/* Header with avatar and question */}
          <div className="flex items-start space-x-[19px] mb-[20px]">
            <Avatar className="w-[48px] h-[48px] rounded-[8px] transition-all">
              <AvatarImage src={prediction.metaJson.image_url} alt="avatar" />
            </Avatar>
            <div
              className="flex-1 min-w-0 h-[96px] leading-[24px] text-white text-[20px] font-bold overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] cursor-pointer"
              onClick={handleCardClick}
            >
              {prediction.metaJson.title}
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

          {prediction.startedMs > Date.now() ? (
            <Countdown
              target={prediction.startedMs}
              onEnd={() => console.log("倒计时结束")}
            />
            // <div className="h-[48px] flex items-center justify-center gap-1 border border-white/60 rounded-[8px] mb-[12px]">
            //   <LockIcon className="text-white text-[16px]" />
            //   <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">120</span>
            //   <span className="text-white text-[12px]">H</span>
            //   <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">45</span>
            //   <span className="text-white text-[12px]">M</span>
            //   <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">24</span>
            //   <span className="text-white text-[12px]">S</span>
            // </div>
          ) : (
            <div className="grid grid-cols-2 gap-[9px] mb-[12px]">
              <HoverTooltipButton
                label={prediction.metaJson.outcomes[0]}
                hoverLabel={`${chance}%`}
                tooltip={
                  <>
                    To win: {prediction.outcomeYields[prediction.metaJson.outcomes[0]]} x
                  </>
                }
                onClick={(e) => handleButtonClick(e, 0)}
                className="bg-[rgba(40,192,78,0.5)] hover:bg-[#29C041] text-[#089C2B]"
                buttonProps={{ variant: "outline" }}
              />

              <HoverTooltipButton
                label={prediction.metaJson.outcomes[1]}
                hoverLabel={`${(10000 - 100 * chance) / 100}%`}
                tooltip={
                  <>
                    To win: {prediction.outcomeYields[prediction.metaJson.outcomes[1]]} x
                  </>
                }
                onClick={(e) => handleButtonClick(e, 1)}
                className="bg-[rgba(249,93,93,0.5)] hover:bg-[#F95D5D] text-[#F95C5C]"
                buttonProps={{ variant: "outline" }}
              />
            </div>
          )}

          {/* Footer with volume and deadline */}
          <div className="flex items-center justify-between text-[13px] text-white/60">
            <div className="flex items-center space-x-1">
              <span className="inline-block leading-[24px]">{prediction.volumeFormatted ? `${Number(prediction.volumeFormatted).toFixed(2)}Vol.` : 'NEW'}</span>
            </div>
            <div className="flex items-center space-x-[12px]">
              <Image src="/images/icon/icon-calendar.png" alt="" width={12} height={12} />
              <span className="inline-block leading-[24px]">{formatShortDate(Number(prediction.metaJson.end_time_ms))}</span>
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
        chance={chance}
      />

      {/* Trading Modal */}
      <PredictionTradingModal
        isOpen={showTradingModal}
        onClose={() => setShowTradingModal(false)}
        prediction={prediction}
        initialOutcome={selectedOutcome}
      />
    </>
  );
}
