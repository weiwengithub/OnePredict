"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from '@/components/ProgressBar';
import { MarketOption } from "@/lib/api/interface";
import Image from "next/image";
import BigNumber from "bignumber.js";
import RefreshIcon from "@/assets/icons/refresh.svg";
import SettingsIcon from "@/assets/icons/setting.svg";

interface TradingFormProps {
  tradeType: 'buy' | 'sell';
  onTradeTypeChange: (type: 'buy' | 'sell') => void;
  outcome: 'yes' | 'no';
  onOutcomeChange: (outcome: 'yes' | 'no') => void;
  amount: number;
  onAmountChange: (amount: number) => void;
  balance: number;
  onTrade: () => void;
  // prediction: MarketOption;
}

export default function TradingForm({
  tradeType,
  onTradeTypeChange,
  outcome,
  onOutcomeChange,
  amount,
  onAmountChange,
  balance,
  onTrade,
  // prediction
}: TradingFormProps) {
  // const yesPrice = new BigNumber(prediction.pProbsJson[0]).shiftedBy(-12);
  // const noPrice = new BigNumber(prediction.pProbsJson[1]).shiftedBy(-12);
  const yesPrice = 0.5;
  const noPrice = 0.5;
  const [progress, setProgress] = useState(25);

  const handleAmountInputChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onAmountChange(Math.max(0, numValue));
  };

  const addAmount = (value: number) => {
    onAmountChange(Math.max(0, amount + value));
  };

  const setMaxAmount = () => {
    onAmountChange(balance);
  };

  return (
    <div className="mt-[16px] mx-[12px] p-[12px] bg-[#010A2C] rounded-[16px]">
      {/* Buy/Sell 选项卡 */}
      <div className="h-[40px] flex border-b border-white/20">
        <div
          onClick={() => onTradeTypeChange('buy')}
          className={`px-[12px] text-[16px] font-bold border-b-[2px] transition-all cursor-pointer ${
            tradeType === 'buy'
              ? 'text-white border-white'
              : 'text-white/60 hover:text-white border-transparent'
          }`}
        >
          Buy
        </div>
        <div
          onClick={() => onTradeTypeChange('sell')}
          className={`px-[12px] text-[16px] font-bold transition-all cursor-pointer ${
            tradeType === 'sell'
              ? 'text-white border-b-[2px] border-white'
              : 'text-white/60 hover:text-white border-transparent'
          }`}
        >
          Sell
        </div>
      </div>

      {/* Outcomes 选择 */}
      <div className="mt-[24px]">
        <div className="flex justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
          <span>Outcomes</span>
          <RefreshIcon className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOutcomeChange('yes')}
            className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all ${
              outcome === 'yes'
                ? 'bg-[#29C04E] hover:bg-[#29C04E] text-white'
                : 'bg-[#34503B] hover:bg-[#29C04E] text-[#089C2B] hover:text-white'
            }`}
          >
            YES {yesPrice.toFixed(2)}
          </button>

          <button
            onClick={() => onOutcomeChange('no')}
            className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all ${
              outcome === 'no'
                ? 'bg-[#F95D5D] hover:bg-[#F95D5D] text-white'
                : 'bg-[rgba(249,93,93,0.5)] hover:bg-[#F95D5D] text-[#E04646] hover:text-white'
            }`}
          >
            NO {noPrice.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Amount 输入 */}
      <div className="mt-[24px]">
        <div className="flex justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
          <span>Amount</span>
          <SettingsIcon className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
        <div className="space-y-3">
          {/* 金额输入框 */}
          <div className="relative">
            <Input
              type="tel"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountInputChange(e.target.value)}
              placeholder="0"
              className="h-[56px] bg-transparent border-white/20 text-white text-[32px] font-bold placeholder:text-white/60 pl-[12px] pr-20"
              min={0}
              step={0.01}
            />
            <div className="h-[24px] absolute right-[8px] top-[12px] flex gap-[8px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAmount(1)}
                className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
              >
                +1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAmount(10)}
                className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
              >
                +10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={setMaxAmount}
                className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
              >
                MAX
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance 余额 */}
      <div className="mt-[8px] flex items-center justify-between">
        <div className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold flex items-center gap-[8px]">
          <span className="inline-block">Balance</span>
          <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
          <span className="inline-block">{balance.toFixed(2)}</span>
        </div>
        <div className="w-[140px]">
          <ProgressBar
            initialValue={progress}
            onChange={setProgress}
          />
        </div>
      </div>

      {/* Sign In 按钮 */}
      <Button
        onClick={onTrade}
        disabled={amount <= 0}
        className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {amount > 0 && balance >= amount
          ? `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${outcome.toUpperCase()}`
          : 'Sign In'
        }
      </Button>
    </div>
  );
}
