import { useTheme } from '../../Contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== THEME TOGGLE CLICKED ===');
    console.log('1. Current theme state:', theme);
    console.log('2. HTML classes before:', document.documentElement.classList.toString());
    console.log('3. toggleTheme function:', typeof toggleTheme);
    
    // Directly toggle the theme - don't rely on function
    const currentTheme = theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log('4. Calculated new theme:', newTheme);
    
    // Apply directly to DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('5. HTML classes after direct application:', root.classList.toString());
    console.log('6. localStorage after direct application:', localStorage.getItem('theme'));
    
    // Call toggle function to update React state
    toggleTheme();
    
    // Force check what happened
    setTimeout(() => {
      const htmlClasses = document.documentElement.classList.toString();
      const storedTheme = localStorage.getItem('theme');
      console.log('7. HTML classes after 100ms:', htmlClasses);
      console.log('8. localStorage theme:', storedTheme);
      console.log('9. Has dark class?', htmlClasses.includes('dark'));
      console.log('10. Has light class?', htmlClasses.includes('light'));
      console.log('========================');
      
      // If class still wasn't applied, force it
      if (!htmlClasses.includes('dark') && !htmlClasses.includes('light')) {
        console.warn('⚠️ No theme class found! Forcing dark mode...');
        root.classList.add(storedTheme || 'light');
        console.log('Forced class. New classes:', root.classList.toString());
      }
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="relative inline-flex items-center justify-center w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-200 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? (
          <span className="text-lg">🌙</span>
        ) : (
          <span className="text-lg">☀️</span>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;

