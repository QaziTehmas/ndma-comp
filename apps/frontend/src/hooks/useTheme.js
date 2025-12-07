import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Function to check if dark mode is active
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Initial check
    checkTheme();

    // Observer to watch for class changes on html element
    const observer = new MutationObserver(checkTheme);
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const themeColors = {
    text: isDark ? '#f1f5f9' : '#0f172a',
    grid: isDark ? '#334155' : '#e2e8f0',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#f1f5f9' : '#0f172a',
    axis: isDark ? '#94a3b8' : '#64748b',
  };

  return { isDark, themeColors };
};
