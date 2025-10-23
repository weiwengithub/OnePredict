"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Sun from "@/assets/icons/sun.svg";
import Moon from "@/assets/icons/moon.svg";
import Monitor from "@/assets/icons/monitor.svg";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchIcon from "@/assets/icons/search.svg";
import React from "react";

interface ThemeToggleProps {
  variant?: 'simple' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ variant = 'simple', size = 'md' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center size-[36px] border-[1px] border-solid border-white/60 text-white
                hover:border-white rounded-[20px] cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <Sun className={`h-${iconSize/4} w-${iconSize/4} rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`} />
            <Moon className={`absolute h-${iconSize/4} w-${iconSize/4} rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`} />
            <span className="sr-only">切换主题</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-card/95 backdrop-blur-sm border-border/50"
        >
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 h-4 w-4" />
            <span>浅色</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            <span>深色</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>跟随系统</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="group relative w-9 h-9 bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-full transition-all duration-300 overflow-hidden"
    >
      {/* 背景动画层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />

      {/* 太阳图标 */}
      <Sun
        className={`absolute h-5 w-5 text-white/70 group-hover:text-white transition-all duration-300 transform ${
          actualTheme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
        style={{ transformOrigin: 'center' }}
      />

      {/* 月亮图标 */}
      <Moon
        className={`absolute h-5 w-5 text-white/70 group-hover:text-white transition-all duration-300 transform ${
          actualTheme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
        style={{ transformOrigin: 'center' }}
      />

      {/* 波纹效果 */}
      <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />

      <span className="sr-only">切换主题</span>
    </Button>
  );
}

// 固定位置的主题切换器（右下角）
export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* 背景光晕效果 */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />

        <ThemeToggle variant="dropdown" size="lg" />
      </div>
    </div>
  );
}
