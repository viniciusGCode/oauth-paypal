// api/callback.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { oauth_token, oauth_verifier, state } = req.query;

  if (!oauth_token || !oauth_verifier || !state) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const oauth_token_secret = Buffer.from(state as string, 'base64').toString();

    const { accessToken, accessSecret, results } = await getOAuthAccessToken(
      oauth_token as string,
      oauth_token_secret,
      oauth_verifier as string
    );

    res.status(200).json({ accessToken, accessSecret, user: results });
  } catch (err) {
    console.error('Erro no callback:', err);
    res.status(500).send('Erro ao obter access token');
  }
}
