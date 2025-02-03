import { useTheme } from '../contexts/ThemeContext';

// ThemeToggle component, uses theme context to toggle theme from light to dark
const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      className={`${theme.background} px-4 py-2 rounded ${theme.primary}`}
    >
      Switch to {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
};

export default ThemeToggle;