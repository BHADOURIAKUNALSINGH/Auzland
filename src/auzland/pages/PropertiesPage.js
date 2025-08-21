import React, { useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import './PropertiesPage.css';

const PropertiesPage = () => {
  const [filters, setFilters] = useState({
    searchText: '',
    lot: '',
    address: '',
    dp: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedroomsMin: '',
    bedroomsMax: '',
    bathroomsMin: '',
    bathroomsMax: '',
    garageMin: '',
    garageMax: '',
    frontageMin: '',
    frontageMax: '',
    landMin: '',
    landMax: '',
    buildMin: '',
    buildMax: '',
    regoFrom: '',
    regoTo: '',
    readyFrom: '',
    readyTo: ''
  });
  const [sortBy, setSortBy] = useState('price-high');

  // Sample property data
  const allProperties = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop',
      address: '2 McAlister Road',
      suburb: 'Galston',
      price: '$1,250,000',
      bedrooms: 4,
      bathrooms: 2,
      parking: 2,
      propertyType: 'House',
      status: 'For Sale',
      lot: 'LOT 123',
      frontage: '20m',
      landSize: '800sqm',
      buildSize: '250sqm',
      dp: 'DP123456',
      regoDue: '2024-12-31',
      readyBy: '2024-06-30'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop',
      address: '1162 River Road',
      suburb: 'Lower Portland',
      price: '$2,800,000',
      bedrooms: 5,
      bathrooms: 3,
      parking: 3,
      propertyType: 'House',
      status: 'For Sale',
      lot: 'LOT 456',
      frontage: '25m',
      landSize: '1200sqm',
      buildSize: '350sqm',
      dp: 'DP789012',
      regoDue: '2024-11-30',
      readyBy: '2024-08-15'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop',
      address: '44-46 Peebles Road',
      suburb: 'Arcadia',
      price: '$3,500,000',
      bedrooms: 6,
      bathrooms: 4,
      parking: 4,
      propertyType: 'Estate',
      status: 'For Sale',
      lot: 'LOT 789',
      frontage: '30m',
      landSize: '2000sqm',
      buildSize: '500sqm',
      dp: 'DP345678',
      regoDue: '2024-10-31',
      readyBy: '2024-09-30'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop',
      address: '3-9 Nimbus Close',
      suburb: 'Kellyville',
      price: '$950,000',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      propertyType: 'Townhouse',
      status: 'For Sale',
      lot: 'LOT 101',
      frontage: '15m',
      landSize: '400sqm',
      buildSize: '180sqm',
      dp: 'DP901234',
      regoDue: '2024-12-31',
      readyBy: '2024-07-30'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=300&fit=crop',
      address: '12 Wyoming Road',
      suburb: 'Dural',
      price: '$1,800,000',
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      propertyType: 'House',
      status: 'For Sale',
      lot: 'LOT 202',
      frontage: '22m',
      landSize: '1000sqm',
      buildSize: '300sqm',
      dp: 'DP567890',
      regoDue: '2024-11-30',
      readyBy: '2024-08-30'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&h=300&fit=crop',
      address: '769 Singleton Road',
      suburb: 'Laughtondale',
      price: '$4,200,000',
      bedrooms: 7,
      bathrooms: 5,
      parking: 5,
      propertyType: 'Luxury Estate',
      status: 'For Sale',
      lot: 'LOT 303',
      frontage: '35m',
      landSize: '2500sqm',
      buildSize: '600sqm',
      dp: 'DP123789',
      regoDue: '2024-10-31',
      readyBy: '2024-09-15'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop',
      address: '15 Park Avenue',
      suburb: 'Parramatta',
      price: '$850/week',
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      propertyType: 'Apartment',
      status: 'Rent',
      lot: 'LOT 404',
      frontage: '12m',
      landSize: '150sqm',
      buildSize: '80sqm',
      dp: 'DP456123',
      regoDue: '2024-12-31',
      readyBy: 'Immediate'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop',
      address: '78 Beach Road',
      suburb: 'Bondi',
      price: '$1,200/week',
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      propertyType: 'House',
      status: 'Rent',
      lot: 'LOT 505',
      frontage: '18m',
      landSize: '300sqm',
      buildSize: '120sqm',
      dp: 'DP789456',
      regoDue: '2024-12-31',
      readyBy: 'Immediate'
    }
  ];

  const parseNumber = (value) => {
    if (!value) return NaN;
    const n = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? NaN : n;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredProperties = allProperties.filter(property => {
    // Text contains filters
    if (filters.searchText && !(`${property.address} ${property.suburb} ${property.lot}`.toLowerCase().includes(filters.searchText.toLowerCase()))) return false;
    if (filters.lot && !String(property.lot).toLowerCase().includes(filters.lot.toLowerCase())) return false;
    if (filters.address && !`${property.address}`.toLowerCase().includes(filters.address.toLowerCase())) return false;
    if (filters.dp && !String(property.dp).toLowerCase().includes(filters.dp.toLowerCase())) return false;
    if (filters.propertyType && !property.propertyType.toLowerCase().includes(filters.propertyType.toLowerCase())) return false;

    // Numeric ranges
    const priceValue = parseNumber(property.price);
    if (filters.priceMin && priceValue < parseNumber(filters.priceMin)) return false;
    if (filters.priceMax && priceValue > parseNumber(filters.priceMax)) return false;

    if (filters.bedroomsMin && property.bedrooms < parseNumber(filters.bedroomsMin)) return false;
    if (filters.bedroomsMax && property.bedrooms > parseNumber(filters.bedroomsMax)) return false;

    if (filters.bathroomsMin && property.bathrooms < parseNumber(filters.bathroomsMin)) return false;
    if (filters.bathroomsMax && property.bathrooms > parseNumber(filters.bathroomsMax)) return false;

    if (filters.garageMin && property.parking < parseNumber(filters.garageMin)) return false;
    if (filters.garageMax && property.parking > parseNumber(filters.garageMax)) return false;

    const frontageValue = parseNumber(property.frontage);
    if (filters.frontageMin && frontageValue < parseNumber(filters.frontageMin)) return false;
    if (filters.frontageMax && frontageValue > parseNumber(filters.frontageMax)) return false;

    const landValue = parseNumber(property.landSize);
    if (filters.landMin && landValue < parseNumber(filters.landMin)) return false;
    if (filters.landMax && landValue > parseNumber(filters.landMax)) return false;

    const buildValue = parseNumber(property.buildSize);
    if (filters.buildMin && buildValue < parseNumber(filters.buildMin)) return false;
    if (filters.buildMax && buildValue > parseNumber(filters.buildMax)) return false;

    // Dates
    if (filters.regoFrom && new Date(property.regoDue) < new Date(filters.regoFrom)) return false;
    if (filters.regoTo && new Date(property.regoDue) > new Date(filters.regoTo)) return false;

    if (property.readyBy && filters.readyFrom && new Date(property.readyBy) < new Date(filters.readyFrom)) return false;
    if (property.readyBy && filters.readyTo && new Date(property.readyBy) > new Date(filters.readyTo)) return false;

    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-high') {
      const priceA = parseNumber(a.price);
      const priceB = parseNumber(b.price);
      return priceB - priceA;
    }
    if (sortBy === 'price-low') {
      const priceA = parseNumber(a.price);
      const priceB = parseNumber(b.price);
      return priceA - priceB;
    }
    if (sortBy === 'bedrooms') {
      return b.bedrooms - a.bedrooms;
    }
    if (sortBy === 'land-size') {
      const landA = parseNumber(a.landSize);
      const landB = parseNumber(b.landSize);
      return landB - landA;
    }
    return 0;
  });

  const clearFilters = () => {
    setFilters({
      searchText: '',
      lot: '',
      address: '',
      dp: '',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      bedroomsMin: '',
      bedroomsMax: '',
      bathroomsMin: '',
      bathroomsMax: '',
      garageMin: '',
      garageMax: '',
      frontageMin: '',
      frontageMax: '',
      landMin: '',
      landMax: '',
      buildMin: '',
      buildMax: '',
      regoFrom: '',
      regoTo: '',
      readyFrom: '',
      readyTo: ''
    });
  };

  return (
    <div className="properties-page">
      <div className="page-header">
        <div className="container">
          <h1>Properties</h1>
          <p>Discover your perfect property from our extensive collection</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="properties-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <div className="filters-section">
                <div className="filters-header">
                  <h3>Filters</h3>
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear All
                  </button>
                </div>

                <div className="filter-block">
                  <div className="filter-group">
                    <label>Quick Search</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Type address, lot number"
                      value={filters.searchText}
                      onChange={(e) => handleFilterChange('searchText', e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-block">
                  <h4 className="block-title">Location & Area</h4>
                  <div className="filter-group">
                    <label>Address</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Street, suburb"
                      value={filters.address}
                      onChange={(e) => handleFilterChange('address', e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-block">
                  <h4 className="block-title">Property Details</h4>
                  <div className="filter-group">
                    <label>Lot</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="e.g. LOT 123"
                      value={filters.lot}
                      onChange={(e) => handleFilterChange('lot', e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>DP</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="DP Number"
                      value={filters.dp}
                      onChange={(e) => handleFilterChange('dp', e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Type of Property</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="House, Apartment..."
                      value={filters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-block">
                  <h4 className="block-title">Sizes</h4>
                  <div className="filter-group">
                    <label>Frontage (m)</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.frontageMin} onChange={(e) => handleFilterChange('frontageMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.frontageMax} onChange={(e) => handleFilterChange('frontageMax', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Land Size (sqm)</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.landMin} onChange={(e) => handleFilterChange('landMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.landMax} onChange={(e) => handleFilterChange('landMax', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Build Size (sqm)</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.buildMin} onChange={(e) => handleFilterChange('buildMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.buildMax} onChange={(e) => handleFilterChange('buildMax', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="filter-block">
                  <h4 className="block-title">Rooms & Parking</h4>
                  <div className="filter-group">
                    <label>Bed</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.bedroomsMin} onChange={(e) => handleFilterChange('bedroomsMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.bedroomsMax} onChange={(e) => handleFilterChange('bedroomsMax', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Bath</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.bathroomsMin} onChange={(e) => handleFilterChange('bathroomsMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.bathroomsMax} onChange={(e) => handleFilterChange('bathroomsMax', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Garage</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.garageMin} onChange={(e) => handleFilterChange('garageMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.garageMax} onChange={(e) => handleFilterChange('garageMax', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="filter-block">
                  <h4 className="block-title">Price & Dates</h4>
                  <div className="filter-group">
                    <label>Price Guide</label>
                    <div className="range-inputs">
                      <input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => handleFilterChange('priceMin', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => handleFilterChange('priceMax', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Rego Due</label>
                    <div className="range-inputs">
                      <input type="date" value={filters.regoFrom} onChange={(e) => handleFilterChange('regoFrom', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="date" value={filters.regoTo} onChange={(e) => handleFilterChange('regoTo', e.target.value)} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Ready By</label>
                    <div className="range-inputs">
                      <input type="date" value={filters.readyFrom} onChange={(e) => handleFilterChange('readyFrom', e.target.value)} />
                      <span className="range-sep">to</span>
                      <input type="date" value={filters.readyTo} onChange={(e) => handleFilterChange('readyTo', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="results-area">
              <div className="results-header">
                <p className="results-count">{sortedProperties.length} results</p>
                <div className="sort-controls">
                  <label>Sort by</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="price-high">Price</option>
                    <option value="price-low">Price (Low)</option>
                    <option value="bedrooms">Bedrooms</option>
                    <option value="land-size">Land Size</option>
                  </select>
                </div>
              </div>

              <div className="properties-grid">
                {sortedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {sortedProperties.length === 0 && (
                <div className="no-results">
                  <h3>No properties found</h3>
                  <p>Try adjusting your filters to see more results.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage; 