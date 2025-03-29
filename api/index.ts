
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthRequestToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { oauth_token, oauth_token_secret } = await getOAuthRequestToken();

    const encodedSecret = Buffer.from(oauth_token_secret).toString('base64');

    const authURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}&state=${encodedSecret}`;

    res.redirect(authURL);
  } catch (err: any) {
    console.error('Erro ao iniciar autenticação:', err?.message || err);
    res.status(500).send('Erro ao iniciar autenticação');
  }
}
