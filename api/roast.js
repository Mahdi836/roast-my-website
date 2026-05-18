import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const FREE_LIMIT = 2

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    'unknown'
  )
}

async function fetchWebsiteContent(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RoastBot/1.0)' },
    signal: AbortSignal.timeout(8000),
  })
  const html = await res.text()

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'Kein Titel'
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ||
    'Keine Meta Description'
  const h1s = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map(m => m[1].trim()).slice(0, 3)
  const h2s = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1].trim()).slice(0, 5)
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)

  return { title, description, h1s, h2s, bodyText, url }
}

async function roastWithGemini(content) {
  const prompt = `Du bist ein brutaler aber hilfreicher Website-Kritiker. Analysiere diese Website und gib ein ehrliches, unterhaltsames "Roast" auf Deutsch zurück.

Website URL: ${content.url}
Titel: ${content.title}
Meta Description: ${content.description}
H1 Überschriften: ${content.h1s.join(' | ') || 'keine'}
H2 Überschriften: ${content.h2s.join(' | ') || 'keine'}
Inhalt (Auszug): ${content.bodyText}

Antworte NUR mit diesem JSON-Format (kein Markdown, kein Code-Block, nur reines JSON):
{
  "overallScore": (0-100, wie gut die Website ist),
  "overallVibe": (ein kurzer, bissiger Satz der alles zusammenfasst),
  "categories": [
    {
      "name": "Design",
      "emoji": "🎨",
      "score": (0-100),
      "roast": (lustiger aber ehrlicher Kritik-Satz, max 2 Sätze),
      "fix": (konkrete Verbesserung, max 1 Satz)
    },
    {
      "name": "Copywriting",
      "emoji": "✍️",
      "score": (0-100),
      "roast": (lustiger aber ehrlicher Kritik-Satz),
      "fix": (konkrete Verbesserung)
    },
    {
      "name": "UX & Navigation",
      "emoji": "🗺️",
      "score": (0-100),
      "roast": (lustiger aber ehrlicher Kritik-Satz),
      "fix": (konkrete Verbesserung)
    },
    {
      "name": "SEO",
      "emoji": "🔍",
      "score": (0-100),
      "roast": (lustiger aber ehrlicher Kritik-Satz),
      "fix": (konkrete Verbesserung)
    },
    {
      "name": "Conversion",
      "emoji": "💸",
      "score": (0-100),
      "roast": (lustiger aber ehrlicher Kritik-Satz),
      "fix": (konkrete Verbesserung)
    }
  ]
}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(`Gemini Fehler: ${JSON.stringify(data)}`)

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error(`Keine Gemini Antwort: ${JSON.stringify(data)}`)

  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  return JSON.parse(cleaned)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url, email } = req.body || {}
  if (!url) return res.status(400).json({ error: 'URL fehlt' })

  let parsedUrl
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
  } catch {
    return res.status(400).json({ error: 'Ungültige URL' })
  }

  const ip = getIP(req)

  // Pro-User Check via Email
  let isPro = false
  if (email) {
    const { data: user } = await supabase
      .from('subscribers')
      .select('is_pro')
      .eq('email', email.toLowerCase())
      .single()
    isPro = user?.is_pro === true
  }

  // Free Limit Check
  if (!isPro) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('roasts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', since)

    if (count >= FREE_LIMIT) {
      return res.status(429).json({
        error: 'LIMIT_REACHED',
        message: `Du hast dein kostenloses Limit von ${FREE_LIMIT} Roasts erreicht.`,
      })
    }
  }

  try {
    const content = await fetchWebsiteContent(parsedUrl.href)
    const result = await roastWithGemini(content)

    await supabase.from('roasts').insert({
      ip,
      url: parsedUrl.href,
      result,
      email: email || null,
    })

    return res.status(200).json({ result })
  } catch (err) {
    console.error('Roast error:', err?.message || err)
    return res.status(500).json({ error: err?.message || 'Fehler beim Analysieren der Website' })
  }
}
