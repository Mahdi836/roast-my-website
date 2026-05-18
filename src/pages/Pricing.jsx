import { useState } from 'react'

export default function Pricing({ navigate, email: savedEmail }) {
  const [email, setEmail] = useState(savedEmail || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Checkout konnte nicht gestartet werden.')
      }
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Einfache Preise
      </h1>
      <p className="text-gray-400 text-lg mb-16">Kein Bullshit, keine versteckten Kosten.</p>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
        {/* Free */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-8 text-left">
          <h2 className="text-xl font-bold mb-2">Kostenlos</h2>
          <div className="text-4xl font-bold mb-6">€0</div>
          <ul className="space-y-3 text-gray-300">
            {[
              '2 Roasts pro Monat',
              '5 Analysekategorien',
              'Konkrete Verbesserungsvorschläge',
              'Kein Account nötig',
            ].map(f => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('home')}
            className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium transition-all"
          >
            Kostenlos starten
          </button>
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-b from-orange-500/10 to-red-500/5 border border-orange-500/30 rounded-2xl p-8 text-left relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            BELIEBT
          </div>
          <h2 className="text-xl font-bold mb-2">Pro</h2>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold">€8</span>
            <span className="text-gray-400">/Monat</span>
          </div>
          <ul className="space-y-3 text-gray-300">
            {[
              'Unbegrenzte Roasts',
              '5 Analysekategorien',
              'Konkrete Verbesserungsvorschläge',
              'Priorisierte Analyse',
              'Jederzeit kündbar',
            ].map(f => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">✓</span> {f}
              </li>
            ))}
          </ul>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="deine@email.de (optional)"
            className="mt-8 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 text-sm mb-3"
          />
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all text-lg"
          >
            {loading ? 'Weiterleiten...' : '🔥 Pro holen →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <p className="text-gray-500 text-xs mt-3 text-center">Sichere Zahlung via Stripe</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-lg mx-auto text-left space-y-6">
        <h2 className="text-2xl font-bold text-center mb-8">Häufige Fragen</h2>
        {[
          { q: 'Kann ich jederzeit kündigen?', a: 'Ja, ohne Frist. Du kannst direkt im Stripe-Kundenportal kündigen.' },
          { q: 'Welche Websites können analysiert werden?', a: 'Jede öffentlich erreichbare Website. Nicht-öffentliche Seiten (localhost, passwortgeschützt) funktionieren nicht.' },
          { q: 'Wie genau ist die Analyse?', a: 'Unsere KI analysiert den HTML-Inhalt, Texte und Struktur. Je mehr Inhalt deine Website hat, desto genauer.' },
        ].map(item => (
          <div key={item.q} className="border-b border-white/10 pb-6">
            <h3 className="font-semibold text-white mb-2">{item.q}</h3>
            <p className="text-gray-400 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
