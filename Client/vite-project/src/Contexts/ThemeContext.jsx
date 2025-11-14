import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Apply theme class to document
  useEffect(() => {
    console.log('[ThemeContext] useEffect triggered. Theme:', theme);
    const root = document.documentElement;
    console.log('[ThemeContext] HTML classes before useEffect:', root.classList.toString());
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    console.log('[ThemeContext] HTML classes after useEffect:', root.classList.toString());
    localStorage.setItem('theme', theme);
    console.log('[ThemeContext] Theme saved to localStorage:', theme);
  }, [theme]);

  const toggleTheme = () => {
    const currentTheme = theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log('Toggle function called. Current:', currentTheme, 'New:', newTheme);
    
    // Immediately apply to DOM - do this BEFORE state update
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('Class applied to HTML:', root.classList.toString());
    console.log('localStorage set to:', newTheme);
    
    // Then update state
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

