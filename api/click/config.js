// Vercel Serverless Function: /api/click/config

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    service_id: process.env.CLICK_SERVICE_ID || '38827',
    merchant_id: process.env.CLICK_MERCHANT_ID || '29603'
  });
}
