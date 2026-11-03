const DB_URL = process.env.FIREBASE_DATABASE_URL || 'https://typing-euro-default-rtdb.firebaseio.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryUser = String(req.query.userId || req.query.email || '').trim().toLowerCase();
  if (!queryUser) {
    return res.status(200).json({ active: false });
  }

  // Owner always has lifetime unlimited active subscription
  if (queryUser === 'yuldashivagavharoy@gmail.com' || queryUser.startsWith('yuldashivagavharoy')) {
    return res.status(200).json({
      active: true,
      isOwner: true,
      planId: 'yearly',
      expiresAt: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
      remainingDays: 36500
    });
  }

  try {
    const cleanUser = queryUser.replace(/[.$#[\]/]/g, '_');
    const response = await fetch(`${DB_URL}/user_subscriptions/${cleanUser}.json`);
    if (response.ok) {
      const sub = await response.json();
      if (sub && sub.expiresAt) {
        const now = Date.now();
        const isActive = sub.expiresAt > now;
        return res.status(200).json({
          active: isActive,
          planId: sub.planId,
          expiresAt: sub.expiresAt,
          remainingDays: Math.max(0, Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60 * 24)))
        });
      }
    }
  } catch (err) {
    console.warn('Subscription fetch error:', err);
  }

  return res.status(200).json({ active: false });
}
