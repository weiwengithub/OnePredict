'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ViewportContextValue = {
  isMobile: boolean;
  width: number;
};

const ViewportContext = createContext<ViewportContextValue | null>(null);

function getIsMobileByWidth(w: number) {
  return w < 768; // 你也可以改成 tailwind 的 md 断点等
}

export const ViewportProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // 初始值：在 SSR 阶段没有 window，这里给一个“安全默认值”
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1024 : window.innerWidth);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    // 用 resize 监听
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const value = useMemo<ViewportContextValue>(() => {
    return { isMobile: getIsMobileByWidth(width), width };
  }, [width]);

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>;
};

export function useViewport() {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error('useViewport must be used within <ViewportProvider />');
  }
  return ctx;
}

// 也可以导出一个更语义化的 Hook
export function useIsMobile() {
  return useViewport().isMobile;
}
