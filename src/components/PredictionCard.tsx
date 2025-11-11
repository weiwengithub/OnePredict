"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SemicircleGauge from "./SemicircleGauge";
import MarketDetailModal from "./MarketDetailModal";
import { getMiniTrendData } from "@/lib/chartData";
import {formatShortDate, onCopyToText} from "@/lib/utils";
import { MarketOption } from "@/lib/api/interface";
import { PredictionTradingModal } from "./predictionTrading";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";
import SharePopover from "@/components/SharePopover";
import Collecting from "@/components/Collecting";
import Outcomes from "@/components/Outcomes";
import BigNumber from "bignumber.js";
import LockIcon from "@/assets/icons/lock.svg";
import Countdown from "@/components/Countdown";
import CopyIcon from "@/assets/icons/copy_1.svg";
import ExportIcon from "@/assets/icons/export.svg";
import {useLanguage} from "@/contexts/LanguageContext";
import RelativeFutureTime from '@/components/RelativeFutureTime';

interface PredictionCardProps {
  key: number;
  prediction: MarketOption;
}

export default function PredictionCard({
  prediction,
}: PredictionCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [hoverOutcome, setHoverOutcome] = useState<number | null>(null);

  const chance = Number((100 * Number(prediction.outcome[0].prob)).toFixed(2));
  const startTime = new Date(prediction.startTime).getTime();

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
          <div className="flex items-start space-x-[12px] pb-[20px] overflow-hidden">
            <Avatar className="w-[48px] h-[48px] rounded-[8px] transition-all">
              <AvatarImage src={prediction.imageUrl} alt="avatar" />
            </Avatar>
            <div
              className={`flex-1 min-w-0 leading-[24px] text-white text-[16px] font-bold overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] cursor-pointer ${prediction.outcome.length > 2 ? 'h-[48px] [-webkit-line-clamp:2]' : 'h-[96px] [-webkit-line-clamp:4]'}`}
              onClick={handleCardClick}
            >
              {prediction.marketName}
            </div>
            <div className="h-[48px] w-[100px]">
              <SemicircleGauge
                outcomes={prediction.outcome.map((item) => ({ value: Number(item.prob||0), name: item.name }))}
                activeIndex={hoverOutcome}
              />
            </div>
          </div>

          {startTime > Date.now() ? (
            <Countdown
              target={startTime}
              onEnd={() => console.log('倒计时结束')}
            />
          ) : (
            <>
              {new Date(prediction.endTime).getTime() < Date.now() ? (
                <>
                  {prediction.winnerId ? (
                    <div className={`mb-[12px] h-[48px] leading-[48px] text-[#29C04F] text-[16px] font-bold ${prediction.outcome.length > 2 ? 'mt-[48px]' : ''}`}>
                      {t('predictions.resultsOut', {result: prediction.outcome[Number(prediction.winnerId)].name})}
                    </div>
                  ) : (
                    <div className={`mb-[12px] h-[48px] leading-[48px] text-[#29C04F] text-[16px] font-bold ${prediction.outcome.length > 2 ? 'mt-[48px]' : ''}`}>
                      {t('predictions.waitingResolution')}
                    </div>
                  )}
                </>
              ) : (
                <Outcomes
                  prediction={prediction}
                  clickFn={handleButtonClick}
                  onHover={(idx) => {
                    setHoverOutcome(idx)}}
                />
              )}
            </>
          )}

          {/* Footer with volume and deadline */}
          <div className="flex items-center justify-between text-[13px] text-white/60">
            <div className="flex items-center space-x-1">
              <span className="inline-block leading-[24px]">{prediction.tradeVolume ? `${Number(prediction.tradeVolume).toFixed(2)}${t('common.volume')}` : t('common.new')}</span>
            </div>
            <div className="flex items-center space-x-[12px]">
              <Image src="/images/icon/icon-calendar.png?v=1" alt="" width={12} height={12} />
              <RelativeFutureTime target={new Date(prediction.endTime)} />
              <Collecting collecting={prediction.isFollow} followType="Project" followId={prediction.id} />
              <SharePopover
                trigger={<ExportIcon className="text-white/60 hover:text-white text-[12px]" />}
                content={
                  <div className="max-w-[260px] text-sm leading-5">
                    <div
                      className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] cursor-pointer whitespace-nowrap"
                      onClick={() => onCopyToText(`${window.location.origin}/details?marketId=${prediction.marketId}`)}
                    >
                      <CopyIcon className="text-[14px] text-[#9BA3B1] hover:text-white" />
                      {t('predictions.copyLink')}
                    </div>
                  </div>
                }
                offset={10}
                lockScroll
              />
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
