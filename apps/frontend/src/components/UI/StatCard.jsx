import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const StatCard = ({ value, label, icon, color = 'blue', className }) => {
  const colorVariants = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    yellow: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-rose-400',
  };

  const iconBgVariants = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    yellow: 'bg-amber-500/20 text-amber-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-rose-400',
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
          <h3 className="text-3xl font-bold font-heading text-white tracking-tight mb-1">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-400 font-body">{label}</p>
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