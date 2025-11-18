"use client";

import React, {useEffect, useMemo, useState} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import CloseIcon from "@/assets/icons/close.svg";
import {toast} from "sonner";
import {useIsMobile} from "@/contexts/viewport";
import RankCardImage from '@/components/RankCardImage';
import {downloadDataUrl, copyImageFromDataUrl} from '@/lib/utils';

interface RankingModalProps {
  open: boolean;
  rankType: string;
  value: number;
  sort: number;
  memberCode: string;
  avatar: string;
  onOpenChange: (open: boolean) => void;
}

export default function RankingModal({ open, rankType, value, sort, memberCode, avatar, onOpenChange }: RankingModalProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const rankName = rankType === 'pnl' ? t('leaderboard.pnl') : rankType === 'volume' ? t('leaderboard.volume') : rankType === 'tradeCount' ? t('leaderboard.trades') : '';
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

  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleDownload = () => {
    if (!imgUrl) return;
    downloadDataUrl(imgUrl, 'leaderboard-card.png');
  };

  const handleCopy = async () => {
    if (!imgUrl) return;
    try {
      const ok = await copyImageFromDataUrl(imgUrl);
      console.log(ok)
      if(ok) toast.success(t('leaderboard.imageCopied'))
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[60]">
      <DialogContent className={`p-0 bg-transparent border-none ${isMobile ? "w-full left-0 top-auto bottom-0 translate-x-0 translate-y-0 rounded-none" : "w-[350px]"}`}>
        <div className="w-full h-full relative rounded-[24px] bg-[#04122B] border border-[#051A3D] p-[24px] overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="h-[24px] leading-[24px] text-[18px] text-white font-bold">{t('leaderboard.shareMyRank')}</div>
            <CloseIcon
              className="text-[20px] text-[#999999] hover:text-white cursor-pointer"
              onClick={() => {
                onOpenChange(false)
              }}
            />
          </div>
          <div className="h-[300px] max-w-[300px] mt-[32px] mx-auto rounded-[12px] overflow-hidden">
            <RankCardImage
              labels={{
                title: t('leaderboard.myRank'),
                type: rankName,
                all: t('leaderboard.allRank', {type: rankName}),
                join: t('leaderboard.joinOnePredict'),
                code: t('leaderboard.myInviteCode')
              }}
              value={value}
              rank={sort}
              inviteCode={memberCode}
              avatar={avatar}
              onReady={setImgUrl}
            />
          </div>
          <div
            className="mt-[32px] h-[48px] leading-[48px] bg-[#E1E2E4] rounded-[12px] text-center text-[20px] text-black font-bold cursor-pointer"
            onClick={handleCopy}
          >
            {t('leaderboard.share')}
          </div>
          <div className="mt-[16px] flex justify-center gap-1">
            <div className="h-[24px] leading-[24px] text-[12px] text-white/60 font-bold cursor-pointer hover:text-white" onClick={handleDownload}>{t('leaderboard.download')}</div>
            <div className="h-[24px] leading-[24px] text-[12px] text-white/60 font-bold">{t('leaderboard.or')}</div>
            <div className="h-[24px] leading-[24px] text-[12px] text-white/60 font-bold cursor-pointer hover:text-white" onClick={handleCopy}>{t('leaderboard.copy')}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
