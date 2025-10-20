import { MercadoPagoConfig, PreApprovalPlan, PreApproval, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('Missing MERCADOPAGO_ACCESS_TOKEN environment variable');
}

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

// Create instances for different resources
export const preApprovalPlan = new PreApprovalPlan(client);
export const preApproval = new PreApproval(client);
export const payment = new Payment(client);

export default client;
