import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  name, 
  size = 40, 
  className = '',
  ...props 
}) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

  return (
    <div 
      className={`core-avatar ${className}`} 
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="core-avatar-img" />
      ) : (
        <span className="core-avatar-initials">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
