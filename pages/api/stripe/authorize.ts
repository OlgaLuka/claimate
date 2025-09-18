import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = process.env.STRIPE_CLIENT_ID!; // ca_...
  const state = String(req.query.state || "");
  if (!client || !state) return res.status(400).json({ error: "Missing STRIPE_CLIENT_ID or state" });

  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host  = req.headers.host!;
  const base  = `${proto}://${host}`;
  const redirectUri = `${base}/api/stripe/callback`;

  const qs = new URLSearchParams({
    response_type: "code",
    client_id: client,
    scope: "read_write",                // ← тут жорстко read_write
    redirect_uri: redirectUri,
    state,
  });

  if (req.query.dry === "1") {
    return res.json({ connect_authorize: `https://connect.stripe.com/oauth/authorize?${qs}` });
  }

  res.redirect(302, `https://connect.stripe.com/oauth/authorize?${qs}`);
}
