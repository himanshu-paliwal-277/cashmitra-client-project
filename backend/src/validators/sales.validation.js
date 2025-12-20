import { z } from 'zod';

// ==========================================
// ORDER CREATION SCHEMAS
// ==========================================

export const createOrderSchema = {
  body: z.object({
    items: z.union([
      z
        .array(
          z.object({
            inventoryId: z
              .string()
              .regex(/^[0-9a-fA-F]{24}$/, 'Valid inventory ID is required'),
            quantity: z
              .number()
              .int()
              .min(1, 'Quantity must be a positive integer'),
          })
        )
        .min(1, 'Items must be a non-empty array'),
      z.record(
        z.object({
          inventoryId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Valid inventory ID is required'),
          quantity: z
            .number()
            .int()
            .min(1, 'Quantity must be a positive integer'),
        })
      ),
    ]),
    shippingAddress: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid pincode is required'),
      phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid phone number is required'),
    }),
    paymentMethod: z.enum(['card', 'UPI', 'netbanking', 'wallet', 'Cash'], {
      errorMap: () => ({ message: 'Valid payment method is required' }),
    }),
    couponCode: z.string().optional(),
  }),
};

// ==========================================
// PAYMENT SCHEMAS
// ==========================================

export const processPaymentSchema = {
  body: z.object({
    paymentDetails: z.object({
      method: z.enum(['card', 'UPI', 'netbanking', 'wallet', 'Cash'], {
        errorMap: () => ({ message: 'Valid payment method is required' }),
      }),
      transactionId: z.string().optional(),
      gatewayResponse: z.object({}).passthrough().optional(),
    }),
  }),
};

// ==========================================
// QUERY SCHEMAS
// ==========================================

export const getOrdersSchema = {
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, 'Page must be a positive integer')
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100, 'Limit must be between 1 and 100')
      .optional(),
    status: z
      .enum(
        [
          'pending',
          'confirmed',
          'shipped',
          'delivered',
          'cancelled',
          'returned',
        ],
        {
          errorMap: () => ({ message: 'Invalid status' }),
        }
      )
      .optional(),
    orderType: z
      .enum(['buy', 'sell'], {
        errorMap: () => ({ message: 'Order type must be buy or sell' }),
      })
      .optional(),
    sortBy: z
      .enum(['createdAt', 'totalAmount', 'status'], {
        errorMap: () => ({ message: 'Invalid sort field' }),
      })
      .optional(),
    sortOrder: z
      .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Sort order must be asc or desc' }),
      })
      .optional(),
  }),
};

// ==========================================
// UPDATE SCHEMAS
// ==========================================

export const cancelOrderSchema = {
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
  }),
};

export const updateShippingSchema = {
  body: z.object({
    status: z.enum(['processing', 'shipped', 'delivered', 'returned'], {
      errorMap: () => ({ message: 'Invalid shipping status' }),
    }),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.coerce
      .date({ invalid_type_error: 'Estimated delivery must be a valid date' })
      .optional(),
  }),
};

// ==========================================
// ANALYTICS SCHEMAS
// ==========================================

export const analyticsSchema = {
  query: z.object({
    startDate: z.coerce
      .date({ invalid_type_error: 'Start date must be a valid date' })
      .optional(),
    endDate: z.coerce
      .date({ invalid_type_error: 'End date must be a valid date' })
      .optional(),
    groupBy: z
      .enum(['day', 'week', 'month'], {
        errorMap: () => ({ message: 'Group by must be day, week, or month' }),
      })
      .optional(),
  }),
};
