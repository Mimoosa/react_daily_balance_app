import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JournalPage from './pages/JournalPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ActivityReportPage from './pages/ActivityReportPage';
import FriendButton from './components/friends/FriendButton';
import ProfilePage from './pages/ProfilePage';
import DebugPointsPage from './pages/DebugPointsPage';

const AppContent = () => {
  const { theme } = useTheme();
  const [shouldShowFriendsButton, setShouldShowFriendsButton] = useState(true);
  const isDev = import.meta.env.DEV;

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
            <Route path="/profile" element={<ProfilePage />} />
            {isDev && (
              <Route path="/debug/points" element={<DebugPointsPage />} />
            )}
          </Route>
        </Routes>
        {shouldShowFriendsButton && <FriendButton />}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;