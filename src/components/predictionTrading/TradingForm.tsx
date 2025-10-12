"use client";

import React, {useEffect, useMemo, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from '@/components/ProgressBar';
import { MarketOption } from "@/lib/api/interface";
import Image from "next/image";
import BigNumber from "bignumber.js";
import RefreshIcon from "@/assets/icons/refresh.svg";
import SettingsIcon from "@/assets/icons/setting.svg";
import ArrowDownIcon from "@/assets/icons/arrowDown.svg";
import CheckedIcon from "@/assets/icons/circle-checked.svg";
import WarningIcon from "@/assets/icons/warning_2.svg";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import { useExecuteTransaction } from '@/hooks/useExecuteTransaction';
import { ZkLoginData } from "@/lib/interface";
import {hideLoading, setSigninOpen, showLoading, store} from "@/store";
import {MarketClient} from "@/lib/market";
import { useDispatch } from 'react-redux';
import {useLanguage} from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface TradingFormProps {
  initialOutcome: 'yes' | 'no';
  marketId: string;
  packageId: string;
  coinType: string;
  pProbsJson: string[];
  outcomeYields: {
    YES: string;
    NO: string;
  }
  onClose?: () => void;
}

export default function TradingForm({
  initialOutcome,
  marketId,
  packageId,
  coinType,
  pProbsJson,
  outcomeYields,
  onClose
}: TradingFormProps) {
  const { t } = useLanguage();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [buyOutcome, setBuyOutcome] = useState<'yes' | 'no'>(initialOutcome);
  const [sellOutcome, setSellOutcome] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number | string>('');
  const yesPrice = new BigNumber(pProbsJson[0]).shiftedBy(-12);
  const noPrice = new BigNumber(pProbsJson[1]).shiftedBy(-12);
  const [progress, setProgress] = useState(0);
  const suiClient = useSuiClient() as any;
  const executeTransaction = useExecuteTransaction();
  const dispatch = useDispatch();
  const [tradeDeadlineTime, setTradeDeadlineTime] = useState('');
  const [showTradeDeadline, setShowTradeDeadline] = useState<boolean>(false);

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

  const handleTrade = async () => {
    store.dispatch(showLoading('Processing transaction...'));
    try {
      const marketClient = new MarketClient(suiClient, {
        packageId: packageId,
        coinType: coinType
      });
      // 查询钱包中该币种的 Coin 对象，选择一个对象 ID 作为支付币
      const owner = currentAccount?.address || (zkLoginData as any)?.zkloginUserAddress;
      if (!owner) {
        console.error('No wallet connected');
        return;
      }
      const coins = await suiClient.getCoins({ owner, coinType: coinType });
      const coinObjectId = coins?.data?.[0]?.coinObjectId;
      if (!coinObjectId) {
        console.error('No coin object found for type:', coinType);
        return;
      }
      const tx = await marketClient.buildBuyByAmountTx({
        marketId: marketId,
        outcome: buyOutcome === 'yes' ? 0 : 1,
        amount: Number(amount) * Math.pow(10, 9),
        paymentCoinId: coinObjectId,
        minSharesOut: 0,
      });
      console.log(tx)
      await executeTransaction(tx, false);
      toast.success(t('predictions.buySuccess'));
      onClose && onClose();
    } catch (error) {
      toast.error(t('predictions.buyError'));
      console.error(error);
    } finally {
      store.dispatch(hideLoading());
    }
  };

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
  const { balance: usdhBalance } = useUsdhBalance({
    pollMs: 0, // 可选：例如 5000 开启 5s 轮询
  });

  const [ownerAddress, setOwnerAddress] = useState("");
  useEffect(() => {
    setOwnerAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  const [positionList, setPositionList] = useState<Array<{type: 'yes' | 'no'; id: number;}>>([{type: 'yes', id: 1}, {type: 'no', id: 2}]);
  const [showCheckPosition, setShowCheckPosition] = useState(false);

  const toWin = useMemo(() => {
    const _yield = buyOutcome === 'yes' ? outcomeYields.YES : outcomeYields.NO;
    return amount ? Number(_yield) * Number(amount) : 0
  }, [buyOutcome, amount])

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
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBuyOutcome('yes')}
                className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all ${
                  buyOutcome === 'yes'
                    ? 'bg-[#29C04E] hover:bg-[#29C04E] text-white'
                    : 'bg-[#34503B] hover:bg-[#29C04E] text-[#089C2B] hover:text-white'
                }`}
              >
                YES {yesPrice.toFixed(2)}
              </button>

              <button
                onClick={() => setBuyOutcome('no')}
                className={`h-[48px] rounded-[8px] border-none text-[16px] font-bold transition-all ${
                  buyOutcome === 'no'
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
                    MAX
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Balance 余额 */}
          <div className="mt-[8px] flex items-center justify-between">
            <div className="h-[24px] leading-[24px] text-[16px] text-white/60 font-bold flex items-center gap-[8px]">
              <span className="inline-block">{t('predictions.balance')}</span>
              <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
              <span className="inline-block">{usdhBalance}</span>
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
              <span className="inline-block text-white/60">To win</span>
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
              {`Buy ${buyOutcome.toUpperCase()}`}
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
              <span>Position</span>
              <RefreshIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />
            </div>
            <div className="bg-[#051A3D] h-[56px] border border-white/20 rounded-[8px] relative">
              {positionList.length > 0 ? (
                <div className="flex items-center p-[8px] cursor-pointer" onClick={() => setShowCheckPosition(!showCheckPosition)}>
                  {sellOutcome === 'yes' && (
                    <>
                      <Image src="/images/icon/icon-yes.png" alt="" width={40} height={40} />
                      <div className="flex-1 ml-[12px]">
                        <div className="h-[14px] leading-[14px] text-[14px] text-white">Yes</div>
                        <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white">37.12%  Shares</div>
                      </div>
                    </>
                  )}
                  {sellOutcome === 'no' && (
                    <>
                      <Image src="/images/icon/icon-no.png" alt="" width={40} height={40} />
                      <div className="flex-1 ml-[12px]">
                        <div className="h-[14px] leading-[14px] text-[14px] text-white">No</div>
                        <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white">37.12%  Shares</div>
                      </div>
                    </>
                  )}
                  <ArrowDownIcon className={`text-white text-[16px] mr-[4px] transition-transform duration-300 ease-out ${showCheckPosition ? 'rotate-180' : ''}`} />
                  {showCheckPosition && (
                    <div className="w-full absolute left-0 top-[64px] z-20 border border-white/20 rounded-[8px] bg-[#010A2C] p-[12px] space-y-[8px]">
                      {positionList.map((item, i) => (
                        <div
                          key={item.id}
                          className="h-[56px] bg-[rgba(5,26,61,0.8)] rounded-[8px] flex items-center p-[8px] cursor-pointer"
                          onClick={() => {
                            setSellOutcome(item.type)
                            setShowCheckPosition(false)
                          }}
                        >
                          {item.type === 'yes' && <Image src="/images/icon/icon-yes.png" alt="" width={40} height={40} />}
                          {item.type === 'no' && <Image src="/images/icon/icon-no.png" alt="" width={40} height={40} />}
                          <div className="flex-1 ml-[12px]">
                            <div className="h-[14px] leading-[14px] text-[14px] text-white">Yes</div>
                            <div className="mt-[8px] h-[12px] leading-[12px] text-[12px] text-white">37.12%  Shares</div>
                          </div>
                          {item.type === sellOutcome && <CheckedIcon className="text-[#00AE66] text-[24px] mr-[4px]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full leading-[56px] text-[16px] text-white/20 text-center">No available positions.</div>
              )}
            </div>
          </div>

          {/* Amount 输入 */}
          <div className="mt-[24px]">
            <div className="flex items-center justify-between h-[24px] leading-[24px] text-[16px] font-bold text-white/60 mb-[12px]">
              <span>Shares</span>
              <SettingsIcon className="w-4 h-4 cursor-pointer transition-transform duration-300 ease-out hover:text-white hover:rotate-90" />
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
              <span className="inline-block">Available</span>
              <span className="inline-block">{usdhBalance}</span>
            </div>
            <div className="w-[140px]">
              <ProgressBar
                initialValue={progress}
                onChange={setProgress}
              />
            </div>
          </div>

          <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
            <span className="inline-block text-white/60">Cash Out</span>
            <Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />
            <span className="inline-block text-[#043FCA]">{usdhBalance}</span>
          </div>

          {/* Sign In 按钮 */}
          <Button
            onClick={handleTrade}
            disabled={!amount}
            className="mt-[24px] mb-[12px] w-full h-[56px] bg-[#E0E2E4] hover:bg-blue-700 text-[#010101] font-bold text-[24px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {amount
              ? `Sell ${sellOutcome.toUpperCase()}`
              : 'Sign In'
            }
          </Button>
        </>
      )}
    </div>
  );
}
