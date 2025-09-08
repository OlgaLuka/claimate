import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
export const config = { api: { bodyParser: false } }
function buffer(req:any){ return new Promise<Buffer>((resolve,reject)=>{ const c:Buffer[]=[]; req.on('data',(x:Buffer)=>c.push(x)); req.on('end',()=>resolve(Buffer.concat(c))); req.on('error',reject); }); }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const sig = req.headers['stripe-signature'] as string
  const buf = await buffer(req)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:'2024-06-20' })
  let ev: Stripe.Event
  try{ ev = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!) }catch(e:any){ return res.status(400).send(`Webhook Error: ${e.message}`) }
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)
  if (ev.type.startsWith('charge.dispute.')){
    const d = ev.data.object as Stripe.Dispute
    await supa.from('disputes').upsert({
      provider:'stripe', provider_dispute_id:d.id,
      status:d.status, amount_cents:d.amount, currency:d.currency,
      reason:d.reason, network_reason_code:(d as any).network_reason_code ?? null,
      evidence_due_at: d.evidence_details?.due_by ? new Date(d.evidence_details.due_by*1000) : null,
      raw:d
    }, { onConflict:'provider,provider_dispute_id' })
  }
  res.json({received:true})
}
