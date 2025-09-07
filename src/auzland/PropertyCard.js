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
        {/* Header */}
        <div className="card-header">
          <h3 className="property-address">{address}</h3>
          <p className="property-suburb">{suburb}</p>
          {lot && <span className="lot-badge">Lot {lot}</span>}
        </div>

        {/* Price */}
        <div className="price-section">
          <div className="price">
            {priceCustomerVisibility === '1' ? formatPrice(price) : 'Price on request'}
          </div>
          <div className="status-info">
            <span className="status">{status || 'Available'}</span>
            {availability && <span className="availability">{availability}</span>}
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          {bedrooms === 0 && bathrooms === 0 && parking === 0 && landSize ? (
            <div className="land-feature">
              <div className="land-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="land-size">{landSize} sqm</span>
            </div>
          ) : (
            <div className="features-grid">
              {bedrooms > 0 && (
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{bedrooms} bed</span>
                </div>
              )}
              
              {bathrooms > 0 && (
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 7V4C4 3.44772 4.44772 3 5 3H9C9.55228 3 10 3.44772 10 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 7V4C14 3.44772 14.4477 3 15 3H19C19.5523 3 20 3.44772 20 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{bathrooms} bath</span>
                </div>
              )}
              
              {parking > 0 && (
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7H16V6C16 4.89543 15.1046 4 14 4H10C8.89543 4 8 4.89543 8 6V7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{parking} parking</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Details */}
        {(landSize || buildSize || frontage) && (
          <div className="details-section">
            {landSize && (
              <div className="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Land: {landSize} sqm</span>
              </div>
            )}
            
            {buildSize && (
              <div className="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21H21L19 19L17 21L15 19L13 21L11 19L9 21L7 19L5 21V3H21V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Build: {buildSize} sqm</span>
              </div>
            )}
            
            {frontage && (
              <div className="detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Frontage: {frontage}m</span>
              </div>
            )}
          </div>
        )}

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