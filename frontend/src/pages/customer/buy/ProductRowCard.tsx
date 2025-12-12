import { Eye, ShoppingCart, Heart, Package } from 'lucide-react';

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
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleProductClick(productId)}
    >
      {/* PRODUCT COLUMN */}
      <td className="p-3 border-b border-gray-200 w-[40%]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Image */}
          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative group">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
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
              <Package size={18} className="text-gray-400" />
            </div>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            {/* Product Title */}
            <p className="font-medium text-gray-900 text-sm truncate max-w-[250px]">
              {productTitle}
            </p>

            {/* Short Description */}
            <p className="text-xs text-gray-500 truncate max-w-[250px]">
              {product?.description || 'No description available'}
            </p>
          </div>
        </div>
      </td>

      {/* CONDITION */}
      <td className="p-3 border-b border-gray-200 w-[12%]">
        {condition ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 truncate">
            {condition}
          </span>
        ) : product.isRefurbished ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 truncate">
            Refurbished
          </span>
        ) : (
          <span className="text-xs text-gray-500">-</span>
        )}
      </td>

      {/* PRICE */}
      <td className="p-3 border-b border-gray-200 w-[15%]">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm truncate">
            ₹{productPrice.toLocaleString()}
          </span>

          {discount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs line-through text-gray-400 truncate">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold truncate">
                {discount}% OFF
              </span>
            </div>
          )}
        </div>
      </td>

      {/* ACTIONS */}
      <td className="p-3 border-b border-gray-200 w-[20%]">
        <div className="flex items-center gap-2 justify-end">
          {/* Wishlist */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            className={`p-1.5 rounded-md transition ${
              wishlist.has(productId)
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={14} fill={wishlist.has(productId) ? 'currentColor' : 'none'} />
          </button>

          {/* View */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleProductClick(productId);
            }}
            className="p-1.5 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition"
          >
            <Eye size={14} />
          </button>

          {/* Add to cart */}
          <button
            onClick={e => handleAddToCart(e, product)}
            className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRowCard;
