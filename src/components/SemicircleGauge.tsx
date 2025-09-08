"use client";

import React from 'react';

interface SemicircleGaugeProps {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export default function SemicircleGauge({
  percentage = 25,
  label = "Chance",
  size = 200,
  strokeWidth = 12,
  backgroundColor = "#1e293b",
  progressColor = "#f97316"
}: SemicircleGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const circumference = Math.PI * radius; // 半圆周长
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: size,
          height: (size + 16) / 2
        }}
      >
        <div className="absolute">
          <svg
            width={size}
            height={(size + 16) / 2}
            viewBox={`0 0 ${size} ${(size + 16) / 2}`}
          >
            {/* Background semicircle */}
            <path
              d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
              stroke="#4C657B"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
            />

            {/* Progress semicircle */}
            <path
              d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${progressColor}60)`
              }}
            />
          </svg>

          {/* Center content */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              bottom: '-24px',
              left: 0,
              width: size,
              height: '48px'
            }}
          >
            <div className="text-[16px] leading-[24px] font-bold text-white">
              {percentage}%
            </div>
            <div className="text-[12px] leading-[24px] text-white/60">
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
