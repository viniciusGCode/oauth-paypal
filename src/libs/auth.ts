import { OAuth } from 'oauth';
import dotenv from 'dotenv';
dotenv.config();

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  CALLBACK_URL,
} = process.env;

const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  CONSUMER_KEY!,
  CONSUMER_SECRET!,
  '1.0A',
  CALLBACK_URL!,
  'HMAC-SHA1'
);

export const getOAuthRequestToken = (): Promise<{ oauth_token: string; oauth_token_secret: string }> => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken((err, oauth_token, oauth_token_secret) => {
      if (err) return reject(err);
      resolve({ oauth_token, oauth_token_secret });
    });
  });
};

export const getOAuthAccessToken = (
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier,
      (err, accessToken, accessSecret, results) => {
        if (err) return reject(err);
        resolve({ accessToken, accessSecret, results });
      }
    );
  });
};
