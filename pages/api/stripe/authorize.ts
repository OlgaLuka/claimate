// pages/api/stripe/authorize.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const app = process.env.APP_URL!;            // напр. https://claimate.vercel.app
  const client = process.env.STRIPE_CLIENT_ID!; // формат ca_...
  const state = String(req.query.state || "");
  if (!app || !client || !state) {
    return res.status(400).json({ error: "Missing APP_URL, STRIPE_CLIENT_ID or state" });
  }
  const redirect = encodeURIComponent(`${app}/api/stripe/callback`);
  const url =
    `https://connect.stripe.com/oauth/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(client)}` +
    `&scope=read_only` +
    `&redirect_uri=${redirect}` +
    `&state=${encodeURIComponent(state)}`;
  res.redirect(302, url);
}
