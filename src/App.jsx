import { useState } from 'react'
import Nav from './components/Nav/Nav.jsx'
import Search from './components/Search/Search.jsx'
import Recipes from './components/Recipes/Recipes.jsx'
import Cart from './components/Cart/Cart.jsx'
import Deals from './components/Deals/Deals.jsx'
import Splash from './components/Splash/Splash.jsx'
import './App.css'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('search')
  const [cartItems, setCartItems] = useState([])

  function addToCart(item) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, qty) {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i))
    }
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="app">
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <Nav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cartCount} />
      <main className="app-main">
        {activeTab === 'search'  && <Search  onAddToCart={addToCart} />}
        {activeTab === 'recipes' && <Recipes onAddToCart={addToCart} />}
        {activeTab === 'cart'    && <Cart    cartItems={cartItems} onUpdateQty={updateQty} onClearCart={clearCart} />}
        {activeTab === 'deals'   && <Deals   onAddToCart={addToCart} />}
      </main>
    </div>
  )
}
