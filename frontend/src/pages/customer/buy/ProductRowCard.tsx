import { Eye, ShoppingCart, Heart, Package } from 'lucide-react';
import { truncate } from '../../../utils/truncateString';

const ProductRowCard = ({
  productId,
  product,
  productTitle,
  productImage,
  productPrice,
  originalPrice,
  discount,
  condition,
  wishlist,
  toggleWishlist,
  handleProductClick,
  handleAddToCart,
}) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleProductClick(productId)}
    >
      <div className="flex items-center gap-4 w-full">
        {/* Product Image & Info - 50% width */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Image */}
          <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                loading="lazy"
                className="w-full h-full object-contain p-1 hover:scale-110 transition duration-300"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className={`${
                productImage ? 'hidden' : 'flex'
              } items-center justify-center w-full h-full`}
            >
              <Package size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            {/* Product Title */}
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {truncate(productTitle, 50)}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-gray-500 truncate">
              {truncate(product?.description || 'No description available', 100)}
            </p>
          </div>
        </div>

        {/* Condition - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:flex items-center flex-shrink-0">
          {condition ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              {condition}
            </span>
          ) : product.isRefurbished ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Refurbished
            </span>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex flex-col items-end flex-shrink-0 min-w-[140px]">
          <span className="font-bold text-gray-900 text-lg">₹{productPrice.toLocaleString()}</span>

          {discount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs line-through text-gray-400">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold">
                {discount}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Wishlist */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            className={`p-2 rounded-lg transition ${
              wishlist.has(productId)
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
            title="Add to wishlist"
          >
            <Heart size={16} fill={wishlist.has(productId) ? 'currentColor' : 'none'} />
          </button>

          {/* View */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleProductClick(productId);
            }}
            className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
            title="View details"
          >
            <Eye size={16} />
          </button>

          {/* Add to cart */}
          <button
            onClick={e => handleAddToCart(e, product)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductRowCard;
