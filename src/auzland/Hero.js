import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    suburb: '',
    minPrice: '',
    maxPrice: '',
    minBed: '',
    minBath: '',
    minGarage: '',
    type: ''
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    navigate(`/buy${qs}`);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
              <div className="search-input-wrapper">
                <div className="search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search suburb, postcode or state"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button type="button" className="filters-button" onClick={toggleFilters}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14.2929 13.7071C14.1054 13.8946 14 14.149 14 14.4142V17L10 21V14.4142C10 14.149 9.89464 13.8946 9.70711 13.7071L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Filters
              </button>
              
              <button type="submit" className="search-button">
                Search
              </button>
            </div>

            {showFilters && (
              <div className="filters-dropdown">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>SUBURB</label>
                    <input
                      type="text"
                      placeholder="e.g. Austral, Leppington"
                      value={filters.suburb}
                      onChange={(e) => handleFilterChange('suburb', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>MIN PRICE</label>
                    <select
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any</option>
                      <option value="500000">$500,000</option>
                      <option value="750000">$750,000</option>
                      <option value="1000000">$1,000,000</option>
                      <option value="1500000">$1,500,000</option>
                      <option value="2000000">$2,000,000</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>MAX PRICE</label>
                    <select
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any</option>
                      <option value="750000">$750,000</option>
                      <option value="1000000">$1,000,000</option>
                      <option value="1500000">$1,500,000</option>
                      <option value="2000000">$2,000,000</option>
                      <option value="3000000">$3,000,000</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>MIN BED</label>
                    <select
                      value={filters.minBed}
                      onChange={(e) => handleFilterChange('minBed', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>MIN BATH</label>
                    <select
                      value={filters.minBath}
                      onChange={(e) => handleFilterChange('minBath', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>MIN GARAGE</label>
                    <select
                      value={filters.minGarage}
                      onChange={(e) => handleFilterChange('minGarage', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>TYPE</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Types</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
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
