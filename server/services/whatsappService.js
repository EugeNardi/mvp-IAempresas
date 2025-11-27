import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Store WhatsApp clients per user
const clients = new Map();
const qrCodes = new Map();
const clientStatus = new Map();

/**
 * Initialize WhatsApp client for a user
 */
export async function initializeWhatsAppClient(userId) {
  try {
    console.log(`📱 Initializing WhatsApp client for user: ${userId}`);

    // Check if client already exists
    if (clients.has(userId)) {
      const existingClient = clients.get(userId);
      const state = await existingClient.getState();
      
      if (state === 'CONNECTED') {
        console.log(`✅ Client already connected for user: ${userId}`);
        return {
          success: true,
          status: 'connected',
          message: 'WhatsApp already connected'
        };
      } else {
        // Destroy old client if not connected
        await existingClient.destroy();
        clients.delete(userId);
      }
    }

    // Create new client with persistent session
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `user-${userId}`,
        dataPath: './whatsapp-sessions'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // Store client
    clients.set(userId, client);
    clientStatus.set(userId, 'initializing');

    // QR Code event
    client.on('qr', async (qr) => {
      console.log(`📱 QR Code generated for user: ${userId}`);
      
      try {
        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(qr);
        qrCodes.set(userId, qrDataUrl);
        clientStatus.set(userId, 'qr_ready');

        // Store in database
        await supabase
          .from('whatsapp_authorization')
          .upsert({
            user_id: userId,
            qr_code: qrDataUrl,
            is_authorized: false,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        console.log(`✅ QR Code stored for user: ${userId}`);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    // Ready event
    client.on('ready', async () => {
      console.log(`✅ WhatsApp client ready for user: ${userId}`);
      clientStatus.set(userId, 'connected');
      qrCodes.delete(userId);

      // Get phone number
      const info = client.info;
      
      // Update database
      await supabase
        .from('whatsapp_authorization')
        .upsert({
          user_id: userId,
          phone_number: info.wid.user,
          is_authorized: true,
          authorization_date: new Date().toISOString(),
          qr_code: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      // Update profile
      await supabase
        .from('profiles')
        .update({ whatsapp_authorized: true })
        .eq('id', userId);
    });

    // Authenticated event
    client.on('authenticated', () => {
      console.log(`🔐 WhatsApp authenticated for user: ${userId}`);
      clientStatus.set(userId, 'authenticated');
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      console.log(`❌ WhatsApp disconnected for user: ${userId}. Reason:`, reason);
      clientStatus.set(userId, 'disconnected');
      
      // Update database
      await supabase
        .from('whatsapp_authorization')
        .update({
          is_authorized: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      await supabase
        .from('profiles')
        .update({ whatsapp_authorized: false })
        .eq('id', userId);

      // Clean up
      clients.delete(userId);
      qrCodes.delete(userId);
    });

    // Auth failure event
    client.on('auth_failure', async (msg) => {
      console.error(`❌ Auth failure for user: ${userId}`, msg);
      clientStatus.set(userId, 'auth_failed');
      
      // Clean up
      clients.delete(userId);
      qrCodes.delete(userId);
    });

    // Initialize client
    await client.initialize();

    return {
      success: true,
      status: 'initializing',
      message: 'WhatsApp client initialized. Waiting for QR code...'
    };

  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    clientStatus.set(userId, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get QR code for a user
 */
export function getQRCode(userId) {
  const qr = qrCodes.get(userId);
  const status = clientStatus.get(userId) || 'not_initialized';
  
  return {
    qrCode: qr || null,
    status: status
  };
}

/**
 * Get client status
 */
export function getClientStatus(userId) {
  return clientStatus.get(userId) || 'not_initialized';
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(userId, phoneNumber, message) {
  try {
    const client = clients.get(userId);
    
    if (!client) {
      return {
        success: false,
        error: 'WhatsApp client not initialized. Please scan QR code first.'
      };
    }

    const state = await client.getState();
    if (state !== 'CONNECTED') {
      return {
        success: false,
        error: 'WhatsApp not connected. Please scan QR code again.'
      };
    }

    // Format phone number (remove non-digits and add country code if needed)
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Add Argentina country code if not present
    if (!formattedNumber.startsWith('54')) {
      formattedNumber = '54' + formattedNumber;
    }

    // WhatsApp format: number@c.us
    const chatId = `${formattedNumber}@c.us`;

    // Send message
    await client.sendMessage(chatId, message);

    console.log(`✅ Message sent to ${phoneNumber} by user ${userId}`);

    return {
      success: true,
      message: 'Message sent successfully'
    };

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Disconnect WhatsApp client
 */
export async function disconnectWhatsAppClient(userId) {
  try {
    const client = clients.get(userId);
    
    if (client) {
      await client.destroy();
      clients.delete(userId);
      qrCodes.delete(userId);
      clientStatus.delete(userId);

      // Update database
      await supabase
        .from('whatsapp_authorization')
        .update({
          is_authorized: false,
          qr_code: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      await supabase
        .from('profiles')
        .update({ whatsapp_authorized: false })
        .eq('id', userId);
    }

    return {
      success: true,
      message: 'WhatsApp disconnected successfully'
    };

  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if user has active WhatsApp session
 */
export async function checkWhatsAppSession(userId) {
  try {
    const client = clients.get(userId);
    
    if (!client) {
      return {
        connected: false,
        status: 'not_initialized'
      };
    }

    const state = await client.getState();
    
    return {
      connected: state === 'CONNECTED',
      status: state
    };

  } catch (error) {
    return {
      connected: false,
      status: 'error',
      error: error.message
    };
  }
}
