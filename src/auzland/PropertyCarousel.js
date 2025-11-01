import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const PropertyCarousel = ({ children }) => {
  const originalSlides = React.Children.toArray(children);
  const totalSlides = originalSlides.length;

  // We start at index 1 to show the first "real" slide, as index 0 is a clone of the last
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef(null);

  // 1. Create cloned slides for the infinite loop effect
  // We add the last slide to the beginning, and the first slide to the end
  // [Slide 6 (Clone), Slide 1, Slide 2, Slide 3, Slide 4, Slide 5, Slide 6, Slide 1 (Clone)]
  const slides = useMemo(() => {
    if (totalSlides === 0) return [];
    
    // We need at least 3 slides to make this effect work
    if (totalSlides < 3) return originalSlides; 

    const firstClone = React.cloneElement(originalSlides[0], { key: 'first-clone' });
    const lastClone = React.cloneElement(originalSlides[totalSlides - 1], { key: 'last-clone' });
    return [lastClone, ...originalSlides, firstClone];
  }, [originalSlides, totalSlides]);

  const slideCount = slides.length;

  // 2. Dynamic styles for the carousel track
  const transitionStyle = isTransitioning ? 'transform 0.5s ease-in-out' : 'none';
    const trackWidth = `${slideCount * (100 / 3)}%`; // Total width of the track
    const transformStyle = `translateX(-${currentIndex * trackWidth}%)`; // Each slide is 33.3%

  // 3. Arrow & Dot Navigation Handlers
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  }, [isTransitioning]);

  const handleDotClick = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1); // +1 because of the initial cloned slide
  };

  // 4. The "Snap Back" Effect for infinite loop
  // This runs after the CSS transition finishes
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      // If we're at the (cloned) beginning, snap to the (real) end
      setIsTransitioning(false);
      setCurrentIndex(totalSlides);
    } else if (currentIndex === totalSlides + 1) {
      // If we're at the (cloned) end, snap to the (real) beginning
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else {
      // Normal transition end
      setIsTransitioning(false);
    }
  };

  // 5. Auto-play
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  // 6. Calculate which dot is "active"
  let activeDotIndex = 0;
  if (currentIndex === 0) {
    activeDotIndex = totalSlides - 1; // At start clone, highlight last dot
  } else if (currentIndex === totalSlides + 1) {
    activeDotIndex = 0; // At end clone, highlight first dot
  } else {
    activeDotIndex = currentIndex - 1; // Normal calculation
  }

  // Fallback if there aren't enough slides for a carousel
  if (totalSlides < 3) {
    return (
      <div className="property-carousel-static">
        {originalSlides.map((slide, index) => (
          <div className="carousel-slide" key={index}>{slide}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="property-carousel">
      <div className="carousel-track-container">
        <div
          className="carousel-track"
          ref={trackRef}
          style={{
            width: trackWidth,
            transform: transformStyle,
            transition: transitionStyle,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((slide, index) => (
            <div className="carousel-slide" key={index}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      
      {/* Arrows */}
      <button className="carousel-arrow prev" onClick={prevSlide}>&#128896;</button>
      <button className="carousel-arrow next" onClick={nextSlide}>&#128898;</button>
      
      {/* Navigation Dots */}
      <div className="carousel-dots">
        {originalSlides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeDotIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyCarousel;