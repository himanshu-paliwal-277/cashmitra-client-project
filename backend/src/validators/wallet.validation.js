import { z } from 'zod';

// ==========================================
// TRANSACTION QUERY SCHEMAS
// ==========================================

export const getTransactionsSchema = {
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
    type: z
      .enum(
        [
          'order_payment',
          'commission',
          'payout',
          'refund',
          'wallet_credit',
          'wallet_debit',
        ],
        {
          errorMap: () => ({ message: 'Invalid transaction type' }),
        }
      )
      .optional(),
    status: z
      .enum(['pending', 'completed', 'failed', 'cancelled'], {
        errorMap: () => ({ message: 'Invalid status' }),
      })
      .optional(),
  }),
};

// ==========================================
// PAYOUT SCHEMAS
// ==========================================

export const requestPayoutSchema = {
  body: z
    .object({
      amount: z
        .number({ invalid_type_error: 'Amount must be a number' })
        .positive('Amount must be greater than 0'),
      paymentMethod: z.enum(['Bank Transfer', 'UPI'], {
        errorMap: () => ({
          message: 'Payment method must be Bank Transfer or UPI',
        }),
      }),
      bankDetails: z
        .object({
          accountNumber: z
            .string()
            .min(1, 'Account number is required for bank transfer')
            .optional(),
          ifscCode: z
            .string()
            .min(1, 'IFSC code is required for bank transfer')
            .optional(),
          accountHolderName: z
            .string()
            .min(1, 'Account holder name is required for bank transfer')
            .optional(),
        })
        .optional(),
      upiId: z
        .string()
        .min(1, 'UPI ID is required for UPI transfer')
        .optional(),
    })
    .refine(
      (data) => {
        if (data.paymentMethod === 'Bank Transfer') {
          return (
            data.bankDetails &&
            data.bankDetails.accountNumber &&
            data.bankDetails.ifscCode &&
            data.bankDetails.accountHolderName
          );
        }
        if (data.paymentMethod === 'UPI') {
          return data.upiId;
        }
        return true;
      },
      {
        message:
          'Required payment details are missing for the selected payment method',
      }
    ),
};

export const updatePayoutSettingsSchema = {
  body: z.object({
    minimumPayoutAmount: z
      .number({ invalid_type_error: 'Minimum payout amount must be a number' })
      .optional(),
    autoPayoutEnabled: z
      .boolean({ invalid_type_error: 'Auto payout enabled must be a boolean' })
      .optional(),
    payoutSchedule: z
      .enum(['manual', 'weekly', 'biweekly', 'monthly'], {
        errorMap: () => ({ message: 'Invalid payout schedule' }),
      })
      .optional(),
    bankDetails: z.object({}).passthrough().optional(),
    upiId: z.string().optional(),
  }),
};

export const getPayoutHistorySchema = {
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
    status: z
      .enum(['pending', 'completed', 'failed', 'cancelled'], {
        errorMap: () => ({ message: 'Invalid status' }),
      })
      .optional(),
  }),
};

export const getWalletAnalyticsSchema = {
  query: z.object({
    period: z.coerce
      .number()
      .int()
      .min(1)
      .max(365, 'Period must be between 1 and 365 days')
      .optional(),
  }),
};

export const getPendingPayoutsSchema = {
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
  }),
};

export const getAllPayoutsSchema = {
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
    status: z
      .enum(['pending', 'completed', 'failed', 'cancelled'], {
        errorMap: () => ({ message: 'Invalid status' }),
      })
      .optional(),
  }),
};

export const processPayoutSchema = {
  body: z.object({
    status: z.enum(['completed', 'failed'], {
      errorMap: () => ({ message: 'Status must be completed or failed' }),
    }),
    notes: z.string().optional(),
  }),
};
