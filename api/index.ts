// api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthRequestToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Location');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const { oauth_token, oauth_token_secret } = await getOAuthRequestToken();

    const authURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;

    res.status(200).json({ url: authURL, oauth_token_secret });
  } catch (err: any) {
    console.error('Erro ao iniciar autenticação:', err?.message || err);
    res.status(500).json({ error: 'Erro ao iniciar autenticação' });
  }
}
