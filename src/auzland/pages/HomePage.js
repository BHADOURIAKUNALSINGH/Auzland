import React from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import './HomePage.css';

const HomePage = () => {
  // Sample property data
  const featuredProperties = [
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
              <h3>CALLING ALL INVESTORS</h3>
              <p>Caravan Park With DA Approved For Conversion Into Modern Village</p>
              <button className="btn btn-primary">Learn More</button>
            </div>
          </div>
          
          <div className="properties-grid">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="view-all-container">
            <button className="btn btn-secondary btn-large">View All Properties</button>
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
              <button className="btn btn-primary">Check Property Values</button>
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
              <button className="btn btn-primary">Explore Home Loans</button>
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
              <button className="btn btn-primary">Research Suburbs</button>
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
    </div>
  );
};

export default HomePage; 