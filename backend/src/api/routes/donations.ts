import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createDonation, getDonation, getDonations, deleteDonation, handleStripeWebhook, handleMpesaWebhook, handlePesapalIPN } from '../../services/donationService.js';
import { PesapalService } from '../../services/pesapalService.js';
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
    console.log(`FETCHING DONATIONS: user=${req.user!.id}, role=${req.user!.role}, limit=${limit}, offset=${offset}`);
    const donations = await getDonations({
      userId: req.user!.id,
      role: req.user!.role,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ success: true, data: donations });
  } catch (error) {
    console.error('FETCH DONATIONS ERROR:', error);
    next(error);
  }
});

// Temporary debug route — MUST be before /:id to avoid route collision
donationsRouter.get('/debug/pesapal', async (req, res) => {
  try {
    const ipns = await PesapalService.listIPNs();
    res.json({ success: true, message: 'PesaPal connection OK', ipns });
  } catch (error: any) {
    console.error('DEBUG PESAPAL ERROR:', error);
    res.status(500).json({ success: false, message: error.message, details: error.response?.data });
  }
});

// Temporary debug route to register IPN — MUST be before /:id
donationsRouter.get('/debug/register-ipn', async (req, res) => {
  try {
    const url = 'https://nkineji.org/api/v1/donations/webhooks/pesapal';
    const ipnId = await PesapalService.registerIPN(url);
    res.json({ success: true, message: 'IPN Registered successfully', ipnId });
  } catch (error: any) {
    console.error('DEBUG REGISTER IPN ERROR:', error);
    res.status(500).json({ success: false, message: error.message, details: error.response?.data });
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

// GET /api/v1/donations/webhooks/pesapal
donationsRouter.get('/webhooks/pesapal', async (req, res, next) => {
  try {
    await handlePesapalIPN(req);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});


// DELETE /api/v1/donations/:id - Admin only
donationsRouter.delete(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      // Check for admin role
      if (!['admin', 'super_admin', 'chief_admin'].includes(req.user!.role)) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }
      await deleteDonation(req.params.id as string);
      res.json({ success: true, message: 'Donation record deleted' });
    } catch (error) {
      next(error);
    }
  }
);
