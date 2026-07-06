import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1 w-full', wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-text-secondary pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg border bg-bg-card/50 text-text-primary text-sm transition-all focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 placeholder:text-text-secondary/40',
            Icon ? 'pl-10' : 'pl-4',
            error ? 'border-brand-red focus:ring-brand-red focus:border-brand-red' : 'border-border-custom focus:bg-bg-card',
            className
          )}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-brand-red mt-0.5"
          >
            {error.message || error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
