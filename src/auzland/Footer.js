import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h3>AuzLandRE</h3>
        </div>
        <p className="footer-description">Helping Australians buy and sell property with confidence.</p>
      </div>
    </footer>
  );
};

export default Footer; 