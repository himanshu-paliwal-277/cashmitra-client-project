import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (user) {
      syncCartWithServer();
    }
  }, [user]);

  const syncCartWithServer = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Get server cart
      const response = await fetch(`${API_BASE_URL}/buy/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const serverCartResponse = await response.json();
        console.log('serverCart: ', serverCartResponse);
        
        // Extract cart items from the new backend response format
        const serverCartItems = serverCartResponse.cart || [];
        
        // Transform server cart items to match frontend format
        const transformedServerItems = serverCartItems.map(item => ({
          productId: item.inventoryId,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          product: item.product,
          partner: item.partner,
          isAvailable: item.isAvailable,
          // Map product fields for compatibility
          name: item.product?.brand && item.product?.model ? 
                `${item.product.brand} ${item.product.model}` : 'Unknown Product',
          brand: item.product?.brand,
          model: item.product?.model,
          variant: item.product?.variant,
          images: item.product?.images || [],
          shopName: item.partner?.shopName
        }));
        
        // If there are local cart items, sync them to server first
        if (cartItems.length > 0) {
          await syncLocalItemsToServer(cartItems);
        }
        
        // Set server cart items as the source of truth
        setCartItems(transformedServerItems);
        
        // Set the total from server response
        if (serverCartResponse.total !== undefined) {
          console.log('Cart total:', serverCartResponse.total);
        }
      }
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  const syncLocalItemsToServer = async (localItems) => {
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
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              inventoryId: item.inventoryId || item.productId, 
              quantity: item.quantity 
            }),
          });
        } catch (itemError) {
          console.warn(`Failed to sync item ${item.inventoryId || item.productId}:`, itemError);
        }
      }
    } catch (err) {
      console.error('Error syncing local items to server:', err);
    }
  };

  const mergeCartItems = (localItems, serverItems) => {
    const merged = [...serverItems];
    
    localItems.forEach(localItem => {
      const existingIndex = merged.findIndex(item => 
        (item.productId === localItem.productId) || 
        (item.inventoryId === localItem.inventoryId) ||
        (item.inventoryId === localItem.productId)
      );
      if (existingIndex >= 0) {
        // Combine quantities and update subtotal
        merged[existingIndex].quantity += localItem.quantity;
        if (merged[existingIndex].price) {
          merged[existingIndex].subtotal = merged[existingIndex].price * merged[existingIndex].quantity;
        }
      } else {
        merged.push(localItem);
      }
    });
    
    return merged;
  };

  const updateServerCart = async (items) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Use individual addToCart calls for each item
      for (const item of items) {
        await fetch(`${API_BASE_URL}/buy/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            inventoryId: item.inventoryId || item.productId, 
            quantity: item.quantity 
          }),
        });
      }
    } catch (err) {
      console.error('Error updating server cart:', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    console.log('product: ', product);
    try {
      setLoading(true);
      setError(null);

      const existingItemIndex = cartItems.findIndex(
        item => item.productId === product._id
      );

      let updatedCart;
      if (existingItemIndex >= 0) {
        // Update existing item and move to front
        const updatedItem = { 
          ...cartItems[existingItemIndex], 
          quantity: cartItems[existingItemIndex].quantity + quantity,
          inventoryId: cartItems[existingItemIndex].inventoryId || cartItems[existingItemIndex].productId, // Ensure inventoryId exists
          addedAt: new Date().toISOString() // Update timestamp
        };
        const otherItems = cartItems.filter((_, index) => index !== existingItemIndex);
        updatedCart = [updatedItem, ...otherItems]; // Move updated item to front
      } else {
        // Add new item
        const cartItem = {
          productId: product._id,
          inventoryId: product.inventoryId || product._id, // Use inventoryId if available, fallback to productId
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
          brand: product.brand,
          model: product.model,
          condition: product.condition,
          addedAt: new Date().toISOString(), // Add timestamp for ordering
        };
        updatedCart = [cartItem, ...cartItems]; // Add to beginning for most recent first
      }

      setCartItems(updatedCart);
      
      // Update server if user is logged in
      if (user) {
        await updateServerCart(updatedCart);
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the item to get its inventoryId
      const itemToRemove = cartItems.find(item => item.productId === productId);
      if (!itemToRemove) {
        throw new Error('Item not found in cart');
      }
      
      // Update local state first
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedCart);
      
      // Update server if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          const inventoryId = itemToRemove.inventoryId || itemToRemove.productId;
          const response = await fetch(`${API_BASE_URL}/buy/cart/${inventoryId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            // Revert local state if server update fails
            setCartItems(cartItems);
            throw new Error('Failed to remove item from server cart');
          }
        }
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      // Find the item to get its inventoryId
      const itemToUpdate = cartItems.find(item => item.productId === productId);
      if (!itemToUpdate) {
        throw new Error('Item not found in cart');
      }

      // Update local state first
      const updatedCart = cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity, inventoryId: item.inventoryId || item.productId }
          : item
      );
      
      setCartItems(updatedCart);
      
      // Update server if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          const inventoryId = itemToUpdate.inventoryId || itemToUpdate.productId;
          const response = await fetch(`${API_BASE_URL}/buy/cart/${inventoryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
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
      
      // Update local state first
      setCartItems([]);
      
      // Clear server cart if user is logged in
      if (user) {
        const token = getAuthToken();
        if (token) {
          // Since there's no dedicated clear endpoint, we'll remove each item individually
          const itemsToRemove = [...cartItems]; // Create a copy to avoid state mutation issues
          
          for (const item of itemsToRemove) {
            const inventoryId = item.inventoryId || item.productId;
            try {
              const response = await fetch(`${API_BASE_URL}/buy/cart/${inventoryId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (!response.ok) {
                console.warn(`Failed to remove item ${inventoryId} from server cart`);
              }
            } catch (itemError) {
              console.warn(`Error removing item ${inventoryId}:`, itemError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
    syncCartWithServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;