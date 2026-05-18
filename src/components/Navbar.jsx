export default function Navbar({ navigate, isPro }) {
  return (
    <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
      <button
        onClick={() => navigate('home')}
        className="text-xl font-bold text-white flex items-center gap-2"
      >
        🔥 RoastMyWebsite
      </button>
      <div className="flex items-center gap-4">
        {isPro ? (
          <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-medium">
            ✓ PRO
          </span>
        ) : (
          <button
            onClick={() => navigate('pricing')}
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Upgrade zu Pro
          </button>
        )}
      </div>
    </nav>
  )
}
