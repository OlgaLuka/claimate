import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method!=='POST') return res.status(405).end()
  const { user_id, shop_domain, order_id } = req.body || {}
  if (!user_id || !shop_domain || !order_id) return res.status(400).json({ error:'Missing params' })

  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  const { data: acc } = await supa.from('connected_accounts')
    .select('access_token').eq('user_id', user_id).eq('provider','shopify')
    .eq('external_account_id', shop_domain).single()
  if (!acc) return res.status(403).json({ error:'Shopify not connected' })

  const base = `https://${shop_domain}/admin/api/2025-07`
  const o = await fetch(`${base}/orders/${order_id}.json`, { headers:{'X-Shopify-Access-Token': acc.access_token} }).then(r=>r.json())
  const f = await fetch(`${base}/orders/${order_id}/fulfillments.json`, { headers:{'X-Shopify-Access-Token': acc.access_token} }).then(r=>r.json())

  await supa.from('shopify_orders').upsert({
    user_id, shop_domain, order_id: String(order_id),
    name: o.order?.name ?? null,
    email: o.order?.email ?? null,
    total_price_cents: o.order ? Math.round(Number(o.order.total_price)*100) : null,
    currency: o.order?.currency ?? null,
    shipping_address: o.order?.shipping_address ?? null,
    line_items: o.order?.line_items ?? null,
    raw: o
  }, { onConflict:'shop_domain,order_id' })

  for(const ff of (f.fulfillments ?? [])){
    await supa.from('shopify_fulfillments').insert({
      user_id, shop_domain, order_id: String(order_id),
      tracking_number: ff.tracking_number,
      tracking_company: ff.tracking_company,
      tracking_urls: ff.tracking_urls ?? [],
      raw: ff
    })
  }
  res.status(200).json({ ok:true })
}
