"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SharePopoverProps = {
  /** 触发按钮内容 */
  trigger: React.ReactNode;
  /** 气泡里的内容 */
  content: React.ReactNode;
  /** 与触发器的垂直间距（px） */
  offset?: number;
  /** 打开时是否锁定页面滚动（默认 true） */
  lockScroll?: boolean;
  /** 初始是否打开（默认 false） */
  defaultOpen?: boolean;
  /** 打开/关闭回调（可选） */
  onOpenChange?: (open: boolean) => void;
  /** 额外 class */
  className?: string;
  /** 额外 class（作用于弹层容器） */
  portalClassName?: string;
};

export default function SharePopover({
  trigger,
  content,
  offset = 8,
  lockScroll = true,
  defaultOpen = false,
  onOpenChange,
  className = "",
  portalClassName= "",
}: SharePopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  // Portal 宿主是否可用
  useEffect(() => setMounted(true), []);

  // 计算弹层位置（正下方居中）
  const updatePosition = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.bottom + offset + window.scrollY;
    const left = rect.left + rect.width / 2 + window.scrollX;
    setStyle({
      position: "absolute",
      top,
      left,
      transform: "translateX(-50%)", // 居中
      zIndex: 1000,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, offset]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // 点击外部关闭 & Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popRef.current &&
        !popRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // 打开/关闭回调
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // 锁定滚动（含滚动条补偿，避免页面抖动）
  useEffect(() => {
    if (!open || !lockScroll) return;
    const body = document.body;
    const scrollBarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollBarW > 0) body.style.paddingRight = `${scrollBarW}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open, lockScroll]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v)
        }}
      >
        {trigger}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-modal="false"
            style={style}
            className={`relative select-none ${portalClassName}`}
          >
            {/* 气泡主体 */}
            <div className="rounded-[8px] border border-white/20 bg-[#010A2C] text-white shadow-xl p-3">
              {content}
            </div>
            {/* 小三角（朝上） */}
            <div
              aria-hidden
              className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-white/20"
            />
          </div>,
          document.body
        )}
    </>
  );
}
