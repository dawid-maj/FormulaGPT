import React, { createContext, useContext, useEffect, useState } from 'react';

const ScaleContext = createContext();

export const ScaleProvider = ({ children, baseWidth = 1400, maxScale = 1 }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / baseWidth;
      const newScale = Math.min(maxScale, scaleX);
      document.documentElement.style.setProperty('--app-scale', newScale);
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [baseWidth, maxScale]);

  return (
    <ScaleContext.Provider value={scale}>
      {children}
    </ScaleContext.Provider>
  );
};

export const useScale = () => {
  const context = useContext(ScaleContext);
  if (context === undefined) {
    throw new Error('useScale must be used within a ScaleProvider');
  }
  return context;
};
