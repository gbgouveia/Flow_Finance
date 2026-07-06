import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  className,
  openClassName,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const alignments = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left" {...props}>
      {/* Trigger */}
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger || (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-custom bg-bg-card/50 rounded-lg text-text-secondary hover:text-text-primary hover:border-brand-purple/30 hover:bg-bg-card transition-all cursor-pointer focus:outline-none"
          >
            Opções
            <ChevronDown size={14} className={clsx('transition-transform', isOpen && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute mt-1.5 w-48 rounded-lg border border-border-custom bg-bg-card p-1 shadow-2xl glass-panel z-30',
              alignments[align],
              openClassName
            )}
          >
            {items.map((item, idx) => {
              if (item.separator) {
                return <div key={`sep-${idx}`} className="h-px bg-border-custom my-1" />;
              }

              const Icon = item.icon;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer text-left focus:outline-none',
                    item.danger
                      ? 'text-brand-red hover:bg-brand-red/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )}
                >
                  {Icon && <Icon size={14} className={clsx(item.danger ? 'text-brand-red' : 'text-text-secondary group-hover:text-text-primary')} />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
