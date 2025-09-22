import React from 'react';
import './FamilyExperience.css';

const FamilyExperience = () => {
  return (
    <section className="family-experience">
      <div className="container">
        <div className="experience-content">
          {/* Left Column - Text Content */}
          <div className="text-content">
            <h2 className="experience-title">
              <span className="title-accent">|</span> Buy with AuzLand
            </h2>
            <p className="experience-tagline">We make it possible.</p>
            <p className="experience-description">
              Whether you're excited to be purchasing your very first home, or upsizing for greater comfort and convenience, AuzLand will help you select the best property for you and your family. Our expert team guides you through every step of your real estate journey.
            </p>
            <button className="experience-cta">
              Buy with AuzLand
            </button>
          </div>

          {/* Right Column - Family Images */}
          <div className="image-content">
            <div className="family-image-grid">
              <div className="family-image main-image">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1681913261448-b0488050f8f6?fm=jpg&q=90&w=1000&h=600&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aGFwcHklMjBmYW1pbHl8ZW58MHx8MHx8fDA%3D" 
                  alt="Happy family celebrating their new home"
                />
                <div className="image-overlay">
                  <span className="image-caption">Finding Your Dream Home</span>
                </div>
              </div>
              
              <div className="family-image secondary-image">
                <img 
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=400&fit=crop&crop=faces&auto=format" 
                  alt="Happy family in their new home"
                />
                <div className="image-overlay">
                  <span className="image-caption">Celebrating Together</span>
                </div>
              </div>
              
              <div className="family-image secondary-image">
                <img 
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=400&fit=crop&crop=faces&auto=format" 
                  alt="Family making memories in their home"
                />
                <div className="image-overlay">
                  <span className="image-caption">Making Memories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FamilyExperience;
