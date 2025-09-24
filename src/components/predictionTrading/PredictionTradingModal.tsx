"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CloseIcon from "@/assets/icons/close.svg";
import TradingForm from "./TradingForm";
import { useExecuteTransaction } from '@/hooks/useExecuteTransaction';
import TermsAgreement from "./TermsAgreement";
import { MarketOption } from "@/lib/api/interface";
import { MarketClient } from "@/lib/market";
import { useSuiClient, useCurrentAccount } from "@onelabs/dapp-kit";
import { store } from "@/store";

interface PredictionTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: MarketOption;
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
  const executeTransaction = useExecuteTransaction();
  const suiClient = useSuiClient() as any;
  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData;
  console.log(currentAccount) 
  useEffect(() => {
    if (isOpen) {
      // 重置表单
      setOutcome(initialOutcome);
      setAmount(0);
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, initialOutcome]);

  const handleTrade = async () => {
    // 这里将来会实现实际的交易逻辑
    console.log('Trade:', { tradeType, outcome, amount, prediction });
   const marketClient = new MarketClient(suiClient, {
    packageId: prediction.packageId,
    coinType: prediction.coinType
  });
  // 查询钱包中该币种的 Coin 对象，选择一个对象 ID 作为支付币
  const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
  if (!owner) {
    console.error('No wallet connected');
    return;
  }
  const coins = await suiClient.getCoins({ owner, coinType: prediction.coinType });
  const coinObjectId = coins?.data?.[0]?.coinObjectId;
  if (!coinObjectId) {
    console.error('No coin object found for type:', prediction.coinType);
    return;
  }
  const tx = await marketClient.buildBuyTx({
    marketId: prediction.marketId,
    outcome: outcome === 'yes' ? 1 : 0,
    deltaShares: amount*Math.pow(10, 9),
    paymentCoinId: coinObjectId,
    minSharesOut: 0,
  });
  console.log(tx)
    await executeTransaction(tx, true);
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
              <AvatarImage src={prediction.metaJson.image_url} alt="avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-semibold">
                loading...
              </AvatarFallback>
            </Avatar>
            <h2 className="truncate h-[24px] leading-[24px] text-[20px] font-bold text-white px-[12px]">
              {prediction.metaJson.title}
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
          // prediction={prediction}
        />

        {/* 使用可复用的服务条款组件 */}
        <TermsAgreement />
      </div>
    </>
  );
}
