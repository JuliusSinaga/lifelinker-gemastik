import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  className = '', 
  type = 'button',
  fullWidth = false,
  as: Component = 'button',
  ...props 
}) => {
  const baseClass = 'core-btn';
  const variantClass = `core-btn-${variant}`;
  const sizeClass = `core-btn-${size}`;
  const widthClass = fullWidth ? 'core-btn-full' : '';

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={[baseClass, variantClass, sizeClass, widthClass, className].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
