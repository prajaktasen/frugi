import { useState } from 'react'
import './index.css'
import { AppProvider, useApp } from './AppContext'
import Splash from './components/Splash'
import BottomNav from './components/BottomNav'
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
