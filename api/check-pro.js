import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email fehlt' })

  const { data } = await supabase
    .from('subscribers')
    .select('is_pro')
    .eq('email', email.toLowerCase())
    .single()

  return res.status(200).json({ isPro: data?.is_pro === true })
}
