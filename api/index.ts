import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthRequestToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { oauth_token, oauth_token_secret } = await getOAuthRequestToken();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Location');
    res.setHeader(
      'Set-Cookie',
      `oauth_token_secret=${oauth_token_secret}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    const authURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
    res.redirect(authURL);
  } catch (err: any) {
    console.error('Erro ao iniciar autenticação:', err?.message || err);
    res.status(500).send('Erro ao iniciar autenticação');
  }
}
