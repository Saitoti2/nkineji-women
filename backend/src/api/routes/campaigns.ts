import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, getCampaignImpact } from '../../services/campaignService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createCampaignSchema, updateCampaignSchema } from '../../types/schemas/campaignSchemas.js';

export const campaignsRouter = Router();

// GET /api/v1/campaigns - Public, but filtered
campaignsRouter.get('/', async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const campaigns = await getCampaigns({
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/campaigns/:id
campaignsRouter.get('/:id', async (req, res, next) => {
  try {
    const campaign = await getCampaign(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/campaigns/:id/impact
campaignsRouter.get('/:id/impact', async (req, res, next) => {
  try {
    const impact = await getCampaignImpact(req.params.id);
    res.json({ success: true, data: impact });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/campaigns - Admin only
campaignsRouter.post(
  '/',
  authenticate,
  authorize(['admin', 'super_admin']),
  validateRequest(createCampaignSchema),
  async (req, res, next) => {
    try {
      const campaign = await createCampaign(req.body, req.user!.id);
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/campaigns/:id - Admin only
campaignsRouter.put(
  '/:id',
  authenticate,
  authorize(['admin', 'super_admin']),
  validateRequest(updateCampaignSchema),
  async (req, res, next) => {
    try {
      const campaign = await updateCampaign(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/campaigns/:id - Admin only
campaignsRouter.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'super_admin']),
  async (req, res, next) => {
    try {
      await deleteCampaign(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

