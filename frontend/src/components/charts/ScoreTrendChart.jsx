import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    const getScoreTextColorClass = (val) => {
      if (val >= 80) return 'text-score-emerald';
      if (val >= 50) return 'text-score-amber';
      return 'text-score-red';
    };

    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-elevated text-xs flex flex-col gap-1 animate-scale-in">
        <p className="font-semibold text-text-secondary">{label}</p>
        <p className="font-bold text-sm text-text">
          Score: <span className={getScoreTextColorClass(value)}>{value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ScoreTrendChart = ({ data = [], className }) => {
  return (
    <div className={clsx('w-full h-[240px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--color-border)"
          />
          <XAxis
            dataKey="label"
            stroke="var(--color-text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--color-text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#scoreTrendGradient)"
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
