import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyModal.css';

const PropertyModal = ({ property, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(property?.image || '');
  const [imageError, setImageError] = useState(false);

  // Fallback images if the main image fails to load
  const fallbackImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop'
  ];

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      setImageUrl(fallbackImages[randomIndex]);
    }
  };

  useEffect(() => {
    if (property?.image) {
      setImageUrl(property.image);
      setImageError(false);
    }
  }, [property]);

  // Create Google Maps URL for the property address
  const createGoogleMapsUrl = () => {
    const address = `${property?.address || ''}, ${property?.suburb || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Create Google Maps directions URL
  const createDirectionsUrl = () => {
    const address = `${property?.address || ''}, ${property?.suburb || ''}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  // Handle contact agent click
  const handleContactAgent = () => {
    onClose(); // Close the modal first
    navigate('/contact'); // Navigate to contact page
  };

  if (!isOpen || !property) return null;

  return (
    <div className="property-modal-overlay" onClick={onClose}>
      <div className="property-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="modal-content">
          <div className="modal-left">
            <div className="property-image-section">
              <img 
                src={imageUrl} 
                alt={property.address} 
                onError={handleImageError}
                className="modal-property-image"
              />
              <div className="property-status">
                <span className={`status-badge ${property.status?.toLowerCase()}`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-right">
            <div className="property-details">
              <div className="property-header">
                <h2 className="property-address">{property.address}</h2>
                <p className="property-suburb">{property.suburb}</p>
                <div className="property-type">
                  <span className="type-badge">{property.propertyType}</span>
                </div>
              </div>

              <div className="property-features">
                {property.bedrooms === 0 && property.bathrooms === 0 && property.parking === 0 && property.landSize ? (
                  <div className="area-feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="feature-text">{property.landSize}</span>
                  </div>
                ) : (
                  <div className="features-grid">
                    <div className="feature-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="feature-text">{property.bedrooms} Bedrooms</span>
                    </div>
                    
                    <div className="feature-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 7V4C4 3.44772 4.44772 3 5 3H9C9.55228 3 10 3.44772 10 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 7V4C14 3.44772 14.4477 3 15 3H19C19.5523 3 20 3.44772 20 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="feature-text">{property.bathrooms} Bathrooms</span>
                    </div>
                    
                    <div className="feature-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7H16V6C16 4.89543 15.1046 4 14 4H10C8.89543 4 8 4.89543 8 6V7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="feature-text">{property.parking} Parking</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleContactAgent}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5A8.38 8.38 0 0 1 22 12A8.5 8.5 0 0 1 13.5 20.5A8.38 8.38 0 0 1 13 20.5A8.5 8.5 0 0 1 4.5 12A8.38 8.38 0 0 1 4.5 11.5A8.5 8.5 0 0 1 13 3.5A8.38 8.38 0 0 1 13.5 3.5A8.5 8.5 0 0 1 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12L12 8L8 12L12 16L16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Contact Agent
                </button>
                <button className="btn btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Schedule Viewing
                </button>
              </div>
            </div>

            <div className="map-section">
              <h3>Location</h3>
              <div className="map-container">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${property.address}, ${property.suburb}`)}`}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Property Location"
                />
              </div>
              <div className="map-actions">
                <a 
                  href={createGoogleMapsUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13A5 5 0 0 0 20 13A5 5 0 0 0 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open in Google Maps
                </a>
                <a 
                  href={createDirectionsUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
