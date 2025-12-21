import { z } from 'zod';

// ==========================================
// PARTNER REGISTRATION & PROFILE SCHEMAS
// ==========================================

export const registerPartnerShopSchema = {
  body: z.object({
    shopName: z.string().min(1, 'Shop name is required'),
    shopAddress: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      pincode: z.string().min(1, 'Pincode is required'),
    }),
    gstNumber: z.string().min(1, 'GST number is required'),
    shopPhone: z.string().min(1, 'Shop phone number is required'),
    shopEmail: z.string().email('Valid shop email is required'),
  }),
};

export const updatePartnerProfileSchema = {
  body: z.object({
    shopName: z.string().min(1, 'Shop name cannot be empty').optional(),
    shopAddress: z.object({}).passthrough().optional(),
    shopPhone: z.string().min(1, 'Shop phone cannot be empty').optional(),
    shopEmail: z.string().email('Valid shop email is required').optional(),
    bankDetails: z.object({}).passthrough().optional(),
  }),
};

export const uploadDocumentsSchema = {
  body: z.object({
    gstCertificate: z
      .string()
      .url('Valid GST certificate URL is required')
      .optional(),
    shopLicense: z
      .string()
      .url('Valid shop license URL is required')
      .optional(),
    ownerIdProof: z.string().url('Valid ID proof URL is required').optional(),
    additionalDocuments: z.array(z.any()).optional(),
  }),
};

// ==========================================
// ORDER MANAGEMENT SCHEMAS
// ==========================================

export const respondToOrderAssignmentSchema = {
  body: z.object({
    response: z.enum(['accepted', 'rejected'], {
      errorMap: () => ({
        message: "Response must be either 'accepted' or 'rejected'",
      }),
    }),
    reason: z.string().optional(),
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({
    status: z.enum(
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      {
        errorMap: () => ({ message: 'Valid status is required' }),
      }
    ),
    trackingInfo: z.object({}).passthrough().optional(),
  }),
};

export const assignAgentToOrderSchema = {
  body: z.object({
    agentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Valid agent ID is required'),
  }),
};

// ==========================================
// PRODUCT MANAGEMENT SCHEMAS
// ==========================================

// export const createPartnerProductSchema = {
//   body: z.object({
//     categoryId: z
//       .string()
//       .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')
//       .min(1, 'Category ID is required'),
//     name: z.string().min(1, 'Product name is required'),
//     brand: z.string().min(1, 'Brand is required'),
//     pricing: z
//       .object({
//         mrp: z.number({ invalid_type_error: 'MRP must be a number' }),
//       })
//       .passthrough(),
//     stock: z
//       .object({
//         quantity: z
//           .number()
//           .int()
//           .min(0, 'Stock quantity must be non-negative')
//           .optional(),
//       })
//       .passthrough()
//       .optional(),
//   }),
// };

// export const updatePartnerProductSchema = {
//   body: z.object({
//     pricing: z
//       .object({
//         mrp: z
//           .number({ invalid_type_error: 'MRP must be a number' })
//           .optional(),
//       })
//       .passthrough()
//       .optional(),
//     stock: z
//       .object({
//         quantity: z
//           .number()
//           .int()
//           .min(0, 'Stock quantity must be non-negative')
//           .optional(),
//       })
//       .passthrough()
//       .optional(),
//   }),
// };

// ==========================================
// SELL ORDER SCHEMAS
// ==========================================

export const updatePartnerSellOrderStatusSchema = {
  body: z.object({
    status: z.enum(['draft', 'confirmed', 'cancelled', 'picked', 'paid'], {
      errorMap: () => ({ message: 'Valid status is required' }),
    }),
    notes: z.string().optional(),
  }),
};

// ==========================================
// AGENT MANAGEMENT SCHEMAS
// ==========================================

export const createAgentSchema = {
  body: z.object({
    name: z.string().min(1, 'Agent name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    coverageAreas: z.array(z.any(), {
      invalid_type_error: 'Coverage areas must be an array',
    }),
    aadharCard: z.string().optional(),
    panCard: z.string().optional(),
    drivingLicense: z.string().optional(),
  }),
};

export const updateAgentSchema = {
  body: z.object({
    name: z.string().min(1, 'Agent name cannot be empty').optional(),
    phone: z.string().min(1, 'Phone number cannot be empty').optional(),
    coverageAreas: z
      .array(z.any(), { invalid_type_error: 'Coverage areas must be an array' })
      .optional(),
  }),
};
