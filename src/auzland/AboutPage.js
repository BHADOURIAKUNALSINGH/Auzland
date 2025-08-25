import React from 'react';
import './AboutPage.css';
import AbhiPhoto from '../media/Abhi2.jpeg';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="page-header">
        <div className="container">
          <h1>Our Story</h1>
          <p className="white-text">Building dreams, one property at a time in Sydney's South West</p>
        </div>
      </section>

      {/* Abhi's Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Meet Abhi</h2>
              <h3 className="story-subtitle">Sales Director</h3>
              <div className="story-bio">
                <p>
                  Hi, I'm Abhi, Sales Director with over 18 years of experience in sales across Sydney's South West. Since moving to the area in 2006, I've developed a strong passion for helping people find their dream homes and investment opportunities.
                </p>
                <p>
                  Whether it's a family home or a commercial property, I pride myself on providing honest advice, local insights, and results that truly make a difference. I love showcasing everything that makes our community—from Austral, Leppington, Catherine field, Oran Park, Edmondson Park, Gregory hills, Figtree hill, Wilton, Gledswood hills and many more—such a fantastic place to live and invest.
                </p>
                <p>
                  As a licensed real estate agent with extensive experience in Sydney's South West, I know the local market inside out and have helped countless clients buy, sell, and build their homes. If you're looking to make a move or simply need expert advice, I'm here to help—contact me today!
                </p>
              </div>
              <div className="story-cta">
                <a href="/contact" className="cta-button">Get In Touch</a>
              </div>
            </div>
            <div className="story-image">
              <img src={AbhiPhoto} alt="Abhi - Sales Director at AuzLandRE" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 