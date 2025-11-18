"use client";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider
      delayDuration={200}      // 悬停 200ms 后再显示，减少抖动
      skipDelayDuration={100}  // 快速连续触发时的延迟豁免
      disableHoverableContent  // 一般 tooltip 不建议放可交互内容
    >
      {children}
    </Tooltip.Provider>
  );
}
