import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: '',
    lot: '',
    address: '',
    suburb: '',
    availability: '',
    status: '',
    price: '',
    landSize: '',
    buildSize: ''
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
                    <label>PROPERTY TYPE</label>
                    <select
                      value={filters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Types</option>
                      <option value="Land only">Land only</option>
                      <option value="Single story">Single story</option>
                      <option value="Double story">Double story</option>
                      <option value="Dual occupancy">Dual occupancy</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Home & Land">Home & Land</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>LOT</label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 2, 3"
                      value={filters.lot}
                      onChange={(e) => handleFilterChange('lot', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>ADDRESS</label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={filters.address}
                      onChange={(e) => handleFilterChange('address', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  
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
                    <label>AVAILABILITY</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Availability</option>
                      <option value="Available">Available</option>
                      <option value="Under Offer">Under Offer</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>STATUS</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>PRICE</label>
                    <select
                      value={filters.price}
                      onChange={(e) => handleFilterChange('price', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any Price</option>
                      <option value="0-500000">Under $500,000</option>
                      <option value="500000-750000">$500,000 - $750,000</option>
                      <option value="750000-1000000">$750,000 - $1,000,000</option>
                      <option value="1000000-1500000">$1,000,000 - $1,500,000</option>
                      <option value="1500000-2000000">$1,500,000 - $2,000,000</option>
                      <option value="2000000+">$2,000,000+</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>LAND SIZE</label>
                    <select
                      value={filters.landSize}
                      onChange={(e) => handleFilterChange('landSize', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any Size</option>
                      <option value="0-300">Under 300m²</option>
                      <option value="300-500">300m² - 500m²</option>
                      <option value="500-700">500m² - 700m²</option>
                      <option value="700-1000">700m² - 1000m²</option>
                      <option value="1000+">1000m²+</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>BUILD SIZE</label>
                    <select
                      value={filters.buildSize}
                      onChange={(e) => handleFilterChange('buildSize', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any Size</option>
                      <option value="0-150">Under 150m²</option>
                      <option value="150-200">150m² - 200m²</option>
                      <option value="200-250">200m² - 250m²</option>
                      <option value="250-300">250m² - 300m²</option>
                      <option value="300+">300m²+</option>
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
