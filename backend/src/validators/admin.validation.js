import { z } from 'zod';

// ==========================================
// ADMIN AUTHENTICATION SCHEMAS
// ==========================================

export const loginAdminSchema = {
  body: z.object({
    email: z.string().email('Please include a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const createAdminSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please include a valid email'),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
};

// ==========================================
// PARTNER MANAGEMENT SCHEMAS
// ==========================================

export const createPartnerSchema = {
  body: z
    .object({
      userId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Valid user ID is required')
        .optional()
        .or(z.literal('')),
      name: z
        .string()
        .min(2, 'Name must be between 2 and 100 characters')
        .max(100)
        .optional(),
      email: z.string().email('Valid email is required').optional(),
      phone: z.string().min(10, 'Valid phone number is required').optional(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .optional(),
      shopName: z
        .string()
        .trim()
        .min(2, 'Shop name must be between 2 and 100 characters')
        .max(100),
      shopAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        pincode: z.string().length(6, 'Pincode must be 6 digits'),
      }),
      shopEmail: z.string().email('Valid shop email is required'),
      upiId: z
        .string()
        .regex(
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/,
          'UPI ID must be in format: username@provider (e.g., user@paytm, phone@ybl)'
        )
        .optional(),
    })
    .refine(
      (data) => {
        // If userId is provided and not empty, it's valid
        if (data.userId && data.userId.trim()) {
          return true;
        }
        // If userId is not provided, all user details must be present
        return data.name && data.email && data.phone && data.password;
      },
      {
        message:
          'Either userId or complete user details (name, email, phone, password) are required',
        path: ['userId'],
      }
    ),
};

export const updatePartnerSchema = {
  body: z.object({
    shopName: z
      .string()
      .trim()
      .min(2, 'Shop name must be between 2 and 100 characters')
      .max(100)
      .optional(),
    shopAddress: z
      .object({
        street: z.string().min(1, 'Street address cannot be empty').optional(),
        city: z.string().min(1, 'City cannot be empty').optional(),
        state: z.string().min(1, 'State cannot be empty').optional(),
        pincode: z.string().length(6, 'Pincode must be 6 digits').optional(),
      })
      .optional(),
    shopEmail: z.string().email('Valid email is required').optional(),
    upiId: z
      .string()
      .regex(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/,
        'UPI ID must be in format: username@provider (e.g., user@paytm, phone@ybl)'
      )
      .optional(),
    verificationStatus: z
      .enum(['pending', 'approved', 'rejected'], {
        errorMap: () => ({ message: 'Invalid verification status' }),
      })
      .optional(),
    isVerified: z
      .boolean({ invalid_type_error: 'isVerified must be boolean' })
      .optional(),
  }),
};

export const verifyPartnerSchema = {
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      errorMap: () => ({ message: 'Status must be approved or rejected' }),
    }),
    notes: z.string().optional(),
  }),
};

export const updatePartnerWalletSchema = {
  body: z.object({
    amount: z.number({ invalid_type_error: 'Amount must be a number' }),
    reason: z.string().min(1, 'Reason is required'),
    type: z.enum(['credit', 'debit'], {
      errorMap: () => ({ message: 'Type must be credit or debit' }),
    }),
  }),
};

// ==========================================
// PRODUCT/CATALOG SCHEMAS
// ==========================================

export const addProductSchema = {
  body: z.object({
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
  }),
};

export const updateProductStatusSchema = {
  body: z.object({
    status: z.enum(['active', 'inactive', 'draft', 'archived'], {
      errorMap: () => ({ message: 'Invalid status value' }),
    }),
  }),
};

// ==========================================
// USER MANAGEMENT SCHEMAS
// ==========================================

export const createUserSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please include a valid email'),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z
      .enum(['user', 'partner', 'admin', 'driver'], {
        errorMap: () => ({ message: 'Invalid role' }),
      })
      .optional(),
  }),
};

export const updateUserSchema = {
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    email: z.string().email('Please include a valid email').optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Please include a valid phone number')
      .optional(),
    role: z
      .enum(['user', 'partner', 'admin', 'driver'], {
        errorMap: () => ({ message: 'Invalid role' }),
      })
      .optional(),
  }),
};

export const updateUserPasswordSchema = {
  body: z.object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
  }),
};

export const toggleUserStatusSchema = {
  body: z.object({
    isActive: z.boolean({ invalid_type_error: 'isActive must be a boolean' }),
  }),
};

// ==========================================
// CATEGORY SCHEMAS
// ==========================================

export const createCategorySchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Category name must be between 2 and 100 characters')
      .max(100),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    icon: z.string().optional(),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
  }),
};

export const updateCategorySchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Category name must be between 2 and 100 characters')
      .max(100)
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    icon: z.string().optional(),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
  }),
};

// ==========================================
// ORDER SCHEMAS
// ==========================================

export const updateOrderStatusSchema = {
  body: z.object({
    status: z.enum(
      [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      {
        errorMap: () => ({ message: 'Invalid status' }),
      }
    ),
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  }),
};

export const assignPartnerToOrderSchema = {
  body: z.object({
    partner: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        'Partner ID must be a valid MongoDB ObjectId'
      ),
  }),
};

// ==========================================
// BRAND & MODEL SCHEMAS
// ==========================================

export const createBrandSchema = {
  body: z.object({
    brand: z
      .string()
      .trim()
      .min(2, 'Brand name must be between 2 and 50 characters')
      .max(50),
    category: z.enum(['mobile', 'laptop', 'tablet'], {
      errorMap: () => ({
        message: 'Category must be one of: mobile, laptop, tablet',
      }),
    }),
  }),
};

export const updateBrandSchema = {
  body: z.object({
    newBrandName: z
      .string()
      .trim()
      .min(2, 'New brand name must be between 2 and 50 characters')
      .max(50),
  }),
};

export const createModelSchema = {
  body: z.object({
    brand: z
      .string()
      .trim()
      .min(2, 'Brand name must be between 2 and 50 characters')
      .max(50),
    model: z
      .string()
      .trim()
      .min(2, 'Model name must be between 2 and 100 characters')
      .max(100),
    category: z
      .enum(
        [
          'smartphone',
          'laptop',
          'tablet',
          'smartwatch',
          'headphones',
          'camera',
          'gaming',
          'general',
        ],
        {
          errorMap: () => ({
            message:
              'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general',
          }),
        }
      )
      .optional(),
  }),
};

export const updateModelSchema = {
  body: z.object({
    brand: z
      .string()
      .trim()
      .min(2, 'Brand name must be between 2 and 50 characters')
      .max(50)
      .optional(),
    model: z
      .string()
      .trim()
      .min(2, 'Model name must be between 2 and 100 characters')
      .max(100)
      .optional(),
    category: z
      .enum(
        [
          'smartphone',
          'laptop',
          'tablet',
          'smartwatch',
          'headphones',
          'camera',
          'gaming',
          'general',
        ],
        {
          errorMap: () => ({
            message:
              'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general',
          }),
        }
      )
      .optional(),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    releaseYear: z
      .number()
      .int()
      .min(1990)
      .max(new Date().getFullYear() + 2, 'Invalid release year')
      .optional(),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
  }),
};

// ==========================================
// QUESTIONNAIRE SCHEMAS
// ==========================================

const questionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  title: z
    .string()
    .trim()
    .min(5, 'Question title must be between 5 and 500 characters')
    .max(500),
  type: z.enum(
    ['single_choice', 'multiple_choice', 'text', 'number', 'boolean', 'rating'],
    {
      errorMap: () => ({ message: 'Invalid question type' }),
    }
  ),
  required: z
    .boolean({ invalid_type_error: 'Required field must be boolean' })
    .optional(),
  options: z.array(z.any()).optional(),
});

export const createQuestionnaireSchema = {
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be between 3 and 200 characters')
      .max(200),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    category: z.enum(
      [
        'smartphone',
        'laptop',
        'tablet',
        'smartwatch',
        'headphones',
        'camera',
        'gaming',
        'general',
      ],
      {
        errorMap: () => ({
          message:
            'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general',
        }),
      }
    ),
    subcategory: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    questions: z.array(questionSchema),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
    isDefault: z
      .boolean({ invalid_type_error: 'isDefault must be a boolean' })
      .optional(),
    metadata: z
      .object({
        estimatedTime: z
          .number()
          .int()
          .min(1)
          .max(60, 'Estimated time must be between 1 and 60 minutes')
          .optional(),
        difficulty: z
          .enum(['easy', 'medium', 'hard'], {
            errorMap: () => ({
              message: 'Difficulty must be easy, medium, or hard',
            }),
          })
          .optional(),
        instructions: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  }),
};

export const updateQuestionnaireSchema = {
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be between 3 and 200 characters')
      .max(200)
      .optional(),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    category: z
      .enum(
        [
          'smartphone',
          'laptop',
          'tablet',
          'smartwatch',
          'headphones',
          'camera',
          'gaming',
          'general',
        ],
        {
          errorMap: () => ({
            message:
              'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general',
          }),
        }
      )
      .optional(),
    subcategory: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    questions: z
      .array(questionSchema)
      .min(1, 'At least one question is required')
      .optional(),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
    isDefault: z
      .boolean({ invalid_type_error: 'isDefault must be a boolean' })
      .optional(),
    metadata: z
      .object({
        estimatedTime: z
          .number()
          .int()
          .min(1)
          .max(60, 'Estimated time must be between 1 and 60 minutes')
          .optional(),
        difficulty: z
          .enum(['easy', 'medium', 'hard'], {
            errorMap: () => ({
              message: 'Difficulty must be easy, medium, or hard',
            }),
          })
          .optional(),
        instructions: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  }),
};

export const deleteQuestionnaireSchema = {
  body: z.object({
    reason: z.string().optional(),
  }),
};

// ==========================================
// AGENT SCHEMAS
// ==========================================

export const rejectAgentSchema = {
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required'),
  }),
};

export const toggleAgentStatusSchema = {
  body: z.object({
    isActive: z.boolean({ invalid_type_error: 'isActive must be a boolean' }),
  }),
};
