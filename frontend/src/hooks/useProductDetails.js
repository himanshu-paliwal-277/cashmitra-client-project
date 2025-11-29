import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const useProductDetails = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await adminService.getBuyProductById(productId);
        
        if (response.success && response.data) {
          console.log('response.data: ', response.data);
          const productData = response.data;
          
          // Transform API data to match the expected format
          const transformedProduct = {
            _id: productData._id,
            id: productData._id,
            name: productData.name,
            brand: productData.brand,
            category: productData.categoryId?.name || 'Unknown',
            images: productData.images || [],
            pricing: productData.pricing || {},
            rating: productData.rating || {},
            badges: productData.badges || {},
            paymentOptions: productData.paymentOptions || {},
            availability: productData.availability || {},
            topSpecs: productData.topSpecs || {},
            productDetails: productData.productDetails || {},
            trustMetrics: productData.trustMetrics || {},
            legal: productData.legal || {},
            isRefurbished: productData.isRefurbished || false,
            conditionOptions: productData.conditionOptions || [],
            variants: productData.variants || [],
            addOns: productData.addOns || [],
            offers: productData.offers || [],
            reviews: productData.reviews || [],
            description: productData.description || '',
            relatedProducts: productData.relatedProducts || [],
            isActive: productData.isActive,
            sortOrder: productData.sortOrder || 0,
            createdAt: productData.createdAt,
            updatedAt: productData.updatedAt,
            createdBy: productData.createdBy || null
          };
          
          setProduct(transformedProduct);
        } else {
          setError('Product not found in response');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  return { product, loading, error };
};

export default useProductDetails;