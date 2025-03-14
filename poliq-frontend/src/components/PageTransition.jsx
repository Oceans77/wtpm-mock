// src/components/PageTransition.jsx
import { useEffect } from 'react';

// Simplified page transition component that doesn't cause content to disappear
const PageTransition = ({ children }) => {
  // Apply the animation class once on mount
  useEffect(() => {
    const mainContent = document.querySelector('.page-content');
    if (mainContent) {
      mainContent.classList.add('animate-fade-in');
      
      // Remove animation class after it completes to avoid interference with future page loads
      const timer = setTimeout(() => {
        mainContent.classList.remove('animate-fade-in');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="page-content">
      {children}
    </div>
  );
};

export default PageTransition;
