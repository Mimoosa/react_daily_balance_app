import { NavLink, Link, useNavigate } from 'react-router-dom';
import { themes } from '../contexts/themeConfig';
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
/**
 * Navbar Component
 * Provides navigation and authentication state UI
 * Features:
 * - Conditional rendering based on auth state
 * - Active link highlighting
 * - Logout functionality
 */
const Navbar = () => {
  const theme = themes.light;
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="p-0 m-0"> 
      <nav className={`flex justify-between  lg:items-center sticky top-0 z-10 py-4 pl-4 ${theme.backgroundViolet}`}>
        <div>
          <h1 className="text-lg font-bold text-white lg:text-xl"><Link to="/">Daily Balance</Link></h1>
        </div>
        <div className="flex flex-col space-y-6">
          {isLoggedIn ? (
            <>
              <div className="block lg:hidden ml-auto pr-4 pt-0 mb-0">
                <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                  {isOpen ? (
                    <i className="fas fa-times text-xl"></i> 
                  ) : (
                    <i className="fas fa-bars text-2xl"></i> 
                  )}
                </button>
              </div>
              <div className={`${isOpen ? 'block' : 'hidden'} ml-auto mr-4 lg:block`}>
                <ul className="flex flex-col space-y-4 justify-center lg:flex-row lg:items-center">
                  <li className="mt-4">
                    <NavLink 
                      to="/journal" 
                      className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                        isActive ? theme.backgroundActive : theme.backgroundViolet
                      }`}>
                      Journal
                    </NavLink>
                  </li>
                  <li className="mt-4">
                    <NavLink 
                      to="/dashboard" 
                      className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                        isActive ? theme.backgroundActive : theme.backgroundViolet
                      }`}>
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="text-violet-50 p-3 rounded-xs hover:bg-violet-700">
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
                className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                  isActive ? theme.backgroundActive : theme.backgroundViolet
                }`}>
                Login
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
