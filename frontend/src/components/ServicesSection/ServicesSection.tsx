import React from 'react';
import './ServicesSection.css';

const ServicesSection = () => {
  const ourServices = [
    {
      id: 1,
      title: 'Sell Phone',
      image:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Phone',
    },
    {
      id: 2,
      title: 'Buy Gadgets',
      image:
        'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=80&h=80&fit=crop&crop=center',
      alt: 'Buy Gadgets',
    },
    {
      id: 3,
      title: 'Buy Phone',
      image:
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=80&h=80&fit=crop&crop=center',
      alt: 'Buy Phone',
    },
    {
      id: 4,
      title: 'Buy Laptops',
      image:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&h=80&fit=crop&crop=center',
      alt: 'Buy Laptops',
    },
    {
      id: 5,
      title: 'Repair Phone',
      image:
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=80&h=80&fit=crop&crop=center',
      alt: 'Repair Phone',
    },
    {
      id: 6,
      title: 'Repair Laptop',
      image:
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=80&h=80&fit=crop&crop=center',
      alt: 'Repair Laptop',
    },
    {
      id: 7,
      title: 'Find New Phone',
      image:
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=80&h=80&fit=crop&crop=center',
      alt: 'Find New Phone',
    },
    {
      id: 8,
      title: 'Nearby Stores',
      image:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop&crop=center',
      alt: 'Nearby Stores',
    },
    {
      id: 9,
      title: 'Buy Smartwatches',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&crop=center',
      alt: 'Buy Smartwatches',
    },
    {
      id: 10,
      title: 'Recycle',
      image:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=80&h=80&fit=crop&crop=center',
      alt: 'Recycle',
    },
  ];

  const sellServices = [
    {
      id: 1,
      title: 'Sell Phone',
      image:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Phone',
    },
    {
      id: 2,
      title: 'Sell Laptop',
      image:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Laptop',
    },
    {
      id: 3,
      title: 'Sell TV',
      image:
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell TV',
    },
    {
      id: 4,
      title: 'Sell Tablet',
      image:
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Tablet',
    },
    {
      id: 5,
      title: 'Sell Gaming Consoles',
      image:
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Gaming Consoles',
    },
    {
      id: 6,
      title: 'Sell Smartwatch',
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Smartwatch',
    },
    {
      id: 7,
      title: 'Sell Smart Speakers',
      image:
        'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell Smart Speakers',
    },
    {
      id: 8,
      title: 'Sell More',
      image:
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center',
      alt: 'Sell More',
    },
  ];

  return (
    <div className="services-section">
      <div className="services-container">
        {/* Our Services Section */}
        <div className="services-block">
          <h2 className="services-title">Our Services</h2>
          <div className="services-grid">
            {ourServices.map(service => (
              <div key={service.id} className="service-item">
                <div className="service-image-wrapper">
                  <img src={service.image} alt={service.alt} className="service-image" />
                </div>
                <p className="service-title">{service.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sell Your Old Device Section */}
        <div className="services-block">
          <h2 className="services-title">Sell Your Old Device Now</h2>
          <div className="services-grid">
            {sellServices.map(service => (
              <div key={service.id} className="service-item">
                <div className="service-image-wrapper">
                  <img src={service.image} alt={service.alt} className="service-image" />
                </div>
                <p className="service-title">{service.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
