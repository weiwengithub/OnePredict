"use client";

import React, {useEffect, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {store} from "@/store";
import SettingsIcon from "@/assets/icons/setting.svg";
import {ProgressBar} from "@/components/ProgressBar";
import {MarketClient} from "@/lib/market";
import {useExecuteTransaction} from "@/hooks/useExecuteTransaction";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(0);
  const [address, setAddress] = useState("");
  const [progress, setProgress] = useState(25);
  const suiClient = useSuiClient() as any;
  const executeTransaction = useExecuteTransaction();

  const packageId = "";
  const coinType = "";
  const marketId = "";
  const buyOutcome = "";
  const sellOutcome = "";
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
    const numValue = parseFloat(value) || 0;
    setAmount(Math.max(0, numValue));
  };

  const addAmount = (value: number) => {
    setAmount(Math.max(0, amount + value));
  };

  const setMaxAmount = () => {
    setAmount(Number(usdhBalance));
  };

  const handleSale = async () => {
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
    const tx = await marketClient.buildBuyTx({
      marketId: marketId,
      outcome: 1,
      deltaShares: amount*Math.pow(10, 9),
      paymentCoinId: coinObjectId,
    });
    console.log(tx)
    await executeTransaction(tx, false);
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[450px] p-0 bg-transparent border-none">
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[20px] overflow-hidden">
          <div className="mt-[20px] flex items-center">
            <div className="flex-1 h-[24px] leading-[24px] text-[22px] text-white font-bold">Sell Yes</div>
            <CloseIcon
              className="text-[28px] text-[#D2D1D1] hover:text-white cursor-pointer"
              onClick={() => {onOpenChange(false)}}
            />
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

          <Button
            className="mt-[48px] w-full h-[68px] rounded-[20px] bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
            disabled={!amount || !address}
            onClick={handleSale}
          >
            {amount > 0
              ? `Sell ${sellOutcome}`
              : 'Sign In'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
