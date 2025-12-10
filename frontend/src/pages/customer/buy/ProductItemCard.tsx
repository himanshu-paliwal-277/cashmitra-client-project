import React from 'react';
import { Eye, ShoppingCart } from 'lucide-react';

interface Variant {
  storage?: string;
  color?: string;
}

interface Product {
  _id: string;
  title: string;
  brand?: string;
  image: string;
  isRefurbished?: boolean;
}

interface ProductItemCardProps {
  productId: string;
  product: Product;
  productTitle: string;
  productImage: string;
  productPrice: number;
  originalPrice: number;
  discount: number;
  condition?: string;
  variant?: Variant;
  rating: number;
  reviewCount: number;
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
  handleProductClick: (id: string) => void;
  handleAddToCart: (e: React.MouseEvent, product: Product) => void;
  renderStars: (rating: number) => React.ReactNode;
}

const ProductItemCard: React.FC<ProductItemCardProps> = ({
  productId,
  product,
  productTitle,
  productImage,
  productPrice,
  originalPrice,
  discount,
  condition,
  variant,
  rating,
  reviewCount,
  wishlist,
  toggleWishlist,
  handleProductClick,
  handleAddToCart,
  renderStars,
}) => {
  return (
    <div
      key={productId}
      onClick={() => handleProductClick(productId)}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 cursor-pointer group"
    >
      <div className="relative aspect-[4/3] overflow-hidden ">
        <img
          src={productImage}
          alt={productTitle}
          loading="lazy"
          className="w-auto mx-auto p-6 h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {condition && (
          <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {condition}
          </span>
        )}

        {product.isRefurbished && !condition && (
          <span className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Refurbished
          </span>
        )}

        {/* <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(productId);
          }}
          className={`absolute top-3 right-3 bg-white rounded-full p-2`}
        >
          <Heart
            className="w-6 h-6"
            fill={wishlist.has(productId) ? 'red' : 'none'}
            stroke={wishlist.has(productId) ? 'red' : 'currentColor'}
            strokeWidth={1}
          />
        </button> */}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {productTitle}
        </h3>

        <p className="text-sm text-slate-600 mb-3">
          {variant?.storage && `${variant.storage}`}
          {variant?.color && ` • ${variant.color}`}
          {product.brand && ` • ${product.brand}`}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">{renderStars(rating)}</div>
          <span className="text-xs text-slate-600">({reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-slate-900">
              ₹{productPrice.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-sm text-slate-500 line-through ml-2">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {discount > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              handleProductClick(productId);
            }}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          <button
            onClick={e => handleAddToCart(e, product)}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItemCard;
