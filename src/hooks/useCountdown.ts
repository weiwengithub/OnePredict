import { useEffect, useMemo, useRef, useState } from 'react';

export type CountdownParts = {
  totalMs: number;     // 剩余总毫秒（可能为负）
  days: number;
  hours: number;       // 0-23（默认）或累计小时（见 includeDays）
  minutes: number;     // 0-59
  seconds: number;     // 0-59
};

export function useCountdown(
  target: number | string | Date,
  options?: {
    tickMs?: number;         // 刷新频率，默认 1000ms
    includeDaysInHours?: boolean; // 若为 true，hours 将是累计小时（>24 也继续累加）
  }
) {
  const { tickMs = 1000, includeDaysInHours = true } = options || {};
  const [now, setNow] = useState(() => Date.now());
  const targetTs = useMemo(() => {
    const t = target instanceof Date ? target.getTime() : new Date(target).getTime();
    return Number.isFinite(t) ? t : NaN;
  }, [target]);

  // 只触发一次 onEnd 的辅助
  const endedOnceRef = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(targetTs)) return;
    // 先立即刷新一次，避免首帧闪烁
    setNow(Date.now());

    const id = window.setInterval(() => setNow(Date.now()), Math.max(200, tickMs));
    return () => window.clearInterval(id);
  }, [targetTs, tickMs]);

  const parts: CountdownParts & { ended: boolean } = useMemo(() => {
    if (!Number.isFinite(targetTs)) {
      return { totalMs: -1, days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }
    const totalMs = targetTs - now;
    const ended = totalMs <= 0;

    const ms = Math.max(0, totalMs);
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours24 = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const hours = includeDaysInHours ? Math.floor(s / 3600) : hours24;

    return { totalMs, days, hours, minutes, seconds, ended };
  }, [now, targetTs, includeDaysInHours]);

  return parts;
}
