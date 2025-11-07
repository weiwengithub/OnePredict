"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiService from "@/lib/api/services";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy_1.svg";
import UpIcon from "@/assets/icons/up.svg";
import DownIcon from "@/assets/icons/down.svg";
import ExportIcon from "@/assets/icons/export.svg";
import Image from "next/image";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import {store} from "@/store";
import GoogleIcon from "@/assets/icons/google.svg";
import AppleIcon from "@/assets/icons/apple.svg";
import WalletIcon from "@/assets/icons/walletIcon.svg";
import { useUsdhBalanceFromStore } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {addPoint, onCopyToText, timeAgoEn} from "@/lib/utils";
import { TabSkeleton } from "@/components/SkeletonScreens";
import {MarketPositionOption, MarketTradeOption, TransactionInfo, TransactionOption} from "@/lib/api/interface";
import SaleModal from "@/components/SaleModal";
import { TooltipAmount } from "@/components/TooltipAmount";
import {useRouter} from "next/navigation";
import {useLanguage} from "@/contexts/LanguageContext";
import { MarketClient } from "@/lib/market";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import SharePopover from "@/components/SharePopover";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import {useIsMobile} from "@/contexts/viewport";
import {formatNumberWithSeparator} from '@/lib/numbers';
import {tokenIcon} from "@/assets/config";

interface PredictionIntegralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PredictionIntegralModal({
  isOpen,
  onClose,
}: PredictionIntegralModalProps) {
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<'positions' | 'trades' | 'transaction'>('positions');
  const [positionList, setPositionList] = useState<MarketPositionOption[]>([]);
  const [tradeList, setTradeList] = useState<MarketTradeOption[]>([]);
  const [transactionList, setTransactionList] = useState<TransactionInfo[]>([]);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [salePosition, setSalePosition] = useState<MarketPositionOption | null>(null);

  // 添加加载状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
  const { balance: usdhBalance } = useUsdhBalanceFromStore();
  const suiClient = useSuiClient() as any;
  const executeTransaction = useExecuteTransaction();

  // 组件加载时的初始化效果
  useEffect(() => {
    if (isOpen) {
      // 重置表单
      setAmount(0);
      // 重置错误状态
      setError(null);
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

  const getMarketPosition = useCallback(async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      setError('No wallet connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getMarketPosition({userAddress: owner, address: owner || ''});

      if (res && res.data) {
        const rows = res.data.rows.filter(item => {
          // 不显示已领取收益的数据
          if (item.status === 'Redeemed') {
            return false;
          }
          // 不显示已完成且竞猜失败的数据
          if (item.status === 'Completed' && item.winnerId !== item.currentOutcome.outcomeId) {
            return false;
          }
          return true
        });
        rows.sort((a, b) => {
          const createTimeA = new Date(a.createTime).getTime();
          const createTimeB = new Date(a.createTime).getTime();
          if (a.status !== b.status) {
            return a.status === 'Completed' ? -1 : 1;
          }
          return createTimeA > createTimeB ? 1 : -1;
        })
        setPositionList(rows);
      } else {
        setPositionList([]);
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      setError('Failed to fetch market positions');
      setPositionList([]);
    } finally {
      setLoading(false);
    }
  }, [currentAccount?.address, zkLoginData]);

  const getMarketTradeHistory = useCallback(async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      setError('No wallet connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiService.getMarketTradeHistory({userAddress: owner, address: owner});
      if (res && res.data) {
        const rows = res.data.rows;
        rows.sort((a, b) => {
          const createTimeA = new Date(a.tradeTime).getTime();
          const createTimeB = new Date(a.tradeTime).getTime();
          return createTimeA > createTimeB ? 1 : -1;
        })
        setTradeList(rows);
      } else {
        setTradeList([]);
      }
    } catch (err) {
      console.error('Error fetching market trade history:', err);
      setError('Failed to fetch trade history');
      setTradeList([]);
    } finally {
      setLoading(false);
    }
  }, [currentAccount?.address, zkLoginData]);

  // 添加获取交易记录的函数
  const getTransactionHistory = useCallback(async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      setError('No wallet connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const {data} = await apiService.getTransactionHistory({projectId: '', address: owner});

      const rows = data.rows;
      rows.sort((a, b) => {
        const createTimeA = new Date(a.tradeTime).getTime();
        const createTimeB = new Date(a.tradeTime).getTime();
        return createTimeA > createTimeB ? 1 : -1;
      })
      setTransactionList(rows);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Failed to fetch transaction history');
      setTransactionList([]);
    } finally {
      setLoading(false);
    }
  }, [currentAccount?.address, zkLoginData]);


  // currentTab变化时调用对应的查询方法
  useEffect(() => {
    if (!isOpen || !currentTab) return;

    // 根据当前标签页直接调用对应的查询方法
    switch (currentTab) {
      case 'positions':
        getMarketPosition();
        break;
      case 'trades':
        getMarketTradeHistory();
        break;
      case 'transaction':
        getTransactionHistory();
        break;
    }
  }, [currentTab, isOpen, getMarketPosition, getMarketTradeHistory, getTransactionHistory]);

  const contractRedeem = async (position: MarketPositionOption) => {
    try {
      const marketClient = new MarketClient(suiClient, {
        packageId: position.packageId,
        coinType: position.coinType,
        globalSeqId: position.globalSequencerId || ''
      });
      const tx = await marketClient.buildRedeemTx({
        marketId: position.marketId,
      });
      await executeTransaction(tx, true);
      setTimeout(() => {
        getMarketPosition();
      }, 2000);
    } catch (e: any) {
      console.error('redeem error:', e);
    } finally {
      // setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 右侧滑出弹窗 */}
      <div className={`fixed flex flex-col bg-[#051A3D] p-[24px] z-[110] transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        ${isMobile ? 'left-0 top-[90px] bottom-0 w-full pb-[30px]' : 'right-0 top-0 h-full w-full max-w-[432px]'}`}>
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
              <div className="leading-[20px] text-[18px] text-white font-bold">Wallet address</div>
            ) }
            <div className="mt-[4px] flex leading-[16px] text-[14px] text-white/60 font-bold">
              <span>{addPoint(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')}</span>
              <CopyIcon className="ml-[4px] cursor-pointer hover:text-white" onClick={() => onCopyToText(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')} />
            </div>
          </div>
          <CloseIcon className="text-[24px] text-[#D2D1D1] hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        {/* Balance */}
        <div className="flex-none mt-[35px] h-[220px] bg-[url(/images/card-bg.png)] bg-no-repeat bg-cover bg-center rounded-[16px] p-[16px]">
          <div className="leading-[16px] text-[16px] text-white">{t('predictions.balance')}</div>
          <div className="flex items-end mt-[24px]">
            <span className="leading-[24px] text-[32px] text-white">{formatNumberWithSeparator(usdhBalance, {style: language === 'zh' ? 'cn' : 'western'})}</span>
            <span className="ml-[4px] leading-[19px] text-[20px] text-white/60">USDH</span>
          </div>
          <div className="mt-[56px] flex gap-[16px]">
            <div
              className="flex-1 h-[56px] flex items-center justify-center bg-[#36383A] rounded-[16px] cursor-pointer"
              onClick={() => setShowDeposit(true)}
            >
              <div className="size-[16px] bg-white rounded-full flex items-center justify-center">
                <DownIcon className="text-[8px] text-black" />
              </div>
              <div className="ml-[10px] leading-[24px] text-white text-[16px]">{t('predictions.integralModal.deposit')}</div>
            </div>
            <div
              className="flex-1 h-[56px] flex items-center justify-center bg-[#FAFAFA] rounded-[16px] cursor-pointer"
              onClick={() => setShowWithdraw(true)}
            >
              <div className="size-[16px] bg-black rounded-full flex items-center justify-center">
                <UpIcon className="text-[8px] text-white" />
              </div>
              <div className="ml-[10px] leading-[24px] text-black text-[16px]">{t('predictions.integralModal.withdraw')}</div>
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
              {t('predictions.integralModal.positions')}
            </span>
            <span
              className={`leading-[24px] text-[20px] font-bold ${currentTab === 'trades' ? 'text-white' : 'text-white/60 hover:text-white'} cursor-pointer`}
              onClick={() => {setCurrentTab('trades');}}
            >
              {t('predictions.integralModal.trades')}
            </span>
            <span
              className={`leading-[24px] text-[20px] font-bold ${currentTab === 'transaction' ? 'text-white' : 'text-white/60 hover:text-white'} cursor-pointer`}
              onClick={() => {setCurrentTab('transaction');}}
            >
              {t('predictions.integralModal.transaction')}
            </span>
          </div>

          {/* 骨架屏加载状态 */}
          {loading && <TabSkeleton currentTab={currentTab} />}

          {/* 错误状态显示 */}
          {error && !loading && (
            <div className="mt-[24px] p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
          {currentTab === 'positions' && !loading && (
            <>
              {positionList.length > 0 ? (
                <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
                  {positionList.map((position, index) => (
                    <div
                      key={`${position.marketId}_${index}`}
                      className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20 cursor-pointer"
                      onClick={() => {
                        router.push(`/details?marketId=${position.marketId}`);
                      }}
                    >
                      <div className="flex items-center">
                        <Avatar className="w-[40px] h-[40px] rounded-[8px] transition-all">
                          <AvatarImage src={position.imageUrl} alt="avatar" />
                        </Avatar>
                        <div className="ml-[12px] flex-1 overflow-hidden">
                          <div className="h-[16px] w-full truncate leading-[16px] text-[16px] text-white">
                            {position.marketName}
                          </div>
                          <div className="inline-block mt-[4px] h-[20px] leading-[20px] rounded-[4px] bg-[rgba(40,192,78,0.5)] px-[4px] text-[#28C04E] text-[16px]">
                            <TooltipAmount
                              shares={position.shares}
                              decimals={0}
                              precision={2}
                              suffix={position.currentOutcome.name}
                            />
                          </div>
                        </div>
                        <div className="text-white px-[12px] text-[12px] mx-[20px]">
                          <SharePopover
                            trigger={<ExportIcon className="text-white/60 hover:text-white text-[12px]" />}
                            content={
                              <div className="max-w-[260px] text-sm leading-5">
                                <div
                                  className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyToText(`${window.location.origin}/details?marketId=${position.marketId}`)
                                  }}
                                >
                                  <CopyIcon />
                                  {t('predictions.copyLink')}
                                </div>
                              </div>
                            }
                            offset={10}
                            lockScroll
                          />
                        </div>
                        {(position.status === 'OnGoing' || position.status === 'Resolved') && (
                          <div
                            className="h-[32px] leading-[32px] px-[16px] bg-[#F85E5C] rounded-[8px] text-white text-[16px] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSalePosition(position)
                              setShowSale(true)
                            }}
                          >{t('predictions.integralModal.sale')}</div>
                        )}
                        {(position.status === 'Completed' && position.winnerId === position.currentOutcome.outcomeId) && (
                          <div
                            className={`h-[32px] leading-[32px] px-[16px] bg-[#29C04E] rounded-[8px] text-white text-[16px] cursor-pointer ${position.isRedeemed ? 'bg-[#999999]' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!position.isRedeemed) {
                                contractRedeem(position)
                              }
                            }}
                          >{position.isRedeemed ? t('predictions.integralModal.claimed') : t('predictions.integralModal.claim')}</div>
                        )}
                      </div>
                      <div className="mt-[24px] flex pt-[24px] border-t border-white/10">
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.entryPrice')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.entryPrice} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.marketPrice')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.currentPrice} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.bet')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.betAmount} decimals={0} precision={2} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-[16px] flex">
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.current')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.positionValue} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.pnl')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.pnl} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.toWin')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={position.shares} decimals={0} precision={2}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('predictions.integralModal.loaded')}</div>
                </div>
              ) : (
                <>
                  <div className="mt-[40px] mx-auto size-[48px]">
                    <Image src="/images/empty.png?v=1" alt="" width={48} height={48} />
                  </div>
                  <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('common.nothing')}</div>
                </>
              )}
            </>
          )}
          {currentTab === 'trades' && !loading && (
            <>
              {tradeList.length > 0 ? (
                <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
                  {tradeList.map((trade, index) => (
                    <div
                      key={`${trade.marketId}_${index}`}
                      className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20"
                      onClick={() => {
                        router.push(`/details?marketId=${trade.marketId}`);
                      }}
                    >
                      <div className="flex">
                        <Avatar className="w-[40px] h-[40px] rounded-[8px] transition-all">
                          <AvatarImage src={trade.marketImage} alt="avatar" />
                        </Avatar>
                        {/*<Image src={trade.marketImage} alt="" width={40} height={40} />*/}
                        <div className="ml-[12px] flex-1 overflow-hidden">
                          <div className="h-[16px] w-full truncate leading-[16px] text-[16px] text-white">
                            {trade.marketName}
                          </div>
                          <div className="inline-block mt-[4px] h-[20px] leading-[20px] rounded-[4px] bg-[rgba(40,192,78,0.5)] px-[4px] text-[#28C04E] text-[16px]">
                            <TooltipAmount
                              shares={trade.amount}
                              decimals={0}
                              precision={2}
                              suffix={trade.outcome.name}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-[24px] flex justify-between pt-[24px] border-t border-white/10">
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.type')}</div>
                          {trade.tradeType === 'Bought' && (
                            <div className="mt-[8px] leading-[16px] text-[16px] text-white">
                              {t('predictions.buy')}
                            </div>
                          )}
                          {trade.tradeType === 'Sold' && (
                            <div className="mt-[8px] leading-[16px] text-[16px] text-white">
                              {t('predictions.sell')}
                            </div>
                          )}
                          {trade.tradeType === 'Redeemed' && (
                            <div className="mt-[8px] leading-[16px] text-[16px] text-white">
                              {t('predictions.redeemed')}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.price')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={trade.entryPrice} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.value')}</div>
                          <div className="mt-[8px] flex gap-1 leading-[16px] text-[16px] text-white">
                            <Image src={tokenIcon} alt="" width={16} height={16} />
                            <TooltipAmount shares={trade.amount} decimals={0} precision={2}/>
                          </div>
                        </div>
                        <div>
                          <div className="leading-[12px] text-[12px] text-white/60">{t('predictions.integralModal.date')}</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white">
                            {timeAgoEn(trade.tradeTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('predictions.integralModal.loaded')}</div>
                </div>
              ) : (
                <div>
                  <div className="mt-[40px] mx-auto size-[48px]">
                    <Image src="/images/empty.png?v=1" alt="" width={48} height={48} />
                  </div>
                  <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('common.nothing')}</div>
                </div>
              )}
            </>
          )}
          {currentTab === 'transaction' && !loading && (
            <>
              {transactionList.length > 0 ? (
                <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
                  {transactionList.map((transaction, index) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-center pb-[24px] border-b border-white/10 last:border-none last:pb-0 cursor-pointer"
                      onClick={() => {
                        router.push(`/details?marketId=${transaction.marketId}`);
                      }}
                    >
                      <Image src={transaction.icon} alt="" width={32} height={32} className="size-[32px] flex-none rounded-[8px]" />
                      <div className="ml-[12px] flex-1">
                        {transaction.tradeType === 'Sold' && (
                          <div className="flex items-center justify-between gap-[12px] leading-[16px] text-[16px]">
                            <span className="text-white">{t('predictions.sell')}</span>
                            <span className="text-[#28C04E] font-bold">+<TooltipAmount shares={transaction.total} decimals={0} precision={2}/></span>
                          </div>
                        )}
                        {transaction.tradeType === 'Bought' && (
                          <div className="flex items-center justify-between gap-[12px] leading-[16px] text-[16px]">
                            <span className="text-white">{t('predictions.buy')}</span>
                            <span className="text-white font-bold">-<TooltipAmount shares={transaction.total} decimals={0} precision={2}/></span>
                          </div>
                        )}
                        {transaction.tradeType === 'Redeemed' && (
                          <div className="flex items-center justify-between gap-[12px] leading-[16px] text-[16px]">
                            <span className="text-white">{t('predictions.redeemed')}</span>
                            <span className="text-[#28C04E] font-bold">+<TooltipAmount shares={transaction.total} decimals={0} precision={2}/></span>
                          </div>
                        )}
                        <div className="mt-[6px] flex items-center gap-[12px] leading-[16px] text-[16px]">
                          <span className="flex-1 text-white/40 truncate">{transaction.projectName}</span>
                          <span className="flex-none text-white/60">{timeAgoEn(transaction.tradeTime)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-[24px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('predictions.integralModal.loaded')}</div>
                </div>
              ) : (
                <div>
                  <div className="mt-[40px] mx-auto size-[48px]">
                    <Image src="/images/empty.png?v=1" alt="" width={48} height={48} />
                  </div>
                  <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('common.nothing')}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal open={showDeposit} onOpenChange={setShowDeposit} />

      {/* Withdraw Modal */}
      <WithdrawModal open={showWithdraw} onOpenChange={setShowWithdraw} />

      {/* Sale Modal */}
      <SaleModal open={showSale} position={salePosition} onOpenChange={setShowSale}></SaleModal>
    </>
  );
}
