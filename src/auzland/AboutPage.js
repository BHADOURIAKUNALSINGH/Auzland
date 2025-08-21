import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="intro-section">
        <h1>About AuzLandRE</h1>
        <p>We help Australians buy and sell property with confidence.</p>
      </section>

      <section className="team-section">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <h3>John Doe</h3>
            <p>John leads our company with a focus on transparency and results.</p>
          </div>
          <div className="team-member">
            <h3>Sarah Smith</h3>
            <p>Sarah brings deep market knowledge and a client-first mindset.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 