import { NavLink } from 'react-router-dom';

const Navbar = () =>{
    return(
        <nav>
            <ul>
                <li>
                    <NavLink 
                    to="/" 
                    exact 
                    className={({ isActive }) => isActive ? 'bg-violet-950 text-violet-50' : 'bg-violet-700'
                    }>
                    Journal
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => isActive ? 'bg-violet-950 text-violet-50' : 'bg-violet-700'
                    }>
                    Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                    to="/login" 
                    className={({ isActive }) => isActive ? 'bg-violet-950 text-violet-50' : 'bg-violet-700'
                    }>
                    Login
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;