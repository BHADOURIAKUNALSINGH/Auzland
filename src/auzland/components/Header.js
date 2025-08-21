import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <div className="logo-text">
              <h1>Auz Land</h1>
              <p>Real Estate</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link 
              to="/properties" 
              className={location.pathname === '/properties' ? 'nav-link active' : 'nav-link'}
            >
              BUYING
            </Link>
            <Link 
              to="/properties" 
              className={location.pathname === '/properties' ? 'nav-link active' : 'nav-link'}
            >
              SELLING
            </Link>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'}
            >
              OUR STORY
            </Link>
            <Link 
              to="/properties" 
              className={location.pathname === '/properties' ? 'nav-link active' : 'nav-link'}
            >
              BLOGS
            </Link>
            <Link 
              to="/contact" 
              className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}
            >
              CONTACT
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="header-cta">
            <button className="btn btn-secondary">
              What's My Home Worth?
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/properties" className="nav-link" onClick={closeMenu}>
            BUYING
          </Link>
          <Link to="/properties" className="nav-link" onClick={closeMenu}>
            SELLING
          </Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>
            OUR STORY
          </Link>
          <Link to="/properties" className="nav-link" onClick={closeMenu}>
            BLOGS
          </Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>
            CONTACT
          </Link>
          <button className="btn btn-primary btn-large" onClick={closeMenu}>
            What's My Home Worth?
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 