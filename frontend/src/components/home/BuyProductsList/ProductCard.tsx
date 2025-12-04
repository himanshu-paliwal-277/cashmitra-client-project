import React from 'react';
import { Star, Shield, Tag } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const rupee = (n: any) => (typeof n === 'number' ? n.toLocaleString() : n);

  const rating = product.rating?.average ?? 4.6;
  const mrp = product.pricing?.mrp ?? 0;
  const discounted = product.pricing?.discountedPrice ?? mrp;
  const percent =
    product.pricing?.discountPercent ??
    (mrp > 0 ? Math.round(((mrp - discounted) / mrp) * 100) : 0);
  const discountAmount =
    product.pricing?.discountAmount ?? (mrp - discounted > 0 ? mrp - discounted : 0);
  const goldPrice = Math.max(0, Math.round(discounted * 0.93));

  const assuredChipVisible = true;

  return (
    <article
      className="relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out shadow-sm border-2 border-gray-300 hover:shadow-xl flex flex-col"
      onClick={() => onClick(product._id)}
    >
      {/* Assured Badge */}
      {assuredChipVisible && (
        <div className="absolute top-2 left-2 bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide shadow-md shadow-sky-500/30 z-10 backdrop-blur-sm">
          <Shield size={14} strokeWidth={2.5} />
          <span>ASSURED</span>
        </div>
      )}

      {/* Discount Badge */}
      {percent > 0 && (
        <div className="absolute top-2 right-2 bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold shadow-lg shadow-red-500/30 z-10">
          <Tag size={12} />
          <span>{percent}% OFF</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white px-4 pt-6 pb-4 flex items-center justify-center min-h-[220px]">
        <div className="w-full h-[180px] py-4 flex items-center justify-center relative">
          <img
            src={product.images?.main || '/placeholder-phone.png'}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
        </div>
        {discountAmount > 0 && (
          <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-400 to-orange-500 text-amber-900 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-lg shadow-amber-400/40 whitespace-nowrap">
            Save ₹{rupee(discountAmount)}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Product Name */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug m-0 flex flex-col gap-1.5">
          {product.name}
          {product.isRefurbished && (
            <span className="inline-block text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit mt-1">
              Refurbished
            </span>
          )}
        </h3>

        {/* Rating & Event Tag */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-200">
            <Star size={12} fill="#fbbf24" strokeWidth={0} />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="inline-flex items-center bg-gradient-to-br from-blue-700 to-blue-800 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide shadow-md shadow-blue-700/20">
            Phone Fest
          </div>
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[20px] font-extrabold text-gray-900 tracking-tight">
              ₹{rupee(discounted)}
            </span>
            {mrp > discounted && (
              <span className="text-sm text-gray-400 line-through font-medium">₹{rupee(mrp)}</span>
            )}
          </div>
        </div>

        {/* Gold Price */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 px-2 py-2 rounded-lg border-[1.5px] border-amber-200 w-fit shadow-sm shadow-amber-400/15">
          <div className="bg-white px-2.5 py-1 rounded-md border border-amber-300">
            <span className="text-[13px] font-extrabold text-amber-900">₹{rupee(goldPrice)}</span>
          </div>
          <span className="text-xs font-semibold text-amber-900">
            with{' '}
            <span className="font-extrabold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              GOLD
            </span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
