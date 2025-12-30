import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

interface DeliveryEstimate {
  estimatedDays: string;
  deliveryDate: {
    earliest: string;
    latest: string;
  };
  partnerLocation: {
    city: string;
    state: string;
    pincode: string;
  };
}

interface DeliveryResponse {
  success: boolean;
  message: string;
  data: DeliveryEstimate;
}

export const checkDeliveryTime = async (
  productId: string,
  pincode: string
): Promise<DeliveryEstimate> => {
  try {
    const response = await axios.post<DeliveryResponse>(
      `${API_BASE_URL}/delivery/estimate-time`,
      {
        productId,
        pincode: pincode.trim(),
      },
      {
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get delivery estimate');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Delivery service error:', error);

    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid pincode format');
    }

    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    throw new Error(error.response?.data?.message || 'Failed to get delivery estimate');
  }
};

export const formatDeliveryDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

export const formatDeliveryDateRange = (earliest: string, latest: string): string => {
  try {
    const earliestFormatted = formatDeliveryDate(earliest);
    const latestFormatted = formatDeliveryDate(latest);

    if (earliest === latest) {
      return earliestFormatted;
    }

    return `${earliestFormatted} - ${latestFormatted}`;
  } catch (error) {
    return 'Date unavailable';
  }
};

export const validatePincode = (pincode: string): boolean => {
  if (!pincode) return false;

  const cleanPincode = pincode.replace(/\D/g, '');

  if (cleanPincode.length !== 6) return false;

  const firstDigit = parseInt(cleanPincode[0]);
  if (firstDigit < 1 || firstDigit > 8) return false;

  return true;
};

const deliveryService = {
  checkDeliveryTime,
  formatDeliveryDate,
  formatDeliveryDateRange,
  validatePincode,
};

export default deliveryService;
