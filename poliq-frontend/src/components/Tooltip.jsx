// src/components/Tooltip.jsx
import React from 'react';

const Tooltip = ({ 
  children, 
  text, 
  position = 'top', 
  width = 'auto',
  delay = false,
  alwaysVisible = false
}) => {
  // Convert position to CSS classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full bottom-auto -translate-y-2 translate-y-full';
      case 'left':
        return 'right-full left-auto top-1/2 -translate-y-1/2 -translate-x-2';
      case 'right':
        return 'left-full right-auto top-1/2 -translate-y-1/2 translate-x-2';
      case 'top':
      default:
        return 'bottom-full top-auto -translate-y-2';
    }
  };

  // Get arrow position classes
  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full border-transparent border-b-gray-800 dark:border-b-gray-700';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-transparent border-l-gray-800 dark:border-l-gray-700';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-transparent border-r-gray-800 dark:border-r-gray-700';
      case 'top':
      default:
        return 'top-full border-transparent border-t-gray-800 dark:border-t-gray-700';
    }
  };

  return (
    <div className={`tooltip relative inline-block ${alwaysVisible ? 'tooltip-visible' : ''}`}>
      {children}
      <div 
        className={`
          tooltip-text z-50 ${alwaysVisible ? 'visible opacity-100' : 'invisible opacity-0'} absolute
          px-3 py-2 text-xs font-medium text-white
          bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg
          whitespace-nowrap
          ${getPositionClasses()}
          ${width !== 'auto' ? `w-${width} whitespace-normal text-center` : ''}
          ${delay ? 'transition-delay-tooltip' : 'transition-all duration-300 ease-in-out'}
        `}
      >
        {text}
        <div 
          className={`
            absolute h-0 w-0
            border-4
            ${getArrowClasses()}
          `}
        />
      </div>
    </div>
  );
};

export default Tooltip;
