import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const StatCard = ({ value, label, icon, color = 'primary', className, trend, trendValue }) => {
  // Theme-aware color variants using CSS variables
  const colorVariants = {
    primary: 'bg-gradient-to-br from-primary/20 to-primary-dark/20 border-primary/30',
    blue: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    yellow: 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30',
    orange: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30',
    cyan: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  };

  const iconBgVariants = {
    primary: 'bg-primary/20 text-primary',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    yellow: 'bg-amber-500/20 text-amber-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ duration: 0.3 }}
      className={twMerge(
        'relative overflow-hidden rounded-xl border backdrop-blur-md bg-gradient-to-br p-6 shadow-lg',
        colorVariants[color],
        className
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-3xl font-bold font-heading text-text-primary tracking-tight mb-1">
            {value}
          </h3>
          <p className="text-sm font-medium text-text-secondary font-body">{label}</p>
          {trend && trendValue && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-xs font-semibold',
              trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-text-muted'
            )}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={twMerge('p-3 rounded-lg', iconBgVariants[color])}>
          <div className={iconColorClasses[color]}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Decorative Glow - Theme aware */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </motion.div>
  );
};

export default StatCard;