import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import Card from './Card';
import clsx from 'clsx';

// Simple and highly performant count up component
function AnimatedCounter({ value, duration = 1000, formatter }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Strip non-numeric characters for calculation except decimals
    const numericTarget = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericTarget)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericTarget;
    if (start === end) return;

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const current = start + (end - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  if (typeof value !== 'number') {
    return <span>{value}</span>;
  }

  return <span>{formatter ? formatter(displayValue) : displayValue.toFixed(2)}</span>;
}

export default function StatsCard({
  title,
  value,
  change,
  subtext,
  icon: Icon,
  iconColor = 'purple',
  formatter,
  isLoading = false,
  className
}) {
  const trendUp = change >= 0;

  const colorStyles = {
    purple: 'text-brand-purple bg-brand-purple/10',
    blue: 'text-brand-blue bg-brand-blue/10',
    green: 'text-brand-green bg-brand-green/10',
    yellow: 'text-brand-yellow bg-brand-yellow/10',
    red: 'text-brand-red bg-brand-red/10',
  };

  const borderGlows = {
    purple: 'hover:border-brand-purple/40',
    blue: 'hover:border-brand-blue/40',
    green: 'hover:border-brand-green/40',
    yellow: 'hover:border-brand-yellow/40',
    red: 'hover:border-brand-red/40',
  };

  if (isLoading) {
    return (
      <div className="relative rounded-xl border border-border-custom bg-bg-card/50 p-6 glass-panel flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded skeleton-pulse" />
          <div className="h-8 w-8 rounded-lg skeleton-pulse" />
        </div>
        <div className="h-8 w-36 rounded skeleton-pulse" />
        <div className="h-3 w-48 rounded skeleton-pulse" />
      </div>
    );
  }

  return (
    <Card className={clsx('flex flex-col gap-4 hover:bg-bg-card/70', borderGlows[iconColor], className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
          {title}
        </span>
        {Icon && (
          <div className={clsx('p-2 rounded-lg flex items-center justify-center', colorStyles[iconColor])}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold font-sora text-text-primary">
          <AnimatedCounter value={value} formatter={formatter} />
        </div>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={clsx(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium',
              trendUp ? 'text-brand-green bg-brand-green/10' : 'text-brand-red bg-brand-red/10'
            )}>
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-text-secondary">
              {subtext || 'vs. mês anterior'}
            </span>
          </div>
        )}
        
        {!change && subtext && (
          <div className="text-xs text-text-secondary mt-1">
            {subtext}
          </div>
        )}
      </div>
    </Card>
  );
}
