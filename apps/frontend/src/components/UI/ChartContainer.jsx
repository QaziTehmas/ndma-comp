import React from 'react';
import { motion } from 'framer-motion';

const ChartContainer = ({ title, children, loading, error }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card-bg/50 backdrop-blur-md border border-border-color rounded-xl p-6 shadow-glass relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-heading text-text-primary tracking-wide border-l-4 border-primary pl-3">
          {title}
        </h3>
      </div>

      <div className="w-full h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-light/80 z-10 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400 font-body">Loading data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-light/80 z-10 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <div className="text-risk-critical mb-2">⚠️ Failed to load</div>
              <div className="text-sm text-gray-400">{error}</div>
            </div>
          </div>
        )}

        {children}
      </div>
    </motion.div>
  );
};

export default ChartContainer;
