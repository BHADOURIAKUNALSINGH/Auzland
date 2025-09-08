import React, { useState, useEffect } from 'react';
import './ImageGallery.css';
import { getImageUrl } from '../utils/imageUtils';

const ImageGallery = ({ images, alt = "Property image" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // If no images provided, show empty state
  if (!images || images.length === 0) {
    return (
      <div className="image-gallery empty">
        <div className="empty-image">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  // Filter out images that failed to load
  const validImages = images.filter((_, index) => !imageError[index]);

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  // Auto-advance images every 5 seconds if there are multiple images
  useEffect(() => {
    if (validImages.length > 1) {
      const interval = setInterval(nextImage, 5000);
      return () => clearInterval(interval);
    }
  }, [validImages.length]);

  return (
    <div className="image-gallery">
      <div className="gallery-container">
        <div className="main-image-container">
          <img
            src={getImageUrl(validImages[currentIndex], { width: 800, quality: 85 })}
            alt={`${alt} ${currentIndex + 1}`}
            className="main-image"
            onError={() => handleImageError(currentIndex)}
          />
          
          {validImages.length > 1 && (
            <>
              <button 
                className="nav-button prev-button" 
                onClick={prevImage}
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button 
                className="nav-button next-button" 
                onClick={nextImage}
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {validImages.length > 1 && (
          <div className="thumbnail-container">
            {validImages.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
              >
                <img
                  src={getImageUrl(image, { width: 150, quality: 75 })}
                  alt={`${alt} thumbnail ${index + 1}`}
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}

        {validImages.length > 1 && (
          <div className="image-counter">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;

