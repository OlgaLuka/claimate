import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state' })

  const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      client_secret: process.env.STRIPE_SECRET_KEY!,
    }),
  })
  const tok = await tokenRes.json()
  if (!tok.access_token) return res.status(400).json({ error: 'OAuth failed', details: tok })

  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  const { error } = await supa.from('connected_accounts').upsert({
    user_id: String(state),
    provider: 'stripe',
    external_account_id: tok.stripe_user_id,
    access_token: tok.access_token,
    scope: tok.scope
  }, { onConflict: 'provider,external_account_id,user_id' })
  if (error) return res.status(500).json({ error })

  res.redirect(302, `${process.env.APP_URL}/`)
}
