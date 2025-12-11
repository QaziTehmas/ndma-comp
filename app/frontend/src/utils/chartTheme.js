/**
 * Unified Chart Theme Configuration
 * Provides consistent chart styling across all screens with theme support
 */

/**
 * Get chart colors based on current theme
 */
export const getChartColors = (theme) => {
  const isDark = theme === 'dark';
  
  return {
    // Primary colors
    primary: isDark ? '#06b6d4' : '#0284c7', // Cyan (dark) / Sky (light)
    primaryDark: isDark ? '#0891b2' : '#0369a1',
    primaryLight: isDark ? '#22d3ee' : '#38bdf8',
    
    // Text colors
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    
    // Grid and border colors
    grid: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)',
    border: isDark ? '#334155' : '#e2e8f0',
    
    // Background colors
    background: isDark ? '#0f172a' : '#ffffff',
    backgroundSecondary: isDark ? '#1e293b' : '#f8fafc',
    
    // Chart data colors (consistent palette)
    colors: [
      isDark ? '#06b6d4' : '#0284c7', // Primary/Cyan
      isDark ? '#22d3ee' : '#38bdf8', // Light Cyan/Sky
      isDark ? '#10b981' : '#16a34a', // Green/Emerald
      isDark ? '#f59e0b' : '#d97706', // Amber/Orange
      isDark ? '#f97316' : '#ea580c', // Orange
      isDark ? '#f43f5e' : '#dc2626', // Red/Rose
      isDark ? '#8b5cf6' : '#7c3aed', // Purple/Violet
      isDark ? '#ec4899' : '#db2777', // Pink
    ],
    
    // Status colors
    success: isDark ? '#10b981' : '#16a34a',
    warning: isDark ? '#f59e0b' : '#d97706',
    error: isDark ? '#f43f5e' : '#dc2626',
    info: isDark ? '#06b6d4' : '#0284c7',
  };
};

/**
 * Get base chart options for Recharts
 */
export const getRechartsConfig = (theme) => {
  const colors = getChartColors(theme);
  const isDark = theme === 'dark';
  
  return {
    // Common styling
    textColor: colors.text,
    gridColor: colors.grid,
    borderColor: colors.border,
    
    // Tooltip configuration
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: isDark 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      labelStyle: {
        color: colors.text,
        fontWeight: 600,
        fontSize: '13px',
      },
      itemStyle: {
        color: colors.textSecondary,
        fontSize: '12px',
      },
    },
    
    // Legend configuration
    legend: {
      wrapperStyle: {
        color: colors.text,
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    
    // Axis configuration
    axis: {
      stroke: colors.textSecondary,
      tick: {
        fill: colors.textSecondary,
        fontSize: 11,
      },
      label: {
        fill: colors.textSecondary,
        fontSize: 12,
      },
    },
    
    // Grid configuration
    grid: {
      stroke: colors.grid,
      strokeDasharray: '3 3',
    },
  };
};

/**
 * Get Chart.js options with theme support
 */
export const getChartJSOptions = (theme, customOptions = {}) => {
  const colors = getChartColors(theme);
  const isDark = theme === 'dark';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text,
          font: {
            size: 12,
            weight: '600',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: isDark 
          ? 'rgba(15, 23, 42, 0.98)' 
          : 'rgba(255, 255, 255, 0.98)',
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 13,
          weight: '600',
        },
        bodyFont: {
          size: 12,
        },
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
        },
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
        },
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
      },
    },
    ...customOptions,
  };
};

/**
 * Get dataset styles for Chart.js
 */
export const getChartJSDatasetStyle = (theme, colorIndex = 0) => {
  const colors = getChartColors(theme);
  const color = colors.colors[colorIndex % colors.colors.length];
  
  return {
    borderColor: color,
    backgroundColor: `${color}20`, // 20% opacity
    pointBackgroundColor: color,
    pointBorderColor: colors.background,
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: color,
    pointHoverBorderColor: colors.background,
    pointHoverBorderWidth: 2,
    tension: 0.4, // Smooth curves
  };
};

/**
 * Get bar chart dataset style
 */
export const getBarChartStyle = (theme, colorIndex = 0) => {
  const colors = getChartColors(theme);
  const color = colors.colors[colorIndex % colors.colors.length];
  
  return {
    fill: color,
    stroke: color,
    strokeWidth: 1,
  };
};

/**
 * Get area chart dataset style
 */
export const getAreaChartStyle = (theme, colorIndex = 0) => {
  const colors = getChartColors(theme);
  const color = colors.colors[colorIndex % colors.colors.length];
  
  return {
    fill: color,
    fillOpacity: 0.3,
    stroke: color,
    strokeWidth: 2,
  };
};

/**
 * Hook to get chart theme configuration
 * Must be used inside a React component
 */
export const useChartTheme = () => {
  // Dynamic import to avoid circular dependency
  const { useTheme } = require('../context/ThemeContext');
  const { theme } = useTheme();
  const colors = getChartColors(theme);
  const rechartsConfig = getRechartsConfig(theme);
  const chartJSOptions = getChartJSOptions(theme);
  
  return {
    theme,
    colors,
    rechartsConfig,
    chartJSOptions,
    getDatasetStyle: (colorIndex) => getChartJSDatasetStyle(theme, colorIndex),
    getBarStyle: (colorIndex) => getBarChartStyle(theme, colorIndex),
    getAreaStyle: (colorIndex) => getAreaChartStyle(theme, colorIndex),
  };
};

