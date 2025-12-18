import { z } from 'zod';

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

export const loginSchema = {
  body: z.object({
    email: z.string().email('Valid email is required').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
};

// ==========================================
// ORDER QUERY SCHEMAS
// ==========================================

export const getPastOrdersSchema = {
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
  }),
};

// ==========================================
// EVALUATION SCHEMAS
// ==========================================

export const calculatePriceSchema = {
  body: z.object({
    orderId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Valid order ID is required'),
    answers: z.array(z.any()).optional(),
    selectedDefects: z.array(z.any()).optional(),
  }),
};

export const completeEvaluationSchema = {
  body: z.object({
    finalPrice: z.number({
      invalid_type_error: 'Final price is required and must be a number',
    }),
    adjustmentReason: z
      .string()
      .trim()
      .max(500, 'Adjustment reason must not exceed 500 characters')
      .optional(),
    answers: z.array(z.any()).optional(),
    selectedDefects: z.array(z.any()).optional(),
    photos: z.array(z.any()).optional(),
  }),
};

// ==========================================
// PAYMENT SCHEMAS
// ==========================================

export const completePaymentSchema = {
  body: z.object({
    paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'online'], {
      errorMap: () => ({ message: 'Valid payment method is required' }),
    }),
    transactionId: z
      .string()
      .trim()
      .max(100, 'Transaction ID must not exceed 100 characters')
      .optional(),
    paymentProof: z
      .string()
      .url('Payment proof must be a valid URL')
      .optional(),
  }),
};

// ==========================================
// LOCATION SCHEMAS
// ==========================================

export const updateLocationSchema = {
  body: z.object({
    latitude: z.number().min(-90).max(90, 'Valid latitude is required'),
    longitude: z.number().min(-180).max(180, 'Valid longitude is required'),
  }),
};

// ==========================================
// IMAGE UPLOAD SCHEMAS
// ==========================================

export const uploadCustomerSelfieSchema = {
  body: z.object({
    selfieImage: z.string().min(1, 'Selfie image is required'),
  }),
};

export const uploadIMEIScanSchema = {
  body: z.object({
    imeiImage: z.string().min(1, 'IMEI scan image is required'),
    imei1: z.string().trim().length(15, 'IMEI 1 must be 15 digits').optional(),
    imei2: z.string().trim().length(15, 'IMEI 2 must be 15 digits').optional(),
  }),
};

// ==========================================
// RE-EVALUATION SCHEMAS
// ==========================================

export const reEvaluateDeviceSchema = {
  body: z.object({
    answers: z.object({}).passthrough().optional(),
    defects: z.array(z.any()).optional(),
    accessories: z.array(z.any()).optional(),
    agentNotes: z
      .string()
      .trim()
      .max(1000, 'Agent notes must not exceed 1000 characters')
      .optional(),
    negotiation: z
      .number({ invalid_type_error: 'Negotiation must be a number' })
      .optional(),
  }),
};
