import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ isOpen, setIsOpen }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('journal');
    localStorage.removeItem('activities');
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className={`flex justify-between sticky top-0 z-10 py-4 pl-4 lg:items-center ${theme.backgroundViolet}`}>
      {/* Logo and theme toggle section */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-white lg:text-xl">
          Daily Balance
        </h1>
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col space-y-6">
        {isLoggedIn ? (
          <>
            <div className="block lg:hidden ml-auto pr-4 pt-0 mb-0">
              <button 
                onClick={() => { setIsOpen(!isOpen); }} 
                className="text-white focus:outline-none"
              >
                <FontAwesomeIcon 
                  icon={isOpen ? faTimes : faBars} 
                  className="text-xl"
                />
              </button>
            </div>
            
            <div className={`${isOpen ? 'block' : 'hidden'} ml-auto mr-4 lg:block`}>
              <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                <li className="mt-4 lg:mt-0">
                  <NavLink 
                    to="/journal" onClick={() => { setIsOpen(!isOpen); }}
                    className={({ isActive }) => `text-white p-3 hover:bg-violet-900 rounded-md transition duration-200 ${
                      isActive ? theme.backgroundActive : theme.backgroundViolet
                    }`}>
                    Journal
                  </NavLink>
                </li>
                <li className="mt-4 lg:mt-0">
                  <NavLink 
                    to="/dashboard" onClick={() => { setIsOpen(!isOpen); }}
                    className={({ isActive }) => `text-white p-3 hover:bg-violet-900 rounded-md transition duration-200 ${
                      isActive ? theme.backgroundActive : theme.backgroundViolet
                    }`}>
                    Dashboard
                  </NavLink>
                </li>
                <li className="mt-4 lg:mt-0">
                  <NavLink 
                    to="/activity" onClick={() => { setIsOpen(!isOpen); }}
                    className={({ isActive }) => `text-white p-3 hover:bg-violet-900 rounded-md transition duration-200 ${
                      isActive ? theme.backgroundActive : theme.backgroundViolet
                    }`}>
                    Activity Report
                  </NavLink>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-white p-3 hover:bg-violet-900 rounded-md transition duration-200">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="ml-auto pr-4 pt-0">
            <NavLink 
              to="/login" 
              className={({ isActive }) => `text-white p-3 hover:bg-violet-900 rounded-md transition duration-200 ${
                isActive ? theme.backgroundActive : theme.backgroundViolet
              }`}>
              Login
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;