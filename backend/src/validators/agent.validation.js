import { z } from 'zod';

// ==========================================
// AGENT AUTHENTICATION SCHEMAS
// ==========================================

export const loginAgentSchema = {
  body: z.object({
    email: z.string().email('Please include a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
};

// ==========================================
// OTP VERIFICATION SCHEMAS
// ==========================================

export const verifyOTPSchema = {
  body: z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
};

// ==========================================
// IMEI VERIFICATION SCHEMAS
// ==========================================

export const verifyIMEISchema = {
  body: z.object({
    imei1: z.string().length(15, 'IMEI 1 must be 15 digits'),
    imei2: z.string().length(15, 'IMEI 2 must be 15 digits').optional(),
  }),
};

// ==========================================
// DEVICE INSPECTION SCHEMAS
// ==========================================

export const submitDeviceInspectionSchema = {
  body: z.object({
    inspectionData: z
      .object({
        screenCondition: z.string().min(1, 'Screen condition is required'),
        sim1Working: z.boolean({
          invalid_type_error: 'SIM 1 status is required',
        }),
        sim2Working: z.boolean().optional(),
      })
      .passthrough(),
  }),
};

// ==========================================
// PRICE UPDATE SCHEMAS
// ==========================================

export const updatePriceSchema = {
  body: z.object({
    adjustedPrice: z.number({
      invalid_type_error: 'Adjusted price must be a number',
    }),
    reason: z.string().min(1, 'Reason for price adjustment is required'),
  }),
};

// ==========================================
// CUSTOMER DECISION SCHEMAS
// ==========================================

export const recordCustomerDecisionSchema = {
  body: z.object({
    accepted: z.boolean({ invalid_type_error: 'Accepted status is required' }),
    rejectionReason: z.string().min(1).optional(),
  }),
};

// ==========================================
// PAYMENT SCHEMAS
// ==========================================

export const recordPaymentSchema = {
  body: z.object({
    amount: z.number({ invalid_type_error: 'Payment amount is required' }),
    method: z.enum(['cash', 'upi', 'neft', 'bank_transfer'], {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
    transactionId: z.string().min(1).optional(),
  }),
};
