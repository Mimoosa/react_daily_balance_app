import { useTheme } from '../contexts/ThemeContext';

// ThemeToggle component, uses theme context to toggle theme from light to dark
const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <div className="flex justify-center items-start min-h-screen">
    <button 
      onClick={toggleTheme}
      className={`${theme.background} px-4 py-2 rounded ${theme.primary}`}
    >
      Switch to {isDark ? 'Light' : 'Dark'} Mode
    </button>
    </div>
  );
};

export default ThemeToggle;