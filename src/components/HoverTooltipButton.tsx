"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@radix-ui/react-tooltip";

type ButtonOwnProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick" | "className"
>;

export interface HoverTooltipButtonProps {
  /** 非悬停时显示的内容 */
  label: React.ReactNode;
  /** 悬停时显示的内容（不传则不切换） */
  hoverLabel?: React.ReactNode;
  /** Tooltip 内的内容 */
  tooltip: React.ReactNode;

  /** 点击事件 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /** Tooltip 位置/对齐/偏移 */
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  align?: React.ComponentProps<typeof TooltipContent>["align"];
  sideOffset?: number;

  /** 追加到 Button 的类名（会和默认样式合并） */
  className?: string;

  /** 传递给 Button 的其余原生/组件属性（如 variant/size/disabled 等） */
  buttonProps?: ButtonOwnProps;
}

/**
 * 一个将“按钮显示切换 + Tooltip 提示”封装在一起的通用组件
 */
export const HoverTooltipButton = React.memo(function HoverTooltipButton({
  label,
  hoverLabel,
  tooltip,
  onClick,
  side = "top",
  align = "center",
  sideOffset = 8,
  className = "",
  buttonProps,
}: HoverTooltipButtonProps) {
  const mergedBtnClass =
    [
      // 默认风格（可按需改成你的设计系统）
      "group h-[48px] border-none",
      "text-[16px] font-semibold",
      "transition-all duration-200 shadow-sm hover:shadow-md",
      "hover:text-white",
      // 允许外部覆盖/追加
      className,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className={mergedBtnClass} onClick={onClick} {...buttonProps}>
            {hoverLabel ? (
              <>
                <span className="group-hover:hidden">{label}</span>
                <span className="hidden group-hover:inline">{hoverLabel}</span>
              </>
            ) : (
              label
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-50 rounded-[8px] bg-[#5E6064] px-[15px] py-[11px] text-[16px] text-white shadow-lg backdrop-blur border border-[#26282E]"
        >
          {tooltip}
          <TooltipArrow className="fill-[#5E6064]" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
