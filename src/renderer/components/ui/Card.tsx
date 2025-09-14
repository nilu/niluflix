import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
}) => {
  const baseClasses = 'bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transition-all duration-300';
  const hoverClasses = hover ? 'hover:bg-white/10 hover:border-white/20 cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickClasses} ${className}`;

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};

export default Card;
