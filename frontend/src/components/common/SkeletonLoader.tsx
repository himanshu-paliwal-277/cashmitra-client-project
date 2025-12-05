import React from 'react';

interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'list' | 'text';
  rows?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  rows = 3,
  className = '',
}) => {
  const baseClasses =
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded';

  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`h-4 ${baseClasses}`} />
          ))}
        </div>
        {/* Table Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100">
            {[...Array(7)].map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 ${baseClasses}`}
                style={{ animationDelay: `${(rowIndex * 7 + colIndex) * 0.05}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(rows)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className={`h-40 ${baseClasses} mb-4`} />
            <div className={`h-6 ${baseClasses} mb-3 w-3/4`} />
            <div className={`h-4 ${baseClasses} mb-2`} />
            <div className={`h-4 ${baseClasses} w-5/6`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(rows)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className={`w-12 h-12 rounded-full ${baseClasses}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 ${baseClasses} w-1/3`} />
              <div className={`h-3 ${baseClasses} w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // text type
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(rows)].map((_, index) => (
        <div
          key={index}
          className={`h-4 ${baseClasses} ${index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-5/6' : 'w-4/6'}`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
