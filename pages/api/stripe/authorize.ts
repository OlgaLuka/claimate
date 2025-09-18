import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  const app = process.env.APP_URL!;
  const client = process.env.STRIPE_CLIENT_ID!; // server env
  const state = String(req.query.state || '');
  const redirect = encodeURIComponent(`${app}/api/stripe/callback`);
  const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${client}&scope=read_only&redirect_uri=${redirect}&state=${state}`;
  res.redirect(302, url);
}
