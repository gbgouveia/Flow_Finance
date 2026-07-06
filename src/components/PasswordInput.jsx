import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const PasswordInput = React.forwardRef(({
  label,
  error,
  className,
  wrapperClassName,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className={clsx('flex flex-col gap-1 w-full', wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-text-secondary pointer-events-none">
          <Lock size={16} />
        </div>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={clsx(
            'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-bg-card/50 text-text-primary text-sm transition-all focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 placeholder:text-text-secondary/40',
            error ? 'border-brand-red focus:ring-brand-red focus:border-brand-red' : 'border-border-custom focus:bg-bg-card',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
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

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
