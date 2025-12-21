import { z } from 'zod';

// Password validation regex for strength checking
const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Custom password refinement for strength validation
export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    'Password must be at least 8 characters and include lowercase, number, and special character'
  );

// ==========================================
// CUSTOMER/USER VALIDATION SCHEMAS
// ==========================================

/**
 * Schema for customer registration
 */
export const registerUserSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Please include a valid email').toLowerCase(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid 10-digit phone number')
      .optional(),
    password: passwordSchema,
  }),
};

/**
 * Schema for customer login
 */
export const loginUserSchema = {
  body: z.object({
    email: z.string().email('Please include a valid email').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * Schema for updating customer profile
 */
export const updateUserProfileSchema = {
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').trim().optional(),
    email: z
      .string()
      .email('Please include a valid email')
      .toLowerCase()
      .optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid 10-digit phone number')
      .optional(),
  }),
};

// ==========================================
// PARTNER VALIDATION SCHEMAS
// ==========================================

/**
 * Schema for partner registration
 */
export const registerPartnerSchema = {
  body: z.object({
    name: z.string().min(1, 'Shop name is required').trim(),
    email: z.string().email('Please include a valid email').toLowerCase(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid 10-digit phone number'),
    address: z.string().min(1, 'Address is required').trim(),
    businessType: z.string().min(1, 'Business type is required').trim(),
    password: passwordSchema,
  }),
};

/**
 * Schema for partner login
 */
export const loginPartnerSchema = {
  body: z.object({
    email: z.string().email('Please include a valid email').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * Schema for updating partner profile
 */
export const updatePartnerProfileSchema = {
  body: z.object({
    name: z.string().min(1, 'Shop name cannot be empty').trim().optional(),
    email: z
      .string()
      .email('Please include a valid email')
      .toLowerCase()
      .optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid 10-digit phone number')
      .optional(),
    address: z.string().min(1, 'Address cannot be empty').trim().optional(),
  }),
};
