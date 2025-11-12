"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CloseIcon from "@/assets/icons/close.svg";
import TradingForm from "./TradingForm";
import TermsAgreement from "./TermsAgreement";
import { MarketOption } from "@/lib/api/interface";
import {useIsMobile} from "@/contexts/viewport";

interface PredictionTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: MarketOption;
  initialOutcome?: number;
}

export default function PredictionTradingModal({
  isOpen,
  onClose,
  prediction,
  initialOutcome = 0
}: PredictionTradingModalProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 延迟一帧，确保DOM已渲染再添加动画类
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setIsVisible(false);
      // 等待动画结束后再卸载组件
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 与动画时长一致
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialOutcome]);

  if (!shouldRender) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* 右侧滑出弹窗 - PC端从右侧滑入并缩放，移动端从底部滑入 */}
      <div className={`fixed bg-[#051A3D] z-50 transition-all duration-300 ease-out
        ${isMobile
        ? `left-0 bottom-0 w-full pb-[30px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`
        : `right-0 top-0 h-full w-full max-w-[432px] ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`
      }`}>
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between pt-[24px] pl-[12px] pr-[24px]">
          <div className="flex-1 flex items-center overflow-hidden">
            <Avatar className="w-[24px] h-[24px] rounded-[8px] transition-all">
              <AvatarImage src={prediction.imageUrl} alt="avatar" />
            </Avatar>
            <h2 className="truncate h-[24px] leading-[24px] text-[20px] font-bold text-white px-[12px]">
              {prediction.marketName}
            </h2>
          </div>
          <CloseIcon className="text-[24px] text-[#D2D1D1] hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        <TradingForm
          prediction={prediction}
          initialOutcome={initialOutcome}
          onClose={onClose}
        />

        {/* 使用可复用的服务条款组件 */}
        <TermsAgreement />
      </div>
    </>
  );
}
