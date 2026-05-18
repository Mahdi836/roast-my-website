import { useState, useEffect } from 'react'
import Home from './pages/Home'
import RoastResult from './pages/RoastResult'
import Pricing from './pages/Pricing'
import Navbar from './components/Navbar'

export default function App() {
  const [page, setPage] = useState('home')
  const [roastData, setRoastData] = useState(null)
  const [email, setEmail] = useState(() => localStorage.getItem('roast_email') || '')
  const [isPro, setIsPro] = useState(() => localStorage.getItem('roast_pro') === 'true')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pro') === 'true') {
      setIsPro(true)
      localStorage.setItem('roast_pro', 'true')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function navigate(p, data = null) {
    setPage(p)
    if (data) setRoastData(data)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar navigate={navigate} isPro={isPro} />
      {page === 'home' && (
        <Home navigate={navigate} email={email} setEmail={setEmail} isPro={isPro} />
      )}
      {page === 'result' && roastData && (
        <RoastResult result={roastData} navigate={navigate} email={email} isPro={isPro} />
      )}
      {page === 'pricing' && (
        <Pricing navigate={navigate} email={email} />
      )}
    </div>
  )
}
