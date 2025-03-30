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
          <div class="box" id="status">
            <h2>Finalizando login com Twitter...</h2>
            <p>Por favor, aguarde...</p>
          </div>
  
          <script>
            (async () => {
              const oauth_token = "${oauth_token}";
              const oauth_verifier = "${oauth_verifier}";
              const oauth_token_secret = localStorage.getItem("oauth_token_secret");
  
              if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
                console.log(oauth_token, oauth_verifier, oauth_token_secret)
                document.getElementById("status").innerHTML = "<h3>Erro: dados incompletos.</h3>";
                return;
              }
  
              try {
                const response = await fetch("/api/callback", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    oauth_token,
                    oauth_verifier,
                    oauth_token_secret
                  })
                });
  
                const result = await response.json();
  
                if (response.ok) {
                  document.getElementById("status").innerHTML = \`
                    <h2>✅ Login com Twitter concluído!</h2>
                    <p>Usuário: @\${result.user?.screen_name}</p>
                    <p>Agora você pode fechar esta aba.</p>
                  \`;
                } else {
                  document.getElementById("status").innerHTML = "<h3>Erro ao autenticar com o Twitter.</h3>";
                }
              } catch (e) {
                document.getElementById("status").innerHTML = "<h3>Erro de rede.</h3>";
                console.error(e);
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
