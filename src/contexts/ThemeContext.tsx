"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  // 检测系统主题偏好
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  // 计算实际应用的主题
  const calculateActualTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  }, [getSystemTheme]);

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const actual = calculateActualTheme(newTheme);
    setActualTheme(actual);

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }

    // 更新HTML类名
    updateHTMLTheme(actual);
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 更新HTML主题类名
  const updateHTMLTheme = (actualTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(actualTheme);

      // 添加主题切换动画类
      root.classList.add('theme-transition');
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }
  };

  // 初始化主题
  useEffect(() => {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'system';

    const actual = calculateActualTheme(initialTheme);
    setThemeState(initialTheme);
    setActualTheme(actual);
    updateHTMLTheme(actual);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newActual = getSystemTheme();
        setActualTheme(newActual);
        updateHTMLTheme(newActual);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
