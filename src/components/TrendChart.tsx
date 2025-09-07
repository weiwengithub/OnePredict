"use client";

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: Array<{ time: string; value: number }>;
  color?: string;
  height?: number;
  isPositive?: boolean;
}

export default function TrendChart({
  data,
  color = "#10b981",
  height = 40,
  isPositive = true
}: TrendChartProps) {
  const chartColor = isPositive ? "#10b981" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color || chartColor}
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
