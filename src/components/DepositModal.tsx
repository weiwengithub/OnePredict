"use client";

import React, {useCallback, useEffect, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close_1.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import WarningIcon from "@/assets/icons/warning_1.svg";
import BigNumber from "bignumber.js";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalanceFromStore } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {setSigninOpen, store} from "@/store";
import { onCopyToText } from "@/lib/utils";
import { QRCode } from "@/components/QRCode";
import {useIsMobile} from "@/contexts/viewport";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // 禁止背景滚动
  useEffect(() => {
    if (open) {
      // 复制地址
      onCopyToText(address)
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
  const { balance: usdhBalance } = useUsdhBalanceFromStore();

  const [address, setAddress] = useState("");
  useEffect(() => {
    setAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[60]">
      <DialogContent className={`p-0 bg-transparent border-none ${isMobile ? "w-full left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none" : "w-[450px]"}`}>
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[24px] overflow-hidden space-y-[16px]">
          <div className="h-[20px] leading-[20px] text-[20px] text-white font-bold text-center relative">
            {t('deposit.deposit')}
            <div className="size-[24px] cursor-pointer absolute top-0 right-0">
              <CloseIcon
                className="text-[14px] text-[#D2D1D1] hover:text-white"
                onClick={() => {
                  onOpenChange(false);
                }}
              />
            </div>
          </div>
          <div className="w-[180px] h-[180px] bg-white rounded-[24px] mx-auto p-[11px]">
            <QRCode
              data={address}
              width={164}
              height={164}
            />
          </div>
          <div className="leading-[20px] text-white text-[20px]">
            {t('deposit.address')}
          </div>
          <div className="leading-[24px] text-white/60 text-[16px] break-all pb-[16px] border-b border-white/40">
            {address}<CopyIcon className="inline-block ml-1 -mt-1 text-[8px] cursor-pointer hover:text-white" onClick={() => onCopyToText(address)} />
          </div>
          <div className="h-[40px] flex items-center bg-[#252520] rounded-[24px] px-[16px]">
            <WarningIcon className="text-[#E8C24D] text-[16px]" />
            <span className="ml-[8px] text-[#E8C24D] text-[12px]">{t('deposit.warning')}</span>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-[48px] bg-[#199DFF] hover:bg-blue-700 text-white text-[24px] rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('deposit.gotIt')}
          </Button>
          <div className="h-[12px] leading-[12px] text-[12px] text-white/60 text-center">
            {t('deposit.tip')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
