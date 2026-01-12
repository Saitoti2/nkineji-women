import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createDonation, getDonation, getDonations, handleStripeWebhook, handleMpesaWebhook } from '../../services/donationService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createDonationSchema } from '../../types/schemas/donationSchemas.js';
import { raw } from 'express';

export const donationsRouter = Router();

// POST /api/v1/donations - Public (guest donations) or authenticated
donationsRouter.post('/', validateRequest(createDonationSchema), async (req, res, next) => {
  try {
    const donation = await createDonation(req.body, req.user?.id);
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/donations - Authenticated users see their own, admins see all
donationsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const donations = await getDonations({
      userId: req.user!.id,
      role: req.user!.role,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/donations/:id
donationsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const donation = await getDonation(req.params.id as string, req.user!.id, req.user!.role);
    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoints (no auth, but signature verified)
// POST /api/v1/donations/webhooks/stripe
donationsRouter.post(
  '/webhooks/stripe',
  raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      await handleStripeWebhook(req);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/donations/webhooks/mpesa
donationsRouter.post('/webhooks/mpesa', async (req, res, next) => {
  try {
    await handleMpesaWebhook(req);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});



