import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/?pro=true&email={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { source: 'roast-my-website' },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Checkout konnte nicht erstellt werden' })
  }
}
