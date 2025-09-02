import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import ChatbotSidebar from '../components/ChatbotSidebar';
import './PropertiesPage.css';

const LISTINGS_API_URL = 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings';

const PropertiesPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState(params.get('q') || '');
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
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const parseCsv = (csv) => {
    const rows = [];
    if (!csv) return rows;
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return rows;
    const headers = lines[0].split(',').map((h) => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        let value = (cols[j] || '').trim();
        
        // Transform legacy "Home and Land Packages" to "Home & Land"
        if (value.toLowerCase() === 'home and land packages') {
          value = 'Home & Land';
        }
        
        obj[headers[j]] = value;
      }
      rows.push(obj);
    }
    return rows;
  };

  const toNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Helper function for chatbot filter integration
  const handleChatbotFilterChange = (filterName, value) => {
    console.log('🔧 Setting filter:', filterName, '=', value);
    switch (filterName) {
      case 'priceMin':
        setPriceMin(value);
        break;
      case 'priceMax':
        setPriceMax(value);
        break;
      case 'bedroomsMin':
      case 'bedMin':
        setBedMin(value);
        break;
      case 'bathroomsMin':
      case 'bathMin':
        setBathMin(value);
        break;
      case 'garageMin':
        setGarageMin(value);
        break;
      case 'propertyType':
      case 'typeFilter':
        setTypeFilter(value);
        break;
      case 'suburb':
        setSuburb(value);
        break;
      case 'searchText':
      case 'quickSearch':
        setSearchText(value);
        break;
      // Additional AI service filter names that we don't use in this component
      case 'availability':
      case 'frontageMin':
      case 'frontageMax':
      case 'landSizeMin':
      case 'landSizeMax':
      case 'buildSizeMin':
      case 'buildSizeMax':
      case 'bedMax':
      case 'bathMax':
      case 'garageMax':
      case 'registrationConstructionStatus':
        console.log('⚠️ Filter not implemented in this component:', filterName, value);
        break;
      default:
        console.log('Unknown filter:', filterName, value);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setPriceMin('');
    setPriceMax('');
    setBedMin('');
    setBathMin('');
    setGarageMin('');
    setTypeFilter('');
    setSuburb('');
  };

  // Build current filters object for chatbot context
  const currentFilters = {
    searchText,
    priceMin,
    priceMax,
    bedMin,
    bathMin,
    garageMin,
    typeFilter,
    suburb
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
          bedrooms: toNumber(r.bed),
          bathrooms: toNumber(r.bath),
          parking: toNumber(r.garage),
          landSize: toNumber(r.landSize) || toNumber(r.land_area_sqm),
          image: r.media || r.media_url || placeholder[idx % placeholder.length],
          price: '',
          status: r.status || 'For Sale',
          priceNumber: (() => { const raw = (r.price || r.price_guide || '').toString(); const n = Number(raw.replace(/[^0-9]/g, '')); return Number.isFinite(n) ? n : undefined; })()
        })).filter((p) => p.address || p.suburb);
        setProperties(mapped);
      } catch (e) {
        setError(e?.message || 'Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearchText(p.get('q') || '');
  }, [location.search]);

  const filtered = useMemo(() => {
    const q = (searchText || '').toLowerCase();
    let result = properties.filter((p) => `${p.address} ${p.suburb} ${p.propertyType}`.toLowerCase().includes(q));
    const minP = priceMin ? Number(priceMin) : undefined;
    const maxP = priceMax ? Number(priceMax) : undefined;
    const minBed = bedMin ? Number(bedMin) : undefined;
    const minBath = bathMin ? Number(bathMin) : undefined;
    const minGarage = garageMin ? Number(garageMin) : undefined;
    const type = (typeFilter || '').toLowerCase();
    const suburbQ = (suburb || '').toLowerCase();
    result = result.filter((p) => {
      if (typeof minP === 'number' && (p.priceNumber ?? Infinity) < minP) return false;
      if (typeof maxP === 'number' && (p.priceNumber ?? 0) > maxP) return false;
      if (typeof minBed === 'number' && (p.bedrooms ?? 0) < minBed) return false;
      if (typeof minBath === 'number' && (p.bathrooms ?? 0) < minBath) return false;
      if (typeof minGarage === 'number' && (p.parking ?? 0) < minGarage) return false;
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
  }, [properties, searchText, priceMin, priceMax, bedMin, bathMin, garageMin, typeFilter, suburb]);

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
          <div className="filters-section" style={{ marginBottom: 16 }}>
            <div className="filter-group" style={{ width: '100%' }}>
              <label>Search by address or suburb</label>
              <input type="text" className="text-input" placeholder="e.g. Austral, Leppington" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="filter-toggle-btn" onClick={() => setShowFilters((s) => !s)}>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            {showFilters && (
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, maxWidth: '100%' }}>
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
            </div>
            )}
          </div>

          {isLoading && <p>Loading properties...</p>}
          {error && !isLoading && <p style={{ color: 'red' }}>{error}</p>}

          {!isLoading && !error && (
            <>
          <div className="results-info">
                <p>Showing {filtered.length} properties</p>
          </div>
          <div className="properties-grid">
                {filtered.map((p) => (
                  <div key={p.id} onClick={() => handlePropertyClick(p)} style={{ cursor: 'pointer' }}>
                    <PropertyCard property={p} />
                  </div>
            ))}
          </div>
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

      {/* Filter Chatbot */}
      <ChatbotSidebar 
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        currentFilters={currentFilters}
        propertyCount={filtered.length}
        onFiltersChange={(newFilters) => {
          // Apply multiple filter changes at once using the new filters object
          Object.entries(newFilters).forEach(([key, value]) => {
            handleChatbotFilterChange(key, value);
          });
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Chatbot Toggle Button - Fixed position */}
      {!isChatbotOpen && (
        <button 
          className="chatbot-fab"
          onClick={() => setIsChatbotOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Open Filter Assistant"
        >
          🔍
        </button>
      )}
    </div>
  );
};

export default PropertiesPage; 