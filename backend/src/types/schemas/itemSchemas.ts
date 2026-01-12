import { z } from 'zod';

export const createItemSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        image_url: z.string().url().optional(),
        unit_price: z.number().positive(),
        campaign_id: z.string().uuid().optional(),
    }),
});

export const updateItemSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        image_url: z.string().url().optional(),
        unit_price: z.number().positive().optional(),
        campaign_id: z.string().uuid().optional(),
        is_active: z.boolean().optional(),
    }),
});
