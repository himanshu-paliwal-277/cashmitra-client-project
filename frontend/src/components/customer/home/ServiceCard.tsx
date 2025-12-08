import React from 'react';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    image: string;
    alt: string;
  };
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer w-full"
    >
      <img
        src={service.image}
        alt={service.alt}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mb-3"
      />
      <p className="text-sm font-medium text-gray-700">{service.title}</p>
    </div>
  );
};

export default ServiceCard;
