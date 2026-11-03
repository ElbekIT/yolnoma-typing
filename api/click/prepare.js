import crypto from 'crypto';

const CLICK_PLAN_PRICES = {
  daily: 10000,
  weekly: 15000,
  yearly: 350000
};

const DB_URL = process.env.FIREBASE_DATABASE_URL || 'https://typing-euro-default-rtdb.firebaseio.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: -3, error_note: 'Method not allowed' });
  }

  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string
  } = req.body || {};

  const secretKey = process.env.CLICK_SECRET_KEY || '';

  // 1. Verify sign string
  // Formula: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
  const mySignString = crypto
    .createHash('md5')
    .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`)
    .digest('hex');

  if (String(sign_string).toLowerCase() !== mySignString.toLowerCase()) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: null,
      error: -1,
      error_note: 'SIGN CHECK FAILED'
    });
  }

  // 2. Action verification (0 for Prepare)
  if (parseInt(action, 10) !== 0) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: null,
      error: -3,
      error_note: 'Action not found'
    });
  }

  // 3. Validate merchant_trans_id
  const parts = String(merchant_trans_id || '').split('__');
  const userId = (parts[0] || '').trim().toLowerCase();
  const planId = (parts[1] || '').trim();

  if (!userId || !planId || !CLICK_PLAN_PRICES[planId]) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: null,
      error: -5,
      error_note: 'User or order does not exist'
    });
  }

  // 4. Validate Amount
  const expectedAmount = CLICK_PLAN_PRICES[planId];
  if (Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: null,
      error: -2,
      error_note: 'Incorrect parameter amount'
    });
  }

  // 5. Generate prepare id & save to Firebase RTDB
  const merchant_prepare_id = `prep_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await fetch(`${DB_URL}/click_transactions/${click_trans_id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        click_trans_id: String(click_trans_id),
        service_id: String(service_id),
        merchant_trans_id: String(merchant_trans_id),
        merchant_prepare_id,
        amount: parseFloat(amount),
        userId,
        planId,
        status: 'prepared',
        createdAt: Date.now()
      })
    });
  } catch (err) {
    console.warn('Firebase RTDB write error:', err);
  }

  return res.status(200).json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id,
    error: 0,
    error_note: 'Success'
  });
}
