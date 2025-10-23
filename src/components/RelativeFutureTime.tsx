'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {useLanguage} from "@/contexts/LanguageContext";
import { useDayLabel } from "@/hooks/useDayLabel";

type Props = {
  /** 目标时间（未来） */
  target: Date | string | number;
  /** 小于一天时是否显示倒计时（默认 true） */
  countdownUnderOneDay?: boolean;
  /** 自定义“已结束”显示 */
  endedText?: string;
  /** 自定义 className */
  className?: string;
  /** 到点回调 */
  onEnd?: () => void;
  /** 计时精度，毫秒（默认 1000ms） */
  tickMs?: number;
};

type Mode = 'label' | 'countdown' | 'ended';

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

/** 计算剩余毫秒，负数表示已过期 */
function remainingMs(now: number, target: number) {
  return target - now;
}

/** 把毫秒格式化为 HH:MM:SS（最多 24h 以内的显示） */
function formatHMS(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export default function RelativeFutureTime({
                                             target,
                                             countdownUnderOneDay = true,
                                             endedText = '',
                                             className,
                                             onEnd,
                                             tickMs = 1000,
                                           }: Props) {
  const { t } = useLanguage();
  if (endedText === '') endedText = t('common.finished')
  const dayLabel = useDayLabel();
  // 统一把 target 解析为时间戳
  const targetTs = useMemo(() => {
    const t = target instanceof Date ? target.getTime() : new Date(target).getTime();
    return Number.isFinite(t) ? t : NaN;
  }, [target]);

  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  const endedRef = useRef(false);

  // 定时器：仅在需要“倒计时”或“即将到来”时才跑
  useEffect(() => {
    if (!Number.isFinite(targetTs)) return;
    const tick = () => setNowTs(Date.now());
    // 先立刻更新一次，避免初始闪烁
    tick();

    const id = window.setInterval(tick, Math.max(200, tickMs));
    return () => window.clearInterval(id);
  }, [targetTs, tickMs]);

  // 模式判定 + 文案
  const content = useMemo(() => {
    if (!Number.isFinite(targetTs)) return { mode: 'ended' as Mode, text: endedText };

    const now = new Date(nowTs);
    const tgt = new Date(targetTs);

    const msLeft = remainingMs(nowTs, targetTs);

    // 已结束
    if (msLeft <= 0) {
      return { mode: 'ended' as Mode, text: endedText };
    }

    // 先看“日历天差”标签（明天/后天/N天后）
    const label = dayLabel(now, tgt);

    // 小于 1 天：使用倒计时（如果开启）
    if (msLeft < 86400000 && countdownUnderOneDay) {
      return { mode: 'countdown' as Mode, text: formatHMS(msLeft) };
    }

    // 否则显示日历标签；如果 label 为空（今天但>0），仍走倒计时
    if (label) {
      return { mode: 'label' as Mode, text: label };
    } else {
      // 今天但 > 1 小时/分钟：仍按倒计时
      return { mode: 'countdown' as Mode, text: formatHMS(msLeft) };
    }
  }, [endedText, nowTs, targetTs, countdownUnderOneDay]);

  // 触发 onEnd（只触发一次）
  useEffect(() => {
    if (content.mode === 'ended' && !endedRef.current) {
      endedRef.current = true;
      onEnd?.();
    }
  }, [content.mode, onEnd]);

  return <span className={className}>{content.text}</span>;
}
