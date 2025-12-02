import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { getBeneficiaries, getBeneficiary, createBeneficiary, updateBeneficiary, deleteBeneficiary } from '../../services/beneficiaryService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createBeneficiarySchema, updateBeneficiarySchema } from '../../types/schemas/beneficiarySchemas.js';

export const beneficiariesRouter = Router();

// All routes require authentication
beneficiariesRouter.use(authenticate);

// GET /api/v1/beneficiaries - Field-level filtering based on role
beneficiariesRouter.get('/', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const beneficiaries = await getBeneficiaries({
      userId: req.user!.id,
      role: req.user!.role,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/beneficiaries/:id - Field-level access control
beneficiariesRouter.get('/:id', async (req, res, next) => {
  try {
    const beneficiary = await getBeneficiary(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, data: beneficiary });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/beneficiaries - Field Officer, Education Officer, Health Officer
beneficiariesRouter.post(
  '/',
  authorize(['field_officer', 'education_officer', 'health_officer', 'admin', 'super_admin']),
  validateRequest(createBeneficiarySchema),
  async (req, res, next) => {
    try {
      const beneficiary = await createBeneficiary(req.body, req.user!.id);
      res.status(201).json({ success: true, data: beneficiary });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/beneficiaries/:id
beneficiariesRouter.put(
  '/:id',
  authorize(['field_officer', 'education_officer', 'health_officer', 'admin', 'super_admin']),
  validateRequest(updateBeneficiarySchema),
  async (req, res, next) => {
    try {
      const beneficiary = await updateBeneficiary(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ success: true, data: beneficiary });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/beneficiaries/:id - Admin only, with redaction
beneficiariesRouter.delete(
  '/:id',
  authorize(['admin', 'super_admin']),
  async (req, res, next) => {
    try {
      await deleteBeneficiary(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Beneficiary deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

