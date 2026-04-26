import { useState } from 'react'
import { useApp } from '../AppContext'
import { getPricesForList } from '../api/prices'

export default function ListScreen() {
  const { list, addToList, removeFromList, zipcode, setZipcode, setPriceResults, setActiveTab } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = () => {
    if (!input.trim()) return
    addToList(input)
    setInput('')
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
        <div className="input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add an item (e.g. oat milk)..."
          />
          <button onClick={handleAdd}>+ Add</button>
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
