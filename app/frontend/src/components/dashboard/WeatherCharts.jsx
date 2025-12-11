import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Calculate trend direction and stats
 */
const calculateTrend = (data, key) => {
  if (!data || data.length < 2) return { direction: 'stable', change: 0, max: null, min: null };

  const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return { direction: 'stable', change: 0, max: null, min: null };

  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first * 100).toFixed(1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const maxIndex = values.indexOf(max);
  const minIndex = values.indexOf(min);

  let direction = 'stable';
  if (change > 5) direction = 'up';
  else if (change < -5) direction = 'down';

  return { direction, change, max, min, maxIndex, minIndex };
};

/**
 * Trend Indicator Component
 */
const TrendIndicator = ({ trend }) => {
  const Icon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
  const color = trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className={`flex items-center gap-1 ${color} text-xs font-semibold`}>
      <Icon className="w-3 h-3" />
      <span>{trend.direction === 'stable' ? 'Stable' : `${Math.abs(trend.change)}%`}</span>
    </div>
  );
};

/**
 * Chart Header Component
 */
const ChartHeader = ({ title, description, trend }) => (
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1">
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {trend && <TrendIndicator trend={trend} />}
  </div>
);

/**
 * Custom animated tooltip
 */
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/95 border border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-md"
    >
      <p className="text-gray-300 text-xs font-semibold mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white font-bold">{entry.value}{unit}</span>
          <span className="text-gray-400 text-xs">{entry.name}</span>
        </div>
      ))}
    </motion.div>
  );
};

/**
 * Temperature Forecast Chart - Enhanced with labels and insights
 */
export const TemperatureForecastChart = ({ forecast24h }) => {
  if (!forecast24h || forecast24h.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-sm">No temperature data available</div>;
  }

  const data = forecast24h.map(item => ({
    hour: `${item.hour}:00`,
    temperature: item.temperature ? Math.round(item.temperature) : null,
  }));

  const trend = useMemo(() => calculateTrend(data, 'temperature'), [data]);

  return (
    <div>
      <ChartHeader
        title="🌡️ Temperature Trend"
        description="24-hour temperature forecast in degrees Celsius"
        trend={trend}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: '180px', width: '100%' }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="hour"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: '°C', position: 'insideTopLeft', fill: '#9ca3af', fontSize: 10 }}
            />
            {trend.max && (
              <ReferenceLine
                y={trend.max}
                stroke="#22c55e"
                strokeDasharray="3 3"
                label={{ value: `Max: ${trend.max}°C`, fill: '#22c55e', fontSize: 10, position: 'top' }}
              />
            )}
            {trend.min && (
              <ReferenceLine
                y={trend.min}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: `Min: ${trend.min}°C`, fill: '#3b82f6', fontSize: 10, position: 'bottom' }}
              />
            )}
            <Tooltip content={<CustomTooltip unit="°C" />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={3}
              fill="url(#tempGrad)"
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

/**
 * Precipitation Chart - Enhanced
 */
export const PrecipitationChart = ({ forecast24h }) => {
  if (!forecast24h || forecast24h.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-sm">No precipitation data available</div>;
  }

  const data = forecast24h.map(item => ({
    hour: `${item.hour}:00`,
    precipitation: item.precipitation || 0,
    rain: item.rain || 0
  }));

  const trend = useMemo(() => calculateTrend(data, 'precipitation'), [data]);
  const totalRain = data.reduce((sum, item) => sum + item.precipitation, 0).toFixed(1);
  const isDry = data.every(item => item.precipitation === 0);

  return (
    <div className="relative">
      <ChartHeader
        title="🌧️ Precipitation & Rainfall"
        description={`Expected rainfall volume in millimeters (Total: ${totalRain}mm)`}
        trend={trend}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ height: '180px', width: '100%' }}
        className="relative"
      >
        {isDry && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-[1px] rounded-lg z-10 border border-gray-800/50">
            <div className="bg-yellow-500/10 p-3 rounded-full mb-2 ring-1 ring-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <p className="text-gray-300 font-semibold text-sm">No Rain Expected</p>
            <p className="text-gray-500 text-xs mt-0.5">Conditions clear for next 24h</p>
          </div>
        )}

        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} /> {/* Reduced opacity */}
            <XAxis
              dataKey="hour"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              opacity={isDry ? 0.3 : 1}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: 'mm', position: 'insideTopLeft', fill: '#9ca3af', fontSize: 10 }}
              opacity={isDry ? 0.3 : 1}
            />
            <Tooltip content={<CustomTooltip unit="mm" />} cursor={!isDry} />
            <Bar
              dataKey="precipitation"
              fill="#3b82f6"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

/**
 * Humidity & Wind Chart - Enhanced
 */
export const HumidityWindChart = ({ forecast24h }) => {
  if (!forecast24h || forecast24h.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-sm">No humidity/wind data available</div>;
  }

  const data = forecast24h.map(item => ({
    hour: `${item.hour}:00`,
    humidity: item.humidity || 0,
    windSpeed: item.windSpeed || 0
  }));

  const humidityTrend = useMemo(() => calculateTrend(data, 'humidity'), [data]);
  const windTrend = useMemo(() => calculateTrend(data, 'windSpeed'), [data]);

  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">💧 Humidity & 💨 Wind Speed</h4>
          <p className="text-xs text-gray-500">Atmospheric moisture (%) and surface wind velocity (km/h)</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Humidity</p>
            <TrendIndicator trend={humidityTrend} />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Wind</p>
            <TrendIndicator trend={windTrend} />
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ height: '180px', width: '100%' }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="hour"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#06b6d4"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: '%', position: 'insideTopLeft', fill: '#06b6d4', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#8b5cf6"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: 'km/h', position: 'insideTopRight', fill: '#8b5cf6', fontSize: 10 }}
            />
            <Tooltip />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#humidGrad)"
              name="Humidity"
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="windSpeed"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              name="Wind Speed"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
