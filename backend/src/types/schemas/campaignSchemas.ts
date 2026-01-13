import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    goalAmount: z.number().positive(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    earmark: z.string().optional(),
    image_url: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
    priority: z.number().int().optional(),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    goalAmount: z.number().positive().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    earmark: z.string().optional(),
    image_url: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
    priority: z.number().int().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});



