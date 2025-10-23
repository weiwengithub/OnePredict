"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from '@/components/ProgressBar';
import {MarketOption, MarketPositionOption} from "@/lib/api/interface";
import Image from "next/image";
import BigNumber from "bignumber.js";
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
import {abbreviateNumber, fix, toDisplayDenomAmount} from "@/lib/numbers";
import Countdown from "@/components/Countdown";
import { colors } from "@/assets/config";

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

  const startTime = new Date(prediction.startTime).getTime();

  useEffect(() => {
    setBuyOutcome(initialOutcome)
  }, [initialOutcome]);

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
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

  const handleTrade = async () => {
    store.dispatch(showLoading('Processing transaction...'));
    try {
      const marketClient = new MarketClient(suiClient, {
        packageId: prediction.packageId,
        coinType: prediction.coinType,
        globalSeqId: prediction.globalSequencerId || ''
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
      const payAmount = MarketClient.calcTotalFromCost(Number(amount) * Math.pow(10, 9), prediction.buyFee);
      const tx = await marketClient.buildBuyByAmountTx({
        marketId: prediction.marketId,
        outcome: buyOutcome,
        amount: payAmount,
        paymentCoinId: coinObjectId,
        minSharesOut: 0,
      });
      tx.setGasBudget(100000000);
      console.log(tx)
      await executeTransaction(tx, false);
      setAmount('')
      toast.success(t('predictions.buySuccess'));
      onClose && onClose();
      setTimeout(() => refresh(), 2000);
    } catch (error) {
      toast.error(t('predictions.buyError'));
      console.error(error);
    } finally {
      store.dispatch(hideLoading());
    }
  };

  const [ownerAddress, setOwnerAddress] = useState("");
  useEffect(() => {
    setOwnerAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  const [positionList, setPositionList] = useState<MarketPositionOption[]>([]);
  const [showCheckPosition, setShowCheckPosition] = useState(false);
  const getMarketPosition = useCallback(async () => {
    const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
    if (!owner) {
      console.error('No wallet connected');
      return;
    }

    try {
      const res = await apiService.getMarketPosition(owner);

      // 假设API返回的数据格式，你需要根据实际API响应调整
      if (res && res.data) {
        const list = res.data.items.filter(item => item.marketId === prediction.marketId);
        list.sort((a, b) => a.outcome > b.outcome ? 1 : -1);
        if (list.length > 0) {
          setSellOutcome(list[0].outcome)
          setSellAvailable(toDisplayDenomAmount(list[0].shares, 9).toString())
        }
        setPositionList(list);
      } else {
        setPositionList([]);
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      setPositionList([]);
    }
  }, [currentAccount?.address, zkLoginData]);

  useEffect(() => {
    getMarketPosition()
  }, []);

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
      if (!coinObjectId) {
        console.error('No coin object found for type:', position.coinType);
        return;
      }
      const tx = await marketClient.buildSellTx({
        marketId: position.marketId,
        outcome: position.outcome,
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
    return sellAmount ? Number(positionList[sellOutcome].marketPrice) * Number(sellAmount) : 0
  }, [positionList, sellOutcome, sellAmount])

  return (
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
              <RefreshIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />
            </div>
            {startTime > Date.now() ? (
              <Countdown
                target={startTime}
                onEnd={() => console.log("time over")}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                
                {
                  prediction.outcome?.map((item, index) => {
                    return (
                      <button
                        key={index}
                  onClick={() => {
                    setBuyOutcome(index)
                    outcomeChange && outcomeChange(1)
                  }}
                  style={{background: colors[index]}}
                  className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all predict-btn text-white ${
                    buyOutcome === index
                      ? 'active'
                      : ''
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
              {/*<div className="relative">*/}
              {/*  <SettingsIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />*/}
              {/*  <div className="absolute top-[16px] right-0 w-[192px] bg-[#010A2C] border border-white/20 rounded-[8px] px-[24px] py-[16px] z-20">*/}
              {/*    <div className="h-[24px] flex items-center gap-2">*/}
              {/*      <span className="leading-[24px] text-[12px] text-white/60">Trade deadline</span>*/}
              {/*      <WarningIcon className="text-[#999DAB] text-[10px]" />*/}
              {/*    </div>*/}
              {/*    <div className="h-[32px] border border-white/20 rounded-[24px] px-[14px] flex items-center">*/}
              {/*      <Input*/}
              {/*        type="tel"*/}
              {/*        value={tradeDeadlineTime}*/}
              {/*        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTradeDeadlineTime(e.target.value)}*/}
              {/*        placeholder="0"*/}
              {/*        className="flex-1 h-[24px] leading-[24px] p-0 text-white text-[12px] placeholder:text-white/60 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"*/}
              {/*      />*/}
              {/*      <span className="inline-block leading-[24px] text-[12px] text-white/60">minutes</span>*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
            <div className="space-y-3">
              {/* 金额输入框 */}
              <div className="relative">
                <Input
                  type="tel"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountInputChange(e.target.value)}
                  placeholder="0"
                  className="h-[56px] bg-transparent border-white/20 text-white text-[32px] font-bold placeholder:text-white/60 pl-[12px] pr-20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
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
              <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
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
              <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
              <span className="inline-block text-[#043FCA]">{Number(toWin).toFixed(2)}</span>
            </div>
          )}

          {/* Sign In 按钮 */}
          {zkLoginData || currentAccount ? (
            <Button
              onClick={handleTrade}
              disabled={!amount}
              className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {`${t('predictions.buy')} ${prediction.outcome?prediction.outcome[buyOutcome].name:''}`}
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
              <RefreshIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />
            </div>
            <div className="bg-[#051A3D] h-[56px] border border-white/20 rounded-[8px] relative">
              {positionList.length > 0 ? (
                <div className="flex items-center p-[8px] cursor-pointer" onClick={() => setShowCheckPosition(!showCheckPosition)}>
                  {sellOutcome ? (
                    <Image src="/images/icon/icon-no.png" alt="" width={40} height={40} />
                  ) : (
                    <Image src="/images/icon/icon-yes.png" alt="" width={40} height={40} />
                  )}
                  <div className="flex-1 ml-[12px]">
                    <div className="h-[14px] leading-[14px] text-[14px] text-white">{positionList[sellOutcome].outcomeName}</div>
                    <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white"><TooltipAmount shares={positionList[sellOutcome].shares} decimals={9} precision={2}/>  {t('predictions.shares')}</div>
                  </div>
                  <ArrowDownIcon className={`text-white text-[16px] mr-[4px] transition-transform duration-300 ease-out ${showCheckPosition ? 'rotate-180' : ''}`} />
                  {showCheckPosition && (
                    <div className="w-full absolute left-0 top-[64px] z-20 border border-white/20 rounded-[8px] bg-[#010A2C] p-[12px] space-y-[8px]">
                      {positionList.map((item, i) => (
                        <div
                          key={item.marketId}
                          className={`h-[56px] rounded-[8px] flex items-center p-[8px] cursor-pointer ${item.outcome === sellOutcome ? 'bg-[rgba(5,26,61,0.8)]' : ''} hover:bg-[rgba(5,26,61,0.8)]`}
                          onClick={() => {
                            setSellOutcome(item.outcome)
                            setShowCheckPosition(false)
                            setSellAvailable(toDisplayDenomAmount(item.shares, 9).toString())
                            setSellAmount('');
                            setSellProgress(0);
                          }}
                        >
                          {item.outcome ? (
                            <Image src="/images/icon/icon-no.png" alt="" width={40} height={40} />
                          ) : (
                            <Image src="/images/icon/icon-yes.png" alt="" width={40} height={40} />
                          )}
                          <div className="flex-1 ml-[12px]">
                            <div className="h-[14px] leading-[14px] text-[14px] text-white">{item.outcomeName}</div>
                            <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white"><TooltipAmount shares={item.shares} decimals={9} precision={2}/>  {t('predictions.shares')}</div>
                          </div>
                          {item.outcome === sellOutcome && <CheckedIcon className="text-[#00AE66] text-[24px] mr-[4px]" />}
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
              <SettingsIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />
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
              <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
              <span className="inline-block text-[#043FCA]">{Number(cashOut).toFixed(2)}</span>
            </div>
          )}

          {/* Sign In 按钮 */}
          {zkLoginData || currentAccount ? (
            <Button
              onClick={handleSale}
              disabled={!sellAmount}
              className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {`${t('predictions.sell')} ${prediction.outcome[sellOutcome].name}`}
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
  );
}
