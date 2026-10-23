import { Router } from 'express';
import { currencyService } from '../../services/currencyService.js';

export const currencyRouter = Router();

// GET /api/v1/currency/rates - public; the frontend quotes donors from these
currencyRouter.get('/rates', async (req, res, next) => {
    try {
        const rates = await currencyService.getExchangeRates();
        res.json({
            success: true,
            data: rates,
            meta: { asOf: currencyService.asOf, base: 'USD' },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/currency/convert?amount=10&from=USD&to=KES
currencyRouter.get('/convert', async (req, res, next) => {
    try {
        const amount = Number(req.query.amount);
        const from = String(req.query.from || 'USD');
        const to = String(req.query.to || 'KES');

        if (!Number.isFinite(amount) || amount < 0) {
            return res.status(400).json({ success: false, error: 'amount must be a non-negative number' });
        }

        const converted = await currencyService.convert(amount, from, to);
        res.json({ success: true, data: { amount, from, to, converted, asOf: currencyService.asOf } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});
