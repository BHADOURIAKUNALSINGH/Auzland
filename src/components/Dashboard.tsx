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







  // Function to verify authentication before user creation
  const verifyAuthBeforeUserCreation = async (): Promise<boolean> => {
    try {
      // Check if user has edit access
      if (!hasEditAccess) {
        setMessage({ type: 'error', text: 'You do not have permission to create users. Only administrators can add users.' });
        return false;
      }

      // Try to get auth header to verify token is valid
      try {
        await getAuthHeader();
        return true;
      } catch (error: any) {
        if (error.message?.includes('expired')) {
          setMessage({ type: 'error', text: 'Your authentication has expired. Please sign in again.' });
        } else {
          setMessage({ type: 'error', text: 'Authentication failed. Please sign in again.' });
        }
        return false;
      }
    } catch (error: any) {
      console.error('Auth verification failed:', error);
      setMessage({ type: 'error', text: `Authentication verification failed: ${error.message}` });
      return false;
    }
  };

  // Filter states
  const [filters, setFilters] = useState({
    quickSearch: '',
    suburb: '',
    propertyType: '',
    availability: '',
    frontageMin: '',
    frontageMax: '',
    landSizeMin: '',
    landSizeMax: '',
    buildSizeMin: '',
    buildSizeMax: '',
    bedMin: '',
    bedMax: '',
    bathMin: '',
    bathMax: '',
    garageMin: '',
    garageMax: '',
    priceMin: '',
    priceMax: '',
    registrationConstructionStatus: ''
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
    propertyType: '',
    lot: '',
    address: '',
    suburb: '',
    availability: '',
    frontage: '',
    landSize: '',
    buildSize: '',
    bed: '',
    bath: '',
    garage: '',
    registrationConstructionStatus: '',
    price: '',
    media: '',
    remark: ''
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

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  // Media viewer states
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [viewingMedia, setViewingMedia] = useState<any[]>([]);
  const [mediaPresignedUrls, setMediaPresignedUrls] = useState<{[key: string]: string}>({});



  
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

  // Prevent copy-paste operations only for view-only users
  useEffect(() => {
    // Only apply restrictions if user doesn't have edit access
    if (!hasEditAccess) {
      const preventCopyPaste = (e: KeyboardEvent) => {
        // Prevent Ctrl+C (copy)
        if (e.ctrlKey && e.key === 'c') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Prevent Ctrl+V (paste)
        if (e.ctrlKey && e.key === 'v') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Prevent Ctrl+A (select all)
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Add event listeners
      document.addEventListener('keydown', preventCopyPaste);
      document.addEventListener('contextmenu', preventContextMenu);

      // Cleanup
      return () => {
        document.removeEventListener('keydown', preventCopyPaste);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [hasEditAccess]);



  // Handle keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Filter and sort properties based on current filters and sort settings
  const applyFilters = () => {
    let filtered = [...properties];

    // Universal quick search filter (searches across multiple fields)
    if (filters.quickSearch.trim()) {
      const searchTerm = filters.quickSearch.toLowerCase().trim();
      filtered = filtered.filter(property => 
        // Property type search
        property.propertyType?.toLowerCase().includes(searchTerm) ||
        // Address and location search
        property.address?.toLowerCase().includes(searchTerm) ||
        property.suburb?.toLowerCase().includes(searchTerm) ||
        // Lot and property identification
        property.lot?.toLowerCase().includes(searchTerm) ||
        // Additional property details
        property.availability?.toLowerCase().includes(searchTerm) ||
        property.registrationConstructionStatus?.toLowerCase().includes(searchTerm) ||
        property.remark?.toLowerCase().includes(searchTerm)
      );
    }





    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(property => 
        property.availability?.toLowerCase() === filters.availability.toLowerCase()
      );
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => 
        property.propertyType?.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    // Suburb filter
    if (filters.suburb) {
      filtered = filtered.filter(property => 
        property.suburb?.toLowerCase().includes(filters.suburb.toLowerCase())
      );
    }



    // Frontage filter (min/max)
    if (filters.frontageMin || filters.frontageMax) {
      filtered = filtered.filter(property => {
        const frontage = property.frontage || 0;
        const min = filters.frontageMin ? parseFloat(filters.frontageMin) : 0;
        const max = filters.frontageMax ? parseFloat(filters.frontageMax) : Infinity;
        return frontage >= min && frontage <= max;
      });
    }

    // Land size filter (min/max)
    if (filters.landSizeMin || filters.landSizeMax) {
      filtered = filtered.filter(property => {
        const landSize = property.landSize || 0;
        const min = filters.landSizeMin ? parseFloat(filters.landSizeMin) : 0;
        const max = filters.landSizeMax ? parseFloat(filters.landSizeMax) : Infinity;
        return landSize >= min && landSize <= max;
      });
    }

    // Build size filter (min/max)
    if (filters.buildSizeMin || filters.buildSizeMax) {
      filtered = filtered.filter(property => {
        const buildSize = property.buildSize || 0;
        const min = filters.buildSizeMin ? parseFloat(filters.buildSizeMin) : 0;
        const max = filters.buildSizeMax ? parseFloat(filters.buildSizeMax) : Infinity;
        return buildSize >= min && buildSize <= max;
      });
    }

    // Bedrooms filter (min/max)
    if (filters.bedMin || filters.bedMax) {
      filtered = filtered.filter(property => {
        const beds = property.bed || 0;
        const min = filters.bedMin ? parseInt(filters.bedMin) : 0;
        const max = filters.bedMax ? parseInt(filters.bedMax) : Infinity;
        return beds >= min && beds <= max;
      });
    }

    // Bathrooms filter (min/max)
    if (filters.bathMin || filters.bathMax) {
      filtered = filtered.filter(property => {
        const baths = property.bath || 0;
        const min = filters.bathMin ? parseInt(filters.bathMin) : 0;
        const max = filters.bathMax ? parseInt(filters.bathMax) : Infinity;
        return baths >= min && baths <= max;
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

    // Price filter (min/max)
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(property => {
        const price = property.price || 0;
        const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Registration & Construction Status filter
    if (filters.registrationConstructionStatus) {
      filtered = filtered.filter(property => 
        property.registrationConstructionStatus === filters.registrationConstructionStatus
      );
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
        propertyType: r.propertyType || r.property_type || '',
        lot: r.lot,
        address: r.address,
        suburb: r.suburb || '',
        availability: r.availability || '',
        frontage: toNumber(r.frontage) || toNumber(r.frontage_m),
        landSize: toNumber(r.landSize) || toNumber(r.land_area_sqm),
        buildSize: toNumber(r.buildSize) || toNumber(r.build_area_sqm),
        bed: toNumber(r.bed),
        bath: toNumber(r.bath),
        garage: toNumber(r.garage),
        registrationConstructionStatus: r.registrationConstructionStatus || r.regoDue || r.rego_due || r.readyBy || r.ready_by || '',
        price: toNumber(r.price) || toNumber(r.price_guide),
        media: r.media || r.media_url || '',
        remark: r.remark || '',
        updatedAt: r.updatedAt || r.updated_at || '',
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
    'propertyType',
    'lot',
    'address',
    'suburb',
    'availability',
    'frontage',
    'landSize',
    'buildSize',
    'bed',
    'bath',
    'garage',
    'registrationConstructionStatus',
    'price',
    'media',
    'remark',
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
        p.propertyType ?? '',
        p.lot ?? '',
        p.address ?? '',
        p.suburb ?? '',
        p.availability ?? '',
        p.frontage ?? '',
        p.landSize ?? '',
        p.buildSize ?? '',
        p.bed ?? '',
        p.bath ?? '',
        p.garage ?? '',
        p.registrationConstructionStatus ?? '',
        p.price ?? '',
        p.media ?? '',
        p.remark ?? '',
        p.updatedAt ?? '',
      ].map(csvEscape);
      lines.push(row.join(','));
    }
    return lines.join('\n') + '\n';
  };

  // CSV upload handling functions





  // Property editing handlers
  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setPropertyForm({
      propertyType: property.propertyType || property.typeOfProperty || '',
      lot: property.lot || '',
      address: property.address || '',
      suburb: property.suburb || '',
      availability: property.availability || '',
      frontage: property.frontage || '',
      landSize: property.landSize || property.land || '',
      buildSize: property.buildSize || property.build || '',
      bed: property.bed || '',
      bath: property.bath || '',
      garage: property.garage || '',
      registrationConstructionStatus: property.registrationConstructionStatus || property.regoDue || property.readyBy || '',
      price: property.price || property.priceGuide || '',
      media: property.media || '',
      remark: property.remark || ''
    });
    
    // Clear any existing media files when editing
    setMediaFiles([]);
    setShowPropertyForm(true);
    
    // Log existing media for debugging
    if (property.media) {
      try {
        const existingMedia = JSON.parse(property.media);
        console.log('Editing property with existing media:', existingMedia);
      } catch (error) {
        console.warn('Error parsing existing media for edit:', error);
      }
    }
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      propertyType: '',
      lot: '',
      address: '',
      suburb: '',
      availability: '',
      frontage: '',
      landSize: '',
      buildSize: '',
      bed: '',
      bath: '',
      garage: '',
      registrationConstructionStatus: '',
      price: '',
      media: '',
      remark: ''
    });
    setShowPropertyForm(true);
  };

  const handlePropertyFormChange = (field: string, value: string) => {
    setPropertyForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePropertyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyForm.address) {
      setMessage({ type: 'error', text: 'Address is a required field.' });
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    // Check for duplicate addresses
    if (isDuplicateAddress(propertyForm.address, propertyForm.lot, propertyForm.suburb, properties, editingProperty?.id)) {
      setMessage({ type: 'error', text: 'Address already exists in this suburb! Please use a different address or edit the existing property.' });
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
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
        media: '',
        updatedAt: new Date().toISOString().split('T')[0]
      };

      if (editingProperty) {
        // Update existing property - preserve existing media and add new media
        let finalMediaKeys: string[] = [];
        
        // Parse existing media if any (use current editingProperty state which may have been updated)
        if (editingProperty.media) {
          try {
            const existingMedia = JSON.parse(editingProperty.media);
            if (Array.isArray(existingMedia)) {
              finalMediaKeys = [...existingMedia];
            }
          } catch (error) {
            console.warn('Error parsing existing media:', error);
          }
        }
        
        // Add new media keys
        if (mediaKeys.length > 0) {
          finalMediaKeys = [...finalMediaKeys, ...mediaKeys];
        }
        
        // Set the final media
        propertyData.media = finalMediaKeys.length > 0 ? JSON.stringify(finalMediaKeys) : '';
        
        const updatedProperties = properties.map(p => 
          p.id === editingProperty.id ? propertyData : p
        );
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);
        
        // Show success message with media info
        const existingCount = finalMediaKeys.length - mediaKeys.length;
        let messageText = `Property updated successfully!`;
        if (existingCount > 0) {
          messageText += ` ${existingCount} existing media files preserved.`;
        }
        if (mediaKeys.length > 0) {
          messageText += ` ${mediaKeys.length} new media files added.`;
        }
        setMessage({ type: 'success', text: messageText });
      } else {
        // Add new property
        propertyData.media = mediaKeys.length > 0 ? JSON.stringify(mediaKeys) : '';
        const updatedProperties = [...properties, propertyData];
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);
        
        // Show success message
        let messageText = `New property added successfully!`;
        if (mediaKeys.length > 0) {
          messageText += ` ${mediaKeys.length} media files uploaded.`;
        }
        setMessage({ type: 'success', text: messageText });
      }

      // Clear form and media files
      setPropertyForm({
        propertyType: '',
        lot: '',
        address: '',
        suburb: '',
        availability: '',
        frontage: '',
        landSize: '',
        buildSize: '',
        bed: '',
        bath: '',
        garage: '',
        registrationConstructionStatus: '',
        price: '',
        media: '',
        remark: ''
      });
      setMediaFiles([]);
      setMediaUploadProgress({});
      setMediaUploadErrors({});
      
      setShowPropertyForm(false);
      setEditingProperty(null);
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      setMessage({ type: 'error', text: `Error saving property: ${error.message}` });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    console.log('Delete property called with ID:', propertyId);
    console.log('Current properties:', properties);
    console.log('hasEditAccess:', hasEditAccess);
    
    if (!hasEditAccess) {
      console.log('User does not have edit access');
      setMessage({ type: 'error', text: 'You do not have permission to delete properties' });
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
        setMessage({ type: 'error', text: `Error deleting property: ${error.message}` });
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
      setMessage({ type: 'success', text: 'Successfully updated!' });
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      console.error('Auto-save error:', err);
      setMessage({ type: 'error', text: `Upload failed: ${err.message}` });
      setTimeout(() => setMessage(null), 5000); // Clear error message after 5 seconds
    }
  };

  // Media upload functions
  const handleMediaFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Media file selection triggered');
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 15 * 1024 * 1024; // 15MB limit
      
      console.log('File validation:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isValidType,
        isValidSize
      });
      
      if (!isValidType) {
        alert(`Invalid file type: ${file.type}. Only images, videos, and PDFs are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 15MB.`);
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



  const deleteCurrentMedia = async () => {
    if (!viewingMedia[currentMediaIndex]) return;
    
    const mediaKey = viewingMedia[currentMediaIndex];
    const fileName = mediaKey?.split('/').pop() || 'this file';
    
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      try {
        // Find the property that contains this media
        const propertyWithMedia = properties.find(p => {
          if (p.media) {
            try {
              const mediaKeys = JSON.parse(p.media);
              return Array.isArray(mediaKeys) && mediaKeys.includes(mediaKey);
            } catch (error) {
              return false;
            }
          }
          return false;
        });

        if (propertyWithMedia) {
          // Remove the media from the property
          const currentMedia = JSON.parse(propertyWithMedia.media);
          const updatedMedia = currentMedia.filter((key: string) => key !== mediaKey);
          
          const updatedProperty = {
            ...propertyWithMedia,
            media: updatedMedia.length > 0 ? JSON.stringify(updatedMedia) : ''
          };

          // Update the properties list
          const updatedProperties = properties.map(p => 
            p.id === propertyWithMedia.id ? updatedProperty : p
          );
          
          setProperties(updatedProperties);
          setFilteredProperties(updatedProperties);
          
          // Update the viewing media array
          const updatedViewingMedia = viewingMedia.filter(key => key !== mediaKey);
          setViewingMedia(updatedViewingMedia);
          
          // Reset current media index if needed
          if (updatedViewingMedia.length === 0) {
            setShowMediaViewer(false);
            setCurrentMediaIndex(0);
          } else if (currentMediaIndex >= updatedViewingMedia.length) {
            setCurrentMediaIndex(updatedViewingMedia.length - 1);
          }
          
          // Save to S3
          await autoSaveToS3(updatedProperties);
          
          // Show success message
          setMessage({ type: 'success', text: `"${fileName}" deleted successfully.` });
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        setMessage({ type: 'error', text: `Failed to delete "${fileName}": ${error instanceof Error ? error.message : 'Unknown error'}` });
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  const showExistingMediaList = (existingMedia: string[]) => {
    // Open the media viewer with existing media
    setViewingMedia(existingMedia);
    setCurrentMediaIndex(0);
    setShowMediaViewer(true);
  };

  const removeExistingMedia = (mediaKey: string, existingMedia: string[]) => {
    const fileName = mediaKey?.split('/').pop() || 'this file';
    
    if (window.confirm(`Are you sure you want to remove "${fileName}"? This action cannot be undone.`)) {
      try {
        const updatedMedia = existingMedia.filter(key => key !== mediaKey);
        const updatedProperty = {
          ...editingProperty,
          media: updatedMedia.length > 0 ? JSON.stringify(updatedMedia) : ''
        };
        setEditingProperty(updatedProperty);
        
        // Update the form to reflect the change
        setPropertyForm((prev: any) => ({
          ...prev,
          media: updatedProperty.media
        }));
        
        // Show feedback message
        setMessage({ type: 'success', text: `"${fileName}" removed from existing media.` });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.warn('Error removing existing media:', error);
      }
    }
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
      console.log(`Starting upload for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Check if file is too large for base64 encoding (keep under 15MB for base64)
      const maxSizeForBase64 = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSizeForBase64) {
        throw new Error(`File too large for upload: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size for videos is 15MB.`);
      }
      
      const base64Data = await convertFileToBase64(file);
      console.log(`File converted to base64, size: ${(base64Data.length * 0.75 / 1024 / 1024).toFixed(2)}MB`);
      
      const payload = {
        filename: file.name,
        contentType: file.type,
        listingId: listingId,
        dataBase64: base64Data
      };

      console.log('Sending upload request...');
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log(`Upload response status: ${response.status}`);
      console.log(`Upload response headers:`, response.headers);

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`Upload successful for ${file.name}:`, result);
      return result.key; // Return the S3 key for CSV storage
    } catch (error: any) {
      console.error(`Upload failed for ${file.name}:`, error);
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
      console.log('Attempting to delete media with key:', key);
      
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key })
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Delete failed with error:', errorData);
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      const successData = await response.json().catch(() => ({ ok: true }));
      console.log('Delete successful:', successData);
      return true;
    } catch (error: any) {
      console.error(`Failed to delete media ${key}:`, error);
      return false;
    }
  };

  // Fetch presigned URLs for media files
  const fetchPresignedUrl = async (mediaKey: string): Promise<string> => {
    try {
      const response = await fetch(`https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media?key=${encodeURIComponent(mediaKey)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch presigned URL: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.ok || !data.presignedUrl) {
        throw new Error('Invalid response from media service');
      }
      return data.presignedUrl;
    } catch (error: any) {
      console.error('Error fetching presigned URL:', error);
      throw new Error(`Failed to get media access: ${error.message}`);
    }
  };

  // Media viewer functions
  const openMediaViewer = async (property: any) => {
    if (!property.media) return;
    
    try {
      const mediaKeys = JSON.parse(property.media);
      if (mediaKeys.length === 0) return;
      
      // Fetch presigned URLs for all media keys
      const presignedUrls: {[key: string]: string} = {};
      for (const key of mediaKeys) {
        try {
          const presignedUrl = await fetchPresignedUrl(key);
          presignedUrls[key] = presignedUrl;
        } catch (error: any) {
          console.error(`Failed to get presigned URL for ${key}:`, error);
          // Continue with other media files
        }
      }
      
      setMediaPresignedUrls(presignedUrls);
      setViewingMedia(mediaKeys);
      setCurrentMediaIndex(0);
      setShowMediaViewer(true);
    } catch (error: any) {
      console.error('Error opening media viewer:', error);
      alert('Failed to load media. Please try again.');
    }
  };

  // Function to open media in new window
  const openMediaInNewWindow = (mediaKey: string) => {
    const presignedUrl = mediaPresignedUrls[mediaKey];
    if (!presignedUrl) {
      alert('Media not available. Please try viewing it again.');
      return;
    }
    
    // Simply open the presigned URL in a new window/tab
    // This will use the browser's default viewer for each file type
    window.open(presignedUrl, '_blank');
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
    setMediaPresignedUrls({});
  };

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
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showMediaViewer, prevMedia, nextMedia, closeMediaViewer]);



  const downloadMedia = () => {
    if (!viewingMedia[currentMediaIndex]) return;
    
    const mediaKey = viewingMedia[currentMediaIndex];
    const presignedUrl = mediaPresignedUrls[mediaKey];
    
    if (!presignedUrl) {
      alert('Media not available for download. Please try viewing it again.');
      return;
    }
    
    const filename = mediaKey?.split('/').pop() || 'media-file';
    
    // Create a temporary link element for download
    const link = document.createElement('a');
    link.href = presignedUrl;
    link.download = filename;
    link.target = '_blank';
    
    // Append to body, click, and remove
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
      console.log('Starting media deletion for:', mediaKey);
      console.log('Property before deletion:', property);
      
      const deleteSuccess = await deleteMediaFromS3(mediaKey);
      
      if (!deleteSuccess) {
        throw new Error('Failed to delete media from S3');
      }
      
      console.log('Media deleted from S3 successfully');
      
      // Update the properties state by removing the deleted media key
      const updatedProperties = properties.map(p => {
        if (p.id === property.id) {
          const currentMedia = p.media ? JSON.parse(p.media) : [];
          console.log('Current media keys:', currentMedia);
          const updatedMedia = currentMedia.filter((key: string) => key !== mediaKey);
          console.log('Updated media keys:', updatedMedia);
          return {
            ...p,
            media: JSON.stringify(updatedMedia)
          };
        }
        return p;
      });
      
      console.log('Updating properties state...');
      setProperties(updatedProperties);
      
      console.log('Auto-saving to S3...');
      await autoSaveToS3(updatedProperties);
      console.log('Auto-save completed');
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
      suburb: '',
      propertyType: '',
      availability: '',
      frontageMin: '',
      frontageMax: '',
      landSizeMin: '',
      landSizeMax: '',
      buildSizeMin: '',
      buildSizeMax: '',
      bedMin: '',
      bedMax: '',
      bathMin: '',
      bathMax: '',
      garageMin: '',
      garageMax: '',
      priceMin: '',
      priceMax: '',
      registrationConstructionStatus: ''
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
      // Verify authentication before proceeding
      const isAuthValid = await verifyAuthBeforeUserCreation();
      if (!isAuthValid) {
        setIsLoading(false);
        return;
      }
      
      // Call protected backend endpoint to create user in Cognito
      const authHeaders = await getAuthHeader();
      
      const requestBody = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
        // Group is automatically assigned by Lambda to "View-access"
      };
      
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
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
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
        {/* Quick Search */}
        <div className="filter-group">
          <label>Quick Search</label>
          <div className="search-input-container" title="You can search using property type, address, suburb, lot number, or any property details">
            <input
              type="text"
              placeholder="Search by property type, address, suburb, lot, or any property details..."
              value={filters.quickSearch}
              onChange={(e) => handleFilterChange('quickSearch', e.target.value)}
              className="universal-search-input"
            />
            <div className="search-tooltip">
              💡 Search across property type, address, suburb, lot number, and more
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="filter-category">
          <h4>Filter By Property Details</h4>
          <div className="filter-group">
            <label>Suburb</label>
            <input
              type="text"
              placeholder="Enter suburb name..."
              value={filters.suburb}
              onChange={(e) => handleFilterChange('suburb', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Property Type</label>
            <select 
              value={filters.propertyType} 
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Land only">Land only</option>
              <option value="Single story">Single story</option>
              <option value="Double story">Double story</option>
              <option value="Dual occupancy">Dual occupancy</option>
              <option value="Apartment">Apartment</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Home and Land Packages">Home and Land Packages</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Availability</label>
            <select 
              value={filters.availability} 
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            >
              <option value="">All Availability</option>
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Frontage (m)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.frontageMin}
                onChange={(e) => handleFilterChange('frontageMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.frontageMax}
                onChange={(e) => handleFilterChange('frontageMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Land Size (sqm)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.landSizeMin}
                onChange={(e) => handleFilterChange('landSizeMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.landSizeMax}
                onChange={(e) => handleFilterChange('landSizeMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Build Size (sqm)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.buildSizeMin}
                onChange={(e) => handleFilterChange('buildSizeMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.buildSizeMax}
                onChange={(e) => handleFilterChange('buildSizeMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Bed</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.bedMin}
                onChange={(e) => handleFilterChange('bedMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.bedMax}
                onChange={(e) => handleFilterChange('bedMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Bath</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.bathMin}
                onChange={(e) => handleFilterChange('bathMin', e.target.value)}
                className="range-input"
                min="0"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.bathMax}
                onChange={(e) => handleFilterChange('bathMax', e.target.value)}
                className="range-input"
                min="0"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Garage</label>
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
            <label>Price Range</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="range-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Registration & Construction Status</label>
            <select 
              value={filters.registrationConstructionStatus} 
              onChange={(e) => handleFilterChange('registrationConstructionStatus', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Unregistered">Unregistered</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          {/* Clear All Filters Button - At Bottom */}
          <div className="filter-group">
            <button 
              className="clear-filters-btn" 
              onClick={clearAllFilters}
              title={`Clear all ${getActiveFiltersCount()} active filters`}
            >
              🗑️ Clear All Filters
              {getActiveFiltersCount() > 0 && (
                <span className="filter-count-badge">
                  ({getActiveFiltersCount()})
                </span>
              )}
            </button>
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
              <option value="propertyType">Property Type</option>
              <option value="lot">Lot</option>
              <option value="address">Address</option>
              <option value="suburb">Suburb</option>
              <option value="availability">Availability</option>
              <option value="frontage">Frontage</option>
              <option value="landSize">Land Size</option>
              <option value="buildSize">Build Size</option>
              <option value="bed">Bedrooms</option>
              <option value="bath">Bathrooms</option>
              <option value="garage">Garage</option>
              <option value="price">Price</option>
              <option value="registrationConstructionStatus">Registration & Construction Status</option>
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
        
        {hasEditAccess && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {getActiveFiltersCount() > 0 && (
              <button className="clear-filters-header-btn" onClick={clearAllFilters}>
                Clear Filters
              </button>
            )}
            <button className="export-button" onClick={handleExport}>Export</button>
            <button className="export-button" onClick={handleNewProperty}>Add New Entry</button>
            <button className="import-button" onClick={() => setShowCsvUploadModal(true)}>Import CSV</button>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="properties-table-wrapper">
        <table className={`properties-table ${!hasEditAccess ? 'view-only' : ''}`}>
          <thead>
            <tr>
              <th>PROPERTY TYPE</th>
              <th>LOT</th>
              <th>ADDRESS</th>
              <th>SUBURB</th>
              <th>AVAILABILITY</th>
              <th>FRONTAGE</th>
              <th>LAND SIZE</th>
              <th>BUILD SIZE</th>
              <th>BED</th>
              <th>BATH</th>
              <th>GARAGE</th>
              <th>REGISTRATION & CONSTRUCTION STATUS</th>
              <th>PRICE</th>
              <th>MEDIA</th>
              <th>REMARK</th>
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
                  <td>{property.propertyType || '-'}</td>
                  <td>{property.lot}</td>
                  <td>{property.address}</td>
                  <td>{property.suburb || '-'}</td>
                  <td>{property.availability || '-'}</td>
                  <td>{property.frontage || '-'}</td>
                  <td>{property.landSize || '-'}</td>
                  <td>{property.buildSize || '-'}</td>
                  <td>{property.bed || '-'}</td>
                  <td>{property.bath || '-'}</td>
                  <td>{property.garage || '-'}</td>
                  <td>{property.registrationConstructionStatus || '-'}</td>
                  <td>${property.price?.toLocaleString() || '-'}</td>
                  {renderMediaColumn(property)}
                  <td>{property.remark || '-'}</td>
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
      </div>
    </main>
  );

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

  // Process CSV data with fuzzy matching for property types
  const processCsvData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim()); // Remove empty lines
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }
    
    // Parse CSV headers - handle quoted fields properly
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    console.log('CSV Headers detected:', headers);
    
    const processedData = lines.slice(1).map((line, rowIndex) => {
      const values = parseCSVLine(line);
      const row: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Apply fuzzy matching for property type column
        if (header.toLowerCase().includes('property') && header.toLowerCase().includes('type')) {
          value = fuzzyMatchPropertyType(value);
        }
        
        row[header] = value;
      });
      
      // Log the first few rows for debugging
      if (rowIndex < 3) {
        console.log(`Row ${rowIndex + 1}:`, row);
        console.log(`Row ${rowIndex + 1} values:`, values);
      }
      
      return row;
    });
    
    console.log(`Processed ${processedData.length} rows from CSV`);
    return processedData;
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    // Remove quotes from each field
    return result.map(field => field.replace(/^"|"$/g, ''));
  };

  // Fuzzy matching function for property types
  const fuzzyMatchPropertyType = (input: string): string => {
    if (!input) return '';
    
    const normalizedInput = input.toLowerCase().trim().replace(/\s+/g, ' ');
    const propertyTypes = [
      'Land only',
      'Single story', 
      'Double story',
      'Dual occupancy',
      'Apartment',
      'Townhouse',
      'Home and Land Packages'
    ];
    
    // Exact match first
    for (const type of propertyTypes) {
      if (type.toLowerCase() === normalizedInput) {
        return type;
      }
    }
    
    // Partial match
    for (const type of propertyTypes) {
      const normalizedType = type.toLowerCase();
      if (normalizedType.includes(normalizedInput) || normalizedInput.includes(normalizedType)) {
        return type;
      }
    }
    
    // Fuzzy match using similarity
    let bestMatch = '';
    let bestScore = 0;
    
    for (const type of propertyTypes) {
      const normalizedType = type.toLowerCase();
      let score = 0;
      
      // Check for common variations
      if (normalizedInput.includes('land') || normalizedType.includes('land')) score += 3;
      if (normalizedInput.includes('single') || normalizedType.includes('single')) score += 3;
      if (normalizedInput.includes('double') || normalizedType.includes('double')) score += 3;
      if (normalizedInput.includes('dual') || normalizedType.includes('dual')) score += 3;
      if (normalizedInput.includes('apartment') || normalizedType.includes('apartment')) score += 3;
      if (normalizedInput.includes('townhouse') || normalizedType.includes('townhouse')) score += 3;
      if (normalizedInput.includes('home') || normalizedType.includes('home')) score += 3;
      if (normalizedInput.includes('packages') || normalizedType.includes('packages')) score += 3;
      if (normalizedInput.includes('story') || normalizedType.includes('story')) score += 2;
      if (normalizedInput.includes('occupancy') || normalizedType.includes('occupancy')) score += 2;
      
      // Check for common abbreviations
      if (normalizedInput.includes('apt') && normalizedType.includes('apartment')) score += 2;
      if (normalizedInput.includes('town') && normalizedType.includes('townhouse')) score += 2;
      if (normalizedInput.includes('hlp') && normalizedType.includes('home and land packages')) score += 2;
      if (normalizedInput.includes('pkg') && normalizedType.includes('packages')) score += 2;
      if (normalizedInput.includes('1') && normalizedType.includes('single')) score += 1;
      if (normalizedInput.includes('2') && normalizedType.includes('double')) score += 1;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    }
    
    return bestScore >= 2 ? bestMatch : input; // Return original if no good match
  };

  // Check for duplicate addresses using fuzzy matching
  const isDuplicateAddress = (newAddress: string, newLot: string, newSuburb: string, existingProperties: any[], excludeId?: string): boolean => {
    if (!newAddress || !newAddress.trim()) return false;
    
    const normalizedNewAddress = newAddress.toLowerCase().trim();
    const normalizedNewLot = newLot ? newLot.toLowerCase().trim() : '';
    const normalizedNewSuburb = newSuburb ? newSuburb.toLowerCase().trim() : '';
    
    return existingProperties.some(property => {
      // Skip the property being edited (if any)
      if (excludeId && property.id === excludeId) return false;
      
      if (!property.address) return false;
      
      const existingAddress = property.address.toLowerCase().trim();
      const existingLot = property.lot ? property.lot.toLowerCase().trim() : '';
      const existingSuburb = property.suburb ? property.suburb.toLowerCase().trim() : '';
      
      // Check for exact duplicate: same address AND same suburb
      if (existingAddress === normalizedNewAddress && existingSuburb === normalizedNewSuburb) {
        // If both have lot numbers, they must be different to not be duplicates
        if (normalizedNewLot && existingLot) {
          return normalizedNewLot === existingLot; // Only duplicate if lot numbers are the same
        }
        // If one or both don't have lot numbers, consider it a duplicate
        return true;
      }
      
      // Fuzzy matching for very similar addresses in the same suburb
      if (existingSuburb === normalizedNewSuburb && normalizedNewSuburb) {
        const similarity = calculateAddressSimilarity(normalizedNewAddress, existingAddress);
        if (similarity > 0.9) { // Higher threshold for fuzzy matching
          // If both have lot numbers, they must be different to not be duplicates
          if (normalizedNewLot && existingLot) {
            return normalizedNewLot === existingLot;
          }
          return true;
        }
      }
      
      return false;
    });
  };

  // Calculate similarity between two addresses using Levenshtein distance
  const calculateAddressSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Levenshtein distance algorithm for string similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const processExcelUpload = async () => {
    if (!csvFile) return;
    
    setCsvUploadProgress(0);
    setCsvUploadError(null);
    
    try {
      if (csvFile.name.toLowerCase().endsWith('.csv')) {
        // Process CSV file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const csvText = e.target?.result as string;
            const processedData = processCsvData(csvText);
            await importPropertiesFromData(processedData);
          } catch (error: any) {
            console.error('Error processing CSV:', error);
            setCsvUploadError(error.message || 'Failed to process CSV file');
            setCsvUploadProgress(0);
          }
        };
        reader.readAsText(csvFile);
      } else if (csvFile.name.toLowerCase().endsWith('.xlsx')) {
        // Process Excel file
        await processExcelFile();
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      setCsvUploadError(error.message || 'Failed to process file');
      setCsvUploadProgress(0);
    }
  };

  const processExcelFile = async () => {
    if (!csvFile) return;
    
    try {
      setCsvUploadProgress(25);
      
      // For now, we'll implement basic Excel support
      // In a full implementation, you'd use SheetJS (xlsx) library
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setCsvUploadProgress(50);
          // This is a placeholder - in real implementation, parse Excel with SheetJS
          setCsvUploadError('Excel file processing requires SheetJS library. Please use CSV files for now, or contact support to enable Excel support.');
          setCsvUploadProgress(0);
        } catch (error: any) {
          console.error('Error processing Excel:', error);
          setCsvUploadError(error.message || 'Failed to process Excel file');
          setCsvUploadProgress(0);
        }
      };
      reader.readAsArrayBuffer(csvFile);
    } catch (error: any) {
      console.error('Error reading Excel file:', error);
      setCsvUploadError(error.message || 'Failed to read Excel file');
      setCsvUploadProgress(0);
    }
  };

  const importPropertiesFromData = async (data: any[]) => {
    try {
      setCsvUploadProgress(75);
      
      console.log('Raw CSV data received:', data);
      
      // Map CSV data to property structure
      const mappedProperties = data.map((row, index) => {
        console.log(`Processing row ${index}:`, row);
        
        // Create property object with current field structure
        const property = {
          id: row.id || `imported_${Date.now()}_${index}`,
          propertyType: row.propertyType || row.property_type || row['Property Type'] || row['property type'] || row['PROPERTY TYPE'] || '',
          lot: row.lot || row.Lot || row.LOT || '',
          address: row.address || row.Address || row.ADDRESS || '',
          suburb: row.suburb || row.Suburb || row.SUBURB || '',
          availability: row.availability || row.Availability || row.AVAILABILITY || '',
          frontage: row.frontage || row.frontage_m || row.Frontage || row.FRONTAGE || '',
          landSize: row.landSize || row.land_area_sqm || row['Land Size'] || row['Land Size (sqm)'] || row['LAND SIZE'] || row['land size'] || '',
          buildSize: row.buildSize || row.build_area_sqm || row['Build Size'] || row['Build Size (sqm)'] || row['BUILD SIZE'] || row['build size'] || '',
          bed: row.bed || row.Bed || row.BED || row.Bedrooms || row.bedrooms || '',
          bath: row.bath || row.Bath || row.BATH || row.Bathrooms || row.bathrooms || '',
          garage: row.garage || row.Garage || row.GARAGE || '',
          registrationConstructionStatus: row.registrationConstructionStatus || row.regoDue || row.readyBy || row['Registration & Construction Status'] || row['Rego Due'] || row['Ready By'] || row['registration status'] || row['REGISTRATION STATUS'] || '',
          price: (row.price || row.price_guide || row.Price || row['Price Guide'] || row['PRICE'] || row['price'] || '').replace(/^\$/, '').replace(/[,\s]/g, ''),
          media: row.media || row.media_url || row.Media || row.MEDIA || '',
          remark: row.remark || row.Remark || row.REMARK || '',
          updatedAt: new Date().toISOString().split('T')[0]
        };

        console.log(`Mapped property ${index}:`, property);

        // Apply fuzzy matching for property type
        if (property.propertyType) {
          property.propertyType = fuzzyMatchPropertyType(property.propertyType);
        }

        return property;
      }).filter(property => property.lot || property.address); // Only include properties with lot or address

      console.log('Final mapped properties:', mappedProperties);
      console.log('Properties after filtering:', mappedProperties.length);

      setCsvUploadProgress(90);
      
      // Filter out duplicate addresses before adding to existing properties
      const existingProperties = [...properties];
      const newProperties: any[] = [];
      const duplicateCount = { count: 0, addresses: [] as string[] };
      
      for (const property of mappedProperties) {
        if (isDuplicateAddress(property.address, property.lot, property.suburb, existingProperties)) {
          duplicateCount.count++;
          duplicateCount.addresses.push(`${property.address}, ${property.suburb}`);
        } else {
          newProperties.push(property);
        }
      }

      // Add new properties to existing ones (don't replace all)
      const updatedProperties = [...existingProperties, ...newProperties];
      setProperties(updatedProperties);
      setFilteredProperties(updatedProperties);
      
      // Save to S3
      await autoSaveToS3(updatedProperties);
      
      setCsvUploadProgress(100);
      
      // Show success message with duplicate info
      let messageText = `Successfully imported ${newProperties.length} new properties`;
      if (duplicateCount.count > 0) {
        messageText += `. ${duplicateCount.count} duplicate addresses were skipped to prevent duplicates.`;
        if (duplicateCount.count <= 5) {
          messageText += ` Skipped: ${duplicateCount.addresses.join(', ')}`;
        }
      }
      
      setMessage({ type: 'success', text: messageText });
      
      // Close modal after a short delay
      setTimeout(() => {
        clearCsvUpload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error importing properties:', error);
      setCsvUploadError(error.message || 'Failed to import properties');
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

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Global Message Display */}
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        {/* Collapsible Filters Sidebar */}
        <aside className={`filters-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          {renderFiltersSidebar()}
        </aside>
        
        <div className="content-area">
          {/* Combined Navigation Bar - Merged welcome and properties nav */}
          <nav className="combined-nav">
            <div className="nav-left">
              <div className="nav-brand">
                <h2>AuzLandRE Property Management Dashboard</h2>
              </div>
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
            </div>
            
            <div className="nav-right">
              <div className="user-info">
                <span className="username">Welcome, {user?.email || user?.username}</span>
                <span className="user-role">
                  {hasEditAccess ? 'Administrator' : 'View Access'}
                </span>
              </div>
              <button onClick={signOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </nav>
          
          {/* Sidebar Toggle Button */}
          <div className="sidebar-toggle-container">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={`${isSidebarOpen ? 'Hide' : 'Show'} Filters (Ctrl/Cmd + B)`}
              aria-label="Toggle Filters Sidebar"
            >
            </button>
          </div>

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
              {/* Property Form Message Display */}
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="propertyType">Property Type *</label>
                  <select
                    id="propertyType"
                    value={propertyForm.propertyType}
                    onChange={(e) => handlePropertyFormChange('propertyType', e.target.value)}
                    required
                    style={{
                      color: propertyForm.propertyType ? '#e5e7eb' : '#94a3b8'
                    }}
                  >
                    <option value="" disabled style={{ color: '#94a3b8' }}>
                      -- Select Property Type --
                    </option>
                    <option value="Land only">Land only</option>
                    <option value="Single story">Single story</option>
                    <option value="Double story">Double story</option>
                    <option value="Dual occupancy">Dual occupancy</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Home and Land Packages">Home and Land Packages</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="lot">Lot</label>
                  <input
                    type="text"
                    id="lot"
                    value={propertyForm.lot}
                    onChange={(e) => handlePropertyFormChange('lot', e.target.value)}
                    placeholder="Lot number"
                  />
                </div>
              </div>

              <div className="form-row">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    value={propertyForm.availability}
                    onChange={(e) => handlePropertyFormChange('availability', e.target.value)}
                    style={{
                      color: propertyForm.availability ? '#e5e7eb' : '#94a3b8'
                    }}
                  >
                    <option value="" disabled style={{ color: '#94a3b8' }}>
                      -- Select Availability --
                    </option>
                    <option value="Available">Available</option>
                    <option value="Under Offer">Under Offer</option>
                    <option value="Sold">Sold</option>
                  </select>
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
                  <label htmlFor="landSize">Land Area (sqm)</label>
                  <input
                    type="number"
                    id="landSize"
                    value={propertyForm.landSize}
                    onChange={(e) => handlePropertyFormChange('landSize', e.target.value)}
                    placeholder="Land area in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="buildSize">Build Area (sqm)</label>
                  <input
                    type="number"
                    id="buildSize"
                    value={propertyForm.buildSize}
                    onChange={(e) => handlePropertyFormChange('buildSize', e.target.value)}
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
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label htmlFor="registrationConstructionStatus">Registration & Construction Status</label>
                  <select
                    id="registrationConstructionStatus"
                    value={propertyForm.registrationConstructionStatus}
                    onChange={(e) => handlePropertyFormChange('registrationConstructionStatus', e.target.value)}
                    style={{
                      color: propertyForm.registrationConstructionStatus ? '#e5e7eb' : '#94a3b8'
                    }}
                  >
                    <option value="" disabled style={{ color: '#94a3b8' }}>
                      -- Select Status --
                    </option>
                    <option value="Registered">Registered</option>
                    <option value="Un-Registered">Un-Registered</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Constructed">Constructed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    id="price"
                    value={propertyForm.price}
                    onChange={(e) => handlePropertyFormChange('price', e.target.value)}
                    placeholder="Price in dollars"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="media">Media Upload</label>
                
                {/* Display existing media count when editing */}
                {editingProperty && editingProperty.media && (
                  <div className="existing-media-section" key={`media-section-${editingProperty.id}-${Date.now()}`}>
                    <h4>📁 Existing Media Files</h4>
                    {(() => {
                      try {
                        const existingMedia = JSON.parse(editingProperty.media);
                        console.log('Rendering existing media count:', existingMedia.length); // Debug log
                        if (Array.isArray(existingMedia) && existingMedia.length > 0) {
                          console.log('Rendering stacked media display for:', existingMedia.length, 'files');
                          return (
                            <div className="existing-media-stack">
                              {existingMedia.map((mediaKey: string, index: number) => (
                                <div key={index} className="existing-media-item-stacked">
                                  <span className="media-file-name">
                                    {mediaKey.split('/').pop() || mediaKey}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeExistingMedia(mediaKey, existingMedia)}
                                    className="remove-existing-media-btn"
                                    title="Remove this media file"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch (error) {
                        console.warn('Error parsing existing media:', error);
                      }
                      return <p>No existing media files</p>;
                    })()}
                  </div>
                )}
                
                <div className="media-upload-section">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*,.pdf,.PDF"
                    onChange={handleMediaFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="media-upload" className="media-upload-button">
                    📸 Select Photos/Videos/PDFs
                  </label>
                  
                  {mediaFiles.length > 0 && (
                    <div className="media-preview">
                      <h4>Selected Files ({mediaFiles.length})</h4>
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="media-file-item">
                          <span className="media-file-name">
                            {file.type.startsWith('image/') ? '🖼️' : 
                             file.type.startsWith('video/') ? '🎥' : 
                             file.type === 'application/pdf' ? '📄' : '📎'} {file.name}
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
                <label htmlFor="remark">Remark</label>
                <textarea
                  id="remark"
                  value={propertyForm.remark}
                  onChange={(e) => handlePropertyFormChange('remark', e.target.value)}
                  placeholder="Additional remarks"
                ></textarea>
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
                  className="action-btn new-window-btn"
                  onClick={() => openMediaInNewWindow(viewingMedia[currentMediaIndex])}
                  title="Open in new window"
                >
                  🔗
                </button>
                <button 
                  className="action-btn download-btn"
                  onClick={downloadMedia}
                  title="Download media"
                >
                  ⬇️
                </button>
                {hasEditAccess && (
                  <button 
                    className="action-btn delete-media-btn"
                    onClick={() => deleteCurrentMedia()}
                    title="Delete this media file"
                  >
                    🗑️
                  </button>
                )}
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
                        {mediaPresignedUrls[viewingMedia[currentMediaIndex]] ? (
                          (() => {
                            const mediaKey = viewingMedia[currentMediaIndex];
                            const filename = mediaKey?.split('/').pop() || 'media-file';
                            const fileExtension = filename.split('.').pop()?.toLowerCase();
                            
                            if (fileExtension === 'pdf') {
                              return (
                                <iframe 
                                  src={mediaPresignedUrls[mediaKey]}
                                  title={filename}
                                  className="media-pdf"
                                  width="100%"
                                  height="800"
                                />
                              );
                            } else if (fileExtension && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension)) {
                              return (
                                <video 
                                  controls 
                                  className="media-video"
                                  width="100%"
                                  height="auto"
                                >
                                  <source src={mediaPresignedUrls[mediaKey]} type={`video/${fileExtension}`} />
                                  Your browser does not support the video tag.
                                </video>
                              );
                            } else {
                              return (
                                <img 
                                  src={mediaPresignedUrls[mediaKey]}
                                  alt={filename}
                                  className="media-image"
                                  onError={(e) => {
                                    console.error('Failed to load image:', e.currentTarget.src);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              );
                            }
                          })()
                        ) : (
                          <div className="media-loading">
                            Loading media...
                          </div>
                        )}
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
                    {mediaPresignedUrls[item] ? (
                      <img src={mediaPresignedUrls[item]} alt={`Media ${index + 1}`} />
                    ) : (
                      <div className="thumbnail-loading">...</div>
                    )}
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
                  <h4>Quick Guide:</h4>
                  <ul>
                    <li>Upload CSV or Excel file (max 10MB)</li>
                    <li><strong>Required:</strong> lot OR address</li>
                    <li><strong>Optional:</strong> All other fields</li>
                    <li><strong>Warning:</strong> This replaces existing properties</li>
                    <li><strong>Property Types:</strong> Land, Single story, Double story, Dual occupancy, Apartment, Townhouse, Home and Land Packages</li>
                  </ul>
                  
                  <div className="field-mapping-info">
                    <h5>Column Names (any case):</h5>
                    <div className="field-mapping-grid">
                      <div className="field-column">
                        <strong>Basic:</strong>
                        <ul>
                          <li>propertyType</li>
                          <li>lot</li>
                          <li>address</li>
                          <li>suburb</li>
                          <li>availability</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Size:</strong>
                        <ul>
                          <li>frontage</li>
                          <li>landSize</li>
                          <li>buildSize</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Details:</strong>
                        <ul>
                          <li>bed</li>
                          <li>bath</li>
                          <li>garage</li>
                          <li>price</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Other:</strong>
                        <ul>
                          <li>registrationStatus</li>
                          <li>media</li>
                          <li>remark</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="file-upload-area">
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv,.xlsx"
                    onChange={handleCsvFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="csv-upload" className="file-upload-button">
                    📁 Select CSV/Excel File
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
