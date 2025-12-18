import { z } from 'zod';

// ==========================================
// USER PROFILE SCHEMAS
// ==========================================

export const updateUserProfileSchema = {
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    email: z.string().email('Please include a valid email').optional(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Please include a valid phone number').optional(),
    dateOfBirth: z.string().datetime('Please provide a valid date').optional(),
    address: z.object({
      street: z.string().min(1, 'Street cannot be empty').optional(),
      city: z.string().min(1, 'City cannot be empty').optional(),
      state: z.string().min(1, 'State cannot be empty').optional(),
      pincode: z.string().length(6, 'Pincode must be 6 digits').optional(),
    }).optional(),
  }),
};

// ==========================================
// ADDRESS SCHEMAS
// ==========================================

export const addAddressSchema = {
  body: z.object({
    title: z.string().min(1, 'Address title is required'),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Please include a valid phone number'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    addressType: z.enum(['home', 'work', 'other'], {
      errorMap: () => ({ message: 'Invalid address type' }),
    }).optional(),
  }),
};

export const updateAddressSchema = {
  body: z.object({
    title: z.string().min(1, 'Address title cannot be empty').optional(),
    fullName: z.string().min(1, 'Full name cannot be empty').optional(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Please include a valid phone number').optional(),
    street: z.string().min(1, 'Street address cannot be empty').optional(),
    city: z.string().min(1, 'City cannot be empty').optional(),
    state: z.string().min(1, 'State cannot be empty').optional(),
    pincode: z.string().length(6, 'Pincode must be 6 digits').optional(),
    addressType: z.enum(['home', 'work', 'other'], {
      errorMap: () => ({ message: 'Invalid address type' }),
    }).optional(),
  }),
};
