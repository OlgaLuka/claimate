import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, state } = req.query;
  if (!shop || !state) return res.status(400).send('Missing shop/state');
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set('client_id', process.env.SHOPIFY_API_KEY!);
  url.searchParams.set('scope', 'read_orders,read_customers');
  url.searchParams.set('redirect_uri', `${process.env.APP_URL}/api/shopify/callback`);
  url.searchParams.set('state', String(state));
  res.redirect(302, url.toString());
}
