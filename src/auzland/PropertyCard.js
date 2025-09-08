import React, { useState } from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const {
    images,
    address,
    suburb,
    lot,
    availability,
    status,
    price,
    frontage,
    landSize,
    buildSize,
    bedrooms,
    bathrooms,
    parking,
    propertyType,
    priceCustomerVisibility
  } = property;

  // Format price with AUD currency
  const formatPrice = (priceStr) => {
    if (!priceStr || priceStr === 'Price on request') return priceStr;
    
    // Extract numbers from price string
    const numbers = priceStr.toString().replace(/[^0-9]/g, '');
    const numPrice = parseInt(numbers);
    
    if (isNaN(numPrice)) return priceStr;
    
    // Format as AUD currency
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const hasRealImages = images && images.length > 0;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="property-card">
      {/* Image Section */}
      <div className="card-image">
        {hasRealImages && !imageError ? (
          <img 
            src={images[0]} 
            alt={`${address}, ${suburb}`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        <div className="image-overlay">
          <button className="view-btn">View Details</button>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        {/* Simplified horizontal layout */}
        <div className="property-info-horizontal">
          <div className="property-main">
            <h3 className="property-address">{address}</h3>
            <p className="property-suburb">{suburb}</p>
          </div>
          
          <div className="property-details">
            {landSize && (
              <span className="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {landSize} sqm
              </span>
            )}
            
            <span className="detail-item availability">
              {status || 'Available'}
            </span>
            
            {priceCustomerVisibility === '1' && (
              <span className="detail-item price">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span className="property-type">
            {propertyType === 'Home and Land Packages' ? 'Home & Land' : propertyType}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;