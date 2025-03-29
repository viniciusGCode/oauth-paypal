import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';
import cookie from 'cookie';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    // Pega o cookie
    const cookies = cookie.parse(req.headers.cookie || '');
    const oauth_token_secret = cookies.oauth_token_secret;

    if (!oauth_token_secret) {
      return res.status(400).json({ error: 'Token secret não encontrado no cookie' });
    }

    const { accessToken, accessSecret, results } = await getOAuthAccessToken(
      oauth_token as string,
      oauth_token_secret,
      oauth_verifier as string
    );

    res.status(200).json({ accessToken, accessSecret, user: results });
  } catch (err) {
    console.error('Erro ao obter access token:', err);
    res.status(500).send('Erro ao obter access token');
  }
}
