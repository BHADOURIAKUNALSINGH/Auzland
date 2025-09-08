import React, { useState } from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const {
    images,
    address,
    suburb,
    bedrooms,
    bathrooms,
    parking,
    propertyType,
    landSize
  } = property;


  // Only use real property images, no stock/placeholder images
  const hasRealImages = images && images.length > 0;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Only show real property images or hourglass - no stock images
  const shouldShowHourglass = () => {
    return !hasRealImages || imageError;
  };

  const displayImage = hasRealImages && !imageError ? images[0] : null;

  return (
    <div className="property-card card">
      <div className="property-image">
        {/* Show hourglass when no images are available */}
        {shouldShowHourglass() ? (
          <div className="image-loading-placeholder">
            <div className="loading-spinner hourglass">⏳</div>
            <p>No images available</p>
            <small>Images may still be loading...</small>
          </div>
        ) : (
          /* Show actual image when available */
          displayImage && (
            <img 
              src={displayImage} 
              alt={address} 
              onError={handleImageError}
            />
          )
        )}
        <div className="property-overlay">
          <button className="btn btn-primary">View Details</button>
        </div>
      </div>
      
      <div className="property-content">
        <div className="property-header">
          <h3 className="property-address">{address}</h3>
          <p className="property-suburb">{suburb}</p>
        </div>
        
        <div className="property-features">
          {bedrooms === 0 && bathrooms === 0 && parking === 0 && landSize ? (
            <div className="area-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{landSize} sqm</span>
            </div>
          ) : (
            <>
              <div className="feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{bedrooms} bed</span>
              </div>
              
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
              
              <div className="feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7H16V6C16 4.89543 15.1046 4 14 4H10C8.89543 4 8 4.89543 8 6V7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{parking} parking</span>
              </div>
            </>
          )}
        </div>
        
        <div className="property-type">
          <span className="type-badge">{propertyType === 'Home and Land Packages' ? 'Home & Land' : propertyType}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard; 