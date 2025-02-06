import { NavLink, Link, useNavigate } from 'react-router-dom';
import { themes } from '../contexts/themeConfig';
import { useState } from 'react';
/* import '@fontawesome/fontawesome-free/css/all.min.css'; */

/**
 * Navbar Component
 * Provides responsive navigation and authentication state UI
 * Features:
 * - Mobile hamburger menu
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
            <nav className={`flex justify-between items-center sticky top-0 z-10 py-4 pl-4 ${theme.backgroundViolet}`}>
                <div>
                    <h1 className="text-lg font-bold text-white lg:text-xl">
                        <Link to="/">Daily Balance</Link>
                    </h1>
                </div>

                {/* Mobile menu button */}
                {isLoggedIn && (
                    <div className="block lg:hidden ml-auto pr-4">
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="text-white focus:outline-none"
                        >
                            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                        </button>
                    </div>
                )}

                {/* Navigation items */}
                <div className={`${isLoggedIn ? (isOpen ? 'block' : 'hidden lg:block') : 'block'} ml-auto mr-4`}>
                    <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <NavLink 
                                        to="/journal" 
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                                            isActive ? theme.backgroundActive : theme.backgroundViolet
                                        }`}
                                    >
                                        Journal
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                                            isActive ? theme.backgroundActive : theme.backgroundViolet
                                        }`}
                                    >
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-violet-50 p-3 rounded-xs hover:bg-violet-700"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <NavLink 
                                    to="/login" 
                                    className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-700 ${
                                        isActive ? theme.backgroundActive : theme.backgroundViolet
                                    }`}
                                >
                                    Login
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
