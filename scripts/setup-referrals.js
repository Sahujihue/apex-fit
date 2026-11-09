const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'apexfit.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'converted',
    plan_tier TEXT DEFAULT 'PRO',
    commission_amount REAL DEFAULT 2.00,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const count = db.prepare('SELECT COUNT(*) as c FROM referrals').get().c;
if (count === 0) {
  const insert = db.prepare('INSERT INTO referrals (id, referrer_id, referral_code, status, plan_tier, commission_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insert.run('ref-1', 'user-athlete-1', 'ALEX-VIP', 'converted', 'PRO', 2.00, '2026-11-01');
  insert.run('ref-2', 'user-athlete-1', 'ALEX-VIP', 'converted', 'ELITE', 4.00, '2026-11-04');
  insert.run('ref-3', 'user-athlete-1', 'ALEX-VIP', 'pending', 'PRO', 2.00, '2026-11-07');
}

console.log('Referrals table ready. Rows:', db.prepare('SELECT COUNT(*) as c FROM referrals').get().c);
