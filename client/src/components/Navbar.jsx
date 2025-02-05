import { NavLink, Link } from 'react-router-dom';

const Navbar = () =>{
    return(
        <div className="p-0 m-0"> 
            <nav className="flex justify-between items-center sticky top-0 z-10 py-4 pl-4 bg-violet-700">
                <div>
                    <h1 className="text-3xl font-bold text-white"><Link to="/">Daily Balance</Link></h1>
                </div>
                <ul className="flex font-semibold space-x-4 mr-4">
                    <li>
                        <NavLink 
                        to="/journal" 
                        className={({ isActive }) => `text-violet-50  p-3 rounded-xs hover:bg-violet-500 ${isActive ? 'bg-violet-950' : 'bg-violet-700'
                        }`}>
                        Journal
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-500 ${isActive ? 'bg-violet-950' : 'bg-violet-700'
                        }`}>
                        Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                        to="/login" 
                        className={({ isActive }) => `text-violet-50 p-3 rounded-xs hover:bg-violet-500 ${isActive ? 'bg-violet-950' : 'bg-violet-700'
                        }`}>
                        Login
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Navbar;