// src/components/ToastProvider.jsx
import { Toaster } from 'react-hot-toast';

export const toastConfig = {
  success: {
    duration: 4000,
    style: {
      background: '#10B981',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: '✅',
  },
  error: {
    duration: 5000,
    style: {
      background: '#EF4444',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    icon: '❌',
  },
  loading: {
    duration: Infinity,
    style: {
      background: '#3B82F6',
      color: '#FFFFFF',
      fontWeight: 500,
    },
  },
  custom: {
    duration: 4000,
    style: {
      fontWeight: 500,
    },
  },
};

// Enhanced Toast Provider with animations
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        className: 'toast-enter',
        style: {
          maxWidth: '500px',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          fontWeight: 500,
        },
        // Setup specific toast types
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
        custom: toastConfig.custom,
      }}
    />
  );
};

export default ToastProvider;

// Usage Example:
// import toast from 'react-hot-toast';
//
// // Success toast with animation
// toast.success('Question submitted successfully!');
//
// // Error toast with animation
// toast.error('Something went wrong.');
//
// // Custom toast with animation
// toast.custom((t) => (
//   <div
//     className={`${
//       t.visible ? 'toast-enter' : 'toast-exit'
//     } flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg`}
//   >
//     <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//     </svg>
//     <span className="text-gray-800 dark:text-gray-200">Custom notification with icon</span>
//   </div>
// ));
