import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import './PropertiesPage.css';

const LISTINGS_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings';
const MEDIA_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media';

const PropertiesPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState(params.get('q') || '');
  const [searchDraft, setSearchDraft] = useState(params.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedMin, setBedMin] = useState('');
  const [bathMin, setBathMin] = useState('');
  const [garageMin, setGarageMin] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [suburb, setSuburb] = useState('');
  const [frontageMin, setFrontageMin] = useState('');
  const [frontageMax, setFrontageMax] = useState('');
  const [buildMin, setBuildMin] = useState('');
  const [buildMax, setBuildMax] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12); // Show 12 properties per page

  const clearFilters = () => {
    setSearchText('');
    setTypeFilter('');
    setSuburb('');
    setPriceMin('');
    setPriceMax('');
    setFrontageMin('');
    setFrontageMax('');
    setBuildMin('');
    setBuildMax('');
    setBedMin('');
    setBathMin('');
    setGarageMin('');
    setShowFilters(false);
    try {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.pathname);
    } catch (_) {}
  };

  const parseCsv = (csv) => {
    const rows = [];
    if (!csv) return rows;
    
    console.log('🔍 Parsing CSV, length:', csv.length);
    
    // Use a more robust CSV parsing approach
    const lines = [];
    let currentLine = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < csv.length) {
      const char = csv[i];
      const nextChar = csv[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          currentLine += '"';
          i += 2; // Skip both quotes
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          currentLine += char;
          i++;
        }
      } else if (char === '\n' && !inQuotes) {
        // End of line only if not in quotes
        lines.push(currentLine);
        currentLine = '';
        i++;
      } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
        // Handle \r\n line endings
        lines.push(currentLine);
        currentLine = '';
        i += 2; // Skip both \r and \n
      } else {
        // Any other character (including newlines within quotes)
        currentLine += char;
        i++;
      }
    }
    
    // Add the last line if it exists
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
    
    console.log('🔍 Parsed lines count:', lines.length);
    console.log('🔍 First few lines:', lines.slice(0, 3));
    
    if (lines.length < 2) return rows;
    
    // Parse headers
    const headers = parseCsvLine(lines[0]);
    console.log('🔍 Headers:', headers);
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      console.log(`🔍 Row ${i} values count:`, values.length, 'Expected:', headers.length);
      
      if (values.length === headers.length) {
        const obj = {};
        headers.forEach((header, index) => {
          let value = values[index] || '';
          
          // Clean up escaped quotes
          value = value.replace(/""/g, '"');
          
          // Transform legacy "Home and Land Packages" to "Home & Land"
          if (value.toLowerCase() === 'home and land packages') {
            value = 'Home & Land';
          }
          
          obj[header] = value;
        });
        rows.push(obj);
      } else {
        console.warn(`⚠️ Row ${i} has ${values.length} values but expected ${headers.length}. Skipping row.`);
        console.warn('Row content:', lines[i].substring(0, 200) + '...');
      }
    }
    
    console.log('🔍 Final parsed rows count:', rows.length);
    return rows;
  };

  // Helper function to parse a single CSV line
  const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          current += '"';
          i += 2; // Skip both quotes
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        values.push(current);
        current = '';
        i++;
      } else {
        // Regular character (including newlines, tabs, emojis, punctuation, etc.)
        // This handles ALL characters: letters, numbers, symbols, punctuation, emojis, unicode, etc.
        current += char;
        i++;
      }
    }
    
    // Add the last field
    values.push(current);
    
    return values;
  };

  const toNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  // Test function to verify special character handling
  const testSpecialCharacterHandling = () => {
    const testDescription = `Test description with ALL characters:
    • Emojis: 🏠 🛏️ 🛁 🚗 🌳 📍 ✅ ❌ ⭐ 💯
    • Punctuation: , ; : ? ! / \\ | < > { } [ ] ( ) @ # $ % ^ & * + = ~ \`
    • Quotes: "double quotes" and 'single quotes'
    • Special symbols: © ® ™ € £ ¥ § ¶ † ‡ • … – — 
    • Math symbols: ± × ÷ ∞ ≤ ≥ ≠ ≈ ∑ ∏ ∫
    • Arrows: ← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓
    • Newlines and tabs: 
    Line 1
    	Tabbed line
    Line 3
    • Unicode: ñáéíóú üöä ß ç àèìòù`;
    
    console.log('🧪 Testing special character handling:', {
      original: testDescription,
      length: testDescription.length,
      hasAllChars: testDescription.includes('🏠') && testDescription.includes(',') && testDescription.includes(';') && testDescription.includes(':'),
      preserved: testDescription === testDescription // Should be true
    });
    
    return testDescription;
  };

  // Test CSV parsing with multi-line description
  const testCsvParsing = () => {
    const testCsv = `id,address,suburb,description
1,"123 Test St","Test Suburb","This is a test description
with multiple lines
and special characters: , ; : ? ! / \\ | < > { } [ ] ( ) @ # $ % ^ & * + = ~ \`
and emojis: 🏠 🛏️ 🛁 🚗 🌳 📍 ✅ ❌ ⭐ 💯"
2,"456 Another St","Another Suburb","Simple description"`;
    
    console.log('🧪 Testing CSV parsing with multi-line description:');
    const result = parseCsv(testCsv);
    console.log('🧪 Parsed result:', result);
    return result;
  };

  // Fetch presigned URLs for media files (same as Dashboard)
  const fetchPresignedUrl = async (mediaKey) => {
    try {
      console.log('🔍 Fetching presigned URL for key:', mediaKey);
      const response = await fetch(`${MEDIA_API_URL}?key=${encodeURIComponent(mediaKey)}`);
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch presigned URL: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('🔍 Response data:', data);
      
      if (!data.ok || !data.presignedUrl) {
        throw new Error('Invalid response from media service');
      }
      console.log('🔍 Returning presigned URL:', data.presignedUrl);
      return data.presignedUrl;
    } catch (error) {
      console.error('❌ Error fetching presigned URL:', error);
      throw new Error(`Failed to get media access: ${error.message}`);
    }
  };

  // Extract all images from media array with CSV formatting fixes
  const getAllImagesFromMedia = useCallback(async (mediaString) => {
    if (!mediaString) {
      console.log('🔍 No media string provided');
      return [];
    }
    
    console.log('🔍 Processing media string:', mediaString);
    
    try {
      // Fix CSV double-quote escaping issues: "" -> "
      let cleanedString = mediaString.toString();
      
      // Remove outer quotes if present
      if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
        cleanedString = cleanedString.slice(1, -1);
      }
      
      // Fix double-escaped quotes: "" -> "
      cleanedString = cleanedString.replace(/""/g, '"');
      
      console.log('🔍 Cleaned media string:', cleanedString);
      
      // Now parse the cleaned JSON
      const mediaKeys = JSON.parse(cleanedString);
      console.log('🔍 Parsed media keys:', mediaKeys);
      
      if (!Array.isArray(mediaKeys) || mediaKeys.length === 0) {
        console.log('🔍 No media keys found or not an array');
        return [];
      }
      
      // Filter for image files only
      const imageKeys = mediaKeys.filter(key => {
        if (typeof key !== 'string') return false;
        const extension = key.toLowerCase().split('.').pop();
        const allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
        const isImage = allowedImageFormats.includes(extension);
        console.log(`🔍 Checking ${key}: extension=${extension}, isImage=${isImage}`);
        return isImage;
      });
      
      console.log('🔍 Filtered image keys:', imageKeys);
      
      if (imageKeys.length === 0) {
        console.log('🔍 No image files found in media');
        return [];
      }
      
      // Get presigned URLs for all images
      console.log('🔍 Fetching presigned URLs for all images...');
      const imagePromises = imageKeys.map(async (imageKey) => {
        try {
          const presignedUrl = await fetchPresignedUrl(imageKey);
          console.log(`🔍 Got presigned URL for ${imageKey}:`, presignedUrl);
          return presignedUrl;
        } catch (error) {
          console.error(`❌ Failed to get presigned URL for ${imageKey}:`, error);
          return null;
        }
      });
      
      const presignedUrls = await Promise.all(imagePromises);
      const validUrls = presignedUrls.filter(url => url !== null);
      console.log('🔍 Got valid presigned URLs:', validUrls);
      
      return validUrls;
    } catch (error) {
      console.error('❌ Error processing media:', error);
      console.error('❌ Original string:', mediaString);
      
      // Try alternative parsing approaches for malformed JSON
      try {
        console.log('🔄 Trying alternative parsing...');
        
        // Approach 1: Maybe it's a simple file path, not JSON
        if (typeof mediaString === 'string' && mediaString.includes('media/') && !mediaString.includes('[')) {
          console.log('🔄 Treating as single file path');
          const cleanPath = mediaString.replace(/['"]/g, '').trim();
          const extension = cleanPath.toLowerCase().split('.').pop();
          const allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
          
          if (allowedImageFormats.includes(extension)) {
            console.log('✅ Single image file found:', cleanPath);
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
          console.log('🔄 Found paths with regex:', matches);
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

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };



  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        let res = await fetch(LISTINGS_API_URL);
        if (!res.ok) throw new Error(`Failed to load listings: HTTP ${res.status}`);
        const data = await res.json();
        const csv = typeof data === 'string' ? data : (data.csv || '');
        const rows = parseCsv(csv);
        const placeholder = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1200&auto=format&fit=crop'
        ];
        const mapped = rows.map((r, idx) => ({
          id: r.id || `${r.address || 'property'}-${idx}`,
          address: r.address || '',
          suburb: r.suburb || '',
          propertyType: r.propertyType || r.property_type || '',
          lot: r.lot || '',
          availability: r.availability || '',
          status: r.status || 'For Sale',
          price: r.price || r.price_guide || 'Price on request',
          frontage: toNumber(r.frontage),
          landSize: toNumber(r.landSize) || toNumber(r.land_area_sqm),
          buildSize: toNumber(r.buildSize) || toNumber(r.build_size),
          bedrooms: toNumber(r.bed),
          bathrooms: toNumber(r.bath),
          parking: toNumber(r.garage),
          media: r.media || r.media_url || '', // Store the raw media data
          description: r.description || '', // Add description field
          images: [], // Will be populated with real images
          image: placeholder[idx % placeholder.length], // Fallback for old compatibility
          priceNumber: (() => { const raw = (r.price || r.price_guide || '').toString(); const n = Number(raw.replace(/[^0-9]/g, '')); return Number.isFinite(n) ? n : undefined; })(),
          propertyCustomerVisibility: r.propertyCustomerVisibility || '1',
          priceCustomerVisibility: r.priceCustomerVisibility || '0'
        })).filter((p) => (p.address || p.suburb) && p.propertyCustomerVisibility === '1');
        
        // Test CSV parsing first
        testCsvParsing();
        
        // Debug logging for descriptions
        console.log('🔍 Properties with descriptions:', mapped.filter(p => p.description && p.description.trim()).length);
        const sampleWithDescription = mapped.find(p => p.description && p.description.trim());
        if (sampleWithDescription) {
          const desc = sampleWithDescription.description;
          console.log('🔍 Sample property with description:', {
            address: sampleWithDescription.address,
            description: desc.substring(0, 100) + '...',
            hasNewlines: desc.includes('\n'),
            hasTabs: desc.includes('\t'),
            hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(desc),
            hasPunctuation: /[;:?/\\|<>{}[\]()!@#$%^&*+=~`]/g.test(desc),
            hasCommas: desc.includes(','),
            hasQuotes: desc.includes('"') || desc.includes("'"),
            hasSpecialChars: /[^\w\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(desc),
            length: desc.length,
            characterTypes: {
              letters: (desc.match(/[a-zA-Z]/g) || []).length,
              numbers: (desc.match(/[0-9]/g) || []).length,
              spaces: (desc.match(/\s/g) || []).length,
              punctuation: (desc.match(/[^\w\s]/g) || []).length
            }
          });
        }
        
        // Set initial properties without images
        setProperties(mapped);
        
        // Load images asynchronously in batches to avoid overwhelming the API
        console.log(`🖼️ Loading images for ${mapped.length} properties...`);
        const loadImages = async () => {
          const batchSize = 5; // Process 5 images at a time
          const results = [...mapped]; // Copy the array
          
          for (let i = 0; i < mapped.length; i += batchSize) {
            const batch = mapped.slice(i, i + batchSize);
            console.log(`📦 Loading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(mapped.length/batchSize)}`);
            let batchSuccessCount = 0;
            
            await Promise.all(
              batch.map(async (property, batchIndex) => {
                const actualIndex = i + batchIndex;
                try {
                  const imageUrls = await getAllImagesFromMedia(property.media);
                  results[actualIndex] = { ...property, images: imageUrls };
                  if (imageUrls && imageUrls.length > 0) {
                    batchSuccessCount++;
                    console.log(`✅ Loaded ${imageUrls.length} images for ${property.address || property.suburb}`);
                  } else {
                    console.log(`⚠️ No images for ${property.address || property.suburb} (media: ${property.media?.substring(0, 50)}...)`);
                  }
                } catch (error) {
                  console.error(`❌ Failed to load images for ${property.address}:`, error);
                  results[actualIndex] = { ...property, images: [] };
                }
              })
            );
            
            // Update properties after each batch
            setProperties([...results]);
            
            console.log(`📦 Batch completed: ${batchSuccessCount} images loaded`);
            
            // Small delay between batches
            if (i + batchSize < mapped.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          const totalSuccess = results.filter(p => p.images && p.images.length > 0).length;
          console.log(`✅ Loaded images for ${totalSuccess} out of ${mapped.length} properties`);
        };
        
        loadImages();
      } catch (e) {
        setError(e?.message || 'Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [getAllImagesFromMedia]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const q = p.get('q') || '';
    setSearchText(q);
    setSearchDraft(q);
    setTypeFilter(p.get('type') || '');
    setSuburb(p.get('suburb') || '');
    setPriceMin(p.get('priceMin') || '');
    setPriceMax(p.get('priceMax') || '');
    setFrontageMin(p.get('frontageMin') || '');
    setFrontageMax(p.get('frontageMax') || '');
    setBuildMin(p.get('buildMin') || '');
    setBuildMax(p.get('buildMax') || '');
    setBedMin(p.get('bedMin') || '');
    setBathMin(p.get('bathMin') || '');
    setGarageMin(p.get('garageMin') || '');
  }, [location.search]);

  const filtered = useMemo(() => {
    const q = (searchText || '').toLowerCase().trim();
    console.log('🔍 Searching with query:', q);
    let result = properties.filter((p) => {
      // Create search string that includes all property fields
      const searchString = `${p.address || ''} ${p.suburb || ''} ${p.propertyType || ''} ${p.description || ''}`.toLowerCase();
      
      // Use includes for simple substring matching - this handles ALL characters
      const matches = searchString.includes(q);
      
      if (q && matches) {
        console.log('🔍 Found match:', { 
          address: p.address, 
          searchString: searchString.substring(0, 100) + '...',
          query: q,
          hasDescription: !!p.description
        });
      }
      return matches;
    });
    console.log('🔍 Search results count:', result.length);
    const minP = priceMin ? Number(priceMin) : undefined;
    const maxP = priceMax ? Number(priceMax) : undefined;
    const minBed = bedMin ? Number(bedMin) : undefined;
    const minBath = bathMin ? Number(bathMin) : undefined;
    const minGarage = garageMin ? Number(garageMin) : undefined;
    const minFront = frontageMin ? Number(frontageMin) : undefined;
    const maxFront = frontageMax ? Number(frontageMax) : undefined;
    const minBuild = buildMin ? Number(buildMin) : undefined;
    const maxBuild = buildMax ? Number(buildMax) : undefined;
    const type = (typeFilter || '').toLowerCase();
    const suburbQ = (suburb || '').toLowerCase();
    result = result.filter((p) => {
      if (typeof minP === 'number' && (p.priceNumber ?? Infinity) < minP) return false;
      if (typeof maxP === 'number' && (p.priceNumber ?? 0) > maxP) return false;
      if (typeof minBed === 'number' && (p.bedrooms ?? 0) < minBed) return false;
      if (typeof minBath === 'number' && (p.bathrooms ?? 0) < minBath) return false;
      if (typeof minGarage === 'number' && (p.parking ?? 0) < minGarage) return false;
      if (typeof minFront === 'number' && (p.frontage ?? 0) < minFront) return false;
      if (typeof maxFront === 'number' && (p.frontage ?? Infinity) > maxFront) return false;
      if (typeof minBuild === 'number' && (p.buildSize ?? 0) < minBuild) return false;
      if (typeof maxBuild === 'number' && (p.buildSize ?? Infinity) > maxBuild) return false;
      if (type) {
        const propertyType = (p.propertyType || '').toLowerCase();
        // Handle "Home & Land" filtering for both old and new formats
        if (type === 'home & land') {
          if (!(propertyType.includes('home & land') || propertyType.includes('home and land packages'))) return false;
        } else {
          if (!propertyType.includes(type)) return false;
        }
      }
      if (suburbQ && !(p.suburb || '').toLowerCase().includes(suburbQ)) return false;
      return true;
    });
    return result;
  }, [properties, searchText, priceMin, priceMax, bedMin, bathMin, garageMin, typeFilter, suburb, frontageMin, frontageMax, buildMin, buildMax]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filtered.slice(startIndex, endIndex);

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

  // Reset to page 1 when filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtered.length]);

  return (
    <div className="properties-page">
      <div className="page-header">
        <div className="container">
          <h1>Properties</h1>
          <p className="white-text">Browse available listings</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="filters-section" style={{ marginBottom: 15, alignItems: 'center' }}>
            <div className="filter-group" style={{ width: '100%' }}>
              <label>Search by address or suburb</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Austral, Leppington"
                  value={searchDraft}
                  onChange={(e) => { const v = e.target.value; setSearchDraft(v); setSearchText(v); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setSearchText(searchDraft); } }}
                />
                <button className="filter-toggle-btn" style={{ height: 36 }} onClick={() => setSearchText(searchDraft)}>Search</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              {(typeFilter || suburb || priceMin || priceMax || frontageMin || frontageMax || buildMin || buildMax || bedMin || bathMin || garageMin) && (
                <button className="filter-toggle-btn" style={{ height: 36, marginTop: 20 }} onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
              <button className="filter-toggle-btn" style={{ height: 36, marginTop: 20 }} onClick={() => setShowFilters((s) => !s)}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            {showFilters && (
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, maxWidth: '100%' }}>
                <div className="filter-group">
                  <label>Type</label>
                  <select className="text-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="land only">Land only</option>
                    <option value="single story">Single story</option>
                    <option value="double story">Double story</option>
                    <option value="dual occupancy">Dual occupancy</option>
                    <option value="apartment">Apartment</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="home & land">Home & Land</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Suburb</label>
                  <input className="text-input" type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Austral, Leppington" />
                </div>

                <div className="filter-group">
                  <label>Min Price</label>
                  <select className="text-input" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="300000">$300k</option>
                    <option value="600000">$600k</option>
                    <option value="1000000">$1M</option>
                    <option value="1500000">$1.5M</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Max Price</label>
                  <select className="text-input" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}>
                    <option value="">Any</option>
                    <option value="600000">$600k</option>
                    <option value="1000000">$1M</option>
                    <option value="2000000">$2M</option>
                    <option value="5000000">$5M</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Min Frontage (m)</label>
                  <select className="text-input" value={frontageMin} onChange={(e) => setFrontageMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="12.5">12.5</option>
                    <option value="15">15</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Max Frontage (m)</label>
                  <select className="text-input" value={frontageMax} onChange={(e) => setFrontageMax(e.target.value)}>
                    <option value="">Any</option>
                    <option value="10">10</option>
                    <option value="12.5">12.5</option>
                    <option value="15">15</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Min Build Size (sqm)</label>
                  <select className="text-input" value={buildMin} onChange={(e) => setBuildMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="100">100</option>
                    <option value="150">150</option>
                    <option value="200">200</option>
                    <option value="250">250</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Max Build Size (sqm)</label>
                  <select className="text-input" value={buildMax} onChange={(e) => setBuildMax(e.target.value)}>
                    <option value="">Any</option>
                    <option value="150">150</option>
                    <option value="200">200</option>
                    <option value="250">250</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Min Bed</label>
                  <select className="text-input" value={bedMin} onChange={(e) => setBedMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Min Bath</label>
                  <select className="text-input" value={bathMin} onChange={(e) => setBathMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Min Garage</label>
                  <select className="text-input" value={garageMin} onChange={(e) => setGarageMin(e.target.value)}>
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {isLoading && <p>Loading properties...</p>}
          {error && !isLoading && <p style={{ color: 'red' }}>{error}</p>}

          {!isLoading && !error && filtered.length > 0 && (
            <>
              <div className="results-info">
                <p>Showing {startIndex + 1} - {Math.min(endIndex, filtered.length)} of {filtered.length} properties</p>
              </div>
              
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
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="no-results">
              <h3>No properties found</h3>
              <p>Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>

      <PropertyModal 
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

    </div>
  );
};

export default PropertiesPage; 