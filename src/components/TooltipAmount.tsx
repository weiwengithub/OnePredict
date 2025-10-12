"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {fix, toDisplayDenomAmount} from "@/lib/numbers";

export type TooltipAmountProps = {
  /** 最小单位数量（链上单位） */
  shares: string | number;
  /** 小数位（token 精度），默认 9 */
  decimals?: number;
  /** 触发器上显示的小数位（向下取整），默认 2 */
  precision?: number;
  /** 右侧的单位或名称（如 outcomeName） */
  suffix?: string;
  /** 自定义展示：传入已转换为可读单位的字符串，返回显示字符串 */
  formatter?: (readable: string) => string;
  /** 外层 className（包一下方便布局） */
  className?: string;
  /** 触发器样式 */
  triggerClassName?: string;
  /** Tooltip Content 的额外样式 */
  contentClassName?: string;
  /** Tooltip 方向、偏移等自定义 */
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

export const TooltipAmount = forwardRef<HTMLDivElement, TooltipAmountProps>(
  (
    {
      shares,
      decimals = 9,
      precision = 2,
      suffix,
      formatter,
      className,
      triggerClassName,
      contentClassName,
      side = "top",
      align = "center",
      sideOffset = 8,
    },
    ref
  ) => {
    // 完整可读数（不裁剪小数）
    const readable = toDisplayDenomAmount(shares, decimals);
    // 触发器上的精简展示：向下取 precision 位
    const short = fix(readable, precision);

    const displayShort = formatter ? formatter(short) : short;
    const displayFull = formatter ? formatter(readable) : readable;

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span ref={ref}>
            {displayShort} {suffix}
          </span>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 rounded-[8px] border px-[15px] py-[11px] text-[16px] shadow-lg backdrop-blur",
              "bg-[#5E6064] border-[#26282E] text-white",
              contentClassName
            )}
          >
            {displayFull}
            <Tooltip.Arrow className="fill-[#5E6064]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }
);

TooltipAmount.displayName = "TooltipAmount";
