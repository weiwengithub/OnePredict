"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Popover from '@radix-ui/react-popover';
import { ProgressBar } from '@/components/ProgressBar';
import {MarketOption, MarketPositionOption} from "@/lib/api/interface";
import Image from "next/image";
import RefreshIcon from "@/assets/icons/refresh.svg";
import SettingsIcon from "@/assets/icons/setting.svg";
import ArrowDownIcon from "@/assets/icons/arrowDown.svg";
import CheckedIcon from "@/assets/icons/circle-checked.svg";
import WarningIcon from "@/assets/icons/warning_2.svg";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalanceFromStore } from "@/hooks/useUsdhBalance";
import { useExecuteTransaction } from '@/hooks/useExecuteTransaction';
import { ZkLoginData } from "@/lib/interface";
import {hideLoading, setSigninOpen, showLoading, store} from "@/store";
import {MarketClient} from "@/lib/market";
import { useDispatch } from 'react-redux';
import {useLanguage} from "@/contexts/LanguageContext";
import { toast } from "sonner";
import apiService from "@/lib/api/services";
import {TooltipAmount} from "@/components/TooltipAmount";
import {abbreviateNumber, fix, formatNumberWithSeparator, toDisplayDenomAmount} from "@/lib/numbers";
import Countdown from "@/components/Countdown";
import {colors, tokenIcon} from "@/assets/config";
import {hexToRgbTriplet} from "@/lib/color";
import OutcomeProposed from "@/assets/icons/outcomeProposed.svg";
import DisputeWindow from "@/assets/icons/disputeWindow.svg";
import FinalOutcome from "@/assets/icons/finalOutcome.svg";
import ResultIcon from "@/assets/icons/succeedResult.svg";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";
import {HoverTooltipButton} from "@/components/HoverTooltipButton";

interface TradingFormProps {
  prediction: MarketOption;
  initialOutcome: number;
  outcomeChange?: (next: number) => void;
  onClose?: () => void;
}

export default function TradingForm({prediction, initialOutcome, outcomeChange, onClose}: TradingFormProps) {
  const { language, t } = useLanguage();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [buyOutcome, setBuyOutcome] = useState<number>(0);
  const [sellOutcome, setSellOutcome] = useState(0);
  const [amount, setAmount] = useState<number | string>('');
  const [sellAmount, setSellAmount] = useState<number | string>('');
  const [sellAvailable, setSellAvailable] = useState<number | string>(0);
  // const yesPrice = new BigNumber(prediction.pProbsJson[0]).shiftedBy(-12);
  // const noPrice = new BigNumber(prediction.pProbsJson[1]).shiftedBy(-12);
  const [progress, setProgress] = useState(0);
  const [sellProgress, setSellProgress] = useState(0);
  const suiClient = useSuiClient() as any;
  const executeTransaction = useExecuteTransaction();
  const dispatch = useDispatch();
  const [tradeDeadlineTime, setTradeDeadlineTime] = useState('');
  const [showTradeDeadline, setShowTradeDeadline] = useState<boolean>(false);

  const [positionList, setPositionList] = useState<MarketPositionOption[]>([]);
  const [showCheckPosition, setShowCheckPosition] = useState(false);

  const startTime = new Date(prediction.startTime).getTime();

  useEffect(() => {
    setBuyOutcome(initialOutcome)
  }, [initialOutcome]);

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;


  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData])
  const { balance: usdhBalance, refresh } = useUsdhBalanceFromStore();

  const handleAmountInputChange = (value: string) => {
    const max = Number(usdhBalance);
    const newAmount = value ? Math.min(parseFloat(value), max) : '';
    setAmount(newAmount);
    const progress = newAmount ? 100 * Number(newAmount) / max : 0;
    setProgress(progress);
  };

  const addAmount = (value: number) => {
    const max = Number(usdhBalance);
    const newAmount = Math.min(amount ? Number(amount) + value : value, max);
    setAmount(newAmount);
    const progress = 100 * Number(newAmount) / max
    setProgress(progress);
  };

  const setMaxAmount = () => {
    setAmount(usdhBalance);
    setProgress(100);
  };

  const handleSellAmountInputChange = (value: string) => {
    const max = Number(sellAvailable);
    const newAmount = value ? Math.min(parseFloat(value), max) : '';
    setSellAmount(newAmount);
    const progress = newAmount ? 100 * Number(newAmount) / max : 0;
    setSellProgress(progress);
  };

  const addSellAmount = (value: number) => {
    const max = Number(sellAvailable);
    const newAmount = Math.min(sellAmount ? Number(sellAmount) + value : value, max);
    setSellAmount(newAmount);
    const progress = 100 * Number(newAmount) / max
    setSellProgress(progress);
  };

  const setMaxSellAmount = () => {
    setSellAmount(sellAvailable);
    setSellProgress(100);
  };

  const handleTrade = useCallback(async () => {
    if (!userAddress) {
      console.error('No wallet connected');
      return;
    }
    store.dispatch(showLoading('Processing transaction...'));

    try {
      const marketClient = new MarketClient(suiClient, {
        packageId: prediction.packageId,
        coinType: prediction.coinType,
        globalSeqId: prediction.globalSequencerId || ''
      });
      const coins = await suiClient.getCoins({ owner:userAddress, coinType: prediction.coinType });
      const coinObjectId = coins?.data?.[0]?.coinObjectId;
      if (!coinObjectId) {
        console.error('No coin object found for type:', prediction.coinType);
        return;
      }
      const payAmount = MarketClient.calcTotalFromCost(Number(amount) * Math.pow(10, 9), prediction.buyFee);
      console.log('payAmount', payAmount)
      const tx = await marketClient.buildBuyByAmountTx({
        marketId: prediction.marketId,
        outcome: buyOutcome,
        amount: payAmount,
        paymentCoinId: coinObjectId,
        minSharesOut: 0,
      });
      tx.setGasBudget(100000000);
      const res = await executeTransaction(tx, false);
      if (res?.effects.status.status === 'success') {
        setAmount('')
        toast.success(t('predictions.buySuccess'));
        onClose && onClose();
        setTimeout(() => refresh(), 2000);
      } else {
        toast.error(t('predictions.buyError'));
      }
    } catch (error) {
      toast.error(t('predictions.buyError'));
      console.error(error);
    } finally {
      store.dispatch(hideLoading());
    }
  },[userAddress, amount, buyOutcome, executeTransaction, prediction.coinType, prediction.packageId, prediction.marketId, prediction.buyFee, prediction.globalSequencerId]);

  const getMarketPosition = useCallback(async () => {
    const owner = userAddress;
    if (!owner) {
      console.error('No wallet connected');
      return;
    }

    try {
      const res = await apiService.getMarketPosition({userAddress: owner, address: owner || ''});

      if (res && res.data) {
        const list = res.data.rows.filter(item => {
          if(item.marketId === prediction.marketId) {
            // 不显示持仓数量为0的数据
            if(item.shares === 0) {
              return false;
            }
            // 不显示已领取收益的数据
            if (item.status === 'Redeemed') {
              return false;
            }
            // 不显示已完成且竞猜失败的数据
            if (item.status === 'Completed' && item.winnerId !== item.currentOutcome.outcomeId) {
              return false;
            }
            return true
          } else {
            return false
          }
        });
        list.sort((a, b) => a.currentOutcome.outcomeId > b.currentOutcome.outcomeId ? 1 : -1);
        if (list.length > 0) {
          setSellAvailable(toDisplayDenomAmount(list[0].shares, 0).toString())
        }
        setPositionList(list);
      } else {
        setPositionList([]);
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      setPositionList([]);
    }
  }, [userAddress]);

  useEffect(() => {
    getMarketPosition()
  }, [userAddress]);

  const toWin = useMemo(() => {
    const _yield = prediction.outcome?prediction.outcome[buyOutcome].roi:0;
    return amount ? Number(_yield) * Number(amount) : 0
  }, [buyOutcome, amount])

  const handleSale = async () => {
    const position = positionList[sellOutcome];
    store.dispatch(showLoading('Processing transaction...'));
    try {
      const marketClient = new MarketClient(suiClient, {
        packageId: position.packageId,
        coinType: position.coinType,
        globalSeqId: position.globalSequencerId || ''
      });
      // 查询钱包中该币种的 Coin 对象，选择一个对象 ID 作为支付币
      const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
      if (!owner) {
        console.error('No wallet connected');
        return;
      }
      const coins = await suiClient.getCoins({ owner, coinType: position.coinType });
      const coinObjectId = coins?.data?.[0]?.coinObjectId;
      console.log('coinObjectId', coinObjectId)
      if (!coinObjectId) {
        console.error('No coin object found for type:', position.coinType);
        return;
      }
      const tx = await marketClient.buildSellTx({
        marketId: position.marketId,
        outcome: position.currentOutcome.outcomeId,
        deltaShares: Number(sellAmount) * Math.pow(10, 9),
        minCoinOut: 0,
      });
      console.log(tx)
      await executeTransaction(tx, false);
      toast.success(t('predictions.saleSuccess'));
      onClose && onClose();
      setTimeout(() => refresh(), 2000);
    } catch (error) {
      toast.error(t('predictions.saleError'));
      console.log(error);
    } finally {
      store.dispatch(hideLoading());
    }
  };

  const cashOut = useMemo(() => {
    return sellAmount ? Number(positionList[sellOutcome].currentPrice) * Number(sellAmount) : 0
  }, [positionList, sellOutcome, sellAmount])

  return (
    <>
      {prediction.status === 'Resolved' || prediction.status === 'Completed' ? (
        <div className="mt-[16px] mx-[12px] p-[24px] bg-[#010A2C] rounded-[16px]">
          <ResultIcon className="mt-[24px] text-[60px] text-[#29C04E] mx-auto" />
          <div className="mt-[24px] h-[24px] leading-[24px] text-[24px] text-white/60 font-bold text-center">{t('predictions.result')}</div>
          <div className="mt-[24px] flex items-center justify-between bg-[#051A3D] rounded-[16px] overflow-hidden px-[12px] py-[22px]">
            <div>
              <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                <OutcomeProposed className={`text-[14px] ${prediction.status === 'Resolved' || prediction.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                <span className="inline-block ml-[8px] whitespace-nowrap">{t('detail.outcomeProposed')}</span>
              </div>
              <div className={`my-[-3px] ml-[7px] h-[30px] border-l ${prediction.status === 'Resolved' || prediction.status === 'Completed' ? 'border-[#29C041]' : 'border-white/60'}`}>
                {(prediction.status === 'Resolved' || prediction.status === 'Completed') && (
                  <span className="ml-[14px] leading-[16px] text-[16px] text-[#29C041]">{prediction.outcome[Number(prediction.winnerId)].name}</span>
                )}
              </div>
              <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                <DisputeWindow className={`text-[14px] ${prediction.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                <span className="inline-block ml-[8px]">{t('detail.disputeWindow')}</span>
              </div>
              <div className={`my-[-3px] ml-[7px] h-[30px] border-l ${prediction.status === 'Completed' ? 'border-[#29C041]' : 'border-white/60'}`}></div>
              <div className="flex items-center h-[24px] leading-[24px] text-white/60 text-[16px]">
                <FinalOutcome className={`text-[14px] ${prediction.status === 'Completed' ? 'text-[#29C041]' : 'text-white/60'}`} />
                <span className="inline-block ml-[8px]">{t('detail.finalOutcome')}</span>
              </div>
              {prediction.status === 'Completed' && (
                <div className="ml-[22px] leading-[16px] text-[16px] text-[#29C041]">{prediction.outcome[Number(prediction.winnerId)].name}</div>
              )}
            </div>
            {prediction.status === 'Resolved' && (
              <Image src="/images/released.png?v=1" alt="" width={120} height={120} />
            )}
            {prediction.status === 'Completed' && (
              <Image src="/images/ended.png?v=1" alt="" width={120} height={120} />
            )}
          </div>
        </div>
      ) : (
        <div className="mt-[16px] mx-[12px] p-[12px] bg-[#010A2C] rounded-[16px]">
          {/* Buy/Sell 选项卡 */}
          <div className="h-[40px] flex border-b border-white/20">
            <div
              onClick={() => setTradeType('buy')}
              className={`px-[12px] text-[16px] font-bold border-b-[2px] transition-all cursor-pointer ${
                tradeType === 'buy'
                  ? 'text-white border-white'
                  : 'text-white/60 hover:text-white border-transparent'
              }`}
            >
              {t('predictions.buy')}
            </div>
            <div
              onClick={() => setTradeType('sell')}
              className={`px-[12px] text-[16px] font-bold transition-all cursor-pointer ${
                tradeType === 'sell'
                  ? 'text-white border-b-[2px] border-white'
                  : 'text-white/60 hover:text-white border-transparent'
              }`}
            >
              {t('predictions.sell')}
            </div>
          </div>

          {tradeType === 'buy' && (
            <>
              {/* Outcomes 选择 */}
              <div className="mt-[24px]">
                <div className="flex items-center justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
                  <span>{t('predictions.outcomes')}</span>
                  <RefreshIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" onClick={getMarketPosition}/>
                </div>
                {startTime > Date.now() ? (
                  <Countdown
                    target={startTime}
                    onEnd={() => console.log("time over")}
                  />
                ) : prediction.outcome.length > 2 ? (
                  <div className="mb-[12px] w-full space-y-[12px] pr-[6px] overflow-hidden">
                    {prediction.outcome.map((outcome, index) => {
                      const color = colors[index];
                      const [r, g, b] = hexToRgbTriplet(color);
                      const style = {
                        ['--btn-rgb' as any]: `${r} ${g} ${b}`,
                        ['--btn-hex' as any]: color,
                      } as React.CSSProperties;

                      return (
                        <div key={index} className="h-[24px] flex gap-[24px]">
                          <EllipsisWithTooltip
                            text={outcome.name}
                            className="flex-1 h-[24px] leading-[24px] text-white text-[16px] font-bold"
                          />
                          <div className="h-[24px] leading-[24px] text-white/80 text-[16px]">{`${(100 * Number(outcome.prob)).toFixed(2)}%`}</div>
                          <button
                            key={index}
                            onClick={() => {
                              setBuyOutcome(index)
                              outcomeChange && outcomeChange(index)
                            }}
                            style={style}
                            className={`h-[24px] rounded-[4px] border-none text-[14px] font-bold px-2 transition-all ${
                              buyOutcome === index
                                ? 'bg-[rgb(var(--btn-rgb))] text-white'
                                : 'bg-[rgb(var(--btn-rgb)/0.5)] text-[color:var(--btn-hex)] hover:bg-[rgb(var(--btn-rgb))] hover:text-white'
                            }`}
                          >
                            {t('common.buy')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {
                      prediction.outcome?.map((item, index) => {
                        const color = colors[index];
                        const [r, g, b] = hexToRgbTriplet(color);
                        const style = {
                          ['--btn-rgb' as any]: `${r} ${g} ${b}`,
                          ['--btn-hex' as any]: color,
                        } as React.CSSProperties;

                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setBuyOutcome(index)
                              outcomeChange && outcomeChange(index)
                            }}
                            style={style}
                            className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all ${
                              buyOutcome === index
                                ? 'bg-[rgb(var(--btn-rgb))] text-white'
                                : 'bg-[rgb(var(--btn-rgb)/0.5)] text-[color:var(--btn-hex)] hover:bg-[rgb(var(--btn-rgb))] hover:text-white'
                            }`}
                          >
                            {item.name||''} {Number(item.prob||0).toFixed(2)}
                          </button>
                        )
                      })
                    }
                  </div>
                )}
              </div>

              {/* Amount 输入 */}
              <div className="mt-[24px]">
                <div className="flex items-center justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
                  <span>{t('predictions.amount')}</span>
                  {/*<Popover.Root>*/}
                  {/*  /!* 触发按钮：点击后打开/关闭 *!/*/}
                  {/*  <Popover.Trigger asChild>*/}
                  {/*    <SettingsIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />*/}
                  {/*  </Popover.Trigger>*/}

                  {/*  /!* 气泡内容 *!/*/}
                  {/*  <Popover.Portal>*/}
                  {/*    <Popover.Content*/}
                  {/*      side="bottom"*/}
                  {/*      align="end"*/}
                  {/*      sideOffset={6}*/}
                  {/*      className="z-50 w-[192px] bg-[#010A2C] border border-white/20 rounded-[8px] px-[24px] py-[16px] outline-none leading-relaxed"*/}
                  {/*    >*/}
                  {/*      <div className="h-[24px] flex items-center gap-2">*/}
                  {/*        <span className="leading-[24px] text-[12px] text-white/60">Trade deadline</span>*/}
                  {/*        <WarningIcon className="text-[#999DAB] text-[10px]" />*/}
                  {/*      </div>*/}
                  {/*      <div className="h-[32px] border border-white/20 rounded-[24px] px-[14px] flex items-center">*/}
                  {/*        <Input*/}
                  {/*          type="tel"*/}
                  {/*          value={tradeDeadlineTime}*/}
                  {/*          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTradeDeadlineTime(e.target.value)}*/}
                  {/*          placeholder="0"*/}
                  {/*          className="flex-1 h-[24px] leading-[24px] p-0 text-white text-[12px] placeholder:text-white/60 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"*/}
                  {/*        />*/}
                  {/*        <span className="inline-block leading-[24px] text-[12px] text-white/60">minutes</span>*/}
                  {/*      </div>*/}
                  {/*    </Popover.Content>*/}
                  {/*  </Popover.Portal>*/}
                  {/*</Popover.Root>*/}
                </div>
                <div className="space-y-3">
                  {/* 金额输入框 */}
                  <div className="relative">
                    <Input
                      type="tel"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountInputChange(e.target.value)}
                      placeholder="0"
                      className="h-[56px] bg-transparent border-white/20 text-white text-[32px] font-bold placeholder:text-white/60 pl-[12px] pr-[178px] focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
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
                        {t('common.max')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance 余额 */}
              <div className="mt-[8px] flex items-center justify-between">
                <div className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold flex items-center gap-[8px]">
                  <span className="inline-block whitespace-nowrap">{t('predictions.balance')}</span>
                  <Image src={tokenIcon} alt="" width={16} height={16} />
                  <span className="inline-block">{abbreviateNumber(usdhBalance, {style: language === 'zh' ? 'cn' : 'western', decimals: 2})}</span>
                </div>
                <div className="w-[140px]">
                  <ProgressBar
                    value={progress}
                    step={0}
                    onChange={(value) => {
                      const amount = Math.round(value * Number(usdhBalance)) / 100;
                      setProgress(value);
                      setAmount(amount);
                    }}
                  />
                </div>
              </div>

              {amount && (
                <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
                  <span className="inline-block text-white/60">{t('predictions.toWin')}</span>
                  <Image src={tokenIcon} alt="" width={16} height={16} />
                  <span className="inline-block text-[#043FCA]">{formatNumberWithSeparator(Number(toWin).toFixed(2))}</span>
                </div>
              )}

              {new Date(prediction.endTime).getTime() < Date.now() ? (
                <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
                  <span className="inline-block text-white/60">{t('predictions.waitingResolution')}</span>
                </div>
              ) : null}
              {/* Sign In 按钮 */}
              {zkLoginData || currentAccount ? (
                <Button
                  onClick={handleTrade}
                  disabled={!amount || new Date(prediction.endTime).getTime() < Date.now()}
                  className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{`${t('predictions.buy')} ${prediction.outcome?prediction.outcome[buyOutcome].name:''}`}</span>
                </Button>
              ) : (
                <Button
                  onClick={() => dispatch(setSigninOpen(true))}
                  className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </Button>
              )}
            </>
          )}

          {tradeType === 'sell' && (
            <>
              {/* Outcomes 选择 */}
              <div className="mt-[24px]">
                <div className="flex items-center justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
                  <span>{t('predictions.position')}</span>
                  <RefreshIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" onClick={getMarketPosition}/>
                </div>
                <div className="bg-[#051A3D] h-[56px] border border-white/20 rounded-[8px] relative">
                  {positionList.length > 0 ? (
                    <div className="flex items-center p-[8px] cursor-pointer" onClick={() => setShowCheckPosition(!showCheckPosition)}>
                      <div className="w-[36px] h-[36px] rounded-full" style={{backgroundColor: colors[positionList[sellOutcome]?.currentOutcome.outcomeId || 0]}}></div>
                      <div className="flex-1 mx-[12px] overflow-hidden">
                        <EllipsisWithTooltip
                          text={positionList[sellOutcome]?.currentOutcome.name}
                          className="h-[14px] leading-[14px] text-[14px] text-white"
                        />
                        <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white"><TooltipAmount shares={positionList[sellOutcome]?.shares} decimals={0} precision={2}/>  {t('predictions.shares')}</div>
                      </div>
                      <ArrowDownIcon className={`text-white text-[16px] mr-[4px] transition-transform duration-300 ease-out ${showCheckPosition ? 'rotate-180' : ''}`} />
                      {showCheckPosition && (
                        <div className="w-full absolute left-0 top-[64px] z-20 border border-white/20 rounded-[8px] bg-[#010A2C] p-[12px] space-y-[8px]">
                          {positionList.map((item, i) => (
                            <div
                              key={item.marketId}
                              className={`h-[56px] rounded-[8px] flex items-center p-[8px] cursor-pointer ${i === sellOutcome ? 'bg-[rgba(5,26,61,0.8)]' : ''} hover:bg-[rgba(5,26,61,0.8)]`}
                              onClick={() => {
                                setSellOutcome(i)
                                setShowCheckPosition(false)
                                setSellAvailable(toDisplayDenomAmount(item.shares, 0).toString())
                                setSellAmount('');
                                setSellProgress(0);
                              }}
                            >
                              <div className="w-[36px] h-[36px] rounded-full" style={{backgroundColor: colors[item.currentOutcome.outcomeId]}}></div>
                              <div className="flex-1 mx-[12px] overflow-hidden">
                                <EllipsisWithTooltip
                                  text={item.currentOutcome.name}
                                  className="h-[14px] leading-[14px] text-[14px] text-white"
                                />
                                <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white"><TooltipAmount shares={item.shares} decimals={0} precision={2}/>  {t('predictions.shares')}</div>
                              </div>
                              {i === sellOutcome && <CheckedIcon className="text-[#00AE66] text-[24px] mr-[4px]" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full leading-[56px] text-[16px] text-white/20 text-center">{t('predictions.noAvailablePositions')}</div>
                  )}
                </div>
              </div>

              {/* Amount 输入 */}
              <div className="mt-[24px]">
                <div className="flex items-center justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
                  <span>{t('predictions.shares')}</span>
                  {/*<SettingsIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />*/}
                </div>
                <div className="space-y-3">
                  {/* 金额输入框 */}
                  <div className="relative">
                    <Input
                      type="tel"
                      value={sellAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSellAmountInputChange(e.target.value)}
                      placeholder="0"
                      className="h-[56px] bg-transparent border-white/20 text-white text-[32px] font-bold placeholder:text-white/60 pl-[12px] pr-20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                      min={0}
                      step={0.01}
                    />
                    <div className="h-[24px] absolute right-[8px] top-[12px] flex gap-[8px]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSellAmount(1)}
                        className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
                      >
                        +1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSellAmount(10)}
                        className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
                      >
                        +10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setMaxSellAmount}
                        className="px-[8px] bg-[#051A3D] border-none rounded-[8px] text-white/60 text-[16px] font-bold hover:bg-[#E0E2E4] hover:text-black"
                      >
                        {t('common.max')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 持仓数量 */}
              <div className="mt-[8px] flex items-center justify-between">
                <div className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold flex items-center gap-[8px]">
                  <span className="inline-block">{t('predictions.available')}</span>
                  <span className="inline-block">{fix(sellAvailable.toString(), 2)}</span>
                </div>
                <div className="w-[140px]">
                  <ProgressBar
                    value={sellProgress}
                    step={0}
                    onChange={(value) => {
                      const available = Math.round(value * Number(sellAvailable)) / 100;
                      setSellProgress(value);
                      setSellAmount(available);
                    }}
                  />
                </div>
              </div>

              {!!sellAmount && (
                <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
                  <span className="inline-block text-white/60">{t('predictions.cashOut')}</span>
                  <Image src={tokenIcon} alt="" width={16} height={16} />
                  <span className="inline-block text-[#043FCA]">{Number(cashOut).toFixed(2)}</span>
                </div>
              )}
              {new Date(prediction.endTime).getTime() < Date.now() ? (
                <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
                  <span className="inline-block text-white/60">{t('predictions.waitingResolution')}</span>
                </div>
              ) : null
              }

              {/* Sign In 按钮 */}
              {zkLoginData || currentAccount ? (
                <Button
                  onClick={handleSale}
                  disabled={!sellAmount || new Date(prediction.endTime).getTime() < Date.now()}
                  className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{`${t('predictions.sell')} ${positionList[sellOutcome]?.currentOutcome.name}`}</span>
                </Button>
              ) : (
                <Button
                  onClick={() => dispatch(setSigninOpen(true))}
                  className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
