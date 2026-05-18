function ScoreBar({ score }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-bold w-10 text-right" style={{
        color: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'
      }}>
        {score}
      </span>
    </div>
  )
}

function RoastCard({ category }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.emoji}</span>
          <h3 className="font-semibold text-white text-lg">{category.name}</h3>
        </div>
      </div>
      <ScoreBar score={category.score} />
      <p className="text-gray-300 mt-4 italic">"{category.roast}"</p>
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-sm text-gray-400">
          <span className="text-green-400 font-medium">✓ Fix: </span>
          {category.fix}
        </p>
      </div>
    </div>
  )
}

export default function RoastResult({ result, navigate, isPro }) {
  const avg = result.overallScore
  const color = avg >= 70 ? 'text-green-400' : avg >= 40 ? 'text-yellow-400' : 'text-red-400'

  async function handleShare() {
    const text = `Meine Website hat ${result.overallScore}/100 bei RoastMyWebsite bekommen 🔥\n"${result.overallVibe}"\n\nKostenlos testen:`
    if (navigator.share) {
      navigator.share({ title: 'RoastMyWebsite', text, url: window.location.origin })
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`)
      alert('Link kopiert!')
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Overall Score */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-orange-500/30 bg-orange-500/5 mb-6">
          <span className={`text-5xl font-bold ${color}`}>{avg}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          "{result.overallVibe}"
        </h1>
        <p className="text-gray-400">Gesamtbewertung deiner Website</p>
      </div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {result.categories?.map(cat => (
          <RoastCard key={cat.name} category={cat} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('home')}
          className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold transition-all"
        >
          ← Neue URL testen
        </button>
        <button
          onClick={handleShare}
          className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold transition-all"
        >
          🔗 Teilen
        </button>
        {!isPro && (
          <button
            onClick={() => navigate('pricing')}
            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-8 py-4 rounded-xl font-bold transition-all"
          >
            🔥 Pro für €8/Monat
          </button>
        )}
      </div>
    </main>
  )
}
