"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseCountdownOptions = {
  /** 目标时间（时间戳/Date/ISO 字符串） */
  target: number | Date | string;
  /** 刷新间隔，默认 1000ms */
  intervalMs?: number;
  /** 初始是否自动开始，默认 true */
  autoStart?: boolean;
  /** 到点回调（只触发一次） */
  onEnd?: () => void;
};

export type CountdownState = {
  /** 剩余毫秒（最小 0） */
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** 是否正在运行（计时中） */
  isRunning: boolean;
};

export function useCountdown({
                               target,
                               intervalMs = 1000,
                               autoStart = true,
                               onEnd,
                             }: UseCountdownOptions) {
  const parseTarget = useMemo<number>(() => {
    const t = target instanceof Date ? target.getTime() : +new Date(target);
    return Number.isFinite(t) ? t : Date.now();
  }, [target]);

  // 用于避免 SSR 水合闪烁：初始为 0，等挂载后再计算
  const [now, setNow] = useState<number>(0);
  useEffect(() => setNow(Date.now()), []);

  const [isRunning, setIsRunning] = useState(autoStart);
  const rafRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const remainingMs = useMemo(() => {
    if (!now) return 0;
    const diff = Math.max(0, parseTarget - now);
    return diff;
  }, [parseTarget, now]);

  // 计算分解值
  const breakdown = useMemo(() => {
    const ms = remainingMs;
    const days = Math.floor(ms / 86_400_000);
    const hours = Math.floor((ms % 86_400_000) / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return { days, hours, minutes, seconds };
  }, [remainingMs]);

  const tick = useCallback(() => {
    setNow(Date.now());
  }, []);

  // 用 setTimeout + 漂移校正，尽量对齐整秒
  const timerRef = useRef<number | null>(null);
  const scheduleNext = useCallback(() => {
    const now = Date.now();
    // 让下一次尽量卡在整秒（或 intervalMs）的边界上
    const drift = intervalMs - ((now % intervalMs) || 0);
    const delay = Math.max(10, drift); // 最少 10ms，避免 0 造成高频
    timerRef.current = window.setTimeout(() => {
      tick();
    }, delay) as unknown as number;
  }, [intervalMs, tick]);

  // 主循环
  useEffect(() => {
    if (!isRunning) return;
    debugger;
    if (remainingMs <= 0) {
      if (!endedRef.current) {
        endedRef.current = true;
        onEnd?.();
      }
      setIsRunning(false);
      return;
    }
    scheduleNext();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, remainingMs, onEnd, scheduleNext]);

  // 目标时间变化时，重置结束标记
  useEffect(() => {
    endedRef.current = false;
  }, [parseTarget]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(
    (opts?: { target?: number | Date | string; autoStart?: boolean }) => {
      if (typeof opts?.target !== "undefined") {
        // 外部改变 target 时，靠依赖更新生效
      }
      endedRef.current = false;
      setNow(Date.now());
      setIsRunning(opts?.autoStart ?? true);
    },
    []
  );

  const state: CountdownState = useMemo(
    () => ({ remainingMs, ...breakdown, isRunning }),
    [remainingMs, breakdown, isRunning]
  );

  return { ...state, pause, resume, reset };
}
