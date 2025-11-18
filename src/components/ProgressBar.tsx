import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';

interface ProgressBarProps {
  value?: number;
  initialValue?: number;
  step?: number;
  showHeader?: boolean;
  showLabel?: boolean;
  onChange?: (value: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value: valueProp,
  initialValue = 0,
  step = 5,
  showHeader = false,
  showLabel = false,
  onChange
}) => {
  const [uncontrolled, setUncontrolled] = useState(initialValue);
  const isControlled = valueProp !== undefined;

  // 显示用的当前值
  const currentValue = isControlled ? valueProp! : uncontrolled;

  // 通用取整（步进为 0/负值则视为禁用取整，只夹 0~100）
  const snapTo = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    if (step && step > 0) {
      return Math.round(clamped / step) * step;
    }
    return clamped;
  }, [step]);

  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 统一的更新函数：受控 → 只触发 onChange；非受控 → 改内部 state + onChange
  const commit = useCallback((next: number, withAnimation = true) => {
    const snapped = snapTo(next);
    if (snapped === currentValue) return;

    if (withAnimation) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    if (isControlled) onChange?.(snapped);
    else {
      setUncontrolled(snapped);
      onChange?.(snapped);
    }
  }, [currentValue, isControlled, onChange, snapTo]);

  // 如果使用“非受控”模式，当 initialValue 改变时同步一次（可选）
  useEffect(() => {
    if (!isControlled) setUncontrolled(initialValue);
  }, [initialValue, isControlled]);

  // 键盘
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFocused) return;
    const s = step && step > 0 ? step : 1;

    if (["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"].includes(e.key)) e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown': commit(currentValue - s); break;
      case 'ArrowRight':
      case 'ArrowUp':   commit(currentValue + s); break;
      case 'Home':      commit(0); break;
      case 'End':       commit(100); break;
    }
  }, [isFocused, currentValue, commit, step]);

  // 鼠标拖动 / 点击
  const percentFromClientX = (clientX: number) => {
    const rect = progressBarRef.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAnimating(false);
    e.preventDefault();
    containerRef.current?.focus();
  }, []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressBarRef.current) return;
    commit(percentFromClientX(e.clientX), false);
  }, [isDragging, commit]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAnimating(false);
    e.preventDefault();
    containerRef.current?.focus();
  }, []);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !progressBarRef.current) return;
    e.preventDefault();
    commit(percentFromClientX(e.touches[0].clientX), false);
  }, [isDragging, commit]);
  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleBarClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || !progressBarRef.current) return;
    commit(percentFromClientX(e.clientX), true);
  }, [isDragging, commit]);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const markers = [0,25,50,75,100];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto outline-none transition-all duration-200 px-[12px]"
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={currentValue}
      aria-valuetext={`${currentValue}%`}
      aria-label="Purchase Percentage"
    >
      {/* 你的渲染保持不变，只把 value 替换为 currentValue */}
      <div className="relative">
        <div
          ref={progressBarRef}
          className="relative h-[2px] bg-white/60 rounded-full cursor-pointer mx-2"
          onClick={handleBarClick}
        >
          <div
            className={`absolute top-0 left-0 h-full bg-white rounded-full ${
              isAnimating ? 'transition-all duration-300 ease-out' : 'transition-all duration-150'
            }`}
            style={{ width: `${currentValue}%` }}
          />
          {markers.map(m => (
            <div key={m} className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2" style={{ left: `${m}%` }}>
              <div className={`w-[6px] h-[6px] rounded-full border-[2px] transition-all duration-200 ${
                m <= currentValue ? 'bg-white border-white' : 'bg-white/60 border-white/60'
              }`} />
            </div>
          ))}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none ${
              isAnimating ? 'transition-all duration-300 ease-out' : 'transition-all duration-150'
            }`}
            style={{ left: `${currentValue}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className={`w-[12px] h-[12px] bg-white rounded-full border-[2px] border-white shadow-lg hover:scale-110 transition-transform ${
              isDragging ? 'scale-110 shadow-xl' : ''
            } ${isFocused ? 'ring-2 ring-white/60 ring-opacity-50' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
