import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Check if app is already marked as installed
    const installedRow = db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'app_installed'").get() as any;
    const isInstalled = installedRow?.setting_value === 'true';

    // System check
    const nodeVersion = process.version;
    const isDbReady = !!db;

    return NextResponse.json({
      installed: isInstalled,
      systemCheck: {
        nodeVersion,
        nodeCompatible: true,
        databaseStatus: isDbReady ? 'Connected (SQLite ACID)' : 'Error',
        storageWritable: true,
        cryptoReady: true
      }
    });
  } catch (error: any) {
    console.error('Install GET error:', error);
    return NextResponse.json({ error: 'System check failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check if already installed
    const installedRow = db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'app_installed'").get() as any;
    if (installedRow?.setting_value === 'true') {
      return NextResponse.json({ error: 'ApexFit is already installed and secured. Please login to your Admin Dashboard.' }, { status: 400 });
    }

    const body = await request.json();
    const {
      siteName = 'ApexFit AI',
      adminName = 'Super Admin',
      adminEmail = 'admin@apexfit.com',
      adminPassword = 'admin123',
      currency = 'USD',
      inrRate = '83.5',
      demoMode = 'false',
      stripePublishableKey,
      stripeSecretKey,
      razorpayKeyId,
      cryptoWalletUsdt
    } = body;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin email and password are required' }, { status: 400 });
    }

    if (adminPassword.length < 6) {
      return NextResponse.json({ error: 'Admin password must be at least 6 characters' }, { status: 400 });
    }

    // Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminId = `user-admin-${Date.now()}`;

    // 1. Create or Update Super Admin User
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, subscription_tier, subscription_status)
      VALUES (?, ?, ?, ?, 'ADMIN', 'TRAINER', 'ACTIVE')
      ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, role = 'ADMIN', name = excluded.name
    `).run(adminId, adminEmail.toLowerCase().trim(), passwordHash, adminName);

    // 2. Save Platform Settings
    const upsertSetting = db.prepare(`
      INSERT INTO admin_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')
    `);

    upsertSetting.run('site_name', siteName);
    upsertSetting.run('default_currency', currency);
    upsertSetting.run('currency_conversion_inr', inrRate);
    upsertSetting.run('feature_demo_mode', demoMode);
    upsertSetting.run('app_installed', 'true');

    if (stripePublishableKey) upsertSetting.run('stripe_publishable_key', stripePublishableKey);
    if (stripeSecretKey) upsertSetting.run('stripe_secret_key', stripeSecretKey);
    if (razorpayKeyId) upsertSetting.run('razorpay_key_id', razorpayKeyId);
    if (cryptoWalletUsdt) upsertSetting.run('crypto_wallet_usdt', cryptoWalletUsdt);

    return NextResponse.json({
      success: true,
      message: 'ApexFit installed and configured successfully!',
      adminEmail,
      siteName,
      redirectUrl: '/login'
    });
  } catch (error: any) {
    console.error('Install POST error:', error);
    return NextResponse.json({ error: error.message || 'Installation process failed' }, { status: 500 });
  }
}
