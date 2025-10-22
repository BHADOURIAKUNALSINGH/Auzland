import React, { useState } from 'react';
import './ContactPage.css';
import { CONTACT_API_URL, hasContactApi } from './api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, subject, message } = formData;

    if (hasContactApi()) {
      try {
        setIsSubmitting(true);
        const res = await fetch(CONTACT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, subject, message }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed: ${res.status}`);
        }
        setShowSuccess(true);
        setJustSent(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setShowSuccess(false), 5000);
        setTimeout(() => setJustSent(false), 2000);
      } catch (err) {
        console.error('Contact submit failed:', err);
        setShowSuccess(false);
        // Show error in console, user will see form didn't reset
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // No fallback - API must be configured
    // Form not configured
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="white-text">Get in touch with our team for any inquiries or assistance</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Ready to start your property journey? Our experienced team is here to help 
                you every step of the way. Whether you're buying, selling, or just have 
                questions, we'd love to hear from you.
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Addresses</h3>
                    <p><strong>Office 1:</strong> Unit 107, 3 Fordham Way, Oran Park NSW 2570</p>
                    <p><strong>Office 2:</strong> 172 Eight Avenue, Austral NSW 2179</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2136 21.3522 21.4019C21.1471 21.5902 20.9053 21.7335 20.6408 21.8227C20.3763 21.9119 20.0952 21.9454 19.815 21.9209C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.19C2.09553 3.90978 2.12905 3.62868 2.21826 3.36421C2.30747 3.09975 2.45083 2.85793 2.63912 2.65288C2.82741 2.44784 3.05642 2.28425 3.31164 2.17265C3.56686 2.06105 3.84259 2.00407 4.12099 2.005C7.12099 2.005 10.121 3.005 12.121 5.005C14.121 7.005 15.121 10.005 15.121 13.005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Phone</h3>
                    <p>0433 933 756</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                                     <div>
                     <h3>Email</h3>
                     <p>Abhi@auzlandre.com.au</p>
                   </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Business Hours</h3>
                    <p>Mon - Fri: 9:00 AM - 6:00 PM<br/>Sat: 9:00 AM - 4:00 PM<br/>Sun: 9:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-container">
              <form className="contact-form card" onSubmit={handleSubmit}>
                <h3>Send us a Message</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="buying">Buying Property</option>
                    <option value="selling">Selling Property</option>
                    <option value="renting">Renting Property</option>
                    <option value="valuation">Property Valuation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className={`btn-modern ${isSubmitting ? 'loading' : ''} ${justSent ? 'success' : ''}`}
                  disabled={isSubmitting}
                  aria-live="polite"
                >
                  {isSubmitting && (
                    <span className="spinner" aria-hidden="true"></span>
                  )}
                  {justSent && !isSubmitting && (
                    <span className="icon-check" aria-hidden="true">✓</span>
                  )}
                  <span className="label">
                    {isSubmitting ? 'Sending' : justSent ? 'Sent!' : 'Send Message'}
                  </span>
                </button>
              </form>
              
              {showSuccess && (
                <div className="success-message">
                  ✓ Message sent successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="section map-section">
        <div className="container">
                     <h2 className="section-title">Find Us</h2>
           
           {/* Office 1 - Oran Park Map */}
           <div style={{ marginBottom: '2rem' }}>
             <h3 style={{ marginBottom: '1rem', color: '#013B78', fontSize: '1.5rem' }}>Office 1 - Oran Park</h3>
             <div className="map-container card" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
               <iframe
                 title="AuzLandRE Oran Park Location"
                 src={`https://www.google.com/maps?q=${encodeURIComponent('Unit 107, 3 Fordham Way, Oran Park NSW 2570, Australia')}&z=16&output=embed`}
                 width="100%"
                 height="400"
                 style={{ border: 0 }}
                 allowFullScreen
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
             </div>
             <div className="map-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
               <a
                 className="btn btn-secondary"
                 href={`https://www.google.com/maps?q=${encodeURIComponent('Unit 107, 3 Fordham Way, Oran Park NSW 2570, Australia')}`}
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Open in Google Maps
               </a>
               <a
                 className="btn btn-primary"
                 href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Unit 107, 3 Fordham Way, Oran Park NSW 2570, Australia')}`}
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Get Directions
               </a>
             </div>
           </div>

           {/* Office 2 - Austral Map */}
           <div>
             <h3 style={{ marginBottom: '1rem', color: '#013B78', fontSize: '1.5rem' }}>Office 2 - Austral</h3>
             <div className="map-container card" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
               <iframe
                 title="AuzLandRE Austral Location"
                 src={`https://www.google.com/maps?q=${encodeURIComponent('172 Eight Avenue, Austral NSW 2179, Australia')}&z=16&output=embed`}
                 width="100%"
                 height="400"
                 style={{ border: 0 }}
                 allowFullScreen
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
             </div>
             <div className="map-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
               <a
                 className="btn btn-secondary"
                 href={`https://www.google.com/maps?q=${encodeURIComponent('172 Eight Avenue, Austral NSW 2179, Australia')}`}
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Open in Google Maps
               </a>
               <a
                 className="btn btn-primary"
                 href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('172 Eight Avenue, Austral NSW 2179, Australia')}`}
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Get Directions
               </a>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 