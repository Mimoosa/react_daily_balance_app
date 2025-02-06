import { NavLink, Link, useNavigate } from 'react-router-dom';
import { themes } from '../contexts/themeConfig';

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
    
    // Check authentication status from local storage
    const isLoggedIn = localStorage.getItem('token');

    /**
     * Handles user logout by clearing authentication data
     * and redirecting to home page
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    return(
        <div className="p-0 m-0"> 
            <nav className={`flex justify-between items-center sticky top-0 z-10 py-4 pl-4 ${theme.backgroundViolet}`}>
                <div>
                    <h1 className="text-3xl font-bold text-white"><Link to="/">Daily Balance</Link></h1>
                </div>
                <ul className="flex font-semibold items-center space-x-4 mr-4">
                    {isLoggedIn ? (
                        <>
                            <li>
                                <NavLink 
                                    to="/journal" 
                                    className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-500 ${
                                        isActive ? theme.backgroundActive : theme.backgroundViolet
                                    }`}>
                                    Journal
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/dashboard" 
                                    className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-500 ${
                                        isActive ? theme.backgroundActive : theme.backgroundViolet
                                    }`}>
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <button 
                                    onClick={handleLogout}
                                    className="text-violet-50 p-3 rounded-xs hover:bg-violet-500">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <NavLink 
                                to="/login" 
                                className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-500 ${
                                    isActive ? theme.backgroundActive : theme.backgroundViolet
                                }`}>
                                Login
                            </NavLink>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Navbar;