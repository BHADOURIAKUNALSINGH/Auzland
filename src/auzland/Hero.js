import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    navigate(`/buy${qs}`);
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Selling properties like no other
          </h1>
          
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-container">
              <div className="search-input-wrapper" style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search by Address or Suburb (e.g. Austral, Leppington)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </form>
          
          <div className="hero-cta">
            <a className="btn btn-primary btn-large" href="/contact">
              Request Appraisal Now
            </a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Happy Homeowners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
