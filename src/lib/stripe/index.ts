import Stripe from 'stripe';
import db from '../db';

export function getStripeClient(): Stripe | null {
  // Check database admin_settings first, then process.env
  const dbStripeKey = (db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'stripe_secret_key'").get() as any)?.setting_value;
  const apiKey = dbStripeKey || process.env.STRIPE_SECRET_KEY;

  if (!apiKey || apiKey === 'sk_test_placeholder') {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2024-06-20' as any,
  });
}

export const PLAN_PRICING = {
  PRO: {
    name: 'Apex Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 89.99,
    monthlyPriceId: 'price_pro_monthly',
    yearlyPriceId: 'price_pro_yearly',
  },
  ELITE: {
    name: 'Apex Elite',
    monthlyPrice: 19.99,
    yearlyPrice: 179.99,
    monthlyPriceId: 'price_elite_monthly',
    yearlyPriceId: 'price_elite_yearly',
  },
  TRAINER: {
    name: 'Coach & Trainer',
    monthlyPrice: 39.99,
    yearlyPrice: 349.99,
    monthlyPriceId: 'price_trainer_monthly',
    yearlyPriceId: 'price_trainer_yearly',
  },
};

export function getWebhookSecret(): string {
  const dbWebhookKey = (db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'stripe_webhook_secret'").get() as any)?.setting_value;
  return dbWebhookKey || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
}
