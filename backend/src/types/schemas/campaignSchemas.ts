import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    goal_amount: z.coerce.number().positive(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    earmark: z.string().optional(),
    image_url: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
    priority: z.coerce.number().int().optional(),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    goal_amount: z.coerce.number().positive().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
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



