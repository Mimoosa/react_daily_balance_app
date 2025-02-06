import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import ThemeToggle from './components/ThemeToggle';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import JournalPage from './pages/JournalPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage'



const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className={`${theme.primary}`}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
        {!(location.pathname === "/" || location.pathname === "/login" || location.pathname === "/anotherPath") && <ThemeToggle />}
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
