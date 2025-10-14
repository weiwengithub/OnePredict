// components/Countdown.tsx
"use client";

import React from "react";
import { useCountdown } from "@/lib/useCountdown";
import LockIcon from "@/assets/icons/lock.svg";
// import { formatDHMS, pad2 } from "@/utils/formatDuration";

type Props = {
  /** 目标时间 */
  target: number | Date | string;
  /** 结束显示（默认：00:00:00） */
  endedText?: React.ReactNode;
  /** 每次刷新间隔，默认 1000ms */
  intervalMs?: number;
  /** 到点回调 */
  onEnd?: () => void;
};

export default function Countdown({
                                    target,
                                    endedText = "00:00:00",
                                    intervalMs = 1000,
                                    onEnd,
                                  }: Props) {
  const { days, hours, minutes, seconds, remainingMs, isRunning, pause, resume, reset } =
    useCountdown({ target, intervalMs, onEnd });

  if (remainingMs <= 0) {
    return <span>{endedText}</span>;
  }

  // 默认渲染：有天则显示 "D:HH:MM:SS"，否则 "HH:MM:SS"
  return (
    <div className="h-[48px] flex items-center justify-center gap-1 border border-white/60 rounded-[8px] mb-[12px]">
      <LockIcon className="text-white text-[16px]" />
      <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">{hours}</span>
      <span className="text-white text-[12px]">H</span>
      <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">{minutes}</span>
      <span className="text-white text-[12px]">M</span>
      <span className="h-[20px] leading-[20px] bg-white/10 rounded-[4px] px-1 text-white text-[12px]">{seconds}</span>
      <span className="text-white text-[12px]">S</span>
    </div>
  );
}
