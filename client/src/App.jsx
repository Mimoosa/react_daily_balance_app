import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import ThemeToggle from './components/ThemeToggle';



const AppContent = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className={`${theme.primary} p-4`}>
        <h1 className="text-2xl font-bold mb-4">Daily Balance App</h1>
        <ThemeToggle />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
