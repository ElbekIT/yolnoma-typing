const DB_URL = process.env.FIREBASE_DATABASE_URL || 'https://typing-euro-default-rtdb.firebaseio.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    active: true,
    planId: 'free_unlimited',
    expiresAt: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
    remainingDays: 36500,
    isFreePlatform: true
  });
}
