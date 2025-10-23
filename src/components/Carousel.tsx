"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";

export interface CarouselProps<T> {
  // 数据源（如 prediction 列表）
  items: T[];
  // 每页展示按钮数量（需求为 2）
  perPage?: number;
  // 自动播放
  autoplay?: boolean;
  autoplayInterval?: number; // ms
  // 自定义渲染每个按钮（若不传，将用默认的 HoverTooltipButton 渲染）
  renderButton?: (item: T, index: number) => React.ReactNode;
  // 切换页回调
  onPageChange?: (pageIndex: number) => void;
  className?: string;
}

export default function Carousel<T = any>({
  items,
  perPage = 2,
  autoplay = true,
  autoplayInterval = 3000,
  renderButton,
  onPageChange,
  className = "",
}: CarouselProps<T>) {
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / Math.max(1, perPage)));
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentTranslateRef = useRef(0);
  const lastTranslateRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoplayTimerRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampPage = useCallback((p: number): number => {
    if (p < 0) return 0;
    if (p > totalPages - 1) return totalPages - 1;
    return p;
  }, [totalPages]);

  const gotoPage = useCallback((next: number) => {
    const clamped = clampPage(next);
    setPage(clamped);
    onPageChange?.(clamped);
  }, [clampPage, onPageChange]);

  // 自动播放
  useEffect(() => {
    if (!autoplay || totalPages <= 1 || isDragging) return;
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, Math.max(1000, autoplayInterval));
    return () => clearInterval(autoplayTimerRef.current);
  }, [autoplay, autoplayInterval, totalPages, isDragging]);

  // 拖拽/滑动
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent | TouchEvent | MouseEvent) => {
      draggingRef.current = true;
      setIsDragging(true);
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      const clientX = (e as PointerEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      startXRef.current = clientX || 0;
      lastTranslateRef.current = -page * (el.clientWidth || 1);
      currentTranslateRef.current = lastTranslateRef.current;
      (trackRef.current as HTMLDivElement).style.transition = "none";
    };
    const onPointerMove = (e: PointerEvent | TouchEvent | MouseEvent) => {
      if (!draggingRef.current) return;
      const clientX = (e as PointerEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      const dx = (clientX || 0) - startXRef.current;
      currentTranslateRef.current = lastTranslateRef.current + dx;
      if (trackRef.current) {
        (trackRef.current as HTMLDivElement).style.transform = `translate3d(${currentTranslateRef.current}px, 0, 0)`;
      }
    };
    const onPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      (trackRef.current as HTMLDivElement).style.transition = "transform 300ms ease";
      const width = el.clientWidth || 1;
      const movedPages = -currentTranslateRef.current / width;
      const next = Math.round(movedPages);
      gotoPage(next);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // 触摸支持
    el.addEventListener("touchstart", onPointerDown, { passive: true } as any);
    window.addEventListener("touchmove", onPointerMove as any, { passive: true } as any);
    window.addEventListener("touchend", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchstart", onPointerDown as any);
      window.removeEventListener("touchmove", onPointerMove as any);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [gotoPage, page]);

  // 页面变化 -> 应用 transform
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !trackRef.current) return;
    (trackRef.current as HTMLDivElement).style.transition = "transform 300ms ease";
    (trackRef.current as HTMLDivElement).style.transform = `translate3d(${-page * (el.clientWidth || 1)}px, 0, 0)`;
  }, [page]);

  const pages = useMemo(() => {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += perPage) {
      chunks.push(items.slice(i, i + perPage));
    }
    return chunks;
  }, [items, perPage]);

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden pb-4 ${className}`}>
      {/* 轨道 */}
      <div ref={trackRef} className="flex w-full will-change-transform">
        {pages.map((group: T[], pageIndex: number) => (
          <div key={pageIndex} className="shrink-0 w-full px-2">
            <div className="grid grid-cols-2 gap-3">
              {group.map((item: T, i: number) => (
                <div key={i} className="w-full">
                  {renderButton ? (
                    renderButton(item, pageIndex * perPage + i)
                  ) : (
                    <HoverTooltipButton
                      label={(item as any)?.metaJson?.title || (item as any)?.title || `Button ${pageIndex * perPage + i + 1}`}
                      tooltip={(item as any)?.metaJson?.description || ""}
                      onClick={() => {}}
                      buttonProps={{ variant: "outline" } as any}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute left-0 right-0 bottom-0  flex items-center justify-center gap-2" >
        {Array.from({ length: totalPages==1?0:totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => gotoPage(i)}
            className={`h-2  rounded-full transition-colors ${i === page ? "bg-[#467DFF] w-4" : "bg-white/10 hover:bg-white/40 w-2 "}`}
            aria-label={`Go to slide ${i + 1}`}
          />)
        )}
      </div>
    </div>
  );
}


