"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Customized,
} from "recharts";
import * as React from "react";

type Props = {
  value: number;         // 当前值
  min?: number;          // 最小值，默认 0
  max?: number;          // 最大值，默认 100
  orientation?: "up" | "down"; // 上半圆 or 下半圆，默认 up
  trackColor?: string;   // 轨道颜色
  gradientFrom?: string; // 渐变起色
  gradientTo?: string;   // 渐变止色
  thickness?: number;    // 圆环厚度（px），默认 22
  showNeedle?: boolean;  // 显示指针，默认 true
  showMinMax?: boolean;  // 显示两端刻度文本，默认 true
  className?: string;
  // 中心文本自定义
  renderCenter?: (percent: number, value: number) => React.ReactNode;
};

export default function SemiGauge({
                                    value,
                                    min = 0,
                                    max = 100,
                                    orientation = "up",
                                    trackColor = "rgba(255,255,255,0.12)",
                                    gradientFrom = "#477CFC",
                                    gradientTo = "#00FFEE",
                                    thickness = 22,
                                    showNeedle = true,
                                    showMinMax = true,
                                    className,
                                    renderCenter,
                                  }: Props) {
  const clamped = Math.min(Math.max(value, min), max);
  const percent = (clamped - min) / Math.max(1, max - min);

  // 半圆角度设置（Recharts：0°在正右，角度顺时针增加；90°向下，270°向上）
  const startAngle = 180; // 左端
  const endAngle = orientation === "up" ? 360 : 0; // up: 上半圆, down: 下半圆

  // 两个扇区来表示进度（前段为进度，后段为剩余，后段透明让底轨显现）
  const arcData = React.useMemo(
    () => [
      { name: "value", value: percent || 0.00001 }, // 避免 0 时完全不渲染
      { name: "rest", value: Math.max(0.00001, 1 - percent) },
    ],
    [percent]
  );

  // 底轨：一整个半圆
  const trackData = [{ name: "track", value: 1 }];

  // 用于 <defs> id 防冲突
  const gid = React.useId();

  return (
    <div className={className}>
      {/* 容器高度建议是宽度的一半（上/下半圆） */}
      <ResponsiveContainer width="100%" height={48}>
        <PieChart>
          {/* 渐变定义 */}
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>

          {/* 底轨 */}
          <Pie
            data={trackData}
            dataKey="value"
            startAngle={startAngle}
            endAngle={endAngle}
            cx="50%"
            cy="100%"                      // 以底边为圆心的半圆
            innerRadius={80}
            outerRadius={80 + thickness}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={trackColor} />
          </Pie>

          {/* 进度弧 */}
          <Pie
            data={arcData}
            dataKey="value"
            startAngle={startAngle}
            endAngle={endAngle}
            cx="50%"
            cy="100%"
            innerRadius={80}
            outerRadius={80 + thickness}
            stroke="none"
            isAnimationActive
            animationDuration={600}
            cornerRadius={thickness / 2}
          >
            {/* 前段：渐变色 */}
            <Cell fill={`url(#${gid})`} />
            {/* 后段：透明，露出底轨 */}
            <Cell fill="transparent" />
          </Pie>

          {/* 自定义层：指针 + 文本 */}
          <Customized
            component={
              <NeedleAndLabels
                percent={percent}
                min={min}
                max={max}
                orientation={orientation}
                showNeedle={showNeedle}
                showMinMax={showMinMax}
                // 与 Pie 设置一致
                innerR={80}
                outerR={80 + thickness}
                renderCenter={renderCenter}
                value={clamped}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function NeedleAndLabels(props: {
  cx?: number;
  cy?: number;
  viewBox?: any;
  percent: number;
  min: number;
  max: number;
  orientation: "up" | "down";
  showNeedle: boolean;
  showMinMax: boolean;
  innerR: number;
  outerR: number;
  renderCenter?: (percent: number, value: number) => React.ReactNode;
  value: number;
}) {
  // Recharts 会把 viewBox 传给 Customized 组件
  const { cx = 0, cy = 0, percent, min, max, orientation, showNeedle, showMinMax, innerR, outerR, renderCenter, value } =
    props;

  const radius = (innerR + outerR) / 2;
  const startAngle = 180;
  const endAngle = orientation === "up" ? 360 : 0;
  const ang = startAngle + (endAngle - startAngle) * percent; // 0..1 映射到半圆
  const rad = (Math.PI / 180) * ang;

  // 指针末端坐标（SVG 坐标：x→右，y→下）
  const x = cx + radius * Math.cos(rad);
  const y = cy + radius * Math.sin(rad);

  // 中心文本（自定义 or 默认）
  const centerNode =
    renderCenter?.(percent, value) ?? (
      <g>
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize="28" fontWeight={700} fill="currentColor">
          {Math.round(value)}
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="12" fill="currentColor" opacity={0.6}>
          {min} — {max}
        </text>
      </g>
    );

  // 两端刻度文本
  const minX = cx + outerR * Math.cos((Math.PI / 180) * startAngle);
  const minY = cy + outerR * Math.sin((Math.PI / 180) * startAngle);
  const maxX = cx + outerR * Math.cos((Math.PI / 180) * endAngle);
  const maxY = cy + outerR * Math.sin((Math.PI / 180) * endAngle);

  return (
    <g>
      {/* 指针 */}
      {showNeedle && (
        <g>
          <line x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={5} fill="currentColor" />
        </g>
      )}

      {/* 中心文本 */}
      {centerNode}

      {/* 两端刻度 */}
      {showMinMax && (
        <>
          <text x={minX} y={minY} dy={orientation === "up" ? -6 : 14} textAnchor="start" fontSize="12" fill="currentColor" opacity={0.7}>
            {min}
          </text>
          <text x={maxX} y={maxY} dy={orientation === "up" ? -6 : 14} textAnchor="end" fontSize="12" fill="currentColor" opacity={0.7}>
            {max}
          </text>
        </>
      )}
    </g>
  );
}
