import { useState } from 'react'

const EXAMPLES = [
  'apple.com',
  'notion.so',
  'stripe.com',
]

export default function Home({ navigate, email, setEmail, isPro }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showProModal, setShowProModal] = useState(false)

  async function handleRoast(e) {
    e.preventDefault()
    if (!url.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email || undefined }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setShowProModal(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Etwas ist schiefgelaufen.')
        setLoading(false)
        return
      }

      navigate('result', data.result)
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-20 text-center">
      {/* Hero */}
      <div className="mb-6 inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm px-4 py-2 rounded-full">
        🔥 KI-gestützte Website-Analyse
      </div>

      <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
        Deine Website{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          brutal ehrlich
        </span>{' '}
        bewertet
      </h1>

      <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
        Unsere KI analysiert Design, Copy, UX, SEO und Conversion deiner Website —
        ohne Schönreden. Kostenlos. In Sekunden.
      </p>

      {/* URL Form */}
      <form onSubmit={handleRoast} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="deine-website.de"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysiere...
              </span>
            ) : (
              '🔥 Roasten!'
            )}
          </button>
        </div>
        {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
      </form>

      {/* Examples */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-16">
        <span className="text-gray-500 text-sm">Beispiele:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setUrl(ex)}
            className="text-sm text-gray-400 hover:text-orange-400 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-all"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Free tier notice */}
      {!isPro && (
        <p className="text-gray-500 text-sm mb-16">
          Kostenlos: 2 Roasts pro Monat •{' '}
          <button onClick={() => navigate('pricing')} className="text-orange-400 hover:underline">
            Unbegrenzt mit Pro (€8/Monat)
          </button>
        </p>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
        {[
          { icon: '🎨', title: 'Design', desc: 'Erster Eindruck, Farben, Typografie und visuelles Chaos' },
          { icon: '✍️', title: 'Copywriting', desc: 'Sind deine Texte überzeugend oder einschläfernd?' },
          { icon: '🗺️', title: 'UX & Navigation', desc: 'Findet sich ein normaler Mensch zurecht?' },
          { icon: '🔍', title: 'SEO', desc: 'Würde Google dich überhaupt finden?' },
          { icon: '💸', title: 'Conversion', desc: 'Kauft oder bucht jemand nach dem Besuch?' },
          { icon: '⚡', title: 'Sofort', desc: 'Analyse in unter 30 Sekunden. Kein Warten, kein Anmelden.' },
        ].map(f => (
          <div key={f.title} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pro Limit Modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="text-2xl font-bold mb-3">Kostenloses Limit erreicht</h2>
            <p className="text-gray-400 mb-6">
              Du hast deine 2 kostenlosen Roasts aufgebraucht. Upgrade zu Pro für unbegrenzte Analysen.
            </p>
            <button
              onClick={() => { setShowProModal(false); navigate('pricing') }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl text-lg mb-3"
            >
              Pro für €8/Monat →
            </button>
            <button
              onClick={() => setShowProModal(false)}
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
