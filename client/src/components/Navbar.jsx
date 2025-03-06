import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '../contexts/icons';
import { faCalendarDay, faBook, faChartSimple, faUser, faBug } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import devService from '../services/devApi';

const Navbar = ({ isOpen, setIsOpen }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  // Dev env check - only show dev button in development environment
  const isDev = import.meta.env.DEV;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsOpen(false);
    navigate('/login');
  };

  const handleResetUserData = async () => {
    if (window.confirm('This will delete ALL your journals and reset points to 100. Continue?')) {
      try {
        setResetStatus('loading');
        const result = await devService.resetUserData();
        setResetStatus('success');
        console.log('Reset successful:', result);

        alert('User data reset successfully. Points set to 100.');

        setTimeout(() => {
          setResetStatus(null);
          window.location.reload();
        }, 3000);
      } catch (error) {
        setResetStatus('error');
        console.error('Reset failed:', error);
        alert(`Reset failed: ${error.message}`);

        setTimeout(() => {
          setResetStatus(null);
        }, 3000);
      }
    }
  };

  const handleDebugPoints = async () => {
    try {
      setResetStatus('loading');
      const result = await devService.debugPoints();
      console.log('Points debug result:', result);
      
      if (result.updated) {
        alert('Points structure repaired successfully.');
      } else {
        alert('Points structure is already valid. No repairs needed.');
      }
      
      setResetStatus(null);
      setShowDevOptions(false);
    } catch (error) {
      console.error('Debug points failed:', error);
      alert(`Debug points failed: ${error.message}`);
      setResetStatus(null);
    }
  };

  return (
    <nav className={`${theme.backgroundViolet} px-4 py-3 shadow-lg flex justify-between lg:items-center`}>
      <Link to="/" className={`text-xl font-bold ${theme.textWhite}`}>
        DailyBalance
      </Link>
      
      <div className="flex flex-col">
        <div className="block lg:hidden ml-auto pr-4 pt-0 mb-0">
          <button onClick={() => { setIsOpen(!isOpen); }} className="text-white focus:outline-none">
            <FontAwesomeIcon 
              icon={isOpen ? faTimes : faBars} 
              className="text-xl"
            />
          </button>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden'} ml-auto mr-4 lg:block`}>
          {isAuthenticated && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
              <Link to="/journal" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faBook} className="mr-1" /> Journal
              </Link>
              <Link to="/activity" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faCalendarDay} className="mr-1" /> Daily Report
              </Link>
              <Link to="/dashboard" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faChartSimple} className="mr-1" /> Dashboard
              </Link>
              <Link to="/profile" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faUser} className="mr-1" /> Profile
              </Link>
              {/* Theme toggle */}
              <div className="mt-2 lg:mt-0 flex justify-center items-center">
                <ThemeToggle />
              </div>

              {/* Dev Button - only visible in development environment */}
              {isDev && (
                <div className="relative mt-2 lg:mt-0">

                    <button
                      onClick={() => setShowDevOptions(!showDevOptions)}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
                    >
                      <FontAwesomeIcon icon={faBug} className="mr-1" /> Dev
                    </button>

                  {showDevOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={handleResetUserData}
                          disabled={resetStatus === 'loading'}
                          className={`w-full text-left px-4 py-2 text-sm ${resetStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                            }`}
                        >
                          {resetStatus === 'loading' ? 'Resetting...' : 'Reset All Data (Points=100)'}
                        </button>
                        
                        <button
                          onClick={handleDebugPoints}
                          disabled={resetStatus === 'loading'}
                          className={`w-full text-left px-4 py-2 text-sm ${resetStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                            }`}
                        >
                          {resetStatus === 'loading' ? 'Debugging...' : 'Debug & Repair Points'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleLogout}
                className={`bg-violet-100 text-violet-800 px-4 py-1 rounded mt-2 lg:mt-0`}
              >
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex flex-col lg:flex-row lg:space-x-4 mt-2 lg:mt-0">
              <Link to="/login" className="bg-violet-600 text-white px-4 py-1 rounded mt-2 lg:mt-0">
                Login
              </Link>
              <Link to="/register" className="bg-violet-100 text-violet-800 px-4 py-1 rounded mt-2 lg:mt-0">
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;