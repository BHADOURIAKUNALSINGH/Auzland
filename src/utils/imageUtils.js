// CloudFront Image URL Generator
const CLOUDFRONT_DOMAIN = 'https://dx9e0rbpjsaqb.cloudfront.net'; // Your existing CloudFront domain

export const getImageUrl = (imagePath, options = {}) => {
  const { 
    width, 
    height, 
    quality = 80,
    format = 'webp'
  } = options;

  // For CloudFront with image optimization
  let url = `${CLOUDFRONT_DOMAIN}/${imagePath}`;
  
  // Add query parameters for image resizing (if using Lambda@Edge)
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 80) params.append('q', quality);
  if (format !== 'webp') params.append('f', format);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return url;
};

// Preload critical images
export const preloadImage = (src) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

// Generate responsive image srcset
export const getResponsiveImageSet = (imagePath) => {
  const sizes = [400, 800, 1200, 1600];
  return sizes.map(size => 
    `${getImageUrl(imagePath, { width: size })} ${size}w`
  ).join(', ');
};