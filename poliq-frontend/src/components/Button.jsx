// src/components/Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Button variants
const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white dark:bg-blue-700 dark:hover:bg-blue-600 dark:active:bg-blue-500',
  secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:text-gray-300 dark:border-gray-600',
  outlined: 'bg-transparent hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-600 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/20 dark:active:bg-blue-900/30',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-500'
};

// Button sizes
const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3'
};

// Loading spinner component
const LoadingSpinner = ({ className = "w-4 h-4" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to = null,
  href = null,
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
    transform hover:scale-[1.02] active:scale-[0.98]
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // Content with loading state and icon
  const content = (
    <>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </span>
      )}
      <span className={`flex items-center ${isLoading ? 'invisible' : ''}`}>
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </span>
    </>
  );

  // Render as Link if "to" prop is provided
  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {content}
      </Link>
    );
  }

  // Render as anchor if "href" prop is provided
  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {content}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
