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

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mt-[38px] flex items-center">
            <Input type="checkbox" className="w-[24px] h-[24px] flex-none border-[2px] border-white/60 bg-transparent" />
            <div className="ml-[10px] leading-[24px] text-[16px] text-white">I understand this only supports Arbitrum One native USDH (by Circle), <span className="text-[#F95D5F]">NOT bridged USDH.e</span></div>
          </div>
          <Button
            className="mt-[48px] w-full h-[68px] rounded-[20px] bg-[#28C04E] leading-[68px] text-[20px] text-white text-center disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
            disabled={!amount || !address}
          >Withdraw</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
