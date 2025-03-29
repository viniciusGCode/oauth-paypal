import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthRequestToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { oauth_token, oauth_token_secret } = await getOAuthRequestToken();

    // Salva o oauth_token_secret em cookie
    res.setHeader('Set-Cookie', `oauth_token_secret=${oauth_token_secret}; Path=/; HttpOnly; Secure; SameSite=Lax`);

    // Redireciona pro Twitter
    const authURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
    res.redirect(authURL);
  } catch (err: any) {
    console.error('Erro ao iniciar autenticação:', err?.message || err);
    res.status(500).send('Erro ao iniciar autenticação');
  }
}
