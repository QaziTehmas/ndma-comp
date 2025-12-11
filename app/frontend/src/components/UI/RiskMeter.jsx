import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const RiskMeter = ({ value, label, size = 'md', showValue = true }) => {
  // Normalize value to 0-100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Determine color based on value
  let color = '#10B981'; // Low (Green)
  if (normalizedValue > 33) color = '#F59E0B'; // Medium (Yellow)
  if (normalizedValue > 66) color = '#EF4444'; // High (Red)

  const data = [
    { name: 'Risk', value: normalizedValue },
    { name: 'Safe', value: 100 - normalizedValue },
  ];

  const sizeConfig = {
    sm: { width: 100, height: 60, inner: 30, outer: 40, fontSize: 'text-lg' },
    md: { width: 160, height: 90, inner: 50, outer: 70, fontSize: 'text-2xl' },
    lg: { width: 220, height: 120, inner: 70, outer: 90, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div style={{ width: config.width, height: config.height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={config.inner}
              outerRadius={config.outer}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#334155" /> {/* Slate-700 for background track */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Needle/Value Overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end">
          {showValue && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`font-bold font-heading dark:text-white ${config.fontSize}`}
            >
              {normalizedValue}%
            </motion.div>
          )}
        </div>
      </div>
      
      {label && (
        <div className="mt-2 text-sm font-medium text-gray-400 font-body text-center">
          {label}
        </div>
      )}
      
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 blur-2xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} 
      />
    </div>
  );
};

export default RiskMeter;
