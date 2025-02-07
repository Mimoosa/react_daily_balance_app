import React, { useRef, useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation} from 'react-router-dom';

const Layout = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const updateNavbarHeight = () => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  };

  useEffect(()=>{
    window.addEventListener('resize', updateNavbarHeight);
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, [])

  useEffect(() => {
    updateNavbarHeight();
  }, [isOpen]);

  return (
    <div>
        <div ref={navbarRef}>
            <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
        <div style={{ height: `calc(100vh - ${navbarHeight}px ${location.pathname !== "/" ? " - 40px" : ""})` }}>
            <Outlet />
        </div>
    </div>
  );
};


export default Layout;
