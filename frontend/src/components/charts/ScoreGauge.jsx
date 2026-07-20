import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

export const ScoreGauge = ({ score = 0, className }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Smooth count-up animation on mount or score change
  useEffect(() => {
    let animationFrameId;
    const start = 0;
    const end = Math.min(Math.max(0, score), 100);
    const duration = 800; // 800ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Quadratic ease-out formula
      const easeOutQuad = progress * (2 - progress);
      const currentVal = Math.round(start + easeOutQuad * (end - start));
      
      setDisplayScore(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [score]);

  // Determine CSS variable color according to locked score bands
  const getScoreColorVar = (val) => {
    if (val >= 80) return 'var(--color-score-emerald)';
    if (val >= 50) return 'var(--color-score-amber)';
    return 'var(--color-score-red)';
  };

  const getScoreTextColorClass = (val) => {
    if (val >= 80) return 'text-score-emerald';
    if (val >= 50) return 'text-score-amber';
    return 'text-score-red';
  };

  const scoreColor = getScoreColorVar(score);
  const textColorClass = getScoreTextColorClass(score);

  // Data formatted for Recharts RadialBarChart
  const data = [
    {
      name: 'Score',
      value: displayScore,
      fill: scoreColor,
    },
  ];

  return (
    <div className={clsx('relative flex flex-col items-center justify-center w-full aspect-square max-w-[240px] mx-auto', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="95%"
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            min={0}
            max={100}
            background={{ fill: 'var(--color-border)', opacity: 0.3 }}
            dataKey="value"
            cornerRadius={7}
            isAnimationActive={false} // Animation handled by custom count-up hook
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={clsx('text-5xl font-extrabold tracking-tight transition-colors duration-300', textColorClass)}>
          {displayScore}
        </span>
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-1">
          ATS Score
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
