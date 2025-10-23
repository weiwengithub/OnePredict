// components/CountdownToStart.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import LockIcon from "@/assets/icons/lock.svg";

type CountdownToStartProps = {
  /** 目标开始时间 */
  target: number | string | Date;

  /** 结束后显示的内容（默认是一个按钮） */
  renderReady?: () => React.ReactNode;

  /** 自定义倒计时渲染（可定制为你想要的样式） */
  renderCountdown?: (p: {
    hours: number;
    minutes: number;
    seconds: number;
    days: number;
  }) => React.ReactNode;

  /** 点击默认按钮时触发（仅当未提供 renderReady 时） */
  onBuyClick?: () => void;

  /** 到点触发一次 */
  onEnd?: () => void;

  /** 刷新频率，默认 1000ms */
  tickMs?: number;

  /** 是否把天数折算进小时，总小时数可能大于 24（默认 true） */
  includeDaysInHours?: boolean;

  /** 外层 className */
  className?: string;
};

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default function CountdownToStart({
                                           target,
                                           renderReady,
                                           renderCountdown,
                                           onBuyClick,
                                           onEnd,
                                           tickMs = 1000,
                                           includeDaysInHours = true,
                                           className,
                                         }: CountdownToStartProps) {
  const { ended, hours, minutes, seconds, days } = useCountdown(target, {
    tickMs,
    includeDaysInHours,
  });

  // 只触发一次 onEnd
  const firedRef = useRef(false);
  useEffect(() => {
    if (ended && !firedRef.current) {
      firedRef.current = true;
      onEnd?.();
    }
  }, [ended, onEnd]);

  if (ended) {
    // 已结束：显示 ready 内容
    if (renderReady) return <div className={className}>{renderReady()}</div>;
    // 默认：购买按钮
    return (
      <div className={className}>
        <button
          className="inline-flex items-center justify-center rounded-lg bg-[#29C041] px-4 h-9 text-white text-sm font-medium hover:opacity-90 transition"
          onClick={onBuyClick}
        >
          可购买
        </button>
      </div>
    );
  }

  // 未结束：显示倒计时
  if (renderCountdown) {
    return <div className={className}>{renderCountdown({ hours, minutes, seconds, days })}</div>;
  }

  // 默认倒计时样式：11 H 39 M 51 S
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
