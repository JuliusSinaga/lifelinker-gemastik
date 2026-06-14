import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'standard', 
  className = '', 
  ...props 
}) => {
  const baseClass = 'core-card';
  const variantClass = `core-card-${variant}`;

  return (
    <div className={[baseClass, variantClass, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
};

export default Card;
