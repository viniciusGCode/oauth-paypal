import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_REDIRECT_URI } =
  process.env;

const PAYPAL_BASE = 'https://www.sandbox.paypal.com';
const API_BASE = 'https://api-m.sandbox.paypal.com';

export const getPayPalAuthURL = (): string => {
  const params = new URLSearchParams({
    client_id: PAYPAL_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: PAYPAL_REDIRECT_URI!,
    scope: 'openid profile email',
  });

  return `${PAYPAL_BASE}/signin/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {
  const creds = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    `${API_BASE}/v1/oauth2/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: PAYPAL_REDIRECT_URI!,
    }),
    {
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return res.data;
};

export const getUserInfo = async (accessToken: string) => {
  const res = await axios.get(
    `${API_BASE}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};
