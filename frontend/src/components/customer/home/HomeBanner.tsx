import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Truck, Users, ArrowRight } from 'lucide-react';
import Button from '../../ui/Button';

const HomeBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 sm:py-16 py-10 text-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] 
          bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        />
      </div>

      <div className="relative max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 sm:mb-6 mb-3 leading-tight">
          Sell your device in minutes
        </h1>

        <p className="md:text-lg text-gray-600 mb-8 max-w-[600px] mx-auto leading-relaxed">
          Get the best price for your mobile, tablet, or laptop through our network of verified
          local partner shops. Safe, fast, and hassle-free.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={20} />}
            onClick={() => navigate('/sell')}
          >
            Start Selling
          </Button>

          <Button variant="secondary" size="lg" onClick={() => navigate('/buy')}>
            Browse Devices
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center items-center sm:gap-8 gap-4 flex-wrap opacity-80">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Shield size={20} />
            <span>100% Safe & Secure</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Clock size={20} />
            <span>Instant Payment</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Truck size={20} />
            <span>Free Pickup</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Users size={20} />
            <span>50,000+ Happy Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
