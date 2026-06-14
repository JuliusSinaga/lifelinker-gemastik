import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

const Icon = ({ icon, className = '', style = {}, width = 24, height = 24, ...props }) => {
  return (
    <IconifyIcon 
      icon={icon} 
      className={className}
      style={{ ...style }}
      width={width}
      height={height}
      {...props} 
    />
  );
};

export default Icon;
