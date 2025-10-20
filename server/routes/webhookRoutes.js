import express from 'express';
import { WebhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Mercado Pago webhook endpoint
// Note: This route uses raw body parser from app.js
router.post('/', express.json(), WebhookController.handleWebhook);

export default router;
