import { useState, useRef, useEffect, useMemo } from 'react'
import { useApp } from '../AppContext'
import { getPricesForList } from '../api/prices'
import traderJoes from '../data/traderjoes.json'
import krogerMock from '../data/kroger_mock.json'

const INGREDIENT_SUGGESTIONS = [...new Set([
  ...traderJoes.flatMap(i => i.keywords),
  ...krogerMock.flatMap(i => i.keywords),
])].sort()

export default function ListScreen() {
  const { list, addToList, removeFromList, zipcode, setZipcode, setPriceResults, setActiveTab } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return []
    return INGREDIENT_SUGGESTIONS.filter(s => s.includes(q) && s !== q).slice(0, 6)
  }, [input])

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleAdd = (value) => {
    const term = (value ?? input).trim()
    if (!term) return
    addToList(term)
    setInput('')
    setShowSuggestions(false)
  }

  const handleFindPrices = async () => {
    if (!list.length) return
    setLoading(true)
    try {
      const results = await getPricesForList(list)
      setPriceResults(results)
      setActiveTab('map')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="screen-title">My list</div>
          <div className="screen-sub">Add items, then find prices</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>ZIP</span>
          <input
            value={zipcode}
            onChange={e => setZipcode(e.target.value)}
            style={{
              width: 70, fontSize: 13, padding: '5px 8px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", outline: 'none', textAlign: 'center',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '14px 18px', flex: 1 }}>
        <div ref={wrapperRef} style={{ position: 'relative', marginBottom: 14 }}>
          <div className="input-row" style={{ marginBottom: 0 }}>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add an item (e.g. oat milk)..."
            />
            <button onClick={() => handleAdd()}>+ Add</button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, zIndex: 200, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => handleAdd(s)}
                  style={{
                    width: '100%', padding: '9px 12px', background: 'none', border: 'none',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    textAlign: 'left', fontSize: 13, color: 'var(--text)',
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: 'var(--text-3)', fontSize: 11 }}>+</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 14 }}>Your list is empty</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add some items to get started</div>
          </div>
        ) : (
          <>
            <div className="section-label">{list.length} item{list.length !== 1 ? 's' : ''}</div>
            <div style={{ marginBottom: 20 }}>
              {list.map((item, i) => (
                <div key={i} className="row-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%',
                      border: '1.5px solid var(--green)', flexShrink: 0,
                    }} />
                    <span className="row-item-name">{item}</span>
                  </div>
                  <button
                    onClick={() => removeFromList(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                  >×</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '0 18px 16px' }}>
        {loading ? (
          <div style={{ padding: '16px 0' }}>
            <div className="spinner" />
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 10 }}>
              Finding best prices...
            </div>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleFindPrices} disabled={list.length === 0}>
            Find prices →
          </button>
        )}
      </div>
    </div>
  )
}
