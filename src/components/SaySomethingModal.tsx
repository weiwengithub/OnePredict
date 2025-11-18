"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";
import apiService from "@/lib/api/services";
import { useCurrentAccount } from "@onelabs/dapp-kit";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/interface";
import {MarketOption} from "@/lib/api/interface";
import CloseIcon from "@/assets/icons/close.svg";
import {toast} from "sonner";

interface WelcomeModalProps {
  open: boolean;
  prediction: MarketOption;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function SaySomethingModal({ open, prediction, onOpenChange, onSuccess }: WelcomeModalProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [content, setContent] = useState<string>('');

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
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const userAddress = useMemo(() => {
    return currentAccount?.address || zkLoginData?.zkloginUserAddress;
  }, [currentAccount, zkLoginData]);
  const handleSave = useCallback(async () => {
    try {
      const {data} = await apiService.createProjectComment({projectId: prediction.id, content, address: userAddress || ''});
      toast.success(t('detail.postSuccess'));
      setContent('');
      onOpenChange(false);
      setTimeout(() => onSuccess(), 1000);
    } catch (error) {
      toast.error(t('detail.postError'));
    }
  }, [prediction, content, userAddress, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[60]">
      <DialogContent className={`p-0 bg-transparent border-none ${isMobile ? "w-full left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none" : "w-[736px]"}`}>
        <div className="w-full h-full relative rounded-[20px] bg-[#051A3D] p-[20px] space-y-[16px] overflow-hidden">
          <div className="flex items-center">
            <div className="flex-1 h-[24px] leading-[24px] text-[18px] text-white font-bold truncate">{prediction.marketName}</div>
            <CloseIcon
              className="text-[20px] text-[#999999] hover:text-white cursor-pointer"
              onClick={() => onOpenChange(false)}
            />
          </div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('common.writeSomething')}
            className="w-full p-3 bg-transparent border-white/20 text-white text-[16px] font-bold placeholder:text-white/60 pl-[12px] pr-20 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
          <div className="flex justify-end">
            <Button
              className="h-[36px] rounded-[8px] bg-[#E0E2E4] hover:bg-[#E0E2E4]text-[14px] text-[#010101] cursor-pointer disabled:bg-[#98999A] disabled:opacity-100 disabled:text-black"
              disabled={!content}
              onClick={handleSave}
            >
              {t('common.post')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
