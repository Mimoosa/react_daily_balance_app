import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import JournalPage from './pages/JournalPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage'
import ActivityReportPage from './pages/ActivityReportPage'



const AppContent = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className={`${theme.primary}`}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/activity" element={<ActivityReportPage />} />
          </Route>
        </Routes>
     
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
