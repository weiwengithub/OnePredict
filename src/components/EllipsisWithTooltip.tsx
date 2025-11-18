'use client';

import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

type Props = {
  text: string;
  className?: string;
  delayDuration?: number;
  side?: 'top'|'right'|'bottom'|'left';
  align?: 'start'|'center'|'end';
  lines?: number;
};

export default function EllipsisWithTooltip({
  text,
  className = '',
  delayDuration = 300,
  side = 'top',
  align = 'start',
  lines = 1,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [truncated, setTruncated] = React.useState(false);

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const eps = 1;

    // 对多行情况，主要用高度判断是否溢出；单行时宽度也可以判断
    const overflowX = el.scrollWidth - el.clientWidth > eps;
    const overflowY = el.scrollHeight - el.clientHeight > eps;

    const isTruncated = overflowX || overflowY;
    setTruncated(isTruncated);
  }, []);

  React.useEffect(() => {
    const raf = requestAnimationFrame(measure);
    if (document?.fonts?.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(measure));
    }
    return () => cancelAnimationFrame(raf);
  }, [text, measure, lines]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [measure]);

  const base = (
    <div
      ref={ref}
      className={[
        lines === 1
          ? 'truncate whitespace-nowrap overflow-hidden'
          : 'overflow-hidden break-words',
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
              z-[200] rounded-[8px] bg-[#5E6064] px-[12px] py-[11px] text-[16px] text-white shadow-lg backdrop-blur
              border border-[#26282E] max-w-[400px] text-sm outline-none select-text
            "
          >
            {text}
            <Tooltip.Arrow className="fill-[#5E6064]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
