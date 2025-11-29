import { useState, useEffect, useRef, useCallback } from 'react';
import { productCategoriesAPI } from '../api/productCategories';

/**
 * Custom hook for real-time data updates with WebSocket and polling fallback
 * @param {string} type - Type of data to track ('categories', 'products', 'cart')
 * @param {string|null} id - ID of specific item to track (optional)
 * @param {Object} options - Configuration options
 */
export const useRealTimeData = (type, id = null, options = {}) => {
  const {
    enableWebSocket = true,
    pollingInterval = 30000, // 30 seconds
    maxRetries = 3,
    onUpdate = null,
    onError = null,
    autoStart = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const wsRef = useRef(null);
  const pollingRef = useRef(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setConnected(false);
  }, []);

  // Handle data updates
  const handleDataUpdate = useCallback(
    newData => {
      if (!mountedRef.current) return;

      setData(newData);
      setLastUpdated(new Date().toISOString());
      setError(null);
      retryCountRef.current = 0;

      if (onUpdate) {
        onUpdate(newData);
      }
    },
    [onUpdate]
  );

  // Handle errors
  const handleError = useCallback(
    err => {
      if (!mountedRef.current) return;

      console.error('Real-time data error:', err);
      setError(err.message || 'Connection error');
      setConnected(false);

      if (onError) {
        onError(err);
      }
    },
    [onError]
  );

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'categories':
          if (id) {
            result = await productCategoriesAPI.getCategoryById(id);
          } else {
            result = await productCategoriesAPI.getCategories();
          }
          break;
        case 'products':
          if (id) {
            result = await productCategoriesAPI.getProductsByCategory(id);
          } else {
            result = await productCategoriesAPI.getProducts();
          }
          break;
        case 'featured-categories':
          result = await productCategoriesAPI.getFeaturedCategories();
          break;
        case 'featured-products':
          result = await productCategoriesAPI.getFeaturedProducts();
          break;
        default:
          throw new Error(`Unsupported data type: ${type}`);
      }

      if (result.success) {
        handleDataUpdate(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [type, id, handleDataUpdate, handleError]);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    if (!enableWebSocket || !id || type !== 'categories') {
      return false;
    }

    try {
      const ws = productCategoriesAPI.subscribeToCategoryUpdates(
        id,
        updateData => {
          if (!mountedRef.current) return;

          setConnected(true);
          handleDataUpdate(updateData);
        },
        err => {
          if (!mountedRef.current) return;

          handleError(err);

          // Retry connection with exponential backoff
          if (retryCountRef.current < maxRetries) {
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            retryCountRef.current++;

            setTimeout(() => {
              if (mountedRef.current) {
                setupWebSocket();
              }
            }, delay);
          } else {
            // Fall back to polling
            setupPolling();
          }
        }
      );

      wsRef.current = ws;
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [enableWebSocket, id, type, maxRetries, handleDataUpdate, handleError]);

  // Setup polling
  const setupPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const poll = async () => {
      if (!mountedRef.current) return;

      try {
        let result;

        switch (type) {
          case 'categories':
            if (id) {
              result = await productCategoriesAPI.getRealTimeCategoryData(id, lastUpdated);
            } else {
              result = await productCategoriesAPI.getCategories();
            }
            break;
          case 'products':
            if (id) {
              result = await productCategoriesAPI.getProductsByCategory(id);
            } else {
              result = await productCategoriesAPI.getProducts();
            }
            break;
          case 'featured-categories':
            result = await productCategoriesAPI.getFeaturedCategories();
            break;
          case 'featured-products':
            result = await productCategoriesAPI.getFeaturedProducts();
            break;
          default:
            return;
        }

        if (result.success && result.data) {
          // Only update if data has changed
          const hasChanges = JSON.stringify(result.data) !== JSON.stringify(data);
          if (hasChanges) {
            handleDataUpdate(result.data);
          }
        }
      } catch (err) {
        // Silently handle polling errors to avoid spam
        console.warn('Polling error:', err);
      }
    };

    pollingRef.current = setInterval(poll, pollingInterval);
  }, [type, id, pollingInterval, lastUpdated, data, handleDataUpdate]);

  // Start real-time updates
  const start = useCallback(() => {
    cleanup();

    // Try WebSocket first, fall back to polling
    const wsConnected = setupWebSocket();
    if (!wsConnected) {
      setupPolling();
    }
  }, [cleanup, setupWebSocket, setupPolling]);

  // Stop real-time updates
  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Refresh data manually
  const refresh = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  // Initialize
  useEffect(() => {
    mountedRef.current = true;

    // Fetch initial data
    fetchInitialData();

    // Start real-time updates if enabled
    if (autoStart) {
      start();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [fetchInitialData, autoStart, start, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    data,
    loading,
    error,
    connected,
    lastUpdated,
    start,
    stop,
    refresh,
  };
};

/**
 * Hook for real-time category data
 */
export const useRealTimeCategories = (options = {}) => {
  return useRealTimeData('categories', null, options);
};

/**
 * Hook for real-time category by ID
 */
export const useRealTimeCategory = (categoryId, options = {}) => {
  return useRealTimeData('categories', categoryId, options);
};

/**
 * Hook for real-time products by category
 */
export const useRealTimeProductsByCategory = (categoryId, options = {}) => {
  return useRealTimeData('products', categoryId, options);
};

/**
 * Hook for real-time featured categories
 */
export const useRealTimeFeaturedCategories = (options = {}) => {
  return useRealTimeData('featured-categories', null, options);
};

/**
 * Hook for real-time featured products
 */
export const useRealTimeFeaturedProducts = (options = {}) => {
  return useRealTimeData('featured-products', null, options);
};

export default useRealTimeData;
