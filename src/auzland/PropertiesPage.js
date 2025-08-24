import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import './PropertiesPage.css';

const PropertiesPage = () => {
  const [filterType, setFilterType] = useState('all');
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
      status: 'For Sale'
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
      status: 'For Sale'
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
      status: 'For Sale'
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
      status: 'For Sale'
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
      status: 'For Sale'
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
      status: 'For Sale'
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
      status: 'Rent'
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
      status: 'Rent'
    }
  ];

  const filteredProperties = allProperties.filter(property => {
    if (filterType === 'all') return true;
    if (filterType === 'buy') return property.status === 'For Sale';
    if (filterType === 'rent') return property.status === 'Rent';
    return property.propertyType.toLowerCase() === filterType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-high') {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
      return priceB - priceA;
    }
    if (sortBy === 'price-low') {
      const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
      const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
      return priceA - priceB;
    }
    if (sortBy === 'bedrooms') {
      return b.bedrooms - a.bedrooms;
    }
    return 0;
  });

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
          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Property Type:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Properties</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="townhouse">Townhouse</option>
                <option value="estate">Estate</option>
                <option value="home and land packages">Home and Land Packages</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="bedrooms">Bedrooms</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            <p>Showing {sortedProperties.length} properties</p>
          </div>

          {/* Properties Grid */}
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
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage; 