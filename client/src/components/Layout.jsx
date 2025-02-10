import React, { useRef, useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const navbarRef = useRef(null);
  const outletRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [outletHeightExceeds, setOutletHeightExceeds] = useState(false);
  const location = useLocation();

  const updateNavbarHeight = () => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  };

  const updateOutletHeight = () => {
    if (outletRef.current) {
      const outletHeight = outletRef.current.scrollHeight; 
      const totalHeight = outletHeight + navbarHeight;
      setOutletHeightExceeds(totalHeight > window.innerHeight);
    }
  };

  useEffect(() => {
    updateNavbarHeight();
    updateOutletHeight();
  }, [isOpen, location.pathname]);

  useEffect(() => {
    window.addEventListener('resize', updateNavbarHeight);
    window.addEventListener('resize', updateOutletHeight);
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
      window.removeEventListener('resize', updateOutletHeight);
    };
  }, []);

  return (
    <div>
      <div ref={navbarRef}>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      <div
        ref={outletRef}
        style={
          !outletHeightExceeds
            ? { height: `calc(100vh - ${navbarHeight}px ${location.pathname !== "/" && location.pathname !== "/login" ? " - 40px" : ""})` }
            : {} 
        }
      >
        <Outlet />
        {!(location.pathname === "/" || location.pathname === "/login" || location.pathname === "/anotherPath") && (
          <ThemeToggle />
        )}
      </div>
    </div>
  );
};

export default Layout;
