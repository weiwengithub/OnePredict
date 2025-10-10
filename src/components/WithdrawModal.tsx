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
import { Transaction } from '@onelabs/sui/transactions'
import {store} from "@/store";
import { ZkloginClient } from '@/txsdk/zklogin';
import { toast } from "sonner";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const suiClient = useSuiClient();

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

  const tokenAddress = process.env.NEXT_PUBLIC_USDH_TYPE || ''
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const withdraw = async () => {
    try {
      const zkLoginData = store.getState().zkLoginData
      if (!zkLoginData) {
        throw new Error('zkLogin data not found')
      }



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

      if (tokenAddress.toLowerCase() === '0x2::oct::oct') {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountAtomic)])
        tx.transferObjects([coin], toAddress)
      } else {
        // @ts-ignore
        const coins = await suiClient.getCoins({ owner: zkLoginData.zkloginUserAddress, coinType: tokenAddress })
        const coinIds = coins.data.map((c: any) => c.coinObjectId)
        if (!coinIds.length) throw new Error('Insufficient balance')
        const primary = tx.object(coinIds[0])
        if (coinIds.length > 1) {
          tx.mergeCoins(primary, coinIds.slice(1).map((id: string) => tx.object(id)))
        }
        const [split] = tx.splitCoins(primary, [tx.pure.u64(amountAtomic)])
        tx.transferObjects([split], toAddress)
      }
      const zkloginClient = new ZkloginClient(suiClient as any);
      const result = await zkloginClient.sendTransaction(tx, tokenAddress.toLowerCase() === '0x2::oct::oct');
      console.log('transfer executed:', result)
      toast.success(t('send.msg.transferSent'))
      setAmount('')
      // setSending(false)
      setTimeout(() => {
        // getBalances(tokenAddress)
      }, 2000)
    } catch (error) {
      console.error('Failed to transfer token:', error)
      // handleTransactionError(
      //   error,
      //   () => toast.info(t('common.txCancelled')),
      //   () => toast.error(t('send.msg.sendFailed')+':'+((error as any)?.message || JSON.stringify(error)))
      // );
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[450px] p-0 bg-transparent border-none">
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[20px] overflow-hidden">
          <div className="mt-[20px] flex items-center">
            <div className="flex-1 h-[24px] leading-[24px] text-[22px] text-white font-bold">Withdraw USDH</div>
            <CloseIcon
              className="text-[28px] text-[#D2D1D1] hover:text-white cursor-pointer"
              onClick={() => {onOpenChange(false)}}
            />
          </div>
          <div className="mt-[28px] h-[20px] leading-[20px] flex justify-between text-[16px] text-white/60">
            <span>Amount</span><span onClick={() => setAmount(usdhBalance)}>{usdhBalance} Max</span>
          </div>
          <div className="mt-[8px] h-[76px] border border-white/20 rounded-[20px] px-[20px] flex items-center">
            <Input
              className="flex-1 px-0 bg-transparent border-none text-[20px] text-white placeholder:text-white/60"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="leading-[20px] text-[20px] text-white ml-[20px]">USDH</span>
          </div>
          <div className="mt-[28px] h-[20px] leading-[20px] text-[16px] text-white/60">To</div>
          <div className="mt-[8px] h-[76px] border border-white/20 rounded-[20px] px-[20px] flex items-center">
            <Input
              className="flex-1 px-0 bg-transparent border-none text-[20px] text-white placeholder:text-white/60"
              placeholder="Arbitrum One Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div className="mt-[38px] flex items-center">
            <Input type="checkbox" className="w-[24px] h-[24px] flex-none border-[2px] border-white/60 bg-transparent" />
            <div className="ml-[10px] leading-[24px] text-[16px] text-white">I understand this only supports Arbitrum One native USDH (by Circle), <span className="text-[#F95D5F]">NOT bridged USDH.e</span></div>
          </div>
          <Button
            className="mt-[48px] w-full h-[68px] rounded-[20px] bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
            disabled={!amount || !toAddress}
            onClick={withdraw}
          >Withdraw</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
