import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'adaptive';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'adaptive';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'adaptive') {
        setIsDarkMode(e.matches);
      }
    };

    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial dark mode based on theme mode and system preference
    if (themeMode === 'adaptive') {
      setIsDarkMode(systemDarkMode.matches);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }

    // Listen for system theme changes
    systemDarkMode.addEventListener('change', handleSystemThemeChange);

    return () => {
      systemDarkMode.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 