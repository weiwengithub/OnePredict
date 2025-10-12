"use client";

import React, {useEffect, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close_1.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import { useExecuteTransaction } from '@/hooks/useExecuteTransaction';
import { ZkLoginData } from "@/lib/interface";
import { Transaction } from '@onelabs/sui/transactions'
import {store, showLoading, hideLoading} from '@/store';
import { ZkloginClient } from '@/txsdk/zklogin';
import { toast } from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import WarningIcon from "@/assets/icons/warning_1.svg";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const suiClient = useSuiClient();
  const executeTransaction = useExecuteTransaction()

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

  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;
  const { balance: usdhBalance } = useUsdhBalance({
    pollMs: 0, // 可选：例如 5000 开启 5s 轮询
  });

  const [ownerAddress, setOwnerAddress] = useState("");
  useEffect(() => {
    setOwnerAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  const token = 'USDH';
  const tokenAddress = process.env.NEXT_PUBLIC_USDH_TYPE || ''
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const withdraw = async () => {
    if (amount) {
      const amountInt = Number(amount) * Math.pow(10, 9)
      if (!Number.isInteger(amountInt)) {
        toast.error(t('send.msg.amountInvalid'))
        return
      }
    }
    store.dispatch(showLoading('withdraw...'));
    try {
      // @ts-expect-error -- zkLoginData类型报错
      if (!currentAccount?.address && !store.getState().zkLoginData?.zkloginUserAddress) throw new Error('User address is required')
      if (!tokenAddress) throw new Error('Token type is required')
      if (!toAddress) throw new Error('Recipient is required')
      if (!amount || Number(amount) <= 0) throw new Error('Amount should be greater than 0')

      const toAtomic = (val: string, decimals: number): bigint => {
        const [i, f = ''] = String(val).split('.')
        const frac = (f + '0'.repeat(decimals)).slice(0, decimals)
        return BigInt(i + frac)
      }

      const decimals = 9
      const amountAtomic = toAtomic(amount, decimals)

      const tx = new Transaction()
      console.log('tokenaddress', tokenAddress)

      if (tokenAddress.toLowerCase() === '0x2::oct::oct') {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountAtomic)])
        tx.transferObjects([coin], toAddress)
      } else {
        // @ts-expect-error -- zkLoginData类型报错
        const coins = await suiClient.getCoins({ owner: currentAccount?.address || store.getState().zkLoginData?.zkloginUserAddress, coinType: tokenAddress })
        const coinIds = coins.data.map((c: any) => c.coinObjectId)
        if (!coinIds.length) throw new Error('Insufficient balance')
        const primary = tx.object(coinIds[0])
        if (coinIds.length > 1) {
          tx.mergeCoins(primary, coinIds.slice(1).map((id: string) => tx.object(id)))
        }
        const [split] = tx.splitCoins(primary, [tx.pure.u64(amountAtomic)])
        tx.transferObjects([split], toAddress)
      }
      const result = await executeTransaction(tx, tokenAddress.toLowerCase() === '0x2::oct::oct')
      console.log('transfer executed:', result)
      toast.success(t('send.sendSuccess'))
      setAmount('')
      // setTimeout(() => { if (tokenAddress) getBalances(tokenAddress) }, 2000)
    } catch (error) {
      toast.error(t('send.sendError'));
    } finally {
      store.dispatch(hideLoading());
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[450px] p-0 bg-transparent border-none">
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[24px] overflow-hidden">
          <div className="h-[20px] leading-[20px] text-[20px] text-white font-bold text-center relative">
            {t('send.send')}
            <div className="size-[24px] cursor-pointer absolute top-0 right-0">
              <CloseIcon
                className="text-[14px] text-[#D2D1D1] hover:text-white"
                onClick={() => {
                  onOpenChange(false);
                }}
              />
            </div>
          </div>
          <div className="mt-[28px] h-[16px] leading-[16px] text-[16px] text-white/60">{t('send.send')}</div>
          <div className="mt-[8px]">
            <Select value={token} onValueChange={(v) => console.log(v)}>
              <SelectTrigger className="h-[48px] w-full bg-white/10 border-none rounded-[8px] text-white text-[14px] px-[12px]">
                <SelectValue placeholder={t('categories.pickOne')}>
                  <div className="flex items-center gap-1">
                    <Image src="/images/icon/icon-token.png" alt="" width={20} height={20} />
                    {token}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="mt-[12px] w-full bg-[#04122B] border-none p-[12px] space-y-[4px]">
                <SelectItem value="eth" className="h-[32px] text-white hover:bg-white/10 focus:bg-white/10">USDH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-[16px] h-[16px] leading-[16px] flex justify-between text-[16px] text-white/60">
            <span>{t('send.amount')}</span><span>{t('send.balance')}: {usdhBalance}</span>
          </div>
          <div className="mt-[8px] flex items-center">
            <Input
              className="flex-1 h-[48px] px-[12px] bg-white/10 rounded-[8px] text-[20px] text-white placeholder:text-white/60 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="ml-[8px] h-[48px] leading-[48px] px-[24px] bg-white/10 rounded-[8px] text-[16px] text-white/60 hover:text-white cursor-pointer" onClick={() => setAmount(usdhBalance)}>Max</span>
          </div>
          <div className="mt-[16px] h-[16px] leading-[16px] text-[16px] text-white/60">{t('send.to')}</div>
          <div className="mt-[16px] h-[64px] bg-white/10 rounded-[8px]">
            <Textarea
              className="w-full p-[12px] leading-[20px] text-[16px] text-white placeholder:text-white/60"
              placeholder="0x... (Onechain address)"
              value={toAddress}
              maxRows={2}
              variant="borderless"
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div className="mt-[16px] p-[12px] flex bg-[#252520] rounded-[8px]">
            <WarningIcon className="text-[#E8C24D] text-[16px]" />
            <div className="ml-[8px] flex-1 leading-[14px] text-[#E8C24D] text-[12px]">
              {t('send.warning')}
            </div>
          </div>
          <Button
            className="mt-[16px] w-full h-[48px] rounded-[12px] bg-[rgba(40,192,78,0.5)] hover:bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#3F4856] disabled:opacity-100 disabled:text-white/60"
            disabled={!amount || !toAddress}
            onClick={withdraw}
          >{t('send.continue')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
