import React, {useRef, useState, useEffect} from 'react';
import Navbar from './Navbar';
import { Outlet} from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import ScreenContext from '../contexts/ScreenContext' 

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });
  const [navbarHeight, setNavbarHeight] = useState(0);
  const navbarRef = useRef(null);

  const updateNavbarHeight = () => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    updateNavbarHeight();
  }, [isOpen, location.pathname]);

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
        <ScreenContext.Provider value={{ isLargeScreen, navbarHeight }}>
          <Outlet />
        </ScreenContext.Provider>
    </div>
  );
};

export default Layout;
