import React, { useState } from 'react';
import './Hero.css';

const Hero = () => {
  const [searchType, setSearchType] = useState('buying');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchType, searchQuery);
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Selling Lifestyle Like No Other
          </h1>
          
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-container">
              <div className="search-type-selector">
                <select 
                  value={searchType} 
                  onChange={(e) => setSearchType(e.target.value)}
                  className="search-type-dropdown"
                >
                  <option value="buying">Buying</option>
                  <option value="renting">Renting</option>
                  <option value="selling">Selling</option>
                  <option value="investing">Investing</option>
                </select>
              </div>
              
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search by Address, Suburb, or Postcode"
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
            <button className="btn btn-primary btn-large">
              Request Appraisal Now
            </button>
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