import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [list, setList] = useState([]) // user's grocery list items
  const [priceResults, setPriceResults] = useState(null) // { items: [], stores: [] }
  const [cart, setCart] = useState([]) // { name, price, store, amount }
  const [zipcode, setZipcode] = useState('98052')
  const [activeTab, setActiveTab] = useState('list')

  const addToList = (item) => {
    if (!item.trim()) return
    setList(prev => [...prev, item.trim()])
  }

  const removeFromList = (i) => {
    setList(prev => prev.filter((_, idx) => idx !== i))
  }

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.name.toLowerCase() === item.name.toLowerCase())
      if (exists) return prev
      return [...prev, item]
    })
  }

  // Replace the store/price for an existing cart item (used when switching stores in breakdown)
  const updateCartItem = (name, updates) => {
    setCart(prev => prev.map(c =>
      c.name.toLowerCase() === name.toLowerCase() ? { ...c, ...updates } : c
    ))
  }

  const removeFromCart = (name) => {
    setCart(prev => prev.filter(c => c.name !== name))
  }

  const clearCart = () => setCart([])

  return (
    <AppContext.Provider value={{
      list, setList, addToList, removeFromList,
      priceResults, setPriceResults,
      cart, addToCart, updateCartItem, removeFromCart, clearCart,
      zipcode, setZipcode,
      activeTab, setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
