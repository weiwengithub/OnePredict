"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy_1.svg";
import InfoIcon from "@/assets/icons/info.svg";
import Image from "next/image";

interface PredictionIntegralModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: {
    question: string;
    chance: number;
    volume: string;
    deadline: string;
    id?: string;
  };
}

export default function PredictionIntegralModal({
  isOpen,
  onClose,
  prediction,
}: PredictionIntegralModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(0);
  const [balance] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<'positions' | 'trades' | 'transaction'>('positions');
  const [positionList, setPositionList] = useState<number[]>([]);
  const [tradeList, setTradeList] = useState<number[]>([]);
  const [transactionList, setTransactionList] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (isOpen) {
      // 重置表单
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
  }, [isOpen]);

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
    console.log('Trade:', { tradeType, amount, prediction });
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
      <div className={`fixed right-0 top-0 h-full w-full max-w-[432px] bg-[#051A3D] p-[24px] z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between gap-[12px]">
          <Image src="/images/chrome.png" alt="" width={48} height={48} />
          <div className="flex-1">
            <div className="leading-[20px] text-[18px] text-white font-bold">123456789@gmail.com</div>
            <div className="mt-[4px] flex leading-[16px] text-[14px] text-white/60 font-bold">
              <span>7BfnV6...YYZSPcc</span>
              <CopyIcon className="ml-[4px] cursor-pointer hover:text-white" />
            </div>
          </div>
          <CloseIcon className="text-[24px] text-[#D2D1D1] hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        {/* 弹窗内容 */}
        <div className="mt-[35px]">
          {/* Balance */}
          <div className="h-[220px] bg-[linear-gradient(123.54deg,#CEECD5_7.22%,#C3E9CE_19.99%,#D0ECD6_24.03%,#E3F5E3_39.2%,#DCF2DE_51.37%,#D5EED9_64.23%,#FAFBED_84.67%)] rounded-[16px] px-[24px] py-[16px]">
            <div className="leading-[24px] text-[16px] text-black">Balance</div>
            <div className="flex items-end mt-[24px]">
              <span className="leading-[24px] text-[32px] text-black">500</span>
              <span className="ml-[4px] leading-[19px] text-[20px] text-black">USDH</span>
            </div>
            <div className="mt-[78px] flex">
              <InfoIcon className="flex-none text-[16px] text-black" />
              <span className="ml-[9px] leading-[20px] text-[16px] text-black/60">Bayes Points are not withdrawable. You can use Points for prediction trading.</span>
            </div>
          </div>

          {/* Positions/Trades/Transaction 选项卡 */}
          <div className="mt-[37px]">
            <div className="flex gap-[12px]">
              <span
                className={`leading-[24px] text-[20px] font-bold ${currentTab === 'positions' ? 'text-white' : 'text-white/60 hover:text-white'} cursor-pointer`}
                onClick={() => {setCurrentTab('positions');}}
              >
                Positions
              </span>
              <span
                className={`leading-[24px] text-[20px] font-bold ${currentTab === 'trades' ? 'text-white' : 'text-white/60 hover:text-white'} cursor-pointer`}
                onClick={() => {setCurrentTab('trades');}}
              >
                Trades
              </span>
              <span
                className={`leading-[24px] text-[20px] font-bold ${currentTab === 'transaction' ? 'text-white' : 'text-white/60 hover:text-white'} cursor-pointer`}
                onClick={() => {setCurrentTab('transaction');}}
              >
                Transaction
              </span>
            </div>
            {currentTab === 'positions' && (
              <>
                {positionList.length > 0 ? (
                  positionList.map((position) => (
                    <div key={position} className="mt-[24px]"></div>
                  ))
                ) : (
                  <>
                    <div className="mt-[40px] mx-auto size-[48px]">
                      <Image src="/images/list-empty.png" alt="" width={48} height={48} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">Nothing yet</div>
                  </>
                )}
              </>
            )}
            {currentTab === 'trades' && (
              <>
                {tradeList.length > 0 ? (
                  tradeList.map((trade) => (
                    <div key={trade} className="mt-[24px]"></div>
                  ))
                ) : (
                  <div>
                    <div className="mt-[40px] mx-auto size-[48px]">
                      <Image src="/images/list-empty.png" alt="" width={48} height={48} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">Nothing yet</div>
                  </div>
                )}
              </>
            )}
            {currentTab === 'transaction' && (
              <>
                {transactionList.length > 0 ? (
                  <>
                    {transactionList.map((transaction) => (
                      <div key={transaction} className="mt-[24px] flex items-center bg-[#04122B] rounded-[16px] py-[20px]">
                        <div className="ml-[24px] size-[32px] flex-none">
                          <Image src="/images/icon/icon-token.png" alt="" width={32} height={32} />
                        </div>
                        <div className="mx-[12px] flex-1">
                          <div className="leading-[16px] text-[16px] text-white">Task rewards</div>
                          <div className="mt-[6px] leading-[16px] text-[16px] text-white/40">Bonus for your sign up</div>
                        </div>
                        <div className="flex-none">
                          <div className="leading-[16px] text-[16px] text-white/60"><span className="mr-1 text-[#28C04E] font-bold">+500</span>Points</div>
                          <div className="mt-[6px] leading-[16px] text-[16px] text-white/60">4 days ago</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">All items Loaded.</div>
                  </>
                ) : (
                  <div>
                    <div className="mt-[40px] mx-auto size-[48px]">
                      <Image src="/images/list-empty.png" alt="" width={48} height={48} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">Nothing yet</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
