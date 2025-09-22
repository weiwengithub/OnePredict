import type React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';

interface ProgressBarProps {
  initialValue?: number;
  showHeader?: boolean;
  showLabel?: boolean;
  onChange?: (value: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  initialValue = 25,
  showHeader = false,
  showLabel = false,
  onChange
}) => {
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Snap to nearest 5% increment
  const snapToIncrement = useCallback((val: number): number => {
    return Math.round(val / 5) * 5;
  }, []);

  // Update value with animation
  const updateValue = useCallback((newValue: number, withAnimation = true) => {
    const snappedValue = snapToIncrement(newValue);
    if (snappedValue !== value) {
      if (withAnimation) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      setValue(snappedValue);
      onChange?.(snappedValue);
    }
  }, [value, snapToIncrement, onChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFocused) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        updateValue(Math.max(0, value - 5));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        updateValue(Math.min(100, value + 5));
        break;
      case 'Home':
        e.preventDefault();
        updateValue(0);
        break;
      case 'End':
        e.preventDefault();
        updateValue(100);
        break;
    }
  }, [isFocused, value, updateValue]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAnimating(false);
    e.preventDefault();
    containerRef.current?.focus();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const snappedValue = snapToIncrement(clampedPercentage);

    setValue(snappedValue);
    onChange?.(snappedValue);
  }, [isDragging, onChange, snapToIncrement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAnimating(false);
    e.preventDefault();
    containerRef.current?.focus();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !progressBarRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const snappedValue = snapToIncrement(clampedPercentage);

    setValue(snappedValue);
    onChange?.(snappedValue);
  }, [isDragging, onChange, snapToIncrement]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click to jump
  const handleBarClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    updateValue(clampedPercentage, true);
  }, [isDragging, updateValue]);

  // Focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const markers = [0, 25, 50, 75, 100];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto outline-none transition-all duration-200 px-[12px]"
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="slider"
      aria-label="Purchase Percentage"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
    >
      {/* Header */}
      {showHeader && (
        <div className="mb-[18px] h-[19px] leading-[19px] text-[16px] text-[#DEDEDE]] flex justify-between">
          <div>Purchase Percentage</div>
          <div>{value}%</div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Progress Bar Track */}
        <div
          ref={progressBarRef}
          className="relative h-[2px] bg-white/60 rounded-full cursor-pointer mx-2"
          onClick={handleBarClick}
        >
          {/* Filled Progress */}
          <div
            className={`absolute top-0 left-0 h-full bg-white rounded-full ${
              isAnimating ? 'transition-all duration-300 ease-out' : 'transition-all duration-150'
            }`}
            style={{ width: `${value}%` }}
          />

          {/* Markers */}
          {markers.map((marker) => (
            <div
              key={marker}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${marker}%` }}
            >
              <div
                className={`w-[6px] h-[6px] rounded-full border-[2px] transition-all duration-200 ${
                  marker <= value
                    ? 'bg-white border-white'
                    : 'bg-white/60 border-white/60'
                }`}
              />
            </div>
          ))}

          {/* Draggable Handle */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none ${
              isAnimating ? 'transition-all duration-300 ease-out' : 'transition-all duration-150'
            }`}
            style={{ left: `${value}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div
              className={`w-[12px] h-[12px] bg-white rounded-full border-[2px] border-white shadow-lg hover:scale-110 transition-transform ${
                isDragging ? 'scale-110 shadow-xl' : ''
              } ${
                isFocused ? 'ring-2 ring-white/60 ring-opacity-50' : ''
              }`}
            />
          </div>
        </div>

        {/* Labels */}
        {showLabel && (
          <div className="flex justify-between mt-4">
            {markers.map((marker) => (
              <div className={`w-[16px] h-[19px] ${marker > 0 ? "flex" : ""}  ${marker === 100 ? "justify-end" : "justify-center"}`} key={marker}>
                <div className="h-[19px] leading-[19px] text-[16px] text-white/60">{marker}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
