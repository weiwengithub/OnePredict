'use client';

import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

type Props = {
  text: string;
  className?: string;
  delayDuration?: number;
  side?: 'top'|'right'|'bottom'|'left';
  align?: 'start'|'center'|'end';
};

export default function EllipsisWithTooltip({
  text,
  className = '',
  delayDuration = 300,
  side = 'top',
  align = 'start',
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [truncated, setTruncated] = React.useState(false);

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 容差 1px，避免子像素/缩放导致的误判
    const eps = 1;
    const isTruncated = el.scrollWidth - el.clientWidth > eps;
    setTruncated(isTruncated);
  }, []);

  // 初次 + 文本变化后测量（等一帧，确保布局/字体生效）
  React.useEffect(() => {
    const raf = requestAnimationFrame(measure);
    // 字体加载完再测一次（支持的浏览器）
    if (document?.fonts?.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(measure));
    }
    return () => cancelAnimationFrame(raf);
  }, [text, measure]);

  // 监听尺寸变化
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    // 父容器变化也会影响，观察父级一层（可选）
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [measure]);

  const base = (
    <div
      ref={ref}
      className={[
        'truncate whitespace-nowrap overflow-hidden',
        className,
      ].join(' ')}
    >
      {text}
    </div>
  );

  if (!truncated) return base;

  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{base}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align={align}
            className="
              z-[200] rounded-[8px] bg-[#5E6064] px-[12px] py-[11px] text-[16px] text-white shadow-lg backdrop-blur border border-[#26282E]
              max-w-[400px] text-sm outline-none select-text">
            {text}
            <Tooltip.Arrow className="fill-[#5E6064]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
