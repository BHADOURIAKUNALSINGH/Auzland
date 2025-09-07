import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import './HomePage.css';

const LISTINGS_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings';
const MEDIA_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(3); // Show 3 properties per page on homepage

  // Modal handlers
  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(featuredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = featuredProperties.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to page 1 when featured properties change
  useEffect(() => {
    setCurrentPage(1);
  }, [featuredProperties.length]);

  // Helper functions from PropertiesPage
  const parseCsv = (csv) => {
    const rows = [];
    if (!csv) return rows;
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return rows;
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      if (values.length === headers.length) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.replace(/"/g, '') || '';
        });
        rows.push(obj);
      }
    }
    return rows;
  };

  const toNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  // Fetch presigned URLs for media files
  const fetchPresignedUrl = async (mediaKey) => {
    try {
      const response = await fetch(`${MEDIA_API_URL}?key=${encodeURIComponent(mediaKey)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch presigned URL: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.ok || !data.presignedUrl) {
        throw new Error('Invalid response from media service');
      }
      return data.presignedUrl;
    } catch (error) {
      console.error('❌ Error fetching presigned URL:', error);
      throw new Error(`Failed to get media access: ${error.message}`);
    }
  };

  // Extract all images from media array with CSV formatting fixes
  const getAllImagesFromMedia = useCallback(async (mediaString) => {
    if (!mediaString) return [];
    
    console.log('🔍 Processing media string:', mediaString);
    
    try {
      // Fix CSV double-quote escaping issues: "" -> "
      let cleanedString = mediaString.toString();
      console.log('🔍 Original string:', cleanedString);
      
      // Remove outer quotes if present
      if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
        cleanedString = cleanedString.slice(1, -1);
        console.log('🔍 After removing outer quotes:', cleanedString);
      }
      
      // Fix double-escaped quotes: "" -> "
      cleanedString = cleanedString.replace(/""/g, '"');
      console.log('🔍 After fixing quotes:', cleanedString);
      
      // Parse the cleaned JSON
      const mediaKeys = JSON.parse(cleanedString);
      console.log('🔍 Parsed media keys:', mediaKeys);
      
      if (!Array.isArray(mediaKeys) || mediaKeys.length === 0) {
        return [];
      }
      
      // Filter for image files only
      const imageKeys = mediaKeys.filter(key => {
        if (typeof key !== 'string') return false;
        const extension = key.toLowerCase().split('.').pop();
        const allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
        const isImage = allowedImageFormats.includes(extension);
        console.log(`🔍 File: ${key}, Extension: ${extension}, Is Image: ${isImage}`);
        return isImage;
      });
      
      console.log('🔍 Filtered image keys:', imageKeys);
      
      if (imageKeys.length === 0) return [];
      
      // Get presigned URLs for all images
      const imagePromises = imageKeys.map(async (imageKey) => {
        try {
          const presignedUrl = await fetchPresignedUrl(imageKey);
          return presignedUrl;
        } catch (error) {
          console.error(`❌ Failed to get presigned URL for ${imageKey}:`, error);
          return null;
        }
      });
      
      const presignedUrls = await Promise.all(imagePromises);
      const validUrls = presignedUrls.filter(url => url !== null);
      return validUrls;
    } catch (error) {
      console.error('❌ Error processing media:', error);
      
      // Try alternative parsing approaches for malformed JSON
      try {
        // Approach 1: Maybe it's a simple file path, not JSON
        if (typeof mediaString === 'string' && mediaString.includes('media/') && !mediaString.includes('[')) {
          const cleanPath = mediaString.replace(/['"]/g, '').trim();
          const extension = cleanPath.toLowerCase().split('.').pop();
          const allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
          
          if (allowedImageFormats.includes(extension)) {
            const presignedUrl = await fetchPresignedUrl(cleanPath);
            return [presignedUrl];
          }
        }
        
        // Approach 2: Try to extract file paths with regex
        // Robust regex that handles ANY special characters in filenames
        // Uses a more permissive approach: match "media/" followed by anything until a valid image extension
        const mediaPathRegex = /media\/.*?\.(jpg|jpeg|png|gif|webp|bmp|svg)(?=[\s"'\]\},]|$)/gi;
        const matches = mediaString.match(mediaPathRegex);
        
        if (matches && matches.length > 0) {
          const imagePromises = matches.map(async (imagePath) => {
            try {
              // Clean up any trailing spaces or characters
              const cleanImagePath = imagePath.trim();
              console.log('✅ Using image from regex:', cleanImagePath);
              const presignedUrl = await fetchPresignedUrl(cleanImagePath);
              return presignedUrl;
            } catch (error) {
              console.error(`❌ Failed to get presigned URL for ${imagePath}:`, error);
              return null;
            }
          });
          
          const presignedUrls = await Promise.all(imagePromises);
          const validUrls = presignedUrls.filter(url => url !== null);
          return validUrls;
        }
        
      } catch (altError) {
        console.error('❌ Alternative parsing also failed:', altError);
      }
      
      return [];
    }
  }, []);

  // Sample property data (keeping as fallback)
  const fallbackProperties = [
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
    }
  ];

  // Load real properties from API
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      setIsLoading(true);
      try {
        console.log('🏠 Loading featured properties from API...');
        console.log('🏠 API URL:', LISTINGS_API_URL);
        let res = await fetch(LISTINGS_API_URL);
        console.log('🏠 API Response status:', res.status, res.statusText);
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
        
        const responseData = await res.json();
        console.log('🏠 Raw API response:', responseData);
        const csv = responseData.csv || responseData;
        console.log('🏠 CSV data length:', csv.length);
        const rows = parseCsv(csv);
        
        // Filter for visible properties and randomly select 6 from the dataset
        const visibleRows = rows.filter(r => (r.propertyCustomerVisibility || '1') === '1');
        const shuffledRows = [...visibleRows].sort(() => Math.random() - 0.5);
        const mapped = shuffledRows.slice(0, 6).map((r, idx) => {
          const property = {
            id: r.id || `property-${idx}`,
            address: r.address || r.suburb || `Property ${idx + 1}`,
            suburb: r.suburb || '',
            propertyType: r.propertyType || '',
            bedrooms: toNumber(r.bed) || 0,
            bathrooms: toNumber(r.bath) || 0,
            parking: toNumber(r.garage) || 0,
            landSize: toNumber(r.landSize) || 0,
            media: r.media || '',
            images: [], // Will be populated with real images (or stay empty for hourglass)
            price: '',
            status: r.availability || 'For Sale',
            priceNumber: (() => { 
              const raw = (r.price || '').toString(); 
              const n = Number(raw.replace(/[^0-9]/g, '')); 
              return Number.isFinite(n) ? n : 0; 
            })(),
            propertyCustomerVisibility: r.propertyCustomerVisibility || '1',
            priceCustomerVisibility: r.priceCustomerVisibility || '0'
          };
          console.log(`🏠 Mapped property ${idx}:`, property);
          return property;
        });
        
        console.log(`🏠 Found ${rows.length} total properties, randomly selected ${mapped.length} for homepage`);
        console.log('🏠 Sample property:', mapped[0]);
        console.log('🏠 All properties addresses:', mapped.map(p => p.address));
        console.log('🏠 Raw CSV rows (first 3):', rows.slice(0, 3));
        
        // Set initial properties without images
        setFeaturedProperties(mapped);
        console.log('🏠 Properties set in state:', mapped.length);
        setIsLoading(false); // Set loading to false so we can see properties immediately
        
        // Only load images for properties that have media data
        const loadImages = async () => {
          const results = [...mapped];
          const propertiesWithMedia = mapped.filter(p => p.media && p.media.trim());
          
          console.log(`🏠 ${propertiesWithMedia.length} out of ${mapped.length} properties have media data`);
          console.log(`🏠 ${mapped.length - propertiesWithMedia.length} properties will show hourglass`);
          console.log('🏠 Properties with media:', propertiesWithMedia.map(p => ({ address: p.address, media: p.media })));
          
          for (let i = 0; i < propertiesWithMedia.length; i++) {
            const property = propertiesWithMedia[i];
            const originalIndex = mapped.findIndex(p => p.id === property.id);
            
            try {
              console.log(`🖼️ Loading images for ${property.address || property.suburb}...`);
              console.log(`🖼️ Raw media data:`, property.media);
              const imageUrls = await getAllImagesFromMedia(property.media);
              results[originalIndex] = { ...property, images: imageUrls };
              
              if (imageUrls && imageUrls.length > 0) {
                console.log(`✅ Loaded ${imageUrls.length} images for ${property.address || property.suburb}:`, imageUrls);
              } else {
                console.log(`⚠️ No images for ${property.address || property.suburb}`);
              }
              
              // Update state after each property to show progressive loading
              setFeaturedProperties([...results]);
              
            } catch (error) {
              console.error(`❌ Failed to load images for ${property.address}:`, error);
              results[originalIndex] = { ...property, images: [] };
            }
            
            // Small delay between requests
            if (i < propertiesWithMedia.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          const totalWithImages = results.filter(p => p.images && p.images.length > 0).length;
          const totalWithoutMedia = mapped.length - propertiesWithMedia.length;
          console.log(`✅ Featured properties loaded: ${totalWithImages} have images, ${totalWithoutMedia} show hourglass`);
        };
        
        loadImages();
        
      } catch (error) {
        console.error('❌ Error loading featured properties:', error);
        // Use fallback properties if API fails
        console.log('🔄 Using fallback properties...');
        setFeaturedProperties(fallbackProperties);
        setIsLoading(false);
      }
    };
    
    loadFeaturedProperties();
  }, []); // Run only once on component mount

  // Debug logging for render
  console.log('🏠 HomePage render - isLoading:', isLoading, 'featuredProperties.length:', featuredProperties.length);
  console.log('🏠 Featured properties data:', featuredProperties);

  return (
    <div className="home-page">
      <Hero />
      
      {/* Featured Properties Section */}
      <section className="section featured-properties">
        <div className="container">
          <h2 className="section-title">Properties We Think You'll Love</h2>
          
          {/* Special Banner */}
          <div className="special-banner">
            <div className="banner-content">
              <h3>EXCLUSIVE INVESTMENT OPPORTUNITY</h3>
              <p>Prime Development Site With DA Approval - Perfect for Modern Residential Development</p>
              <button className="btn btn-primary">View Details</button>
            </div>
          </div>
          
          {isLoading && featuredProperties.length === 0 ? (
            // Show loading placeholders
            <div className="properties-vertical-container">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`loading-${index}`} className="property-card-loading">
                  <div className="loading-image">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading real listings...</p>
                  </div>
                  <div className="loading-content">
                    <div className="loading-line loading-line-title"></div>
                    <div className="loading-line loading-line-subtitle"></div>
                    <div className="loading-line loading-line-features"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <div className="properties-vertical-container">
                {currentProperties.map((property) => (
                  <div key={property.id} className="vertical-property-card" onClick={() => handlePropertyClick(property)}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    <button 
                      className="pagination-btn prev-btn" 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="ellipsis">...</span>
                          <button
                            className="page-number"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button 
                      className="pagination-btn next-btn" 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-properties-message">
              <p>No properties available at the moment. Please check back later.</p>
            </div>
          )}
          
          <div className="view-all-container">
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/buy')}
            >
              View All Properties
            </button>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="section services-section">
        <div className="container">
          <h2 className="section-title">Explore All Things Property</h2>
          <div className="services-grid">
            <div className="service-card card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V10H12V5H7V19H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Get Estimated Property Prices</h3>
              <p>See how much your property's worth whether you own it or want to buy it.</p>
              <button className="btn btn-primary" onClick={() => navigate('/contact')}>Check Property Values</button>
            </div>
            
            <div className="service-card card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Need Help with a Mortgage?</h3>
              <p>Compare your finance options to make an informed call.</p>
              <button className="btn btn-primary" onClick={() => navigate('/contact')}>Explore Home Loans</button>
            </div>
            
            <div className="service-card card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 20L3 17V4L9 1L15 4V17L9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 1V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Explore Suburb Profiles</h3>
              <p>Check out different suburb profiles and find one that's right for you.</p>
              <button className="btn btn-primary" onClick={() => navigate('/blog')}>Research Suburbs</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest News Section */}
      <section className="section news-section">
        <div className="container">
          <h2 className="section-title">Latest Property News</h2>
          <div className="news-grid">
            <div className="news-card card">
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop" alt="Property News" />
              <div className="news-content">
                <h3>Market Update: Sydney Property Trends 2024</h3>
                <p>Discover the latest trends and insights in Sydney's property market...</p>
                <button className="btn btn-secondary">Read More</button>
              </div>
            </div>
            
            <div className="news-card card">
              <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop" alt="Property News" />
              <div className="news-content">
                <h3>Investment Opportunities in Regional NSW</h3>
                <p>Explore the growing investment potential in regional New South Wales...</p>
                <button className="btn btn-secondary">Read More</button>
              </div>
            </div>
            
            <div className="news-card card">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop" alt="Property News" />
              <div className="news-content">
                <h3>First Home Buyer Guide 2024</h3>
                <p>Everything you need to know about buying your first home in Australia...</p>
                <button className="btn btn-secondary">Read More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PropertyModal 
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default HomePage; 