import React, { useState, useEffect, useCallback } from 'react';
import './Banner.css';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Placeholder images with working URLs
  const bannerImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Sell Your Phone - Get Best Price',
      title: 'Sell Your Phone',
      subtitle: 'Get the best price for your device in minutes'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Buy Refurbished Devices',
      title: 'Buy Refurbished',
      subtitle: 'Quality devices at unbeatable prices'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Laptop Exchange Program',
      title: 'Laptop Exchange',
      subtitle: 'Trade in your old laptop for a new one'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Tablet Trade-in',
      title: 'Tablet Trade-in',
      subtitle: 'Upgrade your tablet with our exchange program'
    }
  ];

  const totalSlides = bannerImages.length;

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  // Navigation functions
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalSlides]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="banner-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="banner-wrapper">
        <div 
          className="banner-slides"
          style={{ transform: `translateX(-${currentSlide * 25}%)` }}
        >
          {bannerImages.map((image, index) => (
            <div key={image.id} className="banner-slide">
              <img 
                src={image.src} 
                alt={image.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="banner-overlay">
                <div className="banner-content">
                  {/* <h2 className="banner-title">{image.title}</h2> */}
                  {/* <p className="banner-subtitle">{image.subtitle}</p> */}
                  {/* <button className="banner-cta">Learn More</button> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <button 
          className="banner-nav banner-nav-prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button 
          className="banner-nav banner-nav-next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="banner-dots">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;