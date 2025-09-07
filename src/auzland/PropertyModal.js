import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyModal.css';

const PropertyModal = ({ property, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Only show real property images - no stock/fallback images
  const getCurrentImage = () => {
    // Only use real property images
    if (property?.images && property.images.length > 0 && !imageError) {
      return property.images[currentImageIndex];
    }
    return null;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    if (!imageError) {
      setImageError(true);
    }
  };

  const nextImage = useCallback(() => {
    const images = property?.images || (property?.image ? [property.image] : []);
    if (images && images.length > 1) {
      setImageLoading(true);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setImageError(false);
    }
  }, [property?.images, property?.image]);

  const prevImage = useCallback(() => {
    const images = property?.images || (property?.image ? [property.image] : []);
    if (images && images.length > 1) {
      setImageLoading(true);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setImageError(false);
    }
  }, [property?.images, property?.image]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
    setImageLoading(true);
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, property, nextImage, prevImage]);

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

  // Handle schedule viewing click
  const handleScheduleViewing = () => {
    onClose(); // Close the modal first
    navigate('/contact'); // Navigate to contact page
  };

  if (!isOpen || !property) return null;

  const currentImage = getCurrentImage();
  const hasImages = (property?.images && property.images.length > 0) || property?.image;
  const hasMultipleImages = property?.images && property.images.length > 1;
  
  // For single image properties, create a temporary array for consistency
  const displayImages = property?.images || (property?.image ? [property.image] : []);
  
  // Debug logging
  console.log('🖼️ PropertyModal Debug:', {
    hasImages,
    hasMultipleImages,
    imagesLength: property?.images?.length,
    displayImagesLength: displayImages.length,
    currentImageIndex,
    imageLoading
  });

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
              {/* Loading state */}
              {imageLoading && !imageError && (
                <div className="image-loading-placeholder">
                  <div className="loading-spinner">⏳</div>
                  <p>Loading images...</p>
                </div>
              )}
              
              {/* No images state */}
              {!hasImages && !imageError && !imageLoading && (
                <div className="no-images-placeholder">
                  <div className="no-images-icon">🏠</div>
                  <p>No images available</p>
                </div>
              )}
              
              {/* Image display */}
              {currentImage && (
                <img 
                  src={currentImage} 
                  alt={property.address} 
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="modal-property-image"
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
              )}
              
              {/* Navigation arrows */}
              {hasMultipleImages && !imageLoading && (
                <>
                  <button className="slideshow-nav-btn prev-btn" onClick={prevImage}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="slideshow-nav-btn next-btn" onClick={nextImage}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
              
              {/* Image counter */}
              {hasMultipleImages && !imageLoading && (
                <div className="slideshow-counter">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              )}
              
              
            </div>
          </div>

          <div className="modal-right">
            <div className="property-details">
              <div className="property-header">
                <h2 className="property-address">{property.address}</h2>
                <p className="property-suburb">{property.suburb}</p>
                <div className="property-type">
                  <span className="type-badge">{property.propertyType === 'Home and Land Packages' ? 'HOME & LAND' : property.propertyType?.toUpperCase()}</span>
                </div>
              </div>

              {/* Property Features - Show all available info horizontally */}
              <div className="property-features-horizontal">
                {typeof property.frontage === 'number' && property.frontage > 0 && (
                  <div className="feature-item-horizontal">
                    <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7 9v6M17 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{property.frontage} m frontage</span>
                  </div>
                )}
                {property.landSize && (
                  <div className="feature-item-horizontal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{property.landSize} sqm</span>
                  </div>
                )}
                {typeof property.buildSize === 'number' && property.buildSize > 0 && (
                  <div className="feature-item-horizontal">
                    <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{property.buildSize} sqm build</span>
                  </div>
                )}
                
                {property.bedrooms > 0 && (
                  <div className="feature-item-horizontal">
                    <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="10" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                
                {property.bathrooms > 0 && (
                  <div className="feature-item-horizontal">
                    <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="12" width="18" height="5" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 12V9a2 2 0 0 1 2-2h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                
                {property.parking > 0 && (
                  <div className="feature-item-horizontal">
                    <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13l3-4h8l3 3h4v5H3v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{property.parking} Parking</span>
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
                <button className="btn btn-outline" onClick={handleScheduleViewing}>
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
