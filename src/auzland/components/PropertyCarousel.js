import React, { useState, useEffect, useRef } from 'react';
import './PropertyCarousel.css';

const PropertyCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // Beautiful homes showcase
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop&auto=format',
      title: 'Modern Luxury Living',
      subtitle: 'Contemporary Design Excellence',
      description: 'Experience the perfect blend of modern architecture and luxurious comfort in our premium properties.',
      cta: 'Explore Properties',
      overlay: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1f2937'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=600&fit=crop&auto=format',
      title: 'Stunning Family Homes',
      subtitle: 'Where Memories Are Made',
      description: 'Discover beautiful family homes designed for comfort, style, and lasting memories.',
      cta: 'View Homes',
      overlay: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1f2937'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop&auto=format',
      title: 'Architectural Masterpieces',
      subtitle: 'Exceptional Design & Craftsmanship',
      description: 'Step into homes that showcase the finest in architectural design and attention to detail.',
      cta: 'Discover More',
      overlay: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1f2937'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop&auto=format',
      title: 'Elegant Living Spaces',
      subtitle: 'Sophisticated & Refined',
      description: 'Find your perfect home in properties that combine elegance with everyday functionality.',
      cta: 'Browse Collection',
      overlay: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1f2937'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop&auto=format',
      title: 'Dream Home Awaits',
      subtitle: 'Your Perfect Match',
      description: 'From cozy cottages to grand estates, find the home that speaks to your heart.',
      cta: 'Start Your Search',
      overlay: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1f2937'
    }
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  // Touch/swipe handlers for fluid interaction
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Debug: Log current slide info
  useEffect(() => {
    console.log('🎠 Carousel - Current slide:', currentSlide);
    console.log('🎠 Carousel - Current slide image:', slides[currentSlide]?.image);
  }, [currentSlide, slides]);

  return (
    <section 
      className="property-carousel"
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-container">
        <div className="carousel-wrapper">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isPrev = index === (currentSlide - 1 + slides.length) % slides.length;
            const isNext = index === (currentSlide + 1) % slides.length;
            
            return (
              <div
                key={slide.id}
                className={`carousel-slide ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''}`}
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#f0f0f0',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : isPrev ? 'translateX(-100%)' : 'translateX(100%)'
                }}
              >
              <div className="slide-content">
                <div className="slide-text">
                  <h2 className="slide-title" style={{ color: slide.textColor }}>
                    {slide.title}
                  </h2>
                  <p className="slide-subtitle" style={{ color: slide.textColor }}>
                    {slide.subtitle}
                  </p>
                  <p className="slide-description" style={{ color: slide.textColor }}>
                    {slide.description}
                  </p>
                  <button className="slide-cta">
                    {slide.cta}
                  </button>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button className="carousel-nav carousel-prev" onClick={goToPrevious}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="carousel-nav carousel-next" onClick={goToNext}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;
