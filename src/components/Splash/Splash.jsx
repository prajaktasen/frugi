import { useEffect, useState } from 'react'
import FrogLogo from '../FrogLogo.jsx'
import './Splash.css'

export default function Splash({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1700)
    const t2 = setTimeout(() => onDone(), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`splash ${exiting ? 'splash--exit' : ''}`}>
      <div className="splash-content">
        <FrogLogo size={110} className="splash-frog" />
        <h1 className="splash-name">frugi</h1>
        <p className="splash-tagline">smart grocery shopping</p>
      </div>
    </div>
  )
}
