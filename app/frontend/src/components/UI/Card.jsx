import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Professional Card Component with theme support
 * Provides consistent styling across all screens
 */
const Card = ({ 
  children, 
  className, 
  variant = 'default', // 'default', 'elevated', 'outlined', 'gradient'
  hover = false,
  padding = 'default', // 'none', 'sm', 'default', 'lg'
  ...props 
}) => {
  const baseClasses = 'relative overflow-hidden rounded-xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-background-light border-border-color shadow-md',
    elevated: 'bg-background-light border-border-color shadow-lg',
    outlined: 'bg-transparent border-2 border-border-color shadow-none',
    gradient: 'bg-gradient-to-br from-background-light to-background border-border-color shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      {...props}
    >
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        'flex items-center justify-between mb-6 pb-4 border-b border-border-color',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 
      className={twMerge(
        'text-lg font-semibold font-heading text-text-primary tracking-wide',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card Description Component
 */
export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p 
      className={twMerge(
        'text-sm text-text-secondary font-body',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * Card Content Component
 */
export const CardContent = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge('', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        'flex items-center justify-between mt-6 pt-4 border-t border-border-color',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

