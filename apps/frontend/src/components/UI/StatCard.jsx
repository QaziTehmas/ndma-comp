import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const StatCard = ({ value, label, icon, color = 'blue', className }) => {
  const colorVariants = {
    blue: 'bg-white/60 from-blue-50/50 to-blue-100/50 border-blue-200 text-blue-700 dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-500/30 dark:text-blue-400',
    green: 'bg-white/60 from-emerald-50/50 to-teal-100/50 border-emerald-200 text-emerald-700 dark:from-emerald-500/20 dark:to-teal-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
    yellow: 'bg-white/60 from-amber-50/50 to-orange-100/50 border-amber-200 text-amber-700 dark:from-amber-500/20 dark:to-orange-500/20 dark:border-amber-500/30 dark:text-amber-400',
    orange: 'bg-white/60 from-orange-50/50 to-red-100/50 border-orange-200 text-orange-700 dark:from-orange-500/20 dark:to-red-500/20 dark:border-orange-500/30 dark:text-orange-400',
    red: 'bg-white/60 from-red-50/50 to-rose-100/50 border-red-200 text-red-700 dark:from-red-500/20 dark:to-rose-500/20 dark:border-red-500/30 dark:text-rose-400',
  };

  const iconBgVariants = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    yellow: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-rose-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.3 }}
      className={twMerge(
        'relative overflow-hidden rounded-xl border backdrop-blur-md bg-gradient-to-br p-6 shadow-glass',
        colorVariants[color],
        className
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-3xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-1">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-body">{label}</p>
        </div>
        <div className={twMerge('p-3 rounded-lg', iconBgVariants[color])}>
          {icon}
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
};

export default StatCard;
