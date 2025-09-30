"use client";

import React, {useCallback, useEffect, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import CloseIcon from "@/assets/icons/close.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import BigNumber from "bignumber.js";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import { ZkLoginData } from "@/lib/interface";
import {store} from "@/store";
import { onCopyToText } from "@/lib/utils";
import { QRCode } from "@/components/QRCode";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function DepositModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useLanguage();
  const [showShade, setShowShade] = useState(true);
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

  const [address, setAddress] = useState("");
  useEffect(() => {
    setAddress(zkLoginData ? zkLoginData.zkloginUserAddress : currentAccount?.address || '')
  }, [currentAccount, zkLoginData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[450px] p-0 bg-transparent border-none">
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[20px] overflow-hidden">
          <div className="w-full h-full">
            <div className="flex items-center">
              <div className="flex-1">
                  <div className="h-[24px] leading-[24px] text-[22px] text-white font-bold">Daposit USDH</div>
                <div className="mt-[5px] h-[20px] leading-[20px] text-[16px] text-white/60 font-bold">Balance : {usdhBalance}</div>
              </div>
              <CloseIcon
                className="text-[28px] text-[#D2D1D1] hover:text-white cursor-pointer"
                onClick={() => {
                  onOpenChange(false);
                  setShowShade(true);
                }}
              />
            </div>
            <div className="mt-[18px] w-[240px] h-[240px] bg-white rounded-[24px] mx-auto p-[11px]">
              <QRCode
                data={address}
                width={218}
                height={218}
              />
            </div>
            <div className="mt-[20px] bg-[#8F8B74] rounded-[20px] p-[20px]">
              <div className="pl-[24px] leading-[20px] text-[14px] text-white/60 font-bold bg-[url(/images/icon/correct-min.png)] bg-no-repeat bg-[0_3px] bg-[length:14px_14px]">
                Supports only Arbitrum One native USDH (by Circle)
              </div>
              <div className="mt-[10px] pl-[24px] leading-[20px] text-[14px] text-white/60 font-bold bg-[url(/images/icon/wrong-min.png)] bg-no-repeat bg-[0_3px] bg-[length:14px_14px]">
                Not bridged USDH.e
              </div>
            </div>
            <div className="mt-[20px] bg-[#010A2C] rounded-[20px] pb-[18px]">
              <div className="mx-[2px] bg-[#051A3D] rounded-[20px] px-[16px] p-[14px] leading-[20px] text-white text-[19px] break-all">
                {address}
              </div>
              <div
                className="mt-[10px] h-[38px] flex items-center justify-center text-[20px] text-white"
                onClick={() => onCopyToText(address)}
              >
                <CopyIcon className="mr-[10px]" />
                Copy Address
              </div>
            </div>
          </div>
          {showShade && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-[30px] flex flex-col items-center">
              <div className="mt-[132px] h-[48px] bg-black/50 rounded-[30px] pl-[54px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[5px_6px] bg-[length:38px_38px] leading-[48px] text-[#29C04E] text-[24px] pr-[24px] relative">
                USDH
                <Image
                  src="/images/icon/correct.png"
                  alt="correct"
                  width={30}
                  height={30}
                  className="absolute -top-[8px] -right-[8px]"
                />
              </div>
              <div className="mt-[12px] h-[48px] bg-black/50 rounded-[30px] pl-[54px] bg-[url(/images/icon/icon-token.png)] bg-no-repeat bg-[5px_6px] bg-[length:38px_38px] leading-[48px] text-[#A63030] text-[24px] pr-[24px] relative">
                USDH.e
                <Image
                  src="/images/icon/wrong.png"
                  alt="correct"
                  width={30}
                  height={30}
                  className="absolute -top-[8px] -right-[8px]"
                />
              </div>
              <div className="mt-[52px] h-[38px] leading-[38px] text-[24px] text-white font-bold text-center">
                Deposit the right USDH
              </div>
              <div className="mt-[10px] px-[26px] leading-[24px] text-[20px] text-white/60 font-bold text-center">
                This is your own wallet address, not a platform wallet. Mistaken tokens can’t be recovered.
              </div>
              <div
                className="mt-[38px] mx-auto w-[144px] h-[50px] bg-[#FAFAFA] rounded-[30px] leading-[50px] text-[20px] text-black text-center cursor-pointer"
                onClick={() => setShowShade(false)}
              >
                I got it
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
