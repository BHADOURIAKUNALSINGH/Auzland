import React, { useState } from 'react';
import { getImageUrl, preloadImage } from '../utils/imageUtils';

const PropertyImage = ({ imagePath, alt, className, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use CloudFront URL instead of presigned URL
  const imageUrl = getImageUrl(imagePath, { width: 800, quality: 85 });

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Preload critical images
  React.useEffect(() => {
    if (imagePath) {
      preloadImage(imageUrl);
    }
  }, [imageUrl, imagePath]);

  if (hasError) {
    return (
      <div className={`image-loading-placeholder ${className}`}>
        <div className="loading-spinner hourglass">🏠</div>
        <p>Image unavailable</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner hourglass">⏳</div>
          <p>Loading image...</p>
          <small>Optimized via CloudFront</small>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        {...props}
      />
    </div>
  );
};

export default PropertyImage;