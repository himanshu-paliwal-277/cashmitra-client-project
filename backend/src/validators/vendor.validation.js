import { z } from 'zod';

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

export const loginVendorSchema = {
  body: z.object({
    email: z.string().email('Please include a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
};

// ==========================================
// VENDOR MANAGEMENT SCHEMAS
// ==========================================

export const getAllVendorsSchema = {
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
      .max(50, 'Limit must be between 1 and 50')
      .optional(),
    search: z.string().optional(),
    status: z
      .enum(['all', 'active', 'inactive'], {
        errorMap: () => ({ message: 'Invalid status filter' }),
      })
      .optional(),
  }),
};

export const createVendorSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please include a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid phone number')
      .optional(),
    roleTemplate: z
      .enum(['basic', 'advanced', 'full'], {
        errorMap: () => ({ message: 'Invalid role template' }),
      })
      .optional(),
  }),
};

export const updateVendorPermissionsSchema = {
  body: z.object({
    permissions: z.object({}).passthrough().optional(),
    roleTemplate: z
      .enum(['basic', 'advanced', 'full'], {
        errorMap: () => ({ message: 'Invalid role template' }),
      })
      .optional(),
    notes: z.string().optional(),
  }),
};

export const toggleVendorStatusSchema = {
  body: z.object({
    isActive: z.boolean({ invalid_type_error: 'isActive must be a boolean' }),
    notes: z.string().optional(),
  }),
};
