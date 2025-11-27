import express from 'express';
import {
  initializeWhatsAppClient,
  getQRCode,
  getClientStatus,
  sendWhatsAppMessage,
  disconnectWhatsAppClient,
  checkWhatsAppSession
} from '../services/whatsappService.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Initialize WhatsApp client and get QR code
 * POST /api/whatsapp/initialize
 */
router.post('/initialize', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await initializeWhatsAppClient(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /initialize:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get QR code status
 * GET /api/whatsapp/qr
 */
router.get('/qr', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = getQRCode(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /qr:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get connection status
 * GET /api/whatsapp/status
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await checkWhatsAppSession(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send WhatsApp message
 * POST /api/whatsapp/send
 */
router.post('/send', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    const result = await sendWhatsAppMessage(userId, phoneNumber, message);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /send:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send bulk WhatsApp messages
 * POST /api/whatsapp/send-bulk
 */
router.post('/send-bulk', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const results = [];
    
    // Send messages with delay to avoid rate limiting
    for (const msg of messages) {
      const result = await sendWhatsAppMessage(userId, msg.phoneNumber, msg.message);
      results.push({
        phoneNumber: msg.phoneNumber,
        ...result
      });
      
      // Wait 2 seconds between messages
      if (messages.indexOf(msg) < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      total: messages.length,
      sent: successCount,
      failed: failCount,
      results: results
    });
  } catch (error) {
    console.error('Error in /send-bulk:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Disconnect WhatsApp
 * POST /api/whatsapp/disconnect
 */
router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await disconnectWhatsAppClient(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /disconnect:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
