import { useState, useEffect } from 'react';
import api from '../services/api';

const useBuyProductDetails = productId => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyProductDetails = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/buy-products/${productId}`);

        if (response.data) {
          console.log('Buy product response.data: ', response.data);
          const productData = response.data.product || response.data;

          // Transform API data to match the expected format for buy products
          const transformedProduct = {
            _id: productData._id || productId,
            id: productData._id || productId,
            name: productData.name || `${productData.brand} ${productData.model}`,
            brand: productData.brand,
            model: productData.model,
            series: productData.series,
            category: productData.category || productData.categoryId,
            images: productData.images || [],

            // Pricing information
            basePrice: productData.pricing?.discountedPrice || productData.basePrice,
            price:
              productData.pricing?.discountedPrice || productData.price || productData.basePrice,
            originalPrice: productData.pricing?.mrp || productData.originalPrice,
            mrp: productData.pricing?.mrp,
            discount: productData.pricing?.discountPercent || productData.discount,

            // Product status and availability
            condition: productData.condition || 'Excellent',
            status: productData.status,
            isActive: productData.isActive !== false,
            isRefurbished: productData.isRefurbished || false,

            // Variants and options
            variants: productData.variants || [],
            conditionOptions: productData.conditionOptions || [],

            // Product details
            specifications: productData.specifications || {},
            description: productData.description || '',
            features: productData.features || [],

            // Badges and assurance
            badges: productData.badges || {
              qualityChecks: '32-Point Quality Check',
              warranty: '6 Month Warranty',
              refundPolicy: '7 Day Return',
              assurance: 'Cashify Assured',
            },

            // Add-ons and offers
            addOns: productData.addOns || [],
            offers: productData.offers || [],

            // Reviews and ratings
            rating: productData.rating || {
              average: 4.5,
              totalReviews: 0,
            },
            reviews: productData.reviews || {
              average: 4.5,
              total: 0,
              breakdown: {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0,
              },
              reviews: [],
            },

            // Questions and answers
            questions: productData.questions || {
              total: 0,
              list: [],
            },

            // Delivery and warranty info
            delivery: productData.delivery || {
              standard: {
                days: '3-5',
                price: 0,
              },
              express: {
                days: '1-2',
                price: 99,
              },
            },
            warranty: productData.warranty || {
              duration: '6 months',
              type: 'Cashify Warranty',
            },

            // Timestamps
            createdAt: productData.createdAt,
            updatedAt: productData.updatedAt,

            // Create SKUs from variants if available
            skus: productData.variants
              ? productData.variants.reduce((acc, variant) => {
                  const skuId = variant.variantId || `${variant.storage}-${variant.color}`;
                  acc[skuId] = {
                    id: skuId,
                    storage: variant.storage,
                    color: variant.color,
                    price: variant.price || productData.pricing?.discountedPrice,
                    originalPrice: productData.pricing?.mrp,
                    availability: {
                      inStock: variant.stock !== false,
                      quantity: variant.quantity || 1,
                    },
                    specifications: productData.specifications || {},
                  };
                  return acc;
                }, {})
              : {},
          };

          setProduct(transformedProduct);
        } else {
          setError('Product not found in response');
        }
      } catch (err) {
        console.error('Error fetching buy product details:', err);
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchBuyProductDetails();
  }, [productId]);

  return { product, loading, error };
};

export default useBuyProductDetails;
