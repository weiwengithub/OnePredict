'use client';
import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import ArrowDownIcon from '@/assets/icons/arrowDown.svg';

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

type Item = React.ReactNode;

interface Props {
  items: Item[];
  className?: string;
  /** 视觉上的 gap（px），要与 Tailwind 的 gap-x-* 对齐，例如 gap-2 => 8 */
  itemGapPx?: number;
  /** 包裹每个 item 的类（建议在这里写 padding/圆角/边框等视觉样式） */
  itemClassName?: string;
  moreLabel?: string;
  renderMoreButton?: (hiddenCount: number) => React.ReactNode;
  openOnHover?: boolean;
}

export default function InlineOverflowList({
  items,
  className,
  itemGapPx = 8,
  itemClassName,
  moreLabel = '更多',
  renderMoreButton,
  openOnHover = true,
}: Props) {
  const rowRef = React.useRef<HTMLDivElement | null>(null);           // 可见行
  const measureRowRef = React.useRef<HTMLDivElement | null>(null);     // 隐形测量行
  const ghostMoreBtnRef = React.useRef<HTMLButtonElement | null>(null);// 幽灵“更多”按钮（测宽）
  const [itemWidths, setItemWidths] = React.useState<number[]>([]);
  const [moreBtnWidth, setMoreBtnWidth] = React.useState<number>(56);  // 给个保底宽度，初始不为 0
  const [visibleCount, setVisibleCount] = React.useState(items.length);
  const [showMore, setShowMore] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // —— 用“真实 JSX”克隆测量每个 item 宽度 —— //
  React.useLayoutEffect(() => {
    const row = measureRowRef.current;
    if (!row) return;
    // 读取每个 child 的 offsetWidth
    const children = Array.from(row.children) as HTMLElement[];
    const widths = children.map((el) => el.offsetWidth);
    setItemWidths(widths);
  }, [items, itemClassName]);

  // —— 测量“更多”按钮宽度（用幽灵按钮渲染“更多 (99+)”等上限文案，保证预留足够空间） —— //
  const updateMoreWidth = React.useCallback(() => {
    const w = ghostMoreBtnRef.current?.offsetWidth ?? 56;
    setMoreBtnWidth(w);
  }, []);
  React.useEffect(() => {
    updateMoreWidth();
  }, [updateMoreWidth, moreLabel]);

  const recompute = React.useCallback(() => {
    const el = rowRef.current;
    if (!el || itemWidths.length === 0) return;

    const containerW = el.clientWidth;

    // 尝试全部放下（不留按钮）
    let total = 0;
    let cnt = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      const gap = i === 0 ? 0 : itemGapPx;
      if (total + gap + itemWidths[i] <= containerW) {
        total += gap + itemWidths[i];
        cnt++;
      } else break;
    }
    if (cnt === items.length) {
      setVisibleCount(items.length);
      setShowMore(false);
      return;
    }

    // 需要预留“更多”按钮空间（使用幽灵按钮测得宽度，略加余量）
    const reserved = moreBtnWidth + 8;
    let total2 = 0;
    let cnt2 = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      const gap = i === 0 ? 0 : itemGapPx;
      if (total2 + gap + itemWidths[i] + reserved <= containerW) {
        total2 += gap + itemWidths[i];
        cnt2++;
      } else break;
    }
    setVisibleCount(cnt2);
    setShowMore(cnt2 < items.length);
  }, [itemWidths, itemGapPx, items.length, moreBtnWidth]);

  // 尺寸监听
  React.useEffect(() => {
    if (!rowRef.current) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, [recompute]);

  React.useEffect(() => {
    recompute();
  }, [recompute, itemWidths, moreBtnWidth]);

  const visibleItems = React.useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hiddenItems = React.useMemo(() => items.slice(visibleCount), [items, visibleCount]);

  const onMouseEnter = () => {
    if (!openOnHover) return;
    if (window.matchMedia?.('(pointer:fine)').matches) setOpen(true);
  };
  const onMouseLeave = () => {
    if (!openOnHover) return;
    if (window.matchMedia?.('(pointer:fine)').matches) setOpen(false);
  };

  return (
    <div className={cx('relative w-full', className)}>
      {/* 可见行：单行、不换行、溢出隐藏 */}
      <div
        ref={rowRef}
        className={cx(
          'relative flex items-center gap-2 whitespace-nowrap overflow-hidden',
          '[mask-image:linear-gradient(to_right,black_85%,transparent)]'
        )}
      >
        {visibleItems.map((it, i) => (
          <span key={i} className={cx('inline-flex shrink-0 items-center', itemClassName)}>
            {it}
          </span>
        ))}

        {/* 右侧更多（绝对定位） */}
        {showMore && (
          <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <ArrowDownIcon className="text-[16px] text-white/60" />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="center"
                  sideOffset={6}
                  className={cx(
                    'z-50 w-[192px] bg-[#010A2C] border border-white/20 rounded-[8px] px-[24px] py-[16px] outline-none leading-relaxed',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=open]:fade-in data-[state=closed]:fade-out'
                  )}
                >
                  <div className="flex flex-col gap-2">
                    {hiddenItems.map((it, idx) => (
                      <span key={idx} className={cx('inline-flex shrink-0 items-center', itemClassName)}>
                        {it}
                      </span>
                    ))}
                  </div>
                  <Popover.Arrow className="fill-popover" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}
      </div>

      {/* —— 隐形测量区 ——
          1) 完整渲染所有 item（包同样的 wrapper 类），拿 offsetWidth = 真实宽度
          2) 幽灵“更多”按钮测宽，使用最大文案确保足量预留
      */}
      <div className="absolute inset-0 invisible pointer-events-none">
        <div
          ref={measureRowRef}
          className={cx('inline-flex gap-2 whitespace-nowrap', /* gap-2 要和上面一致 */)}
          style={{ position: 'absolute', top: -9999, left: -9999 }}
        >
          {items.map((it, i) => (
            <span key={i}>
              {it}
            </span>
          ))}
        </div>

        <button
          ref={ghostMoreBtnRef}
          type="button"
          className="px-2 py-1 text-sm rounded-md border"
          style={{ position: 'absolute', top: -9999, left: -9999 }}
        >
          {/* 用上限文案保证测出的宽度足够，比如 99+ */}
          {renderMoreButton ? renderMoreButton(99) : `${moreLabel} (99+)`}
        </button>
      </div>
    </div>
  );
}
