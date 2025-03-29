// api/callback.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { oauth_token, oauth_verifier, secret } = req.query;

  if (!oauth_token || !oauth_verifier || !secret) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const { accessToken, accessSecret, results } = await getOAuthAccessToken(
      oauth_token as string,
      secret as string,
      oauth_verifier as string
    );

    res.status(200).json({ accessToken, accessSecret, user: results });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter access token');
  }
}
