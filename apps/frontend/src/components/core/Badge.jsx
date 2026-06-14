import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'info', 
  className = '',
  ...props 
}) => {
  return (
    <span className={`core-badge core-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
