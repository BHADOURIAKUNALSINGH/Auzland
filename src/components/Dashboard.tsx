import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NewUser } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, signOut, getAuthHeader } = useAuth();

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Check if user has edit-access role
  const hasEditAccess = user?.groups?.some(group =>
    group.toLowerCase() === 'edit-access'
  );

  // Debug: Log user role information
  console.log('User authentication info:', {
    user: user,
    groups: user?.groups,
    hasEditAccess: hasEditAccess
  });

  // Filter states
  const [filters, setFilters] = useState({
    quickSearch: '',
    address: '',
    state: '',
    region: '',
    priceMin: '',
    priceMax: '',
    propertyType: '',
    marketingCategory: '',
    contractType: '',
    bedroomsMin: '',
    bedroomsMax: '',
    settings: '',
    bathroomsMin: '',
    bathroomsMax: '',
    landSizeMin: '',
    landSizeMax: '',
    buildSizeMin: '',
    buildSizeMax: '',
    garageMin: '',
    garageMax: '',
    frontageMin: '',
    frontageMax: '',
    sizeMin: '',
    sizeMax: '',
  });

  // Property data and editing states
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('lot');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortClickCount, setSortClickCount] = useState(0);
  const [listingsVersionId, setListingsVersionId] = useState<string | undefined>(undefined);

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [propertyForm, setPropertyForm] = useState<any>({
    lot: '',
    frontage: '',
    bath: '',
    size: '',
    address: '',
    suburb: '',
    priceGuide: '',
    regoDue: '',
    dp: '',
    typeOfProperty: '',
    land: '',
    build: '',
    bed: '',
    garage: '',
    media: '',
    readyBy: '',
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<'properties' | 'admin'>('properties');

  // Media upload states
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUploadProgress, setMediaUploadProgress] = useState<{[key: string]: number}>({});
  const [mediaUploadErrors, setMediaUploadErrors] = useState<{[key: string]: string}>({});

  // CSV upload states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadProgress, setCsvUploadProgress] = useState<number>(0);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);

  // Excel file states
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [showSheetSelector, setShowSheetSelector] = useState(false);

  // Media viewer states
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [viewingMedia, setViewingMedia] = useState<any[]>([]);


  
  // S3 Bucket URL for media files (update this with your actual bucket URL)

  
  // TODO: Update the S3_BUCKET_URL above with your actual S3 bucket URL
  // Example: https://my-real-estate-media.s3.amazonaws.com

  // Load listings from S3-backed API for both view and edit users
  useEffect(() => {
    loadPropertiesFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters and sorting whenever properties, filters, sortBy, or sortOrder change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, filters, sortBy, sortOrder]);

  // Handle keyboard navigation for media viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showMediaViewer) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevMedia();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextMedia();
          break;
        case 'Escape':
          event.preventDefault();
          closeMediaViewer();
          break;
      }
    };

    if (showMediaViewer) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMediaViewer]);

  // Filter and sort properties based on current filters and sort settings
  const applyFilters = () => {
    let filtered = [...properties];

    // Quick search filter (address, lot, or any text field)
    if (filters.quickSearch.trim()) {
      const searchTerm = filters.quickSearch.toLowerCase().trim();
      filtered = filtered.filter(property => 
        property.address?.toLowerCase().includes(searchTerm) ||
        property.lot?.toLowerCase().includes(searchTerm) ||
        property.dp?.toLowerCase().includes(searchTerm) ||
        property.typeOfProperty?.toLowerCase().includes(searchTerm)
      );
    }

    // State filter
    if (filters.state) {
      filtered = filtered.filter(property => {
        const address = property.address?.toLowerCase() || '';
        return address.includes(filters.state.toLowerCase());
      });
    }

    // Region filter (based on address patterns)
    if (filters.region) {
      filtered = filtered.filter(property => {
        const address = property.address?.toLowerCase() || '';
        if (filters.region === 'metro') {
          return address.includes('sydney') || address.includes('melbourne') || 
                 address.includes('brisbane') || address.includes('perth') ||
                 address.includes('adelaide') || address.includes('canberra');
        } else if (filters.region === 'regional') {
          return !address.includes('sydney') && !address.includes('melbourne') &&
                 !address.includes('brisbane') && !address.includes('perth') &&
                 !address.includes('adelaide') && !address.includes('canberra');
        }
        return true;
      });
    }

    // Settings filter (based on address patterns)
    if (filters.settings) {
      filtered = filtered.filter(property => {
        const address = property.address?.toLowerCase() || '';
        if (filters.settings === 'urban') {
          return address.includes('cbd') || address.includes('city') || 
                 address.includes('downtown') || address.includes('central');
        } else if (filters.settings === 'suburban') {
          return address.includes('street') || address.includes('road') || 
                 address.includes('avenue') || address.includes('drive');
        } else if (filters.settings === 'coastal') {
          return address.includes('beach') || address.includes('coast') || 
                 address.includes('bay') || address.includes('harbour');
        } else if (filters.settings === 'rural') {
          return address.includes('lane') || address.includes('way') || 
                 address.includes('close') || address.includes('court');
        }
        return true;
      });
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => 
        property.typeOfProperty?.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    // Address filter
    if (filters.address.trim()) {
      const addressTerm = filters.address.toLowerCase().trim();
      filtered = filtered.filter(property => 
        property.address?.toLowerCase().includes(addressTerm)
      );
    }

    // Bedrooms filter (min/max)
    if (filters.bedroomsMin || filters.bedroomsMax) {
      filtered = filtered.filter(property => {
        const beds = property.bed || 0;
        const min = filters.bedroomsMin ? parseInt(filters.bedroomsMin) : 0;
        const max = filters.bedroomsMax ? parseInt(filters.bedroomsMax) : Infinity;
        return beds >= min && beds <= max;
      });
    }

    // Bathrooms filter (min/max)
    if (filters.bathroomsMin || filters.bathroomsMax) {
      filtered = filtered.filter(property => {
        const baths = property.bath || 0;
        const min = filters.bathroomsMin ? parseInt(filters.bathroomsMin) : 0;
        const max = filters.bathroomsMax ? parseInt(filters.bathroomsMax) : Infinity;
        return baths >= min && baths <= max;
      });
    }

    // Price filter (min/max)
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(property => {
        const price = property.priceGuide || 0;
        const min = filters.priceMin ? parseInt(filters.priceMin) : 0;
        const max = filters.priceMax ? parseInt(filters.priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Marketing category filter (based on property characteristics)
    if (filters.marketingCategory) {
      filtered = filtered.filter(property => {
        const land = property.land || 0;
        const build = property.build || 0;
        const price = property.priceGuide || 0;
        
        if (filters.marketingCategory === 'investment') {
          return land > 500 || price > 800000; // Large land or high value
        } else if (filters.marketingCategory === 'owner-occupied') {
          return build > 150 && land < 800; // Good build size, moderate land
        } else if (filters.marketingCategory === 'development') {
          return land > 600 && build < 100; // Large land, small build
        } else if (filters.marketingCategory === 'first-home') {
          return price <= 600000 && build <= 150; // Affordable, smaller
        } else if (filters.marketingCategory === 'downsizer') {
          return build > 200 && land < 500; // Large build, smaller land
        }
        return true;
      });
    }

    // Contract type filter (based on property status)
    if (filters.contractType) {
      filtered = filtered.filter(property => {
        const readyBy = property.readyBy;
        const regoDue = property.regoDue;
        
        if (filters.contractType === '2-part') {
          return readyBy && regoDue; // Has both dates
        } else if (filters.contractType === 'standard') {
          return !readyBy && !regoDue; // No special dates
        } else if (filters.contractType === 'off-plan') {
          return readyBy && !regoDue; // Has ready by but no rego
        } else if (filters.contractType === 'auction') {
          return !readyBy && !regoDue; // No special dates, likely auction
        } else if (filters.contractType === 'tender') {
          return !readyBy && !regoDue; // No special dates, likely tender
        }
        return true;
      });
    }

    // Land size filter (min/max)
    if (filters.landSizeMin || filters.landSizeMax) {
      filtered = filtered.filter(property => {
        const land = property.land || 0;
        const min = filters.landSizeMin ? parseInt(filters.landSizeMin) : 0;
        const max = filters.landSizeMax ? parseInt(filters.landSizeMax) : Infinity;
        return land >= min && land <= max;
      });
    }

    // Build size filter (min/max)
    if (filters.buildSizeMin || filters.buildSizeMax) {
      filtered = filtered.filter(property => {
        const build = property.build || 0;
        const min = filters.buildSizeMin ? parseInt(filters.buildSizeMin) : 0;
        const max = filters.buildSizeMax ? parseInt(filters.buildSizeMax) : Infinity;
        return build >= min && build <= max;
      });
    }

    // Garage filter (min/max)
    if (filters.garageMin || filters.garageMax) {
      filtered = filtered.filter(property => {
        const garage = property.garage || 0;
        const min = filters.garageMin ? parseInt(filters.garageMin) : 0;
        const max = filters.garageMax ? parseInt(filters.garageMax) : Infinity;
        return garage >= min && garage <= max;
      });
    }

    // Frontage filter (min/max)
    if (filters.frontageMin || filters.frontageMax) {
      filtered = filtered.filter(property => {
        const frontage = property.frontage || 0;
        const min = filters.frontageMin ? parseInt(filters.frontageMin) : 0;
        const max = filters.frontageMax ? parseInt(filters.frontageMax) : Infinity;
        return frontage >= min && frontage <= max;
      });
    }

    // Size filter (min/max)
    if (filters.sizeMin || filters.sizeMax) {
      filtered = filtered.filter(property => {
        const size = property.size || 0;
        const min = filters.sizeMin ? parseInt(filters.sizeMin) : 0;
        const max = filters.sizeMax ? parseInt(filters.sizeMax) : Infinity;
        return size >= min && size <= max;
      });
    }

    // Apply sorting
    console.log('Applying sorting:', { 
      sortBy, 
      sortOrder, 
      filteredCount: filtered.length,
      sampleValues: filtered.slice(0, 3).map(p => ({ 
        [sortBy]: p[sortBy], 
        type: typeof p[sortBy],
        parsed: !isNaN(parseFloat(p[sortBy])) ? parseFloat(p[sortBy]) : 'not a number'
      }))
    });
    
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      console.log(`Comparing ${sortBy}:`, { a: aValue, b: bValue, aType: typeof aValue, bType: typeof bValue });

      // Handle numeric values (including string numbers)
      const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue) || 0;
      const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue) || 0;
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        const result = sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
        console.log(`Numeric comparison: ${aNum} vs ${bNum}, order: ${sortOrder}, result: ${result}`);
        return result;
      }

      // Handle date values
      if (sortBy === 'regoDue' || sortBy === 'readyBy') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        const result = sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        console.log(`Date comparison: ${aDate} vs ${bDate}, order: ${sortOrder}, result: ${result}`);
        return result;
      }

      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      return 0;
    });
    
    console.log('Sorting completed. First few items:', filtered.slice(0, 3).map(p => p[sortBy]));

    setFilteredProperties(filtered);
  };

  const LISTINGS_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings';

  const parseCsv = (csv: string): Record<string, string>[] => {
    const rows: Record<string, string>[] = [];
    if (!csv) return rows;
    const lines = csv.replace(/\r\n?/g, '\n').split('\n').filter(Boolean);
    if (lines.length === 0) return rows;
    const headers = splitCsvLine(lines[0]);
    for (let i = 1; i < lines.length; i += 1) {
      const values = splitCsvLine(lines[i]);
      if (values.length === 0) continue;
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] ?? '';
      });
      rows.push(record);
    }
    return rows;
  };

  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { // escaped quote
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  };

  const toNumber = (val: string) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const loadPropertiesFromApi = async () => {
    setIsLoading(true);
    try {
      // Try without auth first; if it fails, retry with auth header
      let response = await fetch(LISTINGS_API_URL);
      if (!response.ok) {
        const authHeaders = await getAuthHeader().catch(() => ({} as any));
        response = await fetch(LISTINGS_API_URL, { headers: { ...(authHeaders || {}) } });
      }
      if (!response.ok) {
        throw new Error(`Failed to load listings: HTTP ${response.status}`);
      }
      const data = await response.json();
      const csv: string = typeof data === 'string' ? data : (data.csv ?? '');
      if (data && data.versionId) setListingsVersionId(data.versionId);
      const rows = parseCsv(csv);
      const mapped = rows.map((r) => ({
        id: r.id,
        lot: r.lot,
        frontage: toNumber(r.frontage_m),
        bath: toNumber(r.bath),
        size: toNumber(r.size_sqm),
        address: r.address,
        priceGuide: toNumber(r.price_guide),
        regoDue: r.rego_due,
        dp: r.dp,
        typeOfProperty: r.property_type,
        land: toNumber(r.land_area_sqm),
        build: toNumber(r.build_area_sqm),
        bed: toNumber(r.bed),
        garage: toNumber(r.garage),
        media: r.media_url,
        readyBy: r.ready_by,
        updatedAt: r.updated_at,
      })).filter((p) => p.lot || p.address);
      setProperties(mapped);
      setMessage(null);
    } catch (err: any) {
      console.error('Error loading listings from API:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load properties' });
    } finally {
      setIsLoading(false);
    }
  };

  const CSV_HEADERS = [
    'id',
    'lot',
    'frontage_m',
    'bath',
    'size_sqm',
    'address',
    'suburb',
    'price_guide',
    'rego_due',
    'dp',
    'property_type',
    'land_area_sqm',
    'build_area_sqm',
    'bed',
    'garage',
    'media_url',
    'ready_by',
    'updated_at',
  ];

  const csvEscape = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };

  const generateCsvFromProperties = (items: any[]): string => {
    const lines: string[] = [];
    lines.push(CSV_HEADERS.join(','));
    for (const p of items) {
      const row = [
        p.id ?? '',
        p.lot ?? '',
        p.frontage ?? '',
        p.bath ?? '',
        p.size ?? '',
        p.address ?? '',
        p.suburb ?? '',
        p.priceGuide ?? '',
        p.regoDue ?? '',
        p.dp ?? '',
        p.typeOfProperty ?? '',
        p.land ?? '',
        p.build ?? '',
        p.bed ?? '',
        p.garage ?? '',
        p.media ?? '',
        p.readyBy ?? '',
        p.updatedAt ?? '',
      ].map(csvEscape);
      lines.push(row.join(','));
    }
    return lines.join('\n') + '\n';
  };

  // CSV upload handling functions
  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.xlsx')) {
        setCsvUploadError('Please select a valid CSV or Excel (.xlsx) file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setCsvUploadError('File size must be less than 10MB');
        return;
      }
      
      setCsvFile(file);
      setCsvUploadError(null);
      
      // If it's an Excel file, read the sheets
      if (file.name.toLowerCase().endsWith('.xlsx')) {
        readExcelSheets(file);
      } else {
        setExcelSheets([]);
        setSelectedSheet('');
        setShowSheetSelector(false);
      }
    }
  };

  const readExcelSheets = async (file: File) => {
    try {
      // We'll need to use a library like SheetJS to read Excel files
      // For now, we'll show a message that Excel support is being implemented
      setExcelSheets(['Sheet1']); // Placeholder
      setSelectedSheet('Sheet1');
      setShowSheetSelector(true);
    } catch (error: any) {
      setCsvUploadError(`Error reading Excel file: ${error.message}`);
    }
  };

  const processExcelUpload = async () => {
    if (!csvFile || !selectedSheet) return;
    
    setCsvUploadProgress(0);
    setCsvUploadError(null);
    
    try {
      // This would use SheetJS to read the specific sheet
      // For now, we'll show a placeholder implementation
      setCsvUploadProgress(100);
      setCsvUploadError('Excel file processing is being implemented. Please use CSV files for now.');
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      setCsvUploadError(error.message || 'Failed to process Excel file');
      setCsvUploadProgress(0);
    }
  };

  const clearCsvUpload = () => {
    setCsvFile(null);
    setCsvUploadProgress(0);
    setCsvUploadError(null);
    setShowCsvUploadModal(false);
  };


  const handleExport = () => {
    const csvText = generateCsvFromProperties(filteredProperties);
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Property editing handlers
  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setPropertyForm({
      lot: property.lot || '',
      frontage: property.frontage || '',
      bath: property.bath || '',
      size: property.size || '',
      address: property.address || '',
      suburb: property.suburb || '',
      priceGuide: property.priceGuide || '',
      regoDue: property.regoDue || '',
      dp: property.dp || '',
      typeOfProperty: property.typeOfProperty || '',
      land: property.land || '',
      build: property.build || '',
      bed: property.bed || '',
      garage: property.garage || '',
      media: property.media || '',
      readyBy: property.readyBy || '',
    });
    setShowPropertyForm(true);
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      lot: '',
      frontage: '',
      bath: '',
      size: '',
      address: '',
      priceGuide: '',
      regoDue: '',
      dp: '',
      typeOfProperty: '',
      land: '',
      build: '',
      bed: '',
      garage: '',
      media: '',
      readyBy: '',
    });
    setShowPropertyForm(true);
  };

  const handlePropertyFormChange = (field: string, value: string) => {
    setPropertyForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePropertyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyForm.lot || !propertyForm.address) {
      alert('Lot and Address are required fields.');
      return;
    }

    try {
      let mediaKeys: string[] = [];
      
      // Upload media files if any are selected
      if (mediaFiles.length > 0) {
        const listingId = propertyForm.id || `new_${Date.now()}`;
        mediaKeys = await uploadAllMedia(listingId);
      }

      // Create property object with media keys
      const propertyData = {
        ...propertyForm,
        id: editingProperty?.id || `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        media: mediaKeys.length > 0 ? JSON.stringify(mediaKeys) : '',
        updatedAt: new Date().toISOString().split('T')[0]
      };

      if (editingProperty) {
        // Update existing property
        const updatedProperties = properties.map(p => 
          p.id === editingProperty.id ? propertyData : p
        );
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);
      } else {
        // Add new property
        const updatedProperties = [...properties, propertyData];
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);
      }

      // Clear form and media files
      setPropertyForm({
        lot: '',
        frontage: '',
        bath: '',
        size: '',
        address: '',
        priceGuide: '',
        regoDue: '',
        dp: '',
        typeOfProperty: '',
        land: '',
        build: '',
        bed: '',
        garage: '',
        media: '',
        readyBy: ''
      });
      setMediaFiles([]);
      setMediaUploadProgress({});
      setMediaUploadErrors({});
      
      setShowPropertyForm(false);
      setEditingProperty(null);
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      alert(`Error saving property: ${error.message}`);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    console.log('Delete property called with ID:', propertyId);
    console.log('Current properties:', properties);
    console.log('hasEditAccess:', hasEditAccess);
    
    if (!hasEditAccess) {
      console.log('User does not have edit access');
      alert('You do not have permission to delete properties');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const updatedProperties = properties.filter(p => p.id !== propertyId);
        console.log('Properties after deletion:', updatedProperties);
        
        // Update state first
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        
        // Auto-save to S3 with the updated properties
        await autoSaveToS3(updatedProperties);
        
        console.log('Property deleted successfully');
      } catch (error: any) {
        console.error('Error deleting property:', error);
        alert(`Error deleting property: ${error.message}`);
      }
    }
  };

  // Auto-save function that runs after every change
  const autoSaveToS3 = async (propertiesToSave?: any[]) => {
    if (!hasEditAccess) return;
    
    // Always use the original properties array for saving to S3
    const propertiesToUse = propertiesToSave || properties;
    
    console.log('Auto-saving to S3...', {
      propertiesCount: propertiesToUse.length,
      properties: propertiesToUse,
      currentVersionId: listingsVersionId
    });
    
    try {
      const csvText = generateCsvFromProperties(propertiesToUse);
      console.log('Generated CSV:', csvText.substring(0, 200) + '...');
      
      const authHeaders = await getAuthHeader().catch(() => ({} as any));
      const response = await fetch(LISTINGS_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders || {}),
        },
        body: JSON.stringify({ csv: csvText, expectedVersionId: listingsVersionId }),
      });
      
      console.log('S3 PUT response status:', response.status);
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Auto-save failed: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('S3 PUT success:', result);
      
      if (result && result.versionId) {
        setListingsVersionId(result.versionId);
        console.log('Updated version ID:', result.versionId);
      }
      
      // Show success message briefly
      setMessage({ type: 'success', text: 'Changes saved to S3 automatically.' });
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      console.error('Auto-save error:', err);
      setMessage({ type: 'error', text: `Auto-save failed: ${err.message}` });
      setTimeout(() => setMessage(null), 5000); // Clear error message after 5 seconds
    }
  };

  // Media upload functions
  const handleMediaFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Media file selection triggered');
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB limit
      
      console.log('File validation:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isValidType,
        isValidSize
      });
      
      if (!isValidType) {
        alert(`Invalid file type: ${file.type}. Only images and videos are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 20MB.`);
        return false;
      }
      
      return true;
    });
    
    console.log('Valid files:', validFiles);
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadMediaToS3 = async (file: File, listingId: string): Promise<string> => {
    try {
      const base64Data = await convertFileToBase64(file);
      
      const payload = {
        filename: file.name,
        contentType: file.type,
        listingId: listingId,
        dataBase64: base64Data
      };

      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.key; // Return the S3 key for CSV storage
    } catch (error: any) {
      throw new Error(`Media upload failed: ${error.message}`);
    }
  };

  const uploadAllMedia = async (listingId: string): Promise<string[]> => {
    console.log('Starting media upload for listing:', listingId);
    console.log('Files to upload:', mediaFiles);
    
    const uploadedKeys: string[] = [];
    
    for (const file of mediaFiles) {
      try {
        console.log(`Uploading file: ${file.name}`);
        setMediaUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const key = await uploadMediaToS3(file, listingId);
        console.log(`Successfully uploaded ${file.name} with key: ${key}`);
        uploadedKeys.push(key);
        
        setMediaUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        setMediaUploadErrors(prev => ({ ...prev, [file.name]: error.message }));
      }
    }
    
    console.log('Upload complete. Total keys:', uploadedKeys);
    return uploadedKeys;
  };

  const deleteMediaFromS3 = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      return true;
    } catch (error: any) {
      console.error(`Failed to delete media ${key}:`, error);
      return false;
    }
  };

  // Fetch signed URLs for media files
  

  // Media viewer functions
  const openMediaViewer = (property: any) => {
    if (!property.media) return;
    
    try {
      const mediaKeys = JSON.parse(property.media);
      if (mediaKeys.length === 0) return;
      
      setViewingMedia(mediaKeys);
      setCurrentMediaIndex(0);
      setShowMediaViewer(true);
    } catch (error) {
      console.error('Error opening media viewer:', error);
      alert('Failed to load media. Please try again.');
    }
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === viewingMedia.length - 1 ? 0 : prev + 1
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? viewingMedia.length - 1 : prev - 1
    );
  };

  const closeMediaViewer = () => {
    setShowMediaViewer(false);
    setViewingMedia([]);
    setCurrentMediaIndex(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const downloadMedia = () => {
    if (!viewingMedia[currentMediaIndex]) return;
    
    const mediaUrl = `https://auzlandrelistings.s3.amazonaws.com/${viewingMedia[currentMediaIndex]}`;
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = viewingMedia[currentMediaIndex]?.split('/').pop() || 'media-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle media deletion from table
  const handleDeleteMedia = async (property: any, mediaKey: string) => {
    // Additional safety check for access control
    if (!hasEditAccess) {
      alert('You do not have permission to delete media files.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      await deleteMediaFromS3(mediaKey);
      
      // Update the properties state by removing the deleted media key
      const updatedProperties = properties.map(p => {
        if (p.id === property.id) {
          const currentMedia = p.media ? JSON.parse(p.media) : [];
          const updatedMedia = currentMedia.filter((key: string) => key !== mediaKey);
          return {
            ...p,
            media: JSON.stringify(updatedMedia)
          };
        }
        return p;
      });
      
      setProperties(updatedProperties);
      await autoSaveToS3(updatedProperties);
    } catch (error: any) {
      console.error('Error deleting media:', error);
      alert(`Error deleting media: ${error.message}`);
    }
  };

  // Render media column with view and delete options
  const renderMediaColumn = (property: any) => {
    if (!property.media) return <td>-</td>;
    
    try {
      const mediaKeys = JSON.parse(property.media);
      if (mediaKeys.length === 0) return <td>-</td>;
      
      return (
        <td className="media-column">
          <div className="media-controls">
            <button 
              className="view-media-btn"
              onClick={() => openMediaViewer(property)}
              title="View all media"
            >
              📷 View Media ({mediaKeys.length})
            </button>
          </div>
          <div className="media-items">
            {mediaKeys.map((key: string, index: number) => (
              <div key={key} className="media-item">
                <span className="media-key">{key.split('/').pop() || key}</span>
                {hasEditAccess && (
                  <button 
                    className="delete-media-btn"
                    onClick={() => handleDeleteMedia(property, key)}
                    title="Delete media"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </td>
      );
    } catch (error) {
      console.error('Error parsing media:', error);
      return <td>Error</td>;
    }
  };



  const handleInputChange = (field: keyof NewUser, value: string) => {
    setNewUser((prev: NewUser) => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      quickSearch: '',
      address: '',
      state: '',
      region: '',
      priceMin: '',
      priceMax: '',
      propertyType: '',
      marketingCategory: '',
      contractType: '',
      bedroomsMin: '',
      bedroomsMax: '',
      settings: '',
      bathroomsMin: '',
      bathroomsMax: '',
      landSizeMin: '',
      landSizeMax: '',
      buildSizeMin: '',
      buildSizeMax: '',
      garageMin: '',
      garageMax: '',
      frontageMin: '',
      frontageMax: '',
      sizeMin: '',
      sizeMax: '',
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newUser.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Call protected backend endpoint to create user in Cognito
      const authHeaders = await getAuthHeader();
      
      const requestBody = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
        // Group is automatically assigned by Lambda to "View-access"
      };
      
      // Log the request being sent
      console.log('Sending request to Lambda:', {
        url: 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/create_view_user',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: requestBody
      });
      
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/create_view_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders, // Include JWT token for authentication
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Lambda Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log the successful response to console
      console.log('Lambda success response:', {
        status: response.status,
        result: result,
        fullResponse: response
      });
      
      setMessage({ 
        type: 'success', 
        text: `User ${newUser.username} created successfully with View-access role!` 
      });
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      setShowAddUserForm(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create user. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFiltersSidebar = () => (
    <aside className="filters-sidebar">
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <button 
              className="clear-filters-btn"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              Clear All
            </button>
          )}
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Active: {getActiveFiltersCount()}</span>
          </div>
        )}

        {/* Primary Search */}
        <div className="filter-category primary-search">
          <h4>Search Properties</h4>
          <div className="filter-group">
            <label>Quick Search</label>
            <div className="search-input">
              <input
                type="text"
                placeholder="Type address, lot number, DP, or property type..."
                value={filters.quickSearch}
                onChange={(e) => handleFilterChange('quickSearch', e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Address</label>
            <div className="search-input">
              <input
                type="text"
                placeholder="Search by address..."
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Location Filters */}
        <div className="filter-category">
          <h4>Location & Area</h4>
          <div className="filter-group">
            <label>State</label>
            <select 
              value={filters.state} 
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="NT">NT</option>
              <option value="ACT">ACT</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Region</label>
            <select 
              value={filters.region} 
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <option value="">All Regions</option>
              <option value="metro">Metropolitan</option>
              <option value="regional">Regional</option>
              <option value="rural">Rural</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Area Setting</label>
            <select 
              value={filters.settings} 
              onChange={(e) => handleFilterChange('settings', e.target.value)}
            >
              <option value="">All Settings</option>
              <option value="urban">Urban</option>
              <option value="suburban">Suburban</option>
              <option value="coastal">Coastal</option>
              <option value="rural">Rural</option>
            </select>
          </div>
        </div>

        {/* Property Specifications */}
        <div className="filter-category">
          <h4>Property Details</h4>
          <div className="filter-group">
            <label>Property Type</label>
            <select 
              value={filters.propertyType} 
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
              <option value="duplex">Duplex</option>
              <option value="villa">Villa</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Bedrooms</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.bedroomsMin}
                onChange={(e) => handleFilterChange('bedroomsMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.bedroomsMax}
                onChange={(e) => handleFilterChange('bedroomsMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Bathrooms</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.bathroomsMin}
                onChange={(e) => handleFilterChange('bathroomsMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.bathroomsMax}
                onChange={(e) => handleFilterChange('bathroomsMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="filter-category">
          <h4>Price & Market</h4>
          <div className="filter-group">
            <label>Price Range</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min $"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="range-input"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max $"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="range-input"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Investment Category</label>
            <select 
              value={filters.marketingCategory} 
              onChange={(e) => handleFilterChange('marketingCategory', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="investment">Investment</option>
              <option value="owner-occupied">Owner Occupied</option>
              <option value="development">Development</option>
              <option value="first-home">First Home Buyer</option>
              <option value="downsizer">Downsizer</option>
            </select>
          </div>
        </div>

        {/* Property Size */}
        <div className="filter-category">
          <h4>Dimensions & Space</h4>
          <div className="filter-group">
            <label>Land Area (sqm)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min sqm"
                value={filters.landSizeMin}
                onChange={(e) => handleFilterChange('landSizeMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max sqm"
                value={filters.landSizeMax}
                onChange={(e) => handleFilterChange('landSizeMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Build Area (sqm)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min sqm"
                value={filters.buildSizeMin}
                onChange={(e) => handleFilterChange('buildSizeMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max sqm"
                value={filters.buildSizeMax}
                onChange={(e) => handleFilterChange('buildSizeMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Garage Spaces</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.garageMin}
                onChange={(e) => handleFilterChange('garageMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.garageMax}
                onChange={(e) => handleFilterChange('garageMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Frontage (m)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min m"
                value={filters.frontageMin}
                onChange={(e) => handleFilterChange('frontageMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max m"
                value={filters.frontageMax}
                onChange={(e) => handleFilterChange('frontageMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Size (sqm)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min sqm"
                value={filters.sizeMin}
                onChange={(e) => handleFilterChange('sizeMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max sqm"
                value={filters.sizeMax}
                onChange={(e) => handleFilterChange('sizeMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="filter-category">
          <h4>Contract & Sale</h4>
          <div className="filter-group">
            <label>Contract Type</label>
            <select 
              value={filters.contractType} 
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
            >
              <option value="">All Contracts</option>
              <option value="2-part">2-part Contract</option>
              <option value="standard">Standard</option>
              <option value="off-plan">Off Plan</option>
              <option value="auction">Auction</option>
              <option value="tender">Tender</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );

  const renderPropertiesTable = () => (
    <main className="properties-main">
      {/* Results and Sort */}
      <div className="results-header">
        <div className="results-info">
          <span className="results-count">{filteredProperties.length} results</span>
          <div className="sort-controls">
            <span>Sort by</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="lot">Lot</option>
              <option value="address">Address</option>
              <option value="priceGuide">Price Guide</option>
              <option value="land">Land Area</option>
              <option value="build">Build Area</option>
              <option value="frontage">Frontage</option>
              <option value="size">Size</option>
              <option value="bed">Bedrooms</option>
              <option value="bath">Bathrooms</option>
              <option value="garage">Garage</option>
              <option value="regoDue">Rego Due</option>
              <option value="readyBy">Ready By</option>
            </select>
            <button 
              className={`sort-order-btn ${sortOrder === 'asc' ? 'active-asc' : 'active-desc'}`}
              onClick={() => {
                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                console.log('Sort order changing from', sortOrder, 'to', newOrder);
                setSortOrder(newOrder);
                setSortClickCount(prev => prev + 1);
              }}
              title={`Currently sorting ${sortOrder === 'asc' ? 'ascending' : 'descending'}. Click to change. (Clicks: ${sortClickCount})`}
            >
              {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'} ({sortClickCount})
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="export-button" onClick={handleExport}>Export</button>
          {hasEditAccess && (
            <>
              <button className="export-button" onClick={handleNewProperty}>Add New Entry</button>
              <button className="import-button" onClick={() => setShowCsvUploadModal(true)}>Import CSV</button>
            </>
          )}
        </div>
      </div>

      {/* Properties Table */}
      <div className="properties-table-container">
        <table className="properties-table">
          <thead>
            <tr>
              <th>LOT</th>
              <th>ADDRESS</th>
              <th>SUBURB</th>
              <th>PRICE GUIDE</th>
              <th>LAND</th>
              <th>BUILD</th>
              <th>FRONTAGE</th>
              <th>SIZE</th>
              <th>BED</th>
              <th>BATH</th>
              <th>GARAGE</th>
              <th>TYPE OF PROPERTY</th>
              <th>DP</th>
              <th>REGO DUE</th>
              <th>READY BY</th>
              <th>MEDIA</th>
              {hasEditAccess && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length === 0 ? (
              <tr className="no-data">
                <td colSpan={hasEditAccess ? 16 : 15}>
                  <div className="empty-state">
                    <p>No properties found</p>
                    <p className="empty-subtitle">Properties will appear here once data is loaded from the API</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property, index) => (
                <tr key={index}>
                  <td>{property.lot}</td>
                  <td>{property.address}</td>
                  <td>{property.suburb || '-'}</td>
                  <td>${property.priceGuide?.toLocaleString()}</td>
                  <td>{property.land}</td>
                  <td>{property.build}</td>
                  <td>{property.frontage}</td>
                  <td>{property.size}</td>
                  <td>{property.bed}</td>
                  <td>{property.bath}</td>
                  <td>{property.garage}</td>
                  <td>{property.typeOfProperty}</td>
                  <td>{property.dp}</td>
                  <td>{property.regoDue}</td>
                  <td>{property.readyBy}</td>
                  {renderMediaColumn(property)}
                  {hasEditAccess && (
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" title="Edit" onClick={() => handleEditProperty(property)}>Edit</button>
                        <button className="delete-btn" title="Delete" onClick={() => handleDeleteProperty(property.id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );

  const renderAdminTools = () => (
    <main className="admin-tools-main">
      <div className="admin-tools-header">
        <h2>Admin Tools</h2>
        <p>Manage users and system settings.</p>
      </div>

      <div className="admin-tools-content">
        <h3>User Management</h3>
        <p>Add new users to the system. Only administrators can add users.</p>
        <button 
          className="add-user-button"
          onClick={() => setShowAddUserForm(true)}
        >
          Add New User
        </button>

        <h3>System Settings</h3>
        <p>Configure application settings and data import/export.</p>
        <button 
          className="export-button"
          onClick={handleExport}
        >
          Export All Properties
        </button>
        <button 
          className="import-button"
          onClick={() => setShowCsvUploadModal(true)}
        >
          Import Properties (CSV)
        </button>
      </div>
    </main>
  );

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>AuzLandRE Property Management Dashboard</h2>
        </div>
        <div className="nav-user">
          <span className="username">Welcome, {user?.email || user?.username}</span>
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className="user-role">
              {hasEditAccess ? 'Administrator' : 'View Access'}
            </span>
            {!hasEditAccess && (
              <span className="role-warning">
                ⚠️ You only have view access. Delete/Edit functions are disabled.
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-main">
        {renderFiltersSidebar()}
        
        <div className="content-area">
          {/* Top Navigation - Always Visible */}
          <nav className="properties-nav">
            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                Properties
              </button>
              {hasEditAccess && (
                <button 
                  className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Admin Tools
                </button>
              )}
            </div>
            
            <div className="nav-user">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <button onClick={signOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </nav>

          {/* Tab Content */}
          {activeTab === 'properties' ? (
            renderPropertiesTable()
          ) : (
            renderAdminTools()
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                onClick={() => setShowAddUserForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || !newUser.username || !newUser.email || !newUser.password || !newUser.confirmPassword}
                >
                  {isLoading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      {showPropertyForm && hasEditAccess && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProperty ? 'Edit Property' : 'Add New Property'}</h3>
              <button 
                onClick={() => setShowPropertyForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePropertyFormSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lot">Lot *</label>
                  <input
                    type="text"
                    id="lot"
                    value={propertyForm.lot}
                    onChange={(e) => handlePropertyFormChange('lot', e.target.value)}
                    placeholder="Lot number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="frontage">Frontage (m)</label>
                  <input
                    type="number"
                    id="frontage"
                    value={propertyForm.frontage}
                    onChange={(e) => handlePropertyFormChange('frontage', e.target.value)}
                    placeholder="Frontage in meters"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bath">Bathrooms</label>
                  <input
                    type="number"
                    id="bath"
                    value={propertyForm.bath}
                    onChange={(e) => handlePropertyFormChange('bath', e.target.value)}
                    placeholder="Number of bathrooms"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="size">Size (sqm)</label>
                  <input
                    type="number"
                    id="size"
                    value={propertyForm.size}
                    onChange={(e) => handlePropertyFormChange('size', e.target.value)}
                    placeholder="Size in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  value={propertyForm.address}
                  onChange={(e) => handlePropertyFormChange('address', e.target.value)}
                  placeholder="Property address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="suburb">Suburb</label>
                <input
                  type="text"
                  id="suburb"
                  value={propertyForm.suburb}
                  onChange={(e) => handlePropertyFormChange('suburb', e.target.value)}
                  placeholder="Suburb name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priceGuide">Price Guide</label>
                  <input
                    type="number"
                    id="priceGuide"
                    value={propertyForm.priceGuide}
                    onChange={(e) => handlePropertyFormChange('priceGuide', e.target.value)}
                    placeholder="Price in dollars"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="regoDue">Rego Due</label>
                  <input
                    type="date"
                    id="regoDue"
                    value={propertyForm.regoDue}
                    onChange={(e) => handlePropertyFormChange('regoDue', e.target.value)}
                    placeholder="Registration due date"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dp">DP</label>
                  <input
                    type="text"
                    id="dp"
                    value={propertyForm.dp}
                    onChange={(e) => handlePropertyFormChange('dp', e.target.value)}
                    placeholder="DP number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="typeOfProperty">Property Type</label>
                  <input
                    type="text"
                    id="typeOfProperty"
                    value={propertyForm.typeOfProperty}
                    onChange={(e) => handlePropertyFormChange('typeOfProperty', e.target.value)}
                    placeholder="e.g., House, Apartment"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="land">Land Area (sqm)</label>
                  <input
                    type="number"
                    id="land"
                    value={propertyForm.land}
                    onChange={(e) => handlePropertyFormChange('land', e.target.value)}
                    placeholder="Land area in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="build">Build Area (sqm)</label>
                  <input
                    type="number"
                    id="build"
                    value={propertyForm.build}
                    onChange={(e) => handlePropertyFormChange('build', e.target.value)}
                    placeholder="Build area in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bed">Bedrooms</label>
                  <input
                    type="number"
                    id="bed"
                    value={propertyForm.bed}
                    onChange={(e) => handlePropertyFormChange('bed', e.target.value)}
                    placeholder="Number of bedrooms"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="garage">Garage</label>
                  <input
                    type="number"
                    id="garage"
                    value={propertyForm.garage}
                    onChange={(e) => handlePropertyFormChange('garage', e.target.value)}
                    placeholder="Number of garage spaces"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="media">Media Upload</label>
                <div className="media-upload-section">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="media-upload" className="media-upload-button">
                    📸 Select Photos/Videos
                  </label>
                  
                  {mediaFiles.length > 0 && (
                    <div className="media-preview">
                      <h4>Selected Files ({mediaFiles.length})</h4>
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="media-file-item">
                          <span className="media-file-name">
                            {file.type.startsWith('image/') ? '🖼️' : '🎥'} {file.name}
                          </span>
                          <span className="media-file-size">
                            ({(file.size / 1024 / 1024).toFixed(2)}MB)
                          </span>
                          {mediaUploadProgress[file.name] !== undefined && (
                            <div className="upload-progress">
                              <div 
                                className="progress-bar" 
                                style={{ width: `${mediaUploadProgress[file.name]}%` }}
                              ></div>
                              <span>{mediaUploadProgress[file.name]}%</span>
                            </div>
                          )}
                          {mediaUploadErrors[file.name] && (
                            <span className="upload-error">❌ {mediaUploadErrors[file.name]}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="remove-media-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="readyBy">Ready By</label>
                <input
                  type="date"
                  id="readyBy"
                  value={propertyForm.readyBy}
                  onChange={(e) => handlePropertyFormChange('readyBy', e.target.value)}
                  placeholder="Ready by date"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {showMediaViewer && viewingMedia.length > 0 && (
        <div className="modal-overlay media-viewer-overlay">
          <div className="modal-content media-viewer-modal">
            <div className="media-viewer-header">
              <h3>Media Viewer</h3>
              <div className="media-viewer-actions">
                <button 
                  className="action-btn fullscreen-btn"
                  onClick={toggleFullscreen}
                  title="Toggle fullscreen"
                >
                  ⛶
                </button>
                <button 
                  className="action-btn download-btn"
                  onClick={downloadMedia}
                  title="Download media"
                >
                  ⬇️
                </button>
                <button 
                  className="close-media-viewer"
                  onClick={closeMediaViewer}
                  title="Close viewer"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="media-viewer-content">
              <div className="media-navigation">
                <button 
                  className="nav-btn prev-btn"
                  onClick={prevMedia}
                  title="Previous media"
                >
                  ‹
                </button>
                
                <div className="media-display">
                  <div className="media-counter">
                    {currentMediaIndex + 1} of {viewingMedia.length}
                  </div>
                  <div className="media-item-display">
                    {viewingMedia[currentMediaIndex] && (
                      <div className="media-content">
                        <img 
                          src={`https://auzlandrelistings.s3.amazonaws.com/${viewingMedia[currentMediaIndex]}`}
                          alt={`Media ${currentMediaIndex + 1}`}
                          className="media-image"
                          onError={(e) => {
                            console.error('Failed to load image:', e.currentTarget.src);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="media-filename">
                    {viewingMedia[currentMediaIndex]?.split('/').pop() || 'Unknown file'}
                  </div>
                </div>
                
                <button 
                  className="nav-btn next-btn"
                  onClick={nextMedia}
                  title="Next media"
                >
                  ›
                </button>
              </div>
            </div>
            
            <div className="media-viewer-footer">
              <div className="media-thumbnails">
                {viewingMedia.map((item: string, index: number) => (
                  <div 
                    key={item}
                    className={`media-thumbnail ${index === currentMediaIndex ? 'active' : ''}`}
                    onClick={() => setCurrentMediaIndex(index)}
                  >
                    <img src={`https://auzlandrelistings.s3.amazonaws.com/${item}`} alt={`Media ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Import Properties from CSV</h3>
              <button 
                onClick={clearCsvUpload}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="csv-upload-section">
                <div className="upload-instructions">
                  <h4>Instructions:</h4>
                  <ul>
                    <li>Upload a CSV file with property data</li>
                    <li>File must be less than 10MB</li>
                    <li>CSV should have headers matching the expected format</li>
                    <li>Required columns: lot, address</li>
                    <li>This will replace all existing properties</li>
                  </ul>
                </div>

                <div className="file-upload-area">
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    onChange={handleCsvFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="csv-upload" className="file-upload-button">
                    📁 Select CSV File
                  </label>
                  
                  {csvFile && (
                    <div className="selected-file">
                      <span className="file-name">📄 {csvFile.name}</span>
                      <span className="file-size">
                        ({(csvFile.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCsvFile(null)}
                        className="remove-file-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {csvUploadError && (
                  <div className="upload-error-message">
                    ❌ {csvUploadError}
                  </div>
                )}

                {csvUploadProgress > 0 && csvUploadProgress < 100 && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar">
                      <div 
                        className="upload-progress-fill" 
                        style={{ width: `${csvUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="upload-progress-text">{csvUploadProgress}%</span>
                  </div>
                )}

                {csvUploadProgress === 100 && (
                  <div className="upload-success-message">
                    ✅ Upload completed successfully!
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={clearCsvUpload}
                    className="cancel-button"
                    disabled={csvUploadProgress > 0 && csvUploadProgress < 100}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={processExcelUpload}
                    className="submit-button"
                    disabled={!csvFile || (csvUploadProgress > 0 && csvUploadProgress < 100)}
                  >
                    {csvUploadProgress > 0 && csvUploadProgress < 100 ? 'Processing...' : 'Import Properties'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
