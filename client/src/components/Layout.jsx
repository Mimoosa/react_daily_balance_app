import React, {useRef, useState, useEffect} from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation} from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import ScreenContext from '../contexts/ScreenContext' 

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);// State to manage navbar open/close
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });// Media query to check if screen width is at least 1024px
  const isExtraLargeScreen = useMediaQuery({ query: '(min-width: 1280px)' });// Media query to check if screen width is at least 1280px
  const [navbarHeight, setNavbarHeight] = useState(0);// State to store navbar height
  const navbarRef = useRef(null);// Reference to the navbar element
  const location = useLocation(); // Get the current location
  
  // Function to update navbar height
  const updateNavbarHeight = () => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  };


  // Use effect to update heights whenever navbar state or route changes
  useEffect(() => {
    updateNavbarHeight();
    }, [isOpen, location.pathname]);

  // Use effect to add event listeners for window resize to update heights
  useEffect(() => {
    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  return (
    <div className=" min-h-screen flex flex-col">
        <div ref={navbarRef}>
          <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
        <ScreenContext.Provider value={{ isLargeScreen, isExtraLargeScreen, navbarHeight }}>
          <Outlet />
        </ScreenContext.Provider>
    </div>
  );
};
 
export default Layout;
