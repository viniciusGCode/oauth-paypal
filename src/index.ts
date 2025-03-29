import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthRequestToken } from './lib/auth';


export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { oauth_token, oauth_token_secret } = await getOAuthRequestToken();

    const authURL = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}&secret=${oauth_token_secret}`;

    res.redirect(authURL);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao iniciar autenticação');
  }
}
