"use client";

import React, {useEffect, useMemo, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalanceFromStore } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {store, showLoading, hideLoading, setSigninOpen} from '@/store';
import SettingsIcon from "@/assets/icons/setting.svg";
import {ProgressBar} from "@/components/ProgressBar";
import {MarketClient} from "@/lib/market";
import {useExecuteTransaction} from "@/hooks/useExecuteTransaction";
import { MarketPositionOption } from "@/lib/api/interface";
import {fix, toDisplayDenomAmount} from "@/lib/numbers";
import {useDispatch} from "react-redux";
import {toast} from "sonner";
import {useIsMobile} from "@/contexts/viewport";
import {tokenIcon} from "@/assets/config";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";

interface WelcomeModalProps {
  open: boolean;
  position: MarketPositionOption | null;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, position, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState<number | string>('');
  const [progress, setProgress] = useState(0);
  const suiClient = useSuiClient() as any;
  const executeTransaction = useExecuteTransaction();
  const available = position ? toDisplayDenomAmount(position.shares, 0).toString() : '';
  const dispatch = useDispatch();

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
  const { refresh } = useUsdhBalanceFromStore();
  // 禁止背景滚动
  useEffect(() => {
    if (open) {
      // 保存当前的overflow值
      const originalOverflow = document.body.style.overflow;
      // 禁止滚动
      document.body.style.overflow = 'hidden';

      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const handleAmountInputChange = (value: string) => {
    const max = Number(available);
    const newAmount = value ? Math.min(parseFloat(value), max) : '';
    setAmount(newAmount);
    const progress = newAmount ? 100 * Number(newAmount) / max : 0;
    setProgress(progress);
  };

  const addAmount = (value: number) => {
    const max = Number(available);
    const newAmount = Math.min(amount ? Number(amount) + value : value, max);
    setAmount(newAmount);
    const progress = 100 * Number(newAmount) / max
    setProgress(progress);
  };

  const setMaxAmount = () => {
    setAmount(available);
    setProgress(100);
  };

  const handleSale = async () => {
    if(!position) return;
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
        outcome: position.currentOutcome.outcomeId,
        deltaShares: Number(amount) * Math.pow(10, 9),
        minCoinOut: 0,
      });
      console.log(tx)
      await executeTransaction(tx, false);
      toast.success(t('predictions.saleSuccess'));
      onOpenChange(false);
      setTimeout(() => refresh(), 2000);
    } catch (error) {
      toast.error(t('predictions.saleError'));
      console.log(error);
    } finally {
      store.dispatch(hideLoading());
    }
  };

  const [ownerAddress, setOwnerAddress] = useState("");
  useEffect(() => {
    setOwnerAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  const cashOut = useMemo(() => {
    return amount ? Number(position?.currentPrice) * Number(amount) : 0
  }, [position, amount])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[120]">
      <DialogContent className={`p-0 bg-transparent border-none ${isMobile ? "w-full left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none" : "w-[450px]"}`}>
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[20px] overflow-hidden">
          <div className="mt-[20px] flex items-center gap-[20px]">
            <EllipsisWithTooltip
              text={`${t('predictions.sell')} ${position?.currentOutcome.name}`}
              className="flex-1 h-[24px] leading-[24px] text-[22px] text-white font-bold"
            />
            <CloseIcon
              className="text-[28px] text-[#D2D1D1] hover:text-white cursor-pointer"
              onClick={() => {
                onOpenChange(false)
                setAmount('');
              }}
            />
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
              <span className="inline-block">{t('predictions.available')}</span>
              <span className="inline-block">{fix(available, 2)}</span>
            </div>
            <div className="w-[140px]">
              <ProgressBar
                value={progress}
                step={0}
                onChange={(value) => {
                  const amount = Math.round(value * Number(available)) / 100;
                  setProgress(value);
                  setAmount(amount);
                }}
              />
            </div>
          </div>

          {!!amount && (
            <div className="mt-[24px] h-[24px] leading-[24px] text-[16px] font-bold flex items-center justify-center gap-[8px]">
              <span className="inline-block text-white/60">{t('predictions.cashOut')}</span>
              <Image src={tokenIcon} alt="" width={16} height={16} />
              <span className="inline-block text-[#043FCA]">{Number(cashOut).toFixed(2)}</span>
            </div>
          )}

          {zkLoginData || currentAccount ? (
            <Button
              className="mt-[48px] w-full h-[68px] rounded-[20px] bg-[rgba(40,192,78,0.5)] hover:bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
              disabled={!amount}
              onClick={handleSale}
            >
              <span className="truncate">{`${t('predictions.sell')} ${position?.currentOutcome.name}`}</span>
            </Button>
          ) : (
            <Button
              onClick={() => dispatch(setSigninOpen(true))}
              className="mt-[48px] w-full h-[68px] rounded-[20px] bg-[rgba(40,192,78,0.5)] hover:bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
            >
              Sign In
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
