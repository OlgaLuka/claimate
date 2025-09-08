import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { user_id } = req.body || {}
  if(!user_id) return res.status(400).json({error:'Missing user_id'})
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  const { data: acc } = await supa.from('connected_accounts').select('access_token').eq('user_id', user_id).eq('provider','stripe').single()
  if(!acc) return res.status(403).json({error:'Stripe not connected'})

  const r = await fetch('https://api.stripe.com/v1/disputes?limit=50', { headers:{Authorization:`Bearer ${acc.access_token}`} })
  const payload = await r.json()
  for(const d of (payload.data ?? [])){
    await supa.from('disputes').upsert({
      user_id, provider:'stripe', provider_dispute_id:d.id,
      amount_cents:d.amount, currency:d.currency, reason:d.reason,
      network_reason_code: d.network_reason_code ?? null,
      status:d.status,
      evidence_due_at: d.evidence_details?.due_by ? new Date(d.evidence_details.due_by*1000) : null,
      raw:d
    }, { onConflict:'provider,provider_dispute_id' })
  }
  res.status(200).json({ ok:true, count: payload.data?.length ?? 0 })
}
