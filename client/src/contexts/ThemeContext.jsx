import { createContext, useState, useContext, useEffect } from 'react';
import { themes } from './themeConfig';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // Check for saved theme preference or use system preference
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Use system preference as fallback
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const [isDark, setIsDark] = useState(getInitialTheme());
    const theme = isDark ? themes.dark : themes.light;

    // Add or remove dark class on body when theme changes
    useEffect(() => {
        // Save preference to localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update document classes
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark-theme');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
