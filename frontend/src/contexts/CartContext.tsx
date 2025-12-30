import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../utils/api';

interface CartItem {
  productId: string;
  inventoryId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand?: string;
  model?: string;
  condition?: any;
  addedAt?: string;
  subtotal?: number;
  product?: any;
  partner?: any;
  isAvailable?: boolean;
  variant?: any;
  images?: string[];
  shopName?: string;
  id?: string;
  title?: string;
  badge?: string;
  specs?: string;
  originalPrice?: number;
  unavailable?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (product: any, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (productId: string, condition?: any) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, condition?: any) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  clearError: () => void;
  syncCartWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: any) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const { user, getAuthToken } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart data:', err);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  // Clear sync flag when user logs out
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('cartSynced');
      setHasInitialSync(false);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // Only sync cart with server when user logs in for the first time in this session
    // and only if there are local cart items or we haven't synced yet
    if (user && !hasInitialSync && (cartItems.length > 0 || !localStorage.getItem('cartSynced'))) {
      syncCartWithServer();
      setHasInitialSync(true);
      localStorage.setItem('cartSynced', 'true');
    }
  }, [user, hasInitialSync]);

  const syncCartWithServer = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      console.log('Syncing cart with server...');

      // Get server cart
      const response = await fetch(`${API_BASE_URL}/buy/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const serverCartResponse = await response.json();
        console.log('Server cart response:', serverCartResponse);

        // Extract cart items from the new backend response format
        const serverCartItems = serverCartResponse.cart || [];

        // Transform server cart items to match frontend format
        const transformedServerItems = serverCartItems.map((item: any) => {
          // Handle images - can be array or object with main/gallery/thumbnail
          let imageUrl = '/placeholder-phone.jpg';
          if (item.product?.images) {
            if (Array.isArray(item.product.images)) {
              imageUrl = item.product.images[0] || '/placeholder-phone.jpg';
            } else if (typeof item.product.images === 'object') {
              imageUrl =
                item.product.images.main ||
                item.product.images.gallery ||
                item.product.images.thumbnail ||
                '/placeholder-phone.jpg';
            }
          }

          return {
            productId: item.productId,
            inventoryId: item.productId, // Use productId as inventoryId for consistency
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice, // Add originalPrice for discount calculation
            subtotal: item.subtotal,
            product: item.product,
            partner: item.partner,
            isAvailable: item.isAvailable,
            image: imageUrl,

            // Map product fields for compatibility
            name:
              item.product?.brand && item.product?.model
                ? `${item.product.brand} ${item.product.model}`
                : item.product?.name || 'Unknown Product',

            brand: item.product?.brand,
            model: item.product?.model,
            condition: item.product?.condition, // Map condition object
            variant: item.product?.variant,
            images: item.product?.images || [],
            shopName: item.partner?.shopName,
            addedAt: item.addedAt,
          };
        });

        // Only sync local items to server if there are local items AND no server items
        // This prevents unnecessary API calls on every page load
        if (cartItems.length > 0 && serverCartItems.length === 0) {
          console.log('Syncing local items to server...');
          await syncLocalItemsToServer(cartItems);
          // After syncing, fetch the updated server cart
          const updatedResponse = await fetch(`${API_BASE_URL}/buy/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (updatedResponse.ok) {
            const updatedServerCartResponse = await updatedResponse.json();
            const updatedServerCartItems = updatedServerCartResponse.cart || [];
            const updatedTransformedItems = updatedServerCartItems.map((item: any) => {
              let imageUrl = '/placeholder-phone.jpg';
              if (item.product?.images) {
                if (Array.isArray(item.product.images)) {
                  imageUrl = item.product.images[0] || '/placeholder-phone.jpg';
                } else if (typeof item.product.images === 'object') {
                  imageUrl =
                    item.product.images.main ||
                    item.product.images.gallery ||
                    item.product.images.thumbnail ||
                    '/placeholder-phone.jpg';
                }
              }

              return {
                productId: item.productId,
                inventoryId: item.productId,
                quantity: item.quantity,
                price: item.price,
                originalPrice: item.originalPrice, // Add originalPrice for discount calculation
                subtotal: item.subtotal,
                product: item.product,
                partner: item.partner,
                isAvailable: item.isAvailable,
                image: imageUrl,
                name:
                  item.product?.brand && item.product?.model
                    ? `${item.product.brand} ${item.product.model}`
                    : item.product?.name || 'Unknown Product',
                brand: item.product?.brand,
                model: item.product?.model,
                condition: item.product?.condition, // Map condition object
                variant: item.product?.variant,
                images: item.product?.images || [],
                shopName: item.partner?.shopName,
                addedAt: item.addedAt,
              };
            });
            setCartItems(updatedTransformedItems);
          }
        } else {
          // Set server cart items as the source of truth
          console.log('Setting server cart items as source of truth');
          setCartItems(transformedServerItems);
        }

        // Set the total from server response
        if (serverCartResponse.total !== undefined) {
          console.log('Cart total:', serverCartResponse.total);
        }
      }
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  const syncLocalItemsToServer = async (localItems: any) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Add each local item to server cart
      for (const item of localItems) {
        try {
          await fetch(`${API_BASE_URL}/buy/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.productId || item.inventoryId,
              quantity: item.quantity,
            }),
          });
        } catch (itemError) {
          console.warn(`Failed to sync item ${item.productId || item.inventoryId}:`, itemError);
        }
      }
    } catch (err) {
      console.error('Error syncing local items to server:', err);
    }
  };

  const mergeCartItems = (localItems: any, serverItems: any) => {
    const merged = [...serverItems];

    localItems.forEach((localItem: any) => {
      const existingIndex = merged.findIndex(
        item =>
          item.productId === localItem.productId ||
          item.inventoryId === localItem.inventoryId ||
          item.inventoryId === localItem.productId
      );
      if (existingIndex >= 0) {
        // Combine quantities and update subtotal
        merged[existingIndex].quantity += localItem.quantity;
        if (merged[existingIndex].price) {
          merged[existingIndex].subtotal =
            merged[existingIndex].price * merged[existingIndex].quantity;
        }
      } else {
        merged.push(localItem);
      }
    });

    return merged;
  };

  const addToCart = async (product: any, quantity = 1) => {
    console.log('CartContext - addToCart called with product:', product);
    console.log('CartContext - product.condition:', product.condition);

    try {
      setLoading(true);
      setError(null);

      // Update server if user is logged in
      if (user) {
        console.log('CartContext - User is logged in, syncing to server');
        const token = getAuthToken();
        if (token) {
          console.log('CartContext - Token available, sending to backend');
          try {
            console.log('CartContext - Sending to backend:', {
              productId: product._id,
              quantity: quantity,
              selectedCondition: product.condition,
            });

            const requestBody = {
              productId: product._id,
              quantity: quantity,
              selectedCondition: product.condition,
            };

            console.log('CartContext - Request body before JSON.stringify:', requestBody);
            console.log('CartContext - product.condition:', product.condition);

            const response = await fetch(`${API_BASE_URL}/buy/cart`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            });

            console.log('CartContext - Response status:', response.status);
            const responseData = await response.json();
            console.log('CartContext - Response data:', responseData);

            if (response.ok) {
              // Update local state with server response
              const serverCartItems = responseData.cart || [];
              const transformedServerItems = serverCartItems.map((item: any) => {
                let imageUrl = '/placeholder-phone.jpg';
                if (item.product?.images) {
                  if (Array.isArray(item.product.images)) {
                    imageUrl = item.product.images[0] || '/placeholder-phone.jpg';
                  } else if (typeof item.product.images === 'object') {
                    imageUrl =
                      item.product.images.main ||
                      item.product.images.gallery ||
                      item.product.images.thumbnail ||
                      '/placeholder-phone.jpg';
                  }
                }

                return {
                  productId: item.productId,
                  inventoryId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  subtotal: item.subtotal,
                  product: item.product,
                  partner: item.partner,
                  isAvailable: item.isAvailable,
                  image: imageUrl,
                  name:
                    item.product?.brand && item.product?.model
                      ? `${item.product.brand} ${item.product.model}`
                      : item.product?.name || 'Unknown Product',
                  brand: item.product?.brand,
                  model: item.product?.model,
                  condition: item.product?.condition,
                  variant: item.product?.variant,
                  images: item.product?.images || [],
                  shopName: item.partner?.shopName,
                  addedAt: item.addedAt,
                };
              });

              setCartItems(transformedServerItems);

              // Show success toast
              toast.success(
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm opacity-80">Added to cart successfully!</div>
                  </div>
                </div>,
                {
                  className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
                }
              );

              return { success: true };
            } else {
              throw new Error(responseData.message || 'Failed to add to cart');
            }
          } catch (serverError) {
            console.error('Failed to sync item to server:', serverError);
            throw serverError;
          }
        }
      } else {
        // User not logged in - update local state only
        const existingItemIndex = cartItems.findIndex(
          item =>
            item.productId === product._id &&
            JSON.stringify(item.condition) === JSON.stringify(product.condition)
        );

        let updatedCart;

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItem = {
            ...cartItems[existingItemIndex],
            quantity: cartItems[existingItemIndex].quantity + quantity,
            addedAt: new Date().toISOString(),
          };
          const otherItems = cartItems.filter((_, index) => index !== existingItemIndex);
          updatedCart = [updatedItem, ...otherItems];
        } else {
          // Add new item
          const cartItem = {
            productId: product._id,
            inventoryId: product.inventoryId || product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            quantity,
            brand: product.brand,
            model: product.model,
            condition: product.condition,
            addedAt: new Date().toISOString(),
          };
          updatedCart = [cartItem, ...cartItems];
        }

        setCartItems(updatedCart);

        // Show success toast
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm opacity-80">Added to cart successfully!</div>
            </div>
          </div>,
          {
            className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
          }
        );

        return { success: true };
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-lg">❌</span>
          <div>
            <div className="font-semibold">Failed to add to cart</div>
            <div className="text-sm opacity-80">{product.name}</div>
          </div>
        </div>,
        {
          className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
        }
      );
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: any, condition?: any) => {
    try {
      setLoading(true);
      setError(null);

      // Find the item to remove based on productId and condition
      const itemToRemove = cartItems.find(item => {
        if (condition !== undefined) {
          return (
            item.productId === productId &&
            JSON.stringify(item.condition) === JSON.stringify(condition)
          );
        } else {
          return item.productId === productId;
        }
      });

      if (!itemToRemove) {
        throw new Error('Item not found in cart');
      }

      // Update local state first - remove only the specific item
      const updatedCart = cartItems.filter(item => {
        if (condition !== undefined) {
          return !(
            item.productId === productId &&
            JSON.stringify(item.condition) === JSON.stringify(condition)
          );
        } else {
          return item.productId !== productId;
        }
      });
      setCartItems(updatedCart);

      // Show success toast
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-lg">🗑️</span>
          <div>
            <div className="font-semibold">Removed from cart</div>
            <div className="text-sm opacity-80">{itemToRemove.name}</div>
          </div>
        </div>,
        {
          className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0',
        }
      );

      // Update server if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          const productIdToRemove = itemToRemove.productId;
          const response = await fetch(`${API_BASE_URL}/buy/cart/${productIdToRemove}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // Revert local state if server update fails
            setCartItems(cartItems);
            toast.error(
              <div className="flex items-center gap-2">
                <span className="text-lg">❌</span>
                <div>
                  <div className="font-semibold">Failed to remove from cart</div>
                  <div className="text-sm opacity-80">{itemToRemove.name}</div>
                </div>
              </div>,
              {
                className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
              }
            );
            throw new Error('Failed to remove item from server cart');
          }
        }
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      if (!err.message.includes('Failed to remove')) {
        toast.error(
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <div>
              <div className="font-semibold">Failed to remove item</div>
              <div className="text-sm opacity-80">Please try again</div>
            </div>
          </div>,
          {
            className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: any, quantity: any, condition?: any) => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        await removeFromCart(productId, condition);
        return;
      }

      // Find the item to update based on productId and condition
      const itemToUpdate = cartItems.find(item => {
        if (condition !== undefined) {
          return (
            item.productId === productId &&
            JSON.stringify(item.condition) === JSON.stringify(condition)
          );
        } else {
          return item.productId === productId;
        }
      });

      if (!itemToUpdate) {
        throw new Error('Item not found in cart');
      }

      // Update local state first - update only the specific item
      const updatedCart = cartItems.map(item => {
        if (condition !== undefined) {
          return item.productId === productId &&
            JSON.stringify(item.condition) === JSON.stringify(condition)
            ? { ...item, quantity, inventoryId: item.inventoryId || item.productId }
            : item;
        } else {
          return item.productId === productId
            ? { ...item, quantity, inventoryId: item.inventoryId || item.productId }
            : item;
        }
      });
      setCartItems(updatedCart);

      // Update server if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          const productIdToUpdate = itemToUpdate.productId;
          const response = await fetch(`${API_BASE_URL}/buy/cart/${productIdToUpdate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });

          if (!response.ok) {
            // Revert local state if server update fails
            setCartItems(cartItems);
            throw new Error('Failed to update item quantity on server');
          }
        }
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const itemCount = cartItems.length;

      // Update local state first
      setCartItems([]);

      // Show success toast
      if (itemCount > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-lg">🧹</span>
            <div>
              <div className="font-semibold">Cart cleared</div>
              <div className="text-sm opacity-80">{itemCount} items removed</div>
            </div>
          </div>,
          {
            className: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0',
          }
        );
      }

      // Clear server cart if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          // Since there's no dedicated clear endpoint, we'll remove each item individually
          const itemsToRemove = [...cartItems]; // Create a copy to avoid state mutation issues

          for (const item of itemsToRemove) {
            const productIdToRemove = item.productId;
            try {
              const response = await fetch(`${API_BASE_URL}/buy/cart/${productIdToRemove}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                console.warn(`Failed to remove item ${productIdToRemove} from server cart`);
              }
            } catch (itemError) {
              console.warn(`Error removing item ${productIdToRemove}:`, itemError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-lg">❌</span>
          <div>
            <div className="font-semibold">Failed to clear cart</div>
            <div className="text-sm opacity-80">Please try again</div>
          </div>
        </div>,
        {
          className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearError = () => {
    setError(null);
  };
  console.log('context cartes: ', cartItems);

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    clearError,
    syncCartWithServer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
