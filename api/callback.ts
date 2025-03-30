// api/callback.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Location');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // ✅ Trata requisição GET (redirecionamento do Twitter)
  if (req.method === 'GET') {
    const { oauth_token, oauth_verifier } = req.query;

    // HTML simples de confirmação
    return res.send(`
      <html>
        <head>
          <title>Login com Twitter</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: #f0f8ff;
              color: #333;
              text-align: center;
            }
            .box {
              background: white;
              padding: 2em;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>✅ Login com Twitter concluído!</h2>
            <p>Você pode fechar esta aba e voltar ao jogo.</p>
          </div>
        </body>
      </html>
    `);
  }

  // ✅ Trata requisição POST com dados do frontend
  if (req.method === 'POST') {
    const { oauth_token, oauth_verifier, oauth_token_secret } = req.body;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
      return res.status(400).json({ error: 'Parâmetros ausentes' });
    }

    try {
      const { accessToken, accessSecret, results } = await getOAuthAccessToken(
        oauth_token,
        oauth_token_secret,
        oauth_verifier
      );

      // Envia ao webhook do Beeceptor
      await axios.post('https://ouauth-twitter.free.beeceptor.com', {
        accessToken,
        accessSecret,
        user: results,
      });

      return res.status(200).json({ accessToken, accessSecret, user: results });
    } catch (err: any) {
      console.error('Erro no callback:', err?.message || err);
      return res.status(500).json({ error: 'Erro ao obter access token' });
    }
  }

  // ❌ Qualquer outro método não é permitido
  return res.status(405).json({ error: 'Método não permitido' });
}
