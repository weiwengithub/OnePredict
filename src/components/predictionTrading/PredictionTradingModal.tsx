"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CloseIcon from "@/assets/icons/close.svg";
import TradingForm from "./TradingForm";
import TermsAgreement from "./TermsAgreement";

interface PredictionTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: {
    avatar: string;
    question: string;
    chance: number;
    volume: string;
    deadline: string;
    id?: string;
  };
  initialOutcome?: 'yes' | 'no';
}

export default function PredictionTradingModal({
  isOpen,
  onClose,
  prediction,
  initialOutcome = 'yes'
}: PredictionTradingModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState<'yes' | 'no'>(initialOutcome);
  const [amount, setAmount] = useState<number>(0);
  const [balance] = useState<number>(0);

  // 重置表单当弹窗打开时
  useEffect(() => {
    if (isOpen) {
      setOutcome(initialOutcome);
      setAmount(0);
    }
  }, [isOpen, initialOutcome]);

  const handleTrade = () => {
    // 这里将来会实现实际的交易逻辑
    console.log('Trade:', { tradeType, outcome, amount, prediction });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 右侧滑出弹窗 */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[432px] bg-[#051A3D] z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between pt-[24px] pl-[12px] pr-[24px]">
          <div className="flex-1 flex items-center overflow-hidden">
            <Avatar className="w-[24px] h-[24px] rounded-[8px] transition-all">
              <AvatarImage src={prediction.avatar} alt="avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
                {prediction.question.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="truncate h-[24px] leading-[24px] text-[20px] font-bold text-white px-[12px]">
              {prediction.question}
            </h2>
          </div>
          <CloseIcon className="text-[24px] text-[#D2D1D1] hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        {/* 使用可复用的交易表单组件 */}
        <TradingForm
          tradeType={tradeType}
          onTradeTypeChange={setTradeType}
          outcome={outcome}
          onOutcomeChange={setOutcome}
          amount={amount}
          onAmountChange={setAmount}
          balance={balance}
          onTrade={handleTrade}
          prediction={prediction}
        />

        {/* 使用可复用的服务条款组件 */}
        <TermsAgreement />
      </div>
    </>
  );
}
