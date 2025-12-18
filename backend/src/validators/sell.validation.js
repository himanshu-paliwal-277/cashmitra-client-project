import { z } from 'zod';

// ==========================================
// PRICE CALCULATION SCHEMAS
// ==========================================

export const calculatePriceSchema = {
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    purchaseDate: z.string().datetime('Valid purchase date is required'),
    screenCondition: z.enum(['excellent', 'good', 'fair', 'poor'], {
      errorMap: () => ({ message: 'Valid screen condition is required' }),
    }),
    bodyCondition: z.enum(['excellent', 'good', 'fair', 'poor'], {
      errorMap: () => ({ message: 'Valid body condition is required' }),
    }),
    batteryHealth: z.enum(['excellent', 'good', 'fair', 'poor'], {
      errorMap: () => ({ message: 'Valid battery health is required' }),
    }),
    functionalIssues: z.enum(['none', 'minor', 'major'], {
      errorMap: () => ({
        message: 'Valid functional issues status is required',
      }),
    }),
  }),
};

// ==========================================
// SELL ORDER SCHEMAS
// ==========================================

export const createSellOrderSchema = {
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    condition: z.enum(['excellent', 'good', 'fair', 'poor'], {
      errorMap: () => ({ message: 'Valid condition is required' }),
    }),
    price: z.number({ invalid_type_error: 'Price must be a number' }),
    pickupAddress: z.string().min(1, 'Pickup address is required'),
    paymentMethod: z.enum(['bank_transfer', 'wallet', 'upi'], {
      errorMap: () => ({ message: 'Valid payment method is required' }),
    }),
  }),
};

export const updateSellOrderStatusSchema = {
  body: z.object({
    status: z.enum(
      [
        'pending',
        'confirmed',
        'picked_up',
        'inspected',
        'completed',
        'cancelled',
      ],
      {
        errorMap: () => ({ message: 'Valid status is required' }),
      }
    ),
    note: z.string().optional(),
  }),
};

// ==========================================
// ASSESSMENT SUBMISSION SCHEMA
// ==========================================

export const submitAssessmentSchema = {
  body: z
    .object({
      category: z.union([
        z.string().min(1, 'Category is required'),
        z
          .object({
            category: z.string().min(1, 'Category is required'),
          })
          .passthrough(),
      ]),
      brand: z.union([z.string().min(1, 'Brand is required'), z.any()]),
      model: z.union([z.string().min(1, 'Model is required'), z.any()]),
      answers: z.record(z.any(), {
        invalid_type_error: 'Answers must be an object',
      }),
      productDetails: z.any().optional(),
    })
    .refine(
      (data) => {
        // Validate brand exists either as string or in category object
        if (typeof data.brand === 'string' && data.brand.trim()) {
          return true;
        }
        if (
          typeof data.category === 'object' &&
          data.category.brand &&
          typeof data.category.brand === 'string' &&
          data.category.brand.trim()
        ) {
          return true;
        }
        return false;
      },
      {
        message: 'Brand is required',
        path: ['brand'],
      }
    )
    .refine(
      (data) => {
        // Validate model exists either as string or in category object
        if (typeof data.model === 'string' && data.model.trim()) {
          return true;
        }
        if (
          typeof data.category === 'object' &&
          data.category.model &&
          typeof data.category.model === 'string' &&
          data.category.model.trim()
        ) {
          return true;
        }
        return false;
      },
      {
        message: 'Model is required',
        path: ['model'],
      }
    ),
};
