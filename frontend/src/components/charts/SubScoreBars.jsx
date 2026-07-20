import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].payload.name;

    const getScoreTextColorClass = (val) => {
      if (val >= 80) return 'text-score-emerald';
      if (val >= 50) return 'text-score-amber';
      return 'text-score-red';
    };

    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-elevated text-xs flex flex-col gap-1 animate-scale-in">
        <p className="font-semibold text-text">{name}</p>
        <p className="font-bold text-sm text-text">
          Score: <span className={getScoreTextColorClass(value)}>{value}/100</span>
        </p>
      </div>
    );
  }
  return null;
};

export const SubScoreBars = ({
  formatting = 0,
  keywordMatch = 0,
  structure = 0,
  readability = 0,
  length = 0,
  className
}) => {
  const data = [
    { name: 'Formatting', value: formatting },
    { name: 'Keyword Match', value: keywordMatch },
    { name: 'Structure', value: structure },
    { name: 'Readability', value: readability },
    { name: 'Length', value: length },
  ];

  const getBarColor = (val) => {
    if (val >= 80) return 'var(--color-score-emerald)';
    if (val >= 50) return 'var(--color-score-amber)';
    return 'var(--color-score-red)';
  };

  return (
    <div className={clsx('w-full h-[240px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            horizontal={false}
            stroke="var(--color-border)"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="var(--color-text-secondary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="var(--color-text)"
            fontSize={12}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.1 }} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            barSize={12}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.value)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubScoreBars;
