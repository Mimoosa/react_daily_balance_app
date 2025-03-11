import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '../contexts/icons';
import { faCalendarDay, faBook, faChartSimple, faUser, faChalkboardTeacher, faChevronDown, faUserCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ isOpen, setIsOpen }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [resetStatus, setResetStatus] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const username = localStorage.getItem('username');

  const isAuthenticated = !!localStorage.getItem('token');

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, [navigate, setIsOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsOpen(false);
    navigate('/login');
  };
  
  return (
    <nav className={`${theme.backgroundViolet} px-4 py-3 shadow-lg flex justify-between lg:items-center relative z-50`}>
      <Link to="/" className={`text-xl font-bold ${theme.textWhite}`}>
        Daily Balance
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:items-center">
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <Link to="/instruction" className={`${theme.textWhite} hover:${theme.textViolet}`}>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-1" /> Instruction
            </Link>
            <Link to="/journal" className={`${theme.textWhite} hover:${theme.textViolet}`}>
              <FontAwesomeIcon icon={faBook} className="mr-1" /> Journal
            </Link>
            <Link to="/activity" className={`${theme.textWhite} hover:${theme.textViolet}`}>
              <FontAwesomeIcon icon={faCalendarDay} className="mr-1" /> Daily Report
            </Link>
            <Link to="/dashboard" className={`${theme.textWhite} hover:${theme.textViolet}`}>
              <FontAwesomeIcon icon={faChartSimple} className="mr-1" /> Dashboard
            </Link>
            
            {/* Profile Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`${theme.textWhite} hover:${theme.textViolet} flex items-center`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                {username || 'Account'}
                <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
              </button>

              {/* Profile Menu Drawer */}
              {isProfileMenuOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                    ${theme.backgroundCard} border ${theme.divider} z-50`}
                >
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 text-sm ${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite}`}
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUserCog} className="mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite}`}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex space-x-4">
            <Link to="/login" className="bg-violet-600 text-white px-4 py-1 rounded">
              Login
            </Link>
            <Link to="/login?mode=register" className="bg-violet-100 text-violet-800 px-4 py-1 rounded">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="block lg:hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`${theme.textWhite} focus:outline-none`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <FontAwesomeIcon 
            icon={isOpen ? faTimes : faBars} 
            className="text-xl"
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 lg:hidden z-40 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onClick={() => setIsOpen(false)}
        ></div>
        
        {/* Drawer Content */}
        <div className={`absolute top-0 right-0 w-4/5 h-full ${theme.backgroundCard} shadow-xl flex flex-col overflow-y-auto`}>
          {/* Drawer Header */}
          <div className={`${theme.backgroundViolet} p-4 flex justify-between items-center`}>
            <span className={`text-xl font-bold ${theme.textWhite}`}>Menu</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className={`${theme.textWhite} focus:outline-none`}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          {/* Drawer Body */}
          <div className="flex-1 p-4">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/instruction" 
                  className={`${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" /> Instruction
                </Link>
                <Link 
                  to="/journal" 
                  className={`${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faBook} className="mr-2" /> Journal
                </Link>
                <Link 
                  to="/activity" 
                  className={`${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faCalendarDay} className="mr-2" /> Daily Report
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faChartSimple} className="mr-2" /> Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserCog} className="mr-2" /> Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className={`w-full text-left ${theme.textViolet} hover:${theme.backgroundViolet} hover:${theme.textWhite} p-2 rounded-md`}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
                </button>
                
                <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={theme.textViolet}>Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/login" 
                  className="bg-violet-600 text-white px-4 py-2 rounded text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/login?mode=register" 
                  className="bg-violet-100 text-violet-800 px-4 py-2 rounded text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;