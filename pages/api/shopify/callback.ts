import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function validHmac(q:any){
  const { hmac, ...rest } = q;
  const msg = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const digest = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET!).update(msg).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac as string,'utf-8'), Buffer.from(digest,'utf-8'));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { code, shop, state, hmac } = req.query
  if (!code || !shop || !state || !hmac) return res.status(400).send('Missing params')
  if (!validHmac(req.query)) return res.status(403).send('Bad HMAC')

  const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ client_id: process.env.SHOPIFY_API_KEY!, client_secret: process.env.SHOPIFY_API_SECRET!, code })
  })
  const tok = await r.json()
  if (!tok.access_token) return res.status(400).json(tok)

  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  const { error } = await supa.from('connected_accounts').upsert({
    user_id: String(state),
    provider: 'shopify',
    external_account_id: String(shop),
    access_token: tok.access_token,
    scope: tok.scope
  }, { onConflict: 'provider,external_account_id,user_id' })
  if (error) return res.status(500).json({ error })

  res.redirect(302, `${process.env.APP_URL}/`)
}
