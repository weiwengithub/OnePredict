"use client";
import React from "react";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";

type Props = {
  text: string | React.ReactNode;
  /** 默认最多显示的行数 */
  maxLines?: number; // default 4
  /** “查看更多”按钮文案 */
  moreLabel?: React.ReactNode; // default: '查看更多'
  /** “收起”按钮文案 */
  lessLabel?: React.ReactNode; // default: '收起'
  /** 包裹文本的类名（可自定义字体、颜色、大小等） */
  className?: string;
  /** 是否显示底部渐隐遮罩（仅收起时） */
  showFade?: boolean; // default true
  /** 点击展开/收起时回调 */
  onToggle?: (expanded: boolean) => void;
};

export function ClampableText({
                                text,
                                maxLines = 4,
                                className = "",
                                showFade = false,
                                onToggle,
                              }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false); // 是否超出需要折叠
  const [measured, setMeasured] = React.useState(false); // 防止测量前按钮闪烁

  // 计算是否溢出：在“收起”状态下对比 scrollHeight / clientHeight
  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 临时强制为收起状态以便测量
    const prev = el.style.webkitLineClamp;
    const wasExpanded = expanded;
    if (wasExpanded) {
      el.style.webkitLineClamp = String(maxLines);
      el.style.display = "-webkit-box";
      el.style.webkitBoxOrient = "vertical";
      el.style.overflow = "hidden";
    }
    // 读尺寸
    const needClamp = el.scrollHeight > el.clientHeight + 1; // +1 防抖
    setOverflowing(needClamp);
    setMeasured(true);
    // 还原
    if (wasExpanded) {
      el.style.webkitLineClamp = "";
      el.style.display = "";
      el.style.webkitBoxOrient = "";
      el.style.overflow = "";
    }
  }, [expanded, maxLines]);

  React.useEffect(() => {
    // 初次与后续布局变化时测量
    measure();
  }, [measure, text, maxLines]);

  // 监听容器尺寸变化，动态文本/窗口改变时重算
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!expanded) measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, measure]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onToggle?.(next);
  };

  // 收起样式：多行截断（webkit 方案，主流浏览器可用）
  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
      display: "-webkit-box",
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    };

  return (
    <div className="relative">
      <div ref={ref} className={className} style={clampStyle}>
        {text}
      </div>

      {/* 渐隐遮罩：仅在收起且溢出时显示 */}
      {showFade && overflowing && !expanded && (
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-12"
          style={{
            // 从透明过渡到背景色；根据你的主题可改为实际背景
            background:
              "linear-gradient(to bottom, rgba(5,26,61,0), rgba(5,26,61,1))",
          }}
        />
      )}

      {/* 底部按钮：仅在溢出时显示；未测量完成前不渲染避免闪烁 */}
      {measured && overflowing && (
        <div
          className="mt-[24px] h-[24px] flex items-center justify-center text-white text-[48px] cursor-pointer"
          onClick={toggle}
        >
          <ArrowDownIcon className={`transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`} />
        </div>
      )}
    </div>
  );
}
