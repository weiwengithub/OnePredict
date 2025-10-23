"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { colors } from "@/assets/config";

interface OutcomeDatum {
  name: string;
  value?: number; // 支持直接传 value
  prob?: number;  // 也支持传 prob（0~1）
  roi?: number;   // 兼容外部结构，非必需
}

interface SemicircleGaugeProps {
  outcomes: OutcomeDatum[];
  activeIndex?: number | null; // 外部控制高亮项
}

export default function SemicircleGauge({ outcomes, activeIndex }: SemicircleGaugeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const lastHoverIndexRef = useRef<number | null>(null);

  const option = useMemo(() => ({
    color: colors,
    tooltip: false,
    series: [
      {
        name: 'Outcomes',
        type: 'pie',
        radius: ['78%', '90%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 40,
          borderColor: 'transparent',
          borderWidth: 0,
        },
        emphasis: {
          // 选中时外圈加粗 2px（通过缩放实现视觉加粗），无需描边颜色
          scale: true,
          scaleSize: 1.2,
          itemStyle: {
            borderWidth: 0,
            borderColor: 'transparent',
            shadowBlur: 0,
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
            formatter: (p: any) => `${(Number(p.value)*100).toFixed(2)}%`,
          }
        },
        // 中心文字：默认隐藏，hover 高亮时显示为“栏目 + 值”
        label: { show: false, position: 'center' },
        labelLine: { show: false },
        startAngle: 180,
        endAngle: 360,
        data: outcomes?.length ? outcomes.map((item: any) => ({ value: Number(item.prob || item.value || 0), name: item.name })) : [],
      },
    ],
  }), [outcomes]);

  useEffect(() => {
    let echartsInstance: any;
    let echartsMod: any;
    const init = async () => {
      try {
        echartsMod = await import('echarts');
        if (!containerRef.current) return;
        echartsInstance = echartsMod.init(containerRef.current);
        chartRef.current = echartsInstance;
        echartsInstance.setOption(option);
        // 默认高亮第一个扇区
        try {
          if (Array.isArray(outcomes) && outcomes.length > 0) {
            lastHoverIndexRef.current = 0;
            echartsInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 });
            echartsInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 0 });
          }
        } catch {}
        // 悬停其它扇区时：取消默认高亮，仅高亮当前悬停项
        try {
          echartsInstance.on('mouseover', (p: any) => {
            try {
              const idx = typeof p?.dataIndex === 'number' ? p.dataIndex : null;
              if (idx == null) return;
              lastHoverIndexRef.current = idx;
              echartsInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 });
              echartsInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: idx });
            } catch {}
          });
          echartsInstance.on('globalout', () => {
            try {
              const keepIdx = lastHoverIndexRef.current;
              echartsInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 });
              if (keepIdx != null) {
                echartsInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: keepIdx });
              }
            } catch {}
          });
        } catch {}
        const resize = () => { try { echartsInstance && echartsInstance.resize(); } catch {} };
        window.addEventListener('resize', resize);
      } catch (e) {
        // 忽略运行时导入异常（未安装依赖时）
        // console.warn('echarts init error', e);
      }
    };
    init();
    return () => {
      try { chartRef.current && chartRef.current.dispose(); } catch {}
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    try {
      if (chartRef.current) {
        chartRef.current.setOption(option, true);
        // 重新设置后，若已有最后悬停项则恢复其高亮；否则默认高亮第一个
        try {
          chartRef.current.dispatchAction({ type: 'downplay', seriesIndex: 0 });
          const keepIdx = lastHoverIndexRef.current != null ? lastHoverIndexRef.current : (outcomes?.length ? 0 : null);
          if (keepIdx != null) {
            chartRef.current.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: keepIdx });
            lastHoverIndexRef.current = keepIdx;
          }
        } catch {}
      }
    } catch {}
  }, [option]);

  // 外部主动控制高亮索引
  useEffect(() => {
    if (chartRef.current == null) return;
    if (activeIndex == null || Number.isNaN(activeIndex)) return;
    try {
      chartRef.current.dispatchAction({ type: 'downplay', seriesIndex: 0 });
      chartRef.current.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: activeIndex });
      lastHoverIndexRef.current = activeIndex;
    } catch {}
  }, [activeIndex]);

  return (
    <div className="w-full flex items-center justify-center">
      <div ref={containerRef} style={{ width: '100%', height: 120 }} />
    </div>
  );
}
