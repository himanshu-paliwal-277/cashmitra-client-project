import React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel';

const HeroCarousel = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const bannerImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Sell Your Phone - Get Best Price',
      title: 'Sell Your Phone',
      subtitle: 'Get the best price for your device in minutes',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Buy Refurbished Devices',
      title: 'Buy Refurbished',
      subtitle: 'Quality devices at unbeatable prices',
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Laptop Exchange Program',
      title: 'Laptop Exchange',
      subtitle: 'Trade in your old laptop for a new one',
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: 'Tablet Trade-in',
      title: 'Tablet Trade-in',
      subtitle: 'Upgrade your tablet with our exchange program',
    },
  ];

  return (
    <div className="w-full my-8 relative main-container">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {bannerImages.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="relative w-full lg:h-[400px] h-[350px]  overflow-hidden rounded-xl">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover block"
                />

                {/* Overlay with gradient and text */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 flex items-center justify-center p-8 md:p-6 sm:p-4">
                  <div className="text-white text-center max-w-3xl">
                    <h2 className=" text-white lg:text-4xl md:text-3xl sm:text-2xl font-bold mb-4 sm:mb-2 leading-tight drop-shadow-[2px_2px_8px_rgba(0,0,0,0.5)]">
                      {image.title}
                    </h2>
                    <p className="lg:text-lg md:text-base sm:text-sm opacity-95 drop-shadow-[1px_1px_4px_rgba(0,0,0,0.5)]">
                      {image.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
