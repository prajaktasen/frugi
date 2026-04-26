import { useState } from 'react'
import './index.css'
import { AppProvider, useApp } from './AppContext'
import Splash from './components/Splash'
import BottomNav from './components/BottomNav'
import FrogLogo from './components/FrogLogo'
import ListScreen from './screens/ListScreen'
import MapScreen from './screens/MapScreen'
import CartScreen from './screens/CartScreen'
import MealsScreen from './screens/MealsScreen'

function AppShell() {
  const { activeTab } = useApp()
  const screens = {
    list: <ListScreen />,
    map: <MapScreen />,
    cart: <CartScreen />,
    meals: <MealsScreen />
  }
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: 'var(--green)',
        flexShrink: 0,
      }}>
        <FrogLogo size={26} />
        <span style={{
          fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700,
          color: '#fff', letterSpacing: '-0.5px', lineHeight: 1,
        }}>frugi</span>
      </div>
      {screens[activeTab]}
      <BottomNav />
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  return (
    <AppProvider>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <AppShell />
    </AppProvider>
  )
}
