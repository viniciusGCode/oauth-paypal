// api/callback.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getOAuthAccessToken } from '../lib/auth';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { oauth_token, oauth_verifier, secret } = req.query;

  if (!oauth_token || !oauth_verifier || !secret) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const { accessToken, accessSecret, results } = await getOAuthAccessToken(
      oauth_token as string,
      secret as string,
      oauth_verifier as string
    );

    const filePath = path.join(__dirname, 'tokens.json');

    const dataToSave = {
      accessToken,
      accessSecret,
      user: results,
    };

    fs.appendFile(
      filePath,
      JSON.stringify(dataToSave, null, 2) + ',\n\n',
      (err) => {
        if (err) {
          console.error('Erro ao salvar no arquivo:', err);
        } else {
          console.log('Dados salvos com sucesso.');
        }
      }
    );

    res.status(200).json({ accessToken, accessSecret, user: results });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter access token');
  }
}
