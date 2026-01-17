import React from 'react';
import { Shield } from 'lucide-react';
import { truncate } from '../../../../utils/truncateString';

interface ProductCardProps {
  product: any;
  onClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const rupee = (n: any) => (typeof n === 'number' ? n.toLocaleString() : n);

  const mrp = product.pricing?.mrp ?? 0;
  const discounted = product.pricing?.discountedPrice ?? mrp;
  const percent =
    product.pricing?.discountPercent ??
    (mrp > 0 ? Math.round(((mrp - discounted) / mrp) * 100) : 0);
  const discountAmount =
    product.pricing?.discountAmount ?? (mrp - discounted > 0 ? mrp - discounted : 0);

  const assuredChipVisible = true;

  return (
    <article
      className="relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:shadow-lg flex flex-col group"
      onClick={() => onClick(product._id)}
    >
      {/* Assured Badge */}
      {assuredChipVisible && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-teal-500 to-teal-600 text-white flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-xs sm:text-[10px] font-black">ⓒ</span>
          </div>
          <span>Cashmitra</span>
          <span className="text-[9px] font-semibold opacity-90">ASSURED</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative bg-white px-4 pt-12 pb-4 flex items-center justify-center">
        <div className="sm:w-full w-auto sm:h-[200px] h-[120px] flex items-center justify-center relative">
          <img
            src={product.images?.main || '/placeholder-phone.png'}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-300 ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 pt-2 flex flex-col sm:gap-2 gap-1 flex-1">
        {/* Discount Amount */}
        {discountAmount > 0 && (
          <div className="sm:text-sm text-xs font-bold text-green-600">
            ₹{rupee(discountAmount)} OFF
          </div>
        )}

        {/* Product Name */}
        <h3 className="sm:text-base text-sm font-bold line-clamp-2 text-gray-900 leading-tight m-0">
          {truncate(product.name, 70)}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline xl:flex-row flex-col xl:gap-2 mt-1">
          {percent > 0 && <span className="text-sm font-bold text-red-500">-{percent}%</span>}
          <div className="flex gap-2 items-center">
            <span className="sm:text-xl font-bold text-gray-900">₹{rupee(discounted)}</span>
            {mrp > discounted && (
              <span className="sm:text-sm text-xs text-gray-400 line-through font-medium">
                ₹{rupee(mrp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
