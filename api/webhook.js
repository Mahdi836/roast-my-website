import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Webhook signature ungültig')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email = session.customer_details?.email
    if (email) {
      await supabase.from('subscribers').upsert(
        { email: email.toLowerCase(), is_pro: true, stripe_customer_id: session.customer },
        { onConflict: 'email' }
      )
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const customer = await stripe.customers.retrieve(sub.customer)
    if (customer.email) {
      await supabase
        .from('subscribers')
        .update({ is_pro: false })
        .eq('email', customer.email.toLowerCase())
    }
  }

  return res.status(200).json({ received: true })
}
