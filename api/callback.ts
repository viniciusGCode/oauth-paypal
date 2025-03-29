import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';
import * as cookie from 'cookie';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const oauth_token_secret = cookies.oauth_token_secret;

    if (!oauth_token_secret) {
      return res.status(400).json({ error: 'Token secret não encontrado no cookie' });
    }

    console.log("Token recebido:", {
      oauth_token,
      oauth_verifier,
      oauth_token_secret
    });

    const { accessToken, accessSecret, results } = await getOAuthAccessToken(
      oauth_token as string,
      oauth_token_secret,
      oauth_verifier as string
    );

    // Enviar os dados via POST para o endpoint do Beeceptor
    await axios.post('https://oauth-twitter.free.beeceptor.com', {
      accessToken,
      accessSecret,
      user: results,
    });

    res.status(200).json({ accessToken, accessSecret, user: results });
  } catch (err: any) {
    console.error('Erro ao obter access token ou enviar para webhook:', err?.message || err);
    res.status(500).send('Erro ao obter access token');
  }
}
