import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
import Navbar from './components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home'



const AppContent = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className={`${theme.primary}`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <ThemeToggle />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
