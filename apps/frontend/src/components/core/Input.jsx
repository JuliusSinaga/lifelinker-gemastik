import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`core-input-wrapper ${className}`}>
      {label && <label htmlFor={inputId} className="core-input-label">{label}</label>}
      <div className="core-input-container">
        {icon && <span className="core-input-icon">{icon}</span>}
        <input 
          id={inputId}
          className={`core-input-field ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props} 
        />
      </div>
      {error && <span className="core-input-error">{error}</span>}
    </div>
  );
};

export default Input;
