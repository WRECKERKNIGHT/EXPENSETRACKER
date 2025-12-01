import fetch from 'node-fetch';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

export const createPlaidLinkToken = async (userId: string) => {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in env');
  }

  // This is a minimal scaffold that shows the shape of the request.
  // In production, use the official Plaid SDK and securely store credentials.
  const url = `https://sandbox.plaid.com/link/token/create`;
  const body = {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    client_name: 'SpendSmart',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
    user: { client_user_id: userId }
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error_message || 'Plaid create link token failed');
  return data;
};

export const exchangePlaidPublicToken = async (userId: string, publicToken: string) => {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in env');
  }

  const url = `https://sandbox.plaid.com/item/public_token/exchange`;
  const body = {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    public_token: publicToken
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error_message || 'Plaid exchange failed');
  // data contains access_token, item_id
  return data;
};

export default {};
