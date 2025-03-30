import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPayPalAuthURL } from '../lib/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Location');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = getPayPalAuthURL();
  res.status(200).json({ url });
}
