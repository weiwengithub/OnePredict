"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** 最小行数（默认 1） */
  minRows?: number;
  /** 最大行数（可选，不传则不限制） */
  maxRows?: number;
  /** 是否显示边框 */
  variant?: "default" | "borderless";
};

export const Textarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className = "", style, minRows = 1, maxRows, variant, onInput, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      const cs = window.getComputedStyle(el);
      // 解析行高
      let lh = parseFloat(cs.lineHeight);
      if (isNaN(lh)) {
        // line-height: normal 的兜底（大致近似）
        lh = parseFloat(cs.fontSize) * 1.2;
      }

      const borderBox = cs.boxSizing === "border-box";
      const padding =
        parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const border =
        parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

      // 计算允许的最小/最大高度
      const minH = Math.max(1, minRows) * lh + (borderBox ? padding + border : 0);
      const maxH =
        typeof maxRows === "number"
          ? Math.max(minH, maxRows * lh + (borderBox ? padding + border : 0))
          : Infinity;

      // 先回到 auto 再测量内容高度
      el.style.height = "auto";
      const contentH = el.scrollHeight;

      // 夹在 min / max 之间
      const nextH = Math.min(Math.max(contentH, minH), maxH);
      el.style.height = `${nextH}px`;

      // 超过最大高度时允许滚动；否则隐藏滚动条
      if (contentH > maxH) {
        el.style.overflowY = "auto";
      } else {
        el.style.overflowY = "hidden";
      }
    }, [minRows, maxRows]);

    // 初次与依赖变更后同步一次（SSR → CSR）
    useLayoutEffect(() => {
      resize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const observer = new ResizeObserver(resize);
      observer.observe(el);
      return () => observer.disconnect();
    }, [resize]);

    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      resize();
      onInput?.(e);
    };
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // 受控场景 value 改变后也需要自适应
      requestAnimationFrame(resize);
      onChange?.(e);
    };

    return (
      <textarea
        ref={innerRef}
        rows={minRows}
        onInput={handleInput}
        onChange={handleChange}
        // 无上下箭头/不允许拖拽调整
        style={{
          resize: "none",
          scrollbarWidth: "none", // Firefox 隐藏滚动条
          ...style,
        }}
        className={
          cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:hidden",
            variant === "borderless" &&
            "border-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none bg-transparent",
            className
          )
        }
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
