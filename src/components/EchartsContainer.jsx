import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

export default function EchartsContainer({
  option,
  style,
  className,
  isLoading = false,
  ...props
}) {
  const chartRef = useRef(null);
  const { isDark } = useTheme();

  // Resize chart when window dimensions change
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const chartInstance = chartRef.current.getEchartsInstance();
        chartInstance.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync ECharts themes with Flow Finance design tokens
  const themeColors = {
    text: isDark ? '#A1A1AA' : '#4B5563',
    line: isDark ? '#27272A' : '#E5E7EB',
    tooltipBg: isDark ? '#202024' : '#FFFFFF',
    tooltipBorder: isDark ? '#27272A' : '#E5E7EB',
    tooltipText: isDark ? '#FAFAFA' : '#111827',
  };

  // Merge default styling into options for a consistent luxurious aesthetic
  const mergedOption = option ? {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
      color: themeColors.text,
    },
    grid: {
      top: '12%',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true,
      ...option.grid,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: themeColors.tooltipBg,
      borderColor: themeColors.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: themeColors.tooltipText,
        fontSize: 12,
      },
      extraCssText: 'backdrop-filter: blur(8px); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); border-radius: 8px; padding: 10px;',
      ...option.tooltip,
    },
    ...option,
  } : {};

  return (
    <div className={clsx('relative w-full h-full min-h-[300px]', className)} style={style}>
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-card/25 backdrop-blur-sm rounded-xl border border-border-custom skeleton-pulse">
          <svg className="animate-spin h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-text-secondary mt-3 font-semibold uppercase tracking-wider font-manrope">
            Carregando Gráficos...
          </span>
        </div>
      ) : (
        <ReactECharts
          ref={chartRef}
          option={mergedOption}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          {...props}
        />
      )}
    </div>
  );
}
