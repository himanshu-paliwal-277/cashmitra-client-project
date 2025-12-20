import { z } from 'zod';

// ==========================================
// CART SCHEMAS
// ==========================================

export const addToCartSchema = {
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Valid product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
};

export const updateCartItemSchema = {
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
};

// ==========================================
// CHECKOUT & ORDER SCHEMAS
// ==========================================

export const checkoutSchema = {
  body: z.object({
    shippingAddress: z.string().min(1, 'Shipping address is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
};

export const createOrderSchema = {
  body: z.object({
    shippingAddress: z.string().min(1, 'Shipping address is required'),
    paymentMethod: z.enum(['cod', 'online', 'wallet'], {
      errorMap: () => ({ message: 'Valid payment method is required' }),
    }),
  }),
};

// ==========================================
// SEARCH SCHEMAS
// ==========================================

export const searchProductsSchema = {
  query: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    condition: z
      .enum(['new', 'like-new', 'good', 'fair'], {
        errorMap: () => ({ message: 'Invalid condition' }),
      })
      .optional(),
    page: z.coerce
      .number()
      .int()
      .min(1, 'Page must be a positive integer')
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50, 'Limit must be between 1 and 50')
      .optional(),
  }),
};
