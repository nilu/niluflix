import React from 'react';
import { motion } from 'framer-motion';

interface FilterToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <motion.label
      className={`
        flex items-center space-x-3 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          className={`
            w-12 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-blue-600' : 'bg-gray-600'}
            ${disabled ? 'bg-gray-500' : ''}
          `}
          animate={{
            backgroundColor: checked ? '#2563eb' : '#4b5563'
          }}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{
              x: checked ? 24 : 2
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        </motion.div>
      </div>
      <span className="text-sm font-medium text-white">
        {label}
      </span>
    </motion.label>
  );
};

export default FilterToggle;
