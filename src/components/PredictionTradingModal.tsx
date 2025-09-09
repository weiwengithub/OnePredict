"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Remove unused dialog imports
import { X, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface PredictionTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: {
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

  const yesPrice = prediction.chance / 100;
  const noPrice = (100 - prediction.chance) / 100;

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmount(Math.max(0, numValue));
  };

  const addAmount = (value: number) => {
    setAmount(prev => Math.max(0, prev + value));
  };

  const setMaxAmount = () => {
    setAmount(balance);
  };

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
      <div className={`fixed right-0 top-0 h-full w-full max-w-[400px] bg-[#1a2332] border-l border-white/10 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {prediction.question.length > 40
              ? `${prediction.question.substring(0, 40)}...`
              : prediction.question
            }
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5 text-white/60" />
          </Button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6 space-y-6">
          {/* Buy/Sell 选项卡 */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-all ${
                tradeType === 'buy'
                  ? 'bg-white text-gray-900'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-all ${
                tradeType === 'sell'
                  ? 'bg-white text-gray-900'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Outcomes 选择 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Outcomes
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutcome('yes')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  outcome === 'yes'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <div className="text-left">
                  <div className="text-lg font-bold text-green-400">YES</div>
                  <div className="text-sm text-white/60">{yesPrice.toFixed(2)}</div>
                </div>
              </button>

              <button
                onClick={() => setOutcome('no')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  outcome === 'no'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <div className="text-left">
                  <div className="text-lg font-bold text-red-400">NO</div>
                  <div className="text-sm text-white/60">{noPrice.toFixed(2)}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount 输入 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              Amount
            </label>
            <div className="space-y-3">
              {/* 金额输入框 */}
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="bg-white/5 border-white/20 text-white text-lg font-bold py-6 pl-4 pr-20"
                  min={0}
                  step={0.01}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                  USDC
                </div>
              </div>

              {/* 快捷金额按钮 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addAmount(1)}
                  className="flex-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addAmount(10)}
                  className="flex-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  +10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setMaxAmount}
                  className="flex-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>

          {/* Balance 余额 */}
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <span className="text-white/60">Balance</span>
            <span className="text-white font-semibold">{balance.toFixed(2)} USDC</span>
          </div>

          {/* Sign In 按钮 */}
          <Button
            onClick={handleTrade}
            disabled={amount <= 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {amount > 0 && balance >= amount
              ? `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${outcome.toUpperCase()}`
              : 'Sign In'
            }
          </Button>

          {/* 服务条款 */}
          <div className="text-center">
            <p className="text-xs text-white/50">
              By trading, you agree to the{' '}
              <Link
                href="/terms"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Terms of Use
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
