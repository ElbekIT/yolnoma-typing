import crypto from 'crypto';

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
    merchant_prepare_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string
  } = req.body || {};

  const secretKey = process.env.CLICK_SECRET_KEY || '';

  // 1. Verify sign string
  // Formula: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
  const mySignString = crypto
    .createHash('md5')
    .update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
    .digest('hex');

  if (String(sign_string).toLowerCase() !== mySignString.toLowerCase()) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: null,
      error: -1,
      error_note: 'SIGN CHECK FAILED'
    });
  }

  // 2. Action verification (1 for Complete)
  if (parseInt(action, 10) !== 1) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: null,
      error: -3,
      error_note: 'Action not found'
    });
  }

  // 3. Handle cancellation (error < 0)
  if (parseInt(error, 10) < 0) {
    return res.status(200).json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: null,
      error: -9,
      error_note: 'Transaction cancelled'
    });
  }

  // 4. Retrieve transaction or parse merchant_trans_id
  const parts = String(merchant_trans_id || '').split('__');
  const userId = (parts[0] || '').trim().toLowerCase();
  const planId = (parts[1] || 'weekly').trim();

  // Duration in ms
  let durationMs = 7 * 24 * 60 * 60 * 1000;
  if (planId === 'daily') durationMs = 24 * 60 * 60 * 1000;
  if (planId === 'yearly') durationMs = 365 * 24 * 60 * 60 * 1000;

  const now = Date.now();
  const expiresAt = now + durationMs;

  try {
    // Save transaction state
    await fetch(`${DB_URL}/click_transactions/${click_trans_id}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'paid',
        paidAt: now
      })
    });

    // Save active user subscription
    const cleanUser = userId.replace(/[.$#[\]/]/g, '_');
    await fetch(`${DB_URL}/user_subscriptions/${cleanUser}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        planId,
        activatedAt: now,
        expiresAt,
        click_trans_id: String(click_trans_id)
      })
    });
  } catch (err) {
    console.warn('Firebase RTDB subscription update error:', err);
  }

  return res.status(200).json({
    click_trans_id,
    merchant_trans_id,
    merchant_confirm_id: click_trans_id,
    error: 0,
    error_note: 'Success'
  });
}
