import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { calculateTripOptions } from '../api/prices'

export default function CartScreen() {
  const { cart, addToCart, removeFromCart, clearCart, priceResults, setActiveTab } = useApp()
  const [view, setView] = useState('cart')
  const [tripOptions, setTripOptions] = useState([])

  useEffect(() => {
    if (priceResults) setTripOptions(calculateTripOptions(priceResults))
  }, [priceResults])

  const cartTotal = cart.reduce((s, i) => s + (i.price || 0), 0)

  // Apply a trip plan: clear cart and fill it from the plan's stop list
  const selectPlan = (opt) => {
    clearCart()
    if (opt.stops) {
      opt.stops.forEach(({ item, store, price }) => {
        if (price != null) addToCart({ name: item, price, store })
      })
    }
    setView('cart')
  }

  if (cart.length === 0) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🛍️</div>
          <div style={{ fontSize: 14 }}>Your cart is empty</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add items from prices or recipes</div>
          <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '10px 24px' }} onClick={() => setActiveTab('list')}>
            Start a list →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingBottom: 72 }}>
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="screen-title">My cart</div>
          <div className="screen-sub">{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={clearCart} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
          Clear all
        </button>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', padding: '8px 18px', gap: 8, borderBottom: '1px solid var(--border)' }}>
        {['cart', 'optimize'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: view === v ? 'var(--green)' : 'var(--bg)',
            color: view === v ? '#fff' : 'var(--text-3)',
            fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.15s',
          }}>
            {v === 'cart' ? '🛒 Cart' : '✨ Trip optimizer'}
          </button>
        ))}
      </div>

      {view === 'cart' ? (
        <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '4px 12px', marginBottom: 16 }}>
            {cart.map((item, i) => (
              <div key={i} className="row-item">
                <div className="row-item-left">
                  <span className="row-item-name">{item.name}</span>
                  <span className="row-item-sub">
                    {item.store === 'TBD' ? 'store TBD' : item.store}
                    {item.amount ? ` · ${item.amount}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--green-dark)' }}>
                    {item.price ? `$${item.price.toFixed(2)}` : '—'}
                  </span>
                  <button onClick={() => removeFromCart(item.name)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--green-dark)' }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {tripOptions.length > 0 && (
            <button className="btn-primary" onClick={() => setView('optimize')}>
              Compare trip options →
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
          {tripOptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 13 }}>Find prices first to compare trip options</div>
              <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => setActiveTab('list')}>
                Go to list →
              </button>
            </div>
          ) : (
            <>
              <div className="section-label">how do you want to shop?</div>
              {tripOptions.map((opt) => (
                <div key={opt.id} style={{
                  border: opt.recommended ? '2px solid var(--green)' : '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 16px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {opt.recommended && <span style={{ color: 'var(--green)', marginRight: 4 }}>★</span>}
                      {opt.title}
                    </span>
                    {opt.savings > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, background: 'var(--green-light)', padding: '2px 8px', borderRadius: 20 }}>
                        save ${opt.savings.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.6 }}>
                    {opt.subtitle}
                  </div>

                  {opt.stops && (
                    <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 10 }}>
                      {(() => {
                        const byStore = {}
                        opt.stops.forEach(s => {
                          if (!byStore[s.store]) byStore[s.store] = []
                          byStore[s.store].push(s.item)
                        })
                        return Object.entries(byStore).map(([store, items]) => (
                          <div key={store}>
                            <strong style={{ color: 'var(--text)' }}>{store}</strong> — {items.join(', ')}
                          </div>
                        ))
                      })()}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--green-dark)' }}>${opt.total.toFixed(2)}</span>
                    <button
                      onClick={() => selectPlan(opt)}
                      style={{
                        background: 'var(--green)', color: '#fff', border: 'none',
                        borderRadius: 20, padding: '8px 18px', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Select this plan
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
