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
    const { oauth_token, oauth_verifier, secret } = req.query;

    // Renderiza o HTML com script que envia o POST
    return res.send(`
      <html>
        <head><title>Login com Twitter</title></head>
        <body>
          <div id="status">Finalizando login...</div>
          <script>
            (async () => {
              const response = await fetch("/api/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  oauth_token: "${oauth_token}",
                  oauth_verifier: "${oauth_verifier}",
                  oauth_token_secret: "${secret}"
                })
              });
  
              const result = await response.json();
  
              if (response.ok) {
                document.getElementById("status").innerHTML = "<h2>✅ Login concluído!</h2><p>Você pode fechar esta aba.</p>";
              } else {
                document.getElementById("status").innerText = "Erro ao autenticar com o Twitter.";
              }
            })();
          </script>
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
      await axios.post('https://uxl6sixhbbddnl9v.free.beeceptor.com', {
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
