import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { createDonation, getDonation, getDonations, deleteDonation, handleStripeWebhook, handleMpesaWebhook, handlePesapalIPN } from '../../services/donationService.js';
import { PesapalService } from '../../services/pesapalService.js';
import { getPesapalIpnUrl } from '../../utils/publicUrls.js';
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

// Diagnostics — admin only, and MUST be before /:id to avoid route collision.
// These expose and mutate payment provider configuration, so they are not public.
donationsRouter.get('/debug/pesapal', authenticate, requireAdmin, async (req, res) => {
  try {
    const expectedUrl = getPesapalIpnUrl();
    const ipns = await PesapalService.listIPNs();
    const registered = ipns.find(
      ipn => ipn.url.trim().replace(/\/+$/, '').toLowerCase() === expectedUrl.replace(/\/+$/, '').toLowerCase()
    );

    res.json({
      success: true,
      message: 'PesaPal connection OK',
      expectedIpnUrl: expectedUrl,
      ipnRegisteredForThisHost: Boolean(registered),
      activeIpnId: registered?.ipn_id ?? null,
      ipns,
    });
  } catch (error: any) {
    console.error('DEBUG PESAPAL ERROR:', error);
    res.status(500).json({ success: false, message: error.message, details: error.response?.data });
  }
});

// Registers (or confirms) the IPN for THIS host. Never takes a URL from the
// caller, so it cannot be used to point callbacks somewhere else.
donationsRouter.post('/debug/register-ipn', authenticate, requireAdmin, async (req, res) => {
  try {
    const ipnId = await PesapalService.ensureIPN();
    res.json({ success: true, message: 'IPN registered for this host', url: getPesapalIpnUrl(), ipnId });
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

// PesaPal IPN. Registered as GET, but accept POST too so the endpoint keeps
// working if the registration's notification type is ever changed.
const pesapalIpnHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await handlePesapalIPN(req);

    // Echo the notification back, as PesaPal's own samples do. A non-2xx reply
    // makes PesaPal retry, so anything we cannot act on (an unknown order)
    // still acknowledges — only genuine server errors fall through to 500.
    res.status(200).json({
      orderNotificationType: req.query.OrderNotificationType ?? 'IPNCHANGE',
      orderTrackingId: req.query.OrderTrackingId ?? null,
      orderMerchantReference: req.query.OrderMerchantReference ?? null,
      status: 200,
      handled: result.handled,
    });
  } catch (error) {
    next(error);
  }
};

donationsRouter.get('/webhooks/pesapal', pesapalIpnHandler);
donationsRouter.post('/webhooks/pesapal', pesapalIpnHandler);


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
