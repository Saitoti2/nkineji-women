import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  body: z.object({
    fullName: z.string().min(1),
    gender: z.enum(['female', 'male', 'other']),
    dateOfBirth: z.string().datetime().optional(),
    locationGeo: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
    consentRecords: z.array(z.object({
      consentType: z.enum(['public_story', 'share_data_with_donor', 'medical_sharing']),
      grantedBy: z.string().optional(),
      method: z.enum(['verbal', 'written', 'digital']),
      scope: z.string(),
    })),
    contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
    }).optional(),
  }),
});

export const updateBeneficiarySchema = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    gender: z.enum(['female', 'male', 'other']).optional(),
    dateOfBirth: z.string().datetime().optional(),
    locationGeo: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
    contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
    }).optional(),
  }).partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
});

