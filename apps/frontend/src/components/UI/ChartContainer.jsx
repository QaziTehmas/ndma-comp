import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const ChartContainer = ({ 
  title, 
  description,
  children, 
  loading, 
  error,
  height = 300,
  className,
  actions
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={twMerge(
        'bg-background-light backdrop-blur-md border border-border-color rounded-xl p-6 shadow-lg relative overflow-hidden',
        'hover:shadow-xl transition-shadow duration-300',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Header */}
      {(title || description || actions) && (
        <div className="relative z-10 flex items-start justify-between mb-6 pb-4 border-b border-border-color">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold font-heading text-text-primary tracking-wide mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-text-secondary font-body">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Chart Content */}
      <div className={twMerge('w-full relative', `h-[${height}px]`)} style={{ height: `${height}px` }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-light/90 z-10 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-secondary font-body">Loading data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-light/90 z-10 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <div className="text-risk-critical mb-2 font-semibold">⚠️ Failed to load</div>
              <div className="text-sm text-text-secondary">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartContainer;
