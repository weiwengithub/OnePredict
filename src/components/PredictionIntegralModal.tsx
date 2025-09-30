"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiService from "@/lib/api/services";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy_1.svg";
import UpIcon from "@/assets/icons/up.svg";
import DownIcon from "@/assets/icons/down.svg";
import ExportIcon from "@/assets/icons/export.svg";
import Image from "next/image";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import {store} from "@/store";
import GoogleIcon from "@/assets/icons/google.svg";
import AppleIcon from "@/assets/icons/apple.svg";
import WalletIcon from "@/assets/icons/walletIcon.svg";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {addPoint, onCopyToText} from "@/lib/utils";

interface PredictionIntegralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowDeposit: () => void;
  onShowWithdraw: () => void;
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
  onShowDeposit,
  onShowWithdraw,
  prediction,
}: PredictionIntegralModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<'positions' | 'trades' | 'transaction'>('positions');
  const [positionList, setPositionList] = useState<number[]>([1, 2, 3, 4, 5]);
  const [tradeList, setTradeList] = useState<number[]>([1, 2, 3, 4, 5]);
  const [transactionList, setTransactionList] = useState<number[]>([1, 2, 3, 4, 5]);

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
  console.log('************** 123');
  console.log(zkLoginData);
  const { balance: usdhBalance } = useUsdhBalance({
    pollMs: 0, // 可选：例如 5000 开启 5s 轮询
  });

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
    setAmount(Number(usdhBalance));
  };

  const handleTrade = () => {
    // 这里将来会实现实际的交易逻辑
    console.log('Trade:', { tradeType, amount, prediction });
    onClose();
  };

  const getMarketPosition = async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      return;
    }
    const res = await apiService.getMarketPosition(owner)
    console.log('**************** market position')
    console.log(res)
  }

  const getMarketTradeHistory = async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      return;
    }
    const res = await apiService.getMarketTradeHistory(owner)
    console.log('**************** market position')
    console.log(res)
  }

  useEffect(() => {
    switch (currentTab) {
      case 'positions':
        getMarketPosition();
        break;
      case 'trades':
        getMarketTradeHistory();
        break;
      case 'transaction':
        console.log('transaction');
        break;
    }
  }, [currentTab]);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 右侧滑出弹窗 */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[432px] flex flex-col bg-[#051A3D] p-[24px] z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {!!zkLoginData && (
          <div></div>
        )}
        <div className="flex-none flex items-center justify-between gap-[12px]">
          <div className="text-[48px]">
            {zkLoginData ? ( (zkLoginData as any)?.provider === 'google' ? <GoogleIcon /> : <AppleIcon />) : <WalletIcon />}
          </div>
          <div className="flex-1">
            {zkLoginData ? (
              <div className="leading-[20px] text-[18px] text-white font-bold">{(zkLoginData as any)?.provider === 'google' ? zkLoginData.email : ''}</div>
            ) : (
              <div className="leading-[20px] text-[18px] text-white font-bold">123456789@gmail.com</div>
            ) }
            <div className="mt-[4px] flex leading-[16px] text-[14px] text-white/60 font-bold">
              <span>{zkLoginData ? addPoint(zkLoginData.zkloginUserAddress) : ''}</span>
              <CopyIcon className="ml-[4px] cursor-pointer hover:text-white" onClick={() => onCopyToText(zkLoginData ? zkLoginData.zkloginUserAddress : '')} />
            </div>
          </div>
          <CloseIcon className="text-[24px] text-[#D2D1D1] hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        {/* Balance */}
        <div className="flex-none mt-[35px] h-[220px] bg-[url(/images/card-bg.png)] bg-no-repeat bg-cover bg-center rounded-[16px] p-[16px]">
          <div className="leading-[16px] text-[16px] text-white">Balance</div>
          <div className="flex items-end mt-[24px]">
            <span className="leading-[24px] text-[32px] text-white">{usdhBalance}</span>
            <span className="ml-[4px] leading-[19px] text-[20px] text-white/60">USDH</span>
          </div>
          <div className="mt-[56px] flex gap-[16px]">
            <div
              className="flex-1 h-[56px] flex items-center justify-center bg-[#36383A] rounded-[16px] cursor-pointer"
              onClick={onShowDeposit}
            >
              <div className="size-[16px] bg-white rounded-full flex items-center justify-center">
                <DownIcon className="text-[8px] text-black" />
              </div>
              <div className="ml-[10px] leading-[24px] text-white text-[16px]">Deposit</div>
            </div>
            <div
              className="flex-1 h-[56px] flex items-center justify-center bg-[#FAFAFA] rounded-[16px] cursor-pointer"
              onClick={onShowWithdraw}
            >
              <div className="size-[16px] bg-black rounded-full flex items-center justify-center">
                <UpIcon className="text-[8px] text-white" />
              </div>
              <div className="ml-[10px] leading-[24px] text-black text-[16px]">Withdraw</div>
            </div>
          </div>
        </div>

        {/* Positions/Trades/Transaction 选项卡 */}
        <div className="flex-1 overflow-hidden mt-[37px] flex flex-col">
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
                <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
                  {positionList.map((position) => (
                    <div key={position} className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
                      <div className="flex items-center">
                        <Image src="/images/demo.png" alt="" width={40} height={40} />
                        <div className="ml-[12px] flex-1 overflow-hidden">
                          <div className="h-[16px] w-full truncate leading-[16px] text-[16px] text-white">Will US–EU strike a tariff deal?deal?deal?deal?deal?deal</div>
                          <div className="inline-block mt-[4px] h-[20px] leading-[20px] rounded-[4px] bg-[rgba(40,192,78,0.5)] px-[4px] text-[#28C04E] text-[16px]">37.15 Yes</div>
                        </div>
                        <div className="text-white px-[12px] text-[12px] mx-[20px]">
                          <ExportIcon />
                        </div>
                        <div className="h-[32px] leading-[32px] px-[16px] bg-[#F85E5C] rounded-[8px] text-white text-[16px]">Sale</div>
                      </div>
                      <div className="mt-[24px] flex pt-[24px] border-t border-white/10">
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">Entry Price</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">0.5</div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">Market Price</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">32.91</div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">Bet</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">32.91</div>
                        </div>
                      </div>
                      <div className="mt-[16px] flex">
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">Current</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">0.5</div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">Pnl</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">32.91</div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">To win</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">32.91</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">All items Loaded.</div>
                </div>
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
                <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
                  {tradeList.map((trade) => (
                    <div key={trade} className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
                      <div className="flex">
                        <Image src="/images/demo.png" alt="" width={40} height={40} />
                        <div className="ml-[12px] flex-1 overflow-hidden">
                          <div className="h-[16px] w-full truncate leading-[16px] text-[16px] text-white">Will US–EU strike a tariff deal?deal?deal?deal?deal?deal</div>
                          <div className="inline-block mt-[4px] h-[20px] leading-[20px] rounded-[4px] bg-[rgba(40,192,78,0.5)] px-[4px] text-[#28C04E] text-[16px]">37.15 Yes</div>
                        </div>
                      </div>
                      <div className="mt-[24px] flex justify-between pt-[24px] border-t border-white/10">
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">Type</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white">Buy</div>
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">Price</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">0.5</div>
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">Value</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white pl-[20px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[length:16px_16px]">32.91</div>
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">Date</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white">4 days ago</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">All items Loaded.</div>
                </div>
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
                <div className="mt-[24px] flex-1">
                  <div className="space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
                    {transactionList.map((transaction) => (
                      <div key={transaction} className="flex items-center pb-[24px] border-b border-white/10 last:border-none last:pb-0">
                        <div className="size-[32px] flex-none">
                          <Image src="/images/icon/icon-token.png" alt="" width={32} height={32} />
                        </div>
                        <div className="mx-[12px] flex-1">
                          <div className="leading-[16px] text-[16px] text-white">Task rewards</div>
                          <div className="mt-[6px] leading-[16px] text-[16px] text-white/40">Bonus for your sign up</div>
                        </div>
                        <div className="flex-none text-right">
                          <div className="leading-[16px] text-[16px] text-white/60"><span className="mr-1 text-[#28C04E] font-bold">+500</span>Points</div>
                          <div className="mt-[6px] leading-[16px] text-[16px] text-white/60">4 days ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">All items Loaded.</div>
                </div>
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
    </>
  );
}
