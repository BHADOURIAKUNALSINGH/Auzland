import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

// Load all images in Landing folder dynamically (CRA/Webpack)
const importAll = (r) => r.keys().map(r);
const localLandingImages = importAll(
  require.context('../media/Landing', false, /\.(png|jpe?g|svg)$/i)
);
// Use ONLY locally stored images for the slideshow
const landingImages = localLandingImages;

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: '',
    suburb: '',
    priceMin: '',
    priceMax: '',
    landMin: '',
    landMax: '',
    frontageMin: '',
    frontageMax: '',
    buildMin: '',
    buildMax: '',
    bedMin: '',
    bathMin: '',
    garageMin: ''
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.suburb) params.set('suburb', filters.suburb);
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);
    if (filters.frontageMin) params.set('frontageMin', filters.frontageMin);
    if (filters.frontageMax) params.set('frontageMax', filters.frontageMax);
    if (filters.buildMin) params.set('buildMin', filters.buildMin);
    if (filters.buildMax) params.set('buildMax', filters.buildMax);
    if (filters.bedMin) params.set('bedMin', filters.bedMin);
    if (filters.bathMin) params.set('bathMin', filters.bathMin);
    if (filters.garageMin) params.set('garageMin', filters.garageMin);
    const qs = params.toString();
    navigate(`/buy${qs ? `?${qs}` : ''}`);
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
        {/* Background Slideshow */}
        <div className="slideshow">
          {landingImages.map((src, index) => (
            <div
              className="slide"
              key={`slide-${index}`}
              style={{
                animationName: 'fadeCycle',
                animationDuration: `${Math.max(1, landingImages.length) * 6}s`,
                animationDelay: `${-index * 6}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                animationFillMode: 'both'
              }}
            >
              <img src={src} alt={`Landing ${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">Specialists in South West Sydney</h1>
          <p className="hero-subtitle">From Wilton to Oran Park, we know the South West inside out.</p>
          
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-container glass">
              <div className="search-input-wrapper">
                <div className="search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by address, suburb, or postcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filters-wrapper">
                <button type="button" className="filters-button" onClick={toggleFilters}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14.2929 13.7071C14.1054 13.8946 14 14.149 14 14.4142V17L10 21V14.4142C10 14.149 9.89464 13.8946 9.70711 13.7071L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Filters
                </button>

                {showFilters && (
                  <div className="filters-dropdown filters-dropdown-over glass">
                    <div className="filters-grid">
                      <div className="filter-group">
                        <label>PROPERTY TYPE</label>
                        <select value={filters.propertyType} onChange={(e) => handleFilterChange('propertyType', e.target.value)} className="filter-select">
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
                        <label>SUBURB</label>
                        <input type="text" placeholder="e.g. Austral, Leppington" value={filters.suburb} onChange={(e) => handleFilterChange('suburb', e.target.value)} className="filter-input" />
                      </div>

                      <div className="filter-group">
                        <label>MIN PRICE</label>
                        <select value={filters.priceMin} onChange={(e) => handleFilterChange('priceMin', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="300000">$300k</option>
                          <option value="600000">$600k</option>
                          <option value="800000">$800k</option>
                          <option value="1000000">$1M</option>
                          <option value="1500000">$1.5M</option>
                          <option value="2000000">$2M</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>MAX PRICE</label>
                        <select value={filters.priceMax} onChange={(e) => handleFilterChange('priceMax', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="600000">$600k</option>
                          <option value="800000">$800k</option>
                          <option value="1000000">$1M</option>
                          <option value="1500000">$1.5M</option>
                          <option value="2000000">$2M</option>
                          <option value="3000000">$3M</option>
                          <option value="5000000">$5M</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>MIN LAND (sqm)</label>
                        <select value={filters.landMin} onChange={(e) => handleFilterChange('landMin', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="150">150</option>
                          <option value="300">300</option>
                          <option value="450">450</option>
                          <option value="600">600</option>
                          <option value="800">800</option>
                          <option value="1000">1000</option>
                        </select>
                      </div>

                      {/* Frontage and Build size removed per request */}

                      <div className="filter-group">
                        <label>MIN BED</label>
                        <select value={filters.bedMin} onChange={(e) => handleFilterChange('bedMin', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>MIN BATH</label>
                        <select value={filters.bathMin} onChange={(e) => handleFilterChange('bathMin', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>MIN GARAGE</label>
                        <select value={filters.garageMin} onChange={(e) => handleFilterChange('garageMin', e.target.value)} className="filter-select">
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>
          
          <div className="hero-stats">
            <div className="stat-item glass-card">
              <span className="stat-number">500+</span>
              <span className="stat-label">Happy Homeowners</span>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-number">99%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years of Experience</span>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Property Available</span>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-number">500+</span>
              <span className="stat-label">People Connected </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
