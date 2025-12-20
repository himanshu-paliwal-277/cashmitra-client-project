import React, { useState } from 'react';
import { Package, Search, CheckCircle } from 'lucide-react';
import AvailableOrders from '../../components/partner/AvailableOrders';
import ClaimedOrders from '../../components/partner/ClaimedOrders';

const SellOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'claimed'>('available');

  const tabs = [
    {
      id: 'available' as const,
      label: 'Available Orders',
      icon: <Search size={16} />,
      description: 'Orders available for pickup in your area',
    },
    {
      id: 'claimed' as const,
      label: 'My Orders',
      icon: <CheckCircle size={16} />,
      description: 'Orders you have claimed and are managing',
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: ``,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <div>
          <h1
            className="m-0 text-gray-900 font-bold"
            style={{ fontSize: 'clamp(1.6rem, 2.2vw, 2rem)' }}
          >
            Sell Orders
          </h1>
          <p className="mt-1 mb-0 text-gray-600">
            Manage device pickup orders in your service area
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Package size={20} />
          <span className="text-sm font-medium">Pincode-Based Routing</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[18px] p-3 shadow-[0_10px_25px_rgba(2,6,23,0.06)] mb-7">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <div className="mt-3 px-2">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-[18px] p-6 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
        {activeTab === 'available' && <AvailableOrders />}
        {activeTab === 'claimed' && <ClaimedOrders />}
      </div>
    </div>
  );
};

export default SellOrders;
