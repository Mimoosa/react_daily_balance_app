import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '../contexts/icons';
import { faCalendarDay, faBook, faChartSimple, faUser, faChalkboardTeacher, faChevronDown, faUserCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ isOpen, setIsOpen }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [resetStatus, setResetStatus] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const username = localStorage.getItem('username');

  const isAuthenticated = !!localStorage.getItem('token');


  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsOpen(false);
    navigate('/login');
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
              <Link to="/instruction" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-1" /> Instruction
              </Link>
              <Link to="/journal" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faBook} className="mr-1" /> Journal
              </Link>
              <Link to="/activity" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faCalendarDay} className="mr-1" /> Daily Report
              </Link>
              <Link to="/dashboard" className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0`}>
                <FontAwesomeIcon icon={faChartSimple} className="mr-1" /> Dashboard
              </Link>
              
              {/* Profile Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`${theme.textWhite} hover:${theme.textViolet} mt-2 lg:mt-0 flex items-center`}
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
              <div className="mt-2 lg:mt-0 flex justify-center items-center">
                <ThemeToggle />
              </div>
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