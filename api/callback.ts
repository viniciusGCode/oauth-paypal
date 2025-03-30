import { VercelRequest, VercelResponse } from '@vercel/node';
import { exchangeCodeForToken, getUserInfo } from '../lib/auth';
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

  if (req.method === 'GET') {
    const { code } = req.query;

    return res.send(`
      <html>
        <head><title>Login com PayPal</title></head>
        <body>
          <div id="status">Finalizando login...</div>
          <script>
            (async () => {
              const response = await fetch("/api/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: "${code}"
                })
              });

              const result = await response.json();

              if (response.ok) {
                document.getElementById("status").innerHTML = "<h2>✅ Login concluído!</h2><p>Você pode fechar esta aba.</p>";
              } else {
                document.getElementById("status").innerText = "Erro ao autenticar com o PayPal.";
              }
            })();
          </script>
        </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Parâmetros ausentes' });
    }

    try {
      const token = await exchangeCodeForToken(code);
      const user = await getUserInfo(token.access_token);

      await axios.post('https://uxl6sixhbbddnl9v.free.beeceptor.com', {
        accessToken: token.access_token,
        user,
      });

      return res.status(200).json({ accessToken: token.access_token, user });
    } catch (err: any) {
      console.error(err?.message || err);
      return res.status(500).json({ error: 'Erro ao obter access token' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
