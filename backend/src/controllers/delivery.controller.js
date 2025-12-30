import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
import { getDeliveryEstimate } from '../services/delivery.service.js';

export const checkDeliveryTime = asyncHandler(async (req, res) => {
  const { productId, pincode } = req.body;

  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  if (!pincode) {
    throw new ApiError(400, 'Pincode is required');
  }

  try {
    const deliveryEstimate = await getDeliveryEstimate(productId, pincode);

    res.status(200).json({
      success: true,
      message: 'Delivery estimate calculated successfully',
      data: deliveryEstimate,
    });
  } catch (error) {
    if (error.message.includes('valid 6-digit pincode')) {
      throw new ApiError(400, error.message);
    }

    if (error.message.includes('Product not found')) {
      throw new ApiError(404, error.message);
    }

    console.error('Delivery estimation error:', error);
    throw new ApiError(
      500,
      'Failed to calculate delivery estimate. Please try again.'
    );
  }
});
