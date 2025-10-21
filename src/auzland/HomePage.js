import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import SellImage from '../media/Landing_humanm/2149383571.webp';
import BuyImage from '../media/Landing_humanm/Downsizing-in-Your-50s.jpg';
// import PropertyCard from './PropertyCard'; // Unused import
import PropertyModal from './PropertyModal';
import './HomePage.css';

// Disable noisy console logs in production (keep warnings/errors)
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
  try {
    // eslint-disable-next-line no-console
    console.log = () => {};
    // eslint-disable-next-line no-console
    console.debug = () => {};
  } catch (_) {}
}

const LISTINGS_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings';
const MEDIA_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media';
const CLOUDFRONT_BASE_URL = 'https://dx9e0rbpjsaqb.cloudfront.net/';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1); // Unused
  // const [propertiesPerPage] = useState(3); // Show 3 properties per page on homepage - Unused
  const [currentSlide, setCurrentSlide] = useState(0);
  // const [visibleSections, setVisibleSections] = useState(new Set()); // Unused
  // const [scrollProgress, setScrollProgress] = useState(0); // Unused
  const [pageLoaded, setPageLoaded] = useState(false);
  const reviews = [
    {
      rating: 5,
      label: 'Verified review',
      title: 'Seller of house in Blair Athol, NSW',
      time: '1 year ago',
      text:
        'I recently sold my home with Abhi and was very pleased. His professionalism and skills were outstanding. Highly recommended.'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Buyer of house in Austral, NSW',
      time: '1 year 1 month ago',
      text:
        'The buying process was smooth. Abhi was very helpful and kept us informed the whole time. He explained everything clearly and guided us.'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Seller of house in Austral, NSW',
      time: '1 year 1 month ago',
      text:
        'Sold my property through Abhi and had an excellent experience. He was professional, communicative, and secured a great price. Highly satisfied with the outcome.'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Buyer of house in Blair Athol, NSW',
      time: '1 year 1 month ago',
      text:
        "I recently bought a home through Abhi and had a great experience. He was patient, knowledgeable, and provided clear advice, making everything easy. I'm very happy with the home he found for me."
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Seller of house in Austral, NSW',
      time: '1 year 1 month ago',
      text:
        'It was a great experience working with Abhi. He was professional, knowledgeable, and always available to help. He made the process smooth and easy. Highly recommend!'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Buyer of house in Austral, NSW',
      time: '1 year 3 months ago',
      text:
        'Abhi was very helpful to us in our purchase. We really appreciated how much he helped us negotiate every step along the way. We found him to be friendly, honest and professional.'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Buyer of residential land in Leppington, NSW',
      time: '1 year 4 months ago',
      text:
        'Abhi is really amazing. He helped us a lot to seal the deal. He was always quick, patient, and understood our situation well. We liked how he was always honest and clear with us. He made everything seem easy. Thanks a lot, Abhi! We hope to work with you again in the future.'
    },
    {
      rating: 5,
      label: 'Verified review',
      title: 'Buyer of residential land in Leppington, NSW',
      time: '1 year 4 months ago',
      text:
        'Abhi was exceptional in helping me purchase land in Leppington, demonstrating deep market knowledge and outstanding professionalism. He provided invaluable insights, was always available for questions, and secured a great deal. Highly recommend Abhi for his dedication and expertise.'
    }
  ];
  
  // Refs for scroll animations
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  // Page load animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll animation observer - commented out as unused
  /*
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  */

  // Helper function to set section ref
  const setSectionRef = (id) => (el) => {
    if (el) {
      sectionRefs.current[id] = el;
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  };

  // Modal handlers
  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Slideshow navigation
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Pagination logic - commented out as unused
  // const totalPages = Math.ceil(featuredProperties.length / propertiesPerPage);
  // const startIndex = (currentPage - 1) * propertiesPerPage;
  // const endIndex = startIndex + propertiesPerPage;
  // const currentProperties = featuredProperties.slice(startIndex, endIndex); // Unused

  // Pagination functions - commented out as unused
  // const goToPage = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // };

  // const goToNextPage = () => {
  //   if (currentPage < totalPages) {
  //     setCurrentPage(currentPage + 1);
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // };

  // const goToPreviousPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // };

  // Reset to page 1 when featured properties change - commented out as unused
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [featuredProperties.length]);

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

  // Build CloudFront URL for media key
  const buildCloudFrontUrl = (mediaKey) => {
    const key = mediaKey.startsWith('/') ? mediaKey.slice(1) : mediaKey;
    return `${CLOUDFRONT_BASE_URL}${key}`;
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
      let mediaKeys = [];
      let cleanedString = mediaString.toString();
      console.log('🔍 Original string:', cleanedString);
      
      // Remove outer quotes if present (from CSV escaping)
      if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
        cleanedString = cleanedString.slice(1, -1);
        console.log('🔍 After removing outer quotes:', cleanedString);
      }
      
      // Fix double-escaped quotes: "" -> "
      cleanedString = cleanedString.replace(/""/g, '"');
      console.log('🔍 After fixing quotes:', cleanedString);
      
      // Check if it's a simple array format: [item1,item2,item3]
      if (cleanedString.startsWith('[') && cleanedString.endsWith(']')) {
        // Remove brackets and split by comma
        const content = cleanedString.slice(1, -1);
        if (content.trim()) {
          mediaKeys = content.split(',').map(key => key.trim());
        }
        console.log('🔍 Parsed as simple array format:', mediaKeys);
      } else {
        // Try to parse as JSON (for backward compatibility)
        mediaKeys = JSON.parse(cleanedString);
        console.log('🔍 Parsed as JSON format:', mediaKeys);
      }
      
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
        const mediaPathRegex = /media\/.*?\.(jpg|jpeg|png|gif|webp|bmp|svg)(?=[\s"'\]},]|$)/gi;
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
  const fallbackProperties = useMemo(() => [
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
  ], []); // Empty dependency array since this is static data

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
        
        // Filter for visible properties first
        const visibleRows = rows.filter(r => (r.propertyCustomerVisibility || '1') === '1');
        
        // Filter for specific properties from the images
        const specificProperties = visibleRows.filter(r => {
          const address = (r.address || '').toLowerCase();
          return address.includes('29b frampton drive') || 
                 address.includes('35 hewitt road') || 
                 address.includes('37 hewitt road') 
        });
        
        console.log(`🏠 Found ${specificProperties.length} specific properties out of ${visibleRows.length} visible properties`);
        
        // Use specific properties if available, otherwise fallback to random selection
        let selectedRows = specificProperties.length > 0 ? specificProperties.slice(0, 3) : visibleRows.slice(0, 3);
        
        // If no properties found, use fallback data
        if (selectedRows.length === 0) {
          console.log('🏠 No properties found, using fallback data');
          selectedRows = [
            { 
              id: 'fallback-1', 
              address: '29b Frampton Drive', 
              suburb: 'Gilead', 
              propertyType: 'Townhouse',
              bed: 3,
              bath: 2,
              garage: 2,
              landSize: 570,
              price: '$1,049,000',
              availability: 'For Sale',
              media: '[]'
            },
            { 
              id: 'fallback-2', 
              address: '35 Hewitt Road', 
              suburb: 'Lochinvar', 
              propertyType: 'Single Story',
              bed: 4,
              bath: 2,
              garage: 2,
              landSize: 596,
              price: '$850,000',
              availability: 'For Sale',
              media: '[]'
            },
            { 
              id: 'fallback-3', 
              address: '37 Hewitt Road', 
              suburb: 'Lochinvar', 
              propertyType: 'Single Story',
              bed: 4,
              bath: 2,
              garage: 2,
              landSize: 596,
              price: '$875,000',
              availability: 'For Sale',
              media: '[]'
            }
          ];
        }
        
        // Fallback images for the specific properties
        const fallbackImages = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&q=80', // Townhouse
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&q=80', // Single story
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop&q=80'  // Single story
        ];

        const mapped = selectedRows.map((r, idx) => {
          // Try to get image from media field
          let imageUrl = '';
          console.log(`🏠 Property ${idx} media field:`, r.media);
          if (r.media) {
            try {
              const mediaArray = JSON.parse(r.media);
              if (Array.isArray(mediaArray) && mediaArray.length > 0) {
                // Filter for image files only
                const imageFiles = mediaArray.filter(file => {
                  const extension = file.toLowerCase().split('.').pop();
                  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(extension);
                });
                
                if (imageFiles.length > 0) {
                  imageUrl = buildCloudFrontUrl(imageFiles[0]);
                  console.log(`🏠 Using S3 image for property ${idx}:`, imageUrl);
                }
              }
            } catch (e) {
              console.log('Failed to parse media:', r.media);
              // Try alternative parsing for malformed JSON
              const mediaPathRegex = /media\/.*?\.(jpg|jpeg|png|gif|webp|bmp|svg)(?=[\s"'\]},]|$)/gi;
              const matches = r.media.match(mediaPathRegex);
              if (matches && matches.length > 0) {
                imageUrl = buildCloudFrontUrl(matches[0]);
                console.log(`🏠 Using regex-parsed S3 image for property ${idx}:`, imageUrl);
              }
            }
          }
          
          // Use fallback image if no S3 media found
          if (!imageUrl) {
            imageUrl = fallbackImages[idx] || fallbackImages[0];
            console.log(`🏠 Using fallback image for property ${idx}:`, imageUrl);
          }

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
            image: imageUrl, // Add the image property for slideshow
            price: r.price || '$0',
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
        
        // Don't set properties initially - wait for images to load
        // setFeaturedProperties(mapped);
        console.log('🏠 Starting image loading for Grassbird and Sharp Street properties:', mapped.length);
        // Keep loading true until we have properties with images
        
        // Load images for the selected properties (already filtered for Grassbird/Sharp Street)
        const loadImages = async () => {
          console.log(`🏠 Processing ${mapped.length} selected properties for image loading`);
          console.log('🏠 Selected properties:', mapped.map(p => p.address));
          
          // Filter for properties that have media data
          const propertiesWithMedia = mapped.filter(p => p.media && p.media.trim());
          
          console.log(`🏠 ${propertiesWithMedia.length} out of ${mapped.length} selected properties have media data`);
          console.log('🏠 Properties with media:', propertiesWithMedia.map(p => ({ address: p.address, media: p.media })));
          
          const propertiesWithImages = [];
          
          for (let i = 0; i < propertiesWithMedia.length; i++) {
            const property = propertiesWithMedia[i];
            
            try {
              console.log(`🖼️ Loading images for ${property.address || property.suburb}...`);
              console.log(`🖼️ Raw media data:`, property.media);
              const imageUrls = await getAllImagesFromMedia(property.media);
              
              if (imageUrls && imageUrls.length > 0) {
                console.log(`✅ Loaded ${imageUrls.length} images for ${property.address || property.suburb}:`, imageUrls);
                propertiesWithImages.push({ ...property, images: imageUrls });
                
                // Update state after each property to show progressive loading
                setFeaturedProperties([...propertiesWithImages]);
                console.log(`🎯 Updated featuredProperties with ${propertiesWithImages.length} properties`);
              } else {
                console.log(`⚠️ No images for ${property.address || property.suburb} - skipping from display`);
              }
              
            } catch (error) {
              console.error(`❌ Failed to load images for ${property.address}:`, error);
              console.log(`⚠️ Skipping ${property.address} due to image loading failure`);
            }
            
            // Small delay between requests
            if (i < propertiesWithMedia.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          const totalWithImages = propertiesWithImages.length;
          const totalWithoutMedia = mapped.length - propertiesWithMedia.length;
          console.log(`✅ Featured properties loaded: ${totalWithImages} properties have images and will be displayed`);
          console.log(`ℹ️ ${totalWithoutMedia} properties had no media data and were filtered out`);
          console.log(`ℹ️ ${propertiesWithMedia.length - totalWithImages} properties had media but no valid images and were filtered out`);
          
          // Set loading to false after processing all properties
          setIsLoading(false);
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
  }, [fallbackProperties, getAllImagesFromMedia]); // Include dependencies

  // Debug logging for render
  console.log('🏠 HomePage render - isLoading:', isLoading, 'featuredProperties.length:', featuredProperties.length);
  console.log('🏠 Featured properties data:', featuredProperties);

  return (
    <div className="home-page">
      <Hero />
      
      {/* Featured Properties Section */}
      <section 
        id="featured-properties" 
        ref={setSectionRef('featured-properties')}
        className={`section featured-properties ${pageLoaded ? 'animate-in' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2 className={`section-title handwriting-font ${pageLoaded ? 'animate-title' : ''}`}>
              We've Got The Right Properties For You
            </h2>
            <p className={`section-subtitle ${pageLoaded ? 'animate-subtitle' : ''}`}>
              Your Gateway to South West Sydney Living.
            </p>
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
              <div className="properties-slideshow">
                <div className="slideshow-container">
                  {featuredProperties.slice(0, 3).map((property, index) => (
                    <div 
                      key={property.id} 
                      className={`slideshow-slide ${index === currentSlide ? 'active' : ''}`}
                      style={{ 
                        backgroundImage: `url(${property.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="slide-overlay">
                        <div className="slide-content">
                          <div className="property-badge">HOT SELLING</div>
                          <h1 className="slide-address">{property.address}</h1>
                          <p className="slide-suburb">{property.suburb}</p>
                          <div className="slide-details">
                            <span className="slide-size">{property.landSize || 'N/A'} sqm</span>
                            <span className="slide-type">{property.propertyType}</span>
                            <span className="slide-status">{property.status}</span>
                          </div>
                          <div className="slide-description">
                            <p>
                              This exceptional {property.propertyType.toLowerCase()} in {property.suburb} is generating incredible interest in today's market. 
                              With {property.bedrooms} bedrooms and {property.bathrooms} bathrooms, this stunning property offers the perfect blend of 
                              modern living and timeless appeal. The {property.landSize || 'generous'} square meter block provides ample space for 
                              families to grow and entertain.
                            </p>
                            <p>
                              Don't miss your chance to secure this highly sought-after property. Contact us today to schedule an exclusive viewing 
                              and discover why this home is the talk of {property.suburb}.
                            </p>
                          </div>
                          <div className="slide-actions">
                          <button
                              className="btn btn-primary btn-large"
                              onClick={() => handlePropertyClick(property)}
                          >
                              View Details
                          </button>
                          <button
                              className="btn btn-secondary btn-large"
                              onClick={() => navigate('/contact')}
                          >
                              Schedule Viewing
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                    
                {/* Navigation Dots */}
                <div className="slideshow-dots">
                  {featuredProperties.slice(0, 3).map((_, index) => (
                    <button 
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button className="slideshow-arrow prev" onClick={prevSlide}>
                  ←
                </button>
                <button className="slideshow-arrow next" onClick={nextSlide}>
                  →
                </button>
              </div>
            </>
          ) : (
            <div className="no-properties-message">
              <p>No properties available at the moment. Please check back later.</p>
            </div>
          )}
          
          <div className="view-all-container" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/buy')}
            >
              View All Properties
            </button>
            <a className="btn btn-primary btn-large" href="/contact">
              Request Appraisal Now
            </a>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section 
        id="services-section" 
        ref={setSectionRef('services-section')}
        className={`section services-section ${pageLoaded ? 'animate-in' : ''}`}
      >
        <div className="container">
          <h2 className={`section-title handwriting-font ${pageLoaded ? 'animate-title' : ''}`}>
            Explore All Things Property
          </h2>
          <div className={`services-grid ${pageLoaded ? 'animate-grid' : ''}`}>
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
              <button className="btn btn-primary" onClick={() => navigate('/contact')}>Research Suburbs</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sell & Buy with AuzLandRE Section */}
      <section 
        id="sell-buy-section" 
        ref={setSectionRef('sell-buy-section')}
        className={`section sell-buy-section ${pageLoaded ? 'animate-in' : ''}`}
      >
        <div className="container">
          {/* Sell with AuzLandRE */}
          <div className="sell-buy-row">
            <div className="sell-buy-image">
              <img 
                src={SellImage} 
                alt="Family selling their home" 
                onError={(e) => {
                  try {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = (process && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '') + '/media/Landing_humanm/2149383571.webp';
                  } catch (_) {}
                }}
              />
            </div>
            <div className="sell-buy-content">
              <h2 className="sell-buy-title handwriting-font">| Sell with AuzLandRE</h2>
              <p className="sell-buy-description">
                Your home is one of your most significant assets. At AuzLandRE we make it possible to sell your home in a simple and stress-free way, supporting you every step of the way.
              </p>
              <button className="btn btn-primary btn-large" onClick={() => navigate('/contact')}>
                Sell with AuzLandRE
              </button>
            </div>
          </div>

          {/* Buy with AuzLandRE */}
          <div className="sell-buy-row reverse">
            <div className="sell-buy-content">
              <h2 className="sell-buy-title handwriting-font">| Buy with AuzLandRE</h2>
              <p className="sell-buy-subtitle">We make it possible.</p>
              <p className="sell-buy-description">
                Whether you're excited to be purchasing your very first home, or upsizing for greater comfort and convenience, AuzLandRE will help you select the best property for you and your family.
              </p>
              <button className="btn btn-primary btn-large" onClick={() => navigate('/buy')}>
                Buy with AuzLandRE
              </button>
            </div>
            <div className="sell-buy-image">
              <img 
                src={BuyImage} 
                alt="Happy couple buying their home" 
                onError={(e) => {
                  try {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = (process && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '') + '/media/Landing_humanm/Downsizing-in-Your-50s.jpg';
                  } catch (_) {}
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Satisfaction Section */}
      <section 
        id="client-satisfaction" 
        ref={setSectionRef('client-satisfaction')}
        className={`section client-satisfaction ${pageLoaded ? 'animate-in' : ''}`}
      >
        <div className="container">
          <h2 className={`section-title handwriting-font ${pageLoaded ? 'animate-title' : ''}`}>
            What Our Clients Say
          </h2>
          <p className={`section-subtitle ${pageLoaded ? 'animate-subtitle' : ''}`}>
            Real stories from families who found their dream homes with AuzLandRE
          </p>
          
          {/* Removed static cards - using continuous two-lane marquee below */}

          {/* Continuous Marquee Reviews */}
          <div className="reviews-marquee">
            <div className="marquee lane-top">
              <div className="marquee-track">
                {[...reviews, ...reviews].map((r, i) => (
                  <div className="marquee-card" key={`top-${i}`}>
                    <div className="marquee-header">
                      <span className="stars">★★★★★</span>
                      <span className="verify">{r.label}</span>
                    </div>
                    <div className="marquee-title">{r.title}</div>
                    <p className="marquee-text">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="marquee lane-bottom">
              <div className="marquee-track">
                {[...reviews.slice().reverse(), ...reviews].map((r, i) => (
                  <div className="marquee-card" key={`bottom-${i}`}>
                    <div className="marquee-header">
                      <span className="stars">★★★★★</span>
                      <span className="verify">{r.label}</span>
                    </div>
                    <div className="marquee-title">{r.title}</div>
                    <p className="marquee-text">{r.text}</p>
                  </div>
                ))}
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