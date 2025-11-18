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

  const viewportPadding = 8;   // 离视口边缘的安全间距
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const [arrowOffset, setArrowOffset] = useState(0); // 小三角的水平偏移（px）

  // Portal 宿主是否可用
  useEffect(() => setMounted(true), []);

  // 计算弹层位置（正下方居中）
  const updatePosition = () => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const a = anchor.getBoundingClientRect();

    // 先获取弹层尺寸
    // 注意：必须在弹层可见后测量（open=true 且已渲染）
    const p = pop.getBoundingClientRect();
    const popW = p.width;
    const popH = p.height;

    // 目标“中心点”（触发器水平中心）
    const desiredCenterX = a.left + a.width / 2;

    // 计算水平“中心点”的限位边界（避免溢出）
    const minCenter = viewportPadding + popW / 2;
    const maxCenter = vw - viewportPadding - popW / 2;
    const clampedCenterX = Math.min(Math.max(desiredCenterX, minCenter), maxCenter);

    // 箭头需要跟随中心点差值偏移（正数 = 向右）
    const deltaX = desiredCenterX - clampedCenterX; // 若发生限位，deltaX != 0
    setArrowOffset(deltaX);

    // 先假设放在下方
    let nextPlacement: 'top' | 'bottom' = 'bottom';
    let topPx = a.bottom + offset; // 视口坐标系
    // 如果下方放不下，就翻转到上方
    if (topPx + popH + viewportPadding > vh) {
      nextPlacement = 'top';
      topPx = a.top - offset - popH;
      // 如果上方还是不够（极端小屏），再兜底夹在视口里
      if (topPx < viewportPadding) {
        topPx = Math.max(viewportPadding, vh / 2 - popH / 2);
      }
    }
    setPlacement(nextPlacement);

    // 计算最终样式（继续用 translateX(-50%)，left 给“限位后的中心点”）
    setStyle({
      position: 'absolute',
      top: topPx + scrollY,
      left: clampedCenterX + scrollX,
      transform: 'translateX(-50%)',
      zIndex: 1000,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const r = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(r);
  }, [open, offset]);

  useEffect(() => {
    if (!open || !popRef.current) return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(popRef.current);
    return () => ro.disconnect();
  }, [open]);

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
            <div
              className={`rounded-[8px] border border-white/20 bg-[#010A2C] text-white shadow-xl p-3 ${
                placement === 'top' ? 'mt-0 mb-2' : 'mt-2 mb-0'
              }`}
            >
              {content}
            </div>
            {/* 小三角（朝上） */}
            <div
              aria-hidden
              className={`absolute left-1/2 h-0 w-0 -translate-x-1/2
                ${placement === 'top'
                ? 'bottom-0 translate-y-full border-x-8 border-t-8 border-x-transparent border-t-white/20'
                : 'top-0 -translate-y-full border-x-8 border-b-8 border-x-transparent border-b-white/20'
              }`}
              style={{ transform: `translate(calc(-50% + ${arrowOffset}px), ${placement === 'top' ? '0.25rem' : '-0.25rem'})` }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
