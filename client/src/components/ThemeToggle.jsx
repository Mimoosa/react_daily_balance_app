import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// ThemeToggle component, uses theme context to toggle theme from light to dark
const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors duration-200 ${theme.backgroundActive} ${theme.backgroundHover}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <FontAwesomeIcon 
        icon={isDark ? faSun : faMoon} 
        className={`w-5 h-5 ${theme.textWhite}`}
      />
    </button>
  );
};

export default ThemeToggle;