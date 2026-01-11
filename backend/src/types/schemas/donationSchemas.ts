import { z } from 'zod';

export const createDonationSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    currency: z.enum(['USD', 'KES', 'EUR']).default('USD'),
    campaignId: z.string().uuid().optional(),
    paymentMethod: z.enum(['stripe', 'mpesa', 'bank_transfer']),
    paymentToken: z.string().optional(), // For Stripe token or M-PESA phone
    donorName: z.string().min(1).optional(),
    donorEmail: z.string().email().optional(),
    donorPhone: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});



