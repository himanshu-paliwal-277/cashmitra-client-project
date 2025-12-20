import { z } from 'zod';

// ==========================================
// PICKUP SCHEDULING SCHEMAS
// ==========================================

export const schedulePickupSchema = {
  body: z.object({
    orderId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Order ID must be a valid MongoDB ObjectId'),
    address: z
      .string()
      .trim()
      .min(10)
      .max(500, 'Address must be between 10 and 500 characters')
      .optional(),
    city: z
      .string()
      .trim()
      .min(2)
      .max(50, 'City must be between 2 and 50 characters')
      .optional(),
    pincode: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, 'Valid Indian pincode is required')
      .optional(),
    preferredDate: z
      .string()
      .datetime('Preferred date must be a valid date')
      .optional(),
    timeSlot: z
      .enum(['morning', 'afternoon', 'evening'], {
        errorMap: () => ({
          message: 'Time slot must be morning, afternoon, or evening',
        }),
      })
      .optional(),
    contactNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Valid phone number is required')
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
    orderType: z.string().optional(),
  }),
};

// ==========================================
// STATUS UPDATE SCHEMAS
// ==========================================

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(
      ['scheduled', 'in_transit', 'completed', 'cancelled', 'rescheduled'],
      {
        errorMap: () => ({
          message:
            'Status must be one of: scheduled, in_transit, completed, cancelled, rescheduled',
        }),
      }
    ),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
  }),
};

// ==========================================
// QUERY SCHEMAS
// ==========================================

export const getPickupsSchema = {
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
        ['scheduled', 'in_transit', 'completed', 'cancelled', 'rescheduled'],
        {
          errorMap: () => ({ message: 'Status filter must be valid' }),
        }
      )
      .optional(),
    date: z.coerce
      .date({ invalid_type_error: 'Date must be a valid date' })
      .optional(),
  }),
};

// ==========================================
// ASSIGNMENT SCHEMAS
// ==========================================

export const assignPickupSchema = {
  body: z.object({
    assignedTo: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Assigned agent ID must be valid'),
  }),
};

// ==========================================
// CANCELLATION & RESCHEDULING SCHEMAS
// ==========================================

export const cancelPickupSchema = {
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
  }),
};

export const reschedulePickupSchema = {
  body: z.object({
    newDate: z.coerce.date({ invalid_type_error: 'New date must be valid' }),
    newTimeSlot: z.string().min(1, 'New time slot is required'),
  }),
};

// ==========================================
// COMMUNICATION SCHEMAS
// ==========================================

export const addCommunicationSchema = {
  body: z.object({
    type: z.enum(['sms', 'email', 'call', 'whatsapp'], {
      errorMap: () => ({ message: 'Communication type must be valid' }),
    }),
    message: z.string().min(1, 'Message is required'),
  }),
};
