import React, { useState } from 'react';
import { AlertTriangle, X, Info, AlertOctagon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const AlertBanner = ({ severity = 'medium', message, title, onDismiss, className }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const variants = {
    low: {
      container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      title: 'text-emerald-400'
    },
    medium: {
      container: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
      icon: <Info className="w-5 h-5 text-amber-400" />,
      title: 'text-amber-400'
    },
    high: {
      container: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      title: 'text-orange-400'
    },
    critical: {
      container: 'bg-rose-500/10 border-rose-500/20 text-rose-200',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      title: 'text-rose-400'
    }
  };

  const style = variants[severity] || variants.medium;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className={clsx(
            'relative overflow-hidden rounded-xl border backdrop-blur-md p-4 shadow-glass',
            style.container,
            className
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1">
              {title && (
                <h4 className={clsx('font-bold font-heading mb-1', style.title)}>
                  {title}
                </h4>
              )}
              <p className="text-sm font-body opacity-90 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
          
          {/* Decorative Glow */}
          <div className={clsx('absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-20', style.title.replace('text-', 'bg-'))} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;
