import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../AppContext'

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const STORE_COLORS = {
  'Kroger/QFC': '#1D9E75',
  "Trader Joe's": '#185FA5',
  'Fred Meyer': '#BA7517',
  'Walmart': '#A32D2D',
}

// What to search for in Google Places for each store chain
const STORE_SEARCHES = {
  'Kroger/QFC': 'QFC',
  "Trader Joe's": "Trader Joe's",
  'Fred Meyer': 'Fred Meyer',
  'Walmart': 'Walmart',
}

async function geocodeZip(zip) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${GOOGLE_KEY}`
  )
  const data = await res.json()
  const loc = data.results?.[0]?.geometry?.location
  return loc ? [loc.lat, loc.lng] : null
}

// Google Places Text Search (New) — finds the nearest location of a named store
async function findStoreNearby(searchName, lat, lon) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.location',
    },
    body: JSON.stringify({
      textQuery: searchName,
      locationBias: {
        circle: { center: { latitude: lat, longitude: lon }, radius: 20000 },
      },
      maxResultCount: 1,
    }),
  })
  const data = await res.json()
  const place = data.places?.[0]
  return place?.location ? [place.location.latitude, place.location.longitude] : null
}

function makeIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `<div style="background:rgba(255,255,255,0.97);color:#111;border-left:3px solid ${color};padding:4px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;font-family:'DM Sans',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.22)">${label}</div>`,
    iconAnchor: [0, 0],
  })
}

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => { map.setView(center, 13) }, [center, map])
  return null
}

const SEATTLE_CENTER = [47.6062, -122.3321]

export default function MapScreen() {
  const { priceResults, setActiveTab, zipcode, addToCart, updateCartItem, cart } = useApp()
  const [view, setView] = useState('map')
  const [mapCenter, setMapCenter] = useState(SEATTLE_CENTER)
  const [storeCoords, setStoreCoords] = useState({})
  const [storeTotals, setStoreTotals] = useState([])
  const [locating, setLocating] = useState(false)

  // Geocode zip, then find each store via Google Places
  useEffect(() => {
    if (!zipcode || zipcode.length < 5) return
    setLocating(true)
    setStoreCoords({})

    geocodeZip(zipcode)
      .then(async (center) => {
        if (!center) return
        setMapCenter(center)
        const [lat, lon] = center
        const entries = await Promise.all(
          Object.entries(STORE_SEARCHES).map(async ([store, searchName]) => {
            const coords = await findStoreNearby(searchName, lat, lon).catch(() => null)
            return [store, coords]
          })
        )
        setStoreCoords(Object.fromEntries(entries.filter(([, c]) => c !== null)))
      })
      .catch(() => {})
      .finally(() => setLocating(false))
  }, [zipcode])

  // Compute per-store basket totals, only for stores found nearby, skipping unavailable items
  useEffect(() => {
    if (!priceResults || Object.keys(storeCoords).length === 0) return
    const totals = Object.keys(storeCoords).map(store => {
      const total = priceResults.reduce((sum, { prices }) => {
        const p = prices.find(p => p.store === store)
        return sum + (p?.price ?? 0)
      }, 0)
      return { store, total: parseFloat(total.toFixed(2)) }
    }).sort((a, b) => a.total - b.total)
    setStoreTotals(totals)
  }, [priceResults, storeCoords])

  // Which store (if any) is currently selected in cart for this item
  const cartStoreFor = (itemName) =>
    cart.find(c => c.name.toLowerCase() === itemName.toLowerCase())?.store ?? null

  // Add item at chosen store, or switch store if already in cart
  const selectStore = (itemName, price, store) => {
    const existing = cart.find(c => c.name.toLowerCase() === itemName.toLowerCase())
    if (existing) {
      updateCartItem(itemName, { price, store })
    } else {
      addToCart({ name: itemName, price, store })
    }
  }

  // Add every item at one store's price, then go to cart
  const addWholeBasket = (store) => {
    priceResults.forEach(({ item, prices }) => {
      const p = prices.find(p => p.store === store)
      if (p?.price != null) selectStore(item, p.price, store)
    })
    setActiveTab('cart')
  }

  if (!priceResults) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontSize: 14 }}>No prices yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add items to your list and tap "Find prices"</div>
          <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '10px 24px' }} onClick={() => setActiveTab('list')}>
            Go to list →
          </button>
        </div>
      </div>
    )
  }

  const priceClass = (i) => i === 0 ? 'price-low' : i === 1 ? 'price-mid' : 'price-high'

  return (
    <div className="screen" style={{ paddingBottom: 72 }}>
      {/* View toggle */}
      <div style={{ display: 'flex', padding: '8px 18px', gap: 8, borderBottom: '1px solid var(--border)' }}>
        {['map', 'breakdown'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: view === v ? 'var(--green)' : 'var(--bg)',
            color: view === v ? '#fff' : 'var(--text-3)',
            fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.15s',
          }}>
            {v === 'map' ? '🗺 Map' : '📋 Breakdown'}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <>
          {/* Map */}
          <div style={{ height: 260, flexShrink: 0, position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
              <MapUpdater center={mapCenter} />
              {storeTotals.map(({ store, total }) =>
                storeCoords[store] ? (
                  <Marker key={store} position={storeCoords[store]} icon={makeIcon(STORE_COLORS[store], `${store} — $${total}`)}>
                    <Popup>{store}<br /><strong>${total}</strong> for full basket</Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
            {locating && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, fontSize: 12, color: 'var(--text-3)', fontFamily: "'DM Sans', sans-serif",
              }}>
                Finding stores near {zipcode}…
              </div>
            )}
          </div>

          {/* Store list with add-basket buttons */}
          <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
            <div className="section-label">
              {storeTotals.length > 0
                ? `${storeTotals.length} stores near ${zipcode}`
                : locating ? 'Locating stores…' : 'No stores found nearby'}
            </div>

            {storeTotals.map(({ store, total }, i) => (
              <div key={store} className="row-item" style={{ alignItems: 'center' }}>
                <div className="row-item-left" style={{ gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STORE_COLORS[store], flexShrink: 0 }} />
                  <div>
                    <span className="row-item-name">{store}</span>
                    <span className="row-item-sub" style={{ display: 'block' }}>full basket</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={priceClass(i)} style={{ fontSize: 16 }}>${total}</span>
                  <button
                    onClick={() => addWholeBasket(store)}
                    style={{
                      background: 'var(--green)', color: '#fff', border: 'none',
                      borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                    }}
                  >
                    Add all
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Breakdown — per-item prices with individual add-to-cart */
        <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
          <div className="section-label">tap + to add an item to your cart</div>

          {priceResults.map(({ item, prices }) => {
            const nearby = prices.filter(p => storeCoords[p.store])
            const available = nearby.filter(p => p.price !== null).sort((a, b) => a.price - b.price)
            const unavailable = nearby.filter(p => p.price === null)
            const allUnavailable = available.length === 0
            const selectedStore = cartStoreFor(item)

            return (
              <div key={item} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{item}</span>
                  {allUnavailable && (
                    <span style={{ fontSize: 11, color: '#c0392b', background: '#fdf0ee', padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
                      Not found
                    </span>
                  )}
                  {selectedStore && (
                    <span style={{ fontSize: 11, color: 'var(--green-dark)', background: 'var(--green-light)', padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
                      in cart
                    </span>
                  )}
                </div>
                {!allUnavailable && (
                  <div style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {available.map((p, i) => {
                      const isSelected = selectedStore === p.store
                      return (
                        <div key={p.store} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(29,158,117,0.08)' : i === 0 && !selectedStore ? 'rgba(29,158,117,0.04)' : 'transparent',
                          borderBottom: i < available.length - 1 || unavailable.length > 0 ? '1px solid var(--border)' : 'none',
                        }}>
                          <span style={{ fontSize: 12, color: isSelected ? 'var(--text)' : i === 0 && !selectedStore ? 'var(--text)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {i === 0 && !selectedStore && <span style={{ color: 'var(--green)', fontSize: 10 }}>★</span>}
                            {p.store}
                            {!p.real && <span style={{ fontSize: 10, color: 'var(--text-3)' }}> est.</span>}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className={priceClass(i)} style={{ fontSize: 13 }}>${p.price.toFixed(2)}</span>
                            <button
                              onClick={() => selectStore(item, p.price, p.store)}
                              style={{
                                width: 24, height: 24, borderRadius: '50%', border: 'none',
                                background: isSelected ? 'var(--green)' : '#d0d0d0',
                                color: '#fff', fontSize: isSelected ? 13 : 14, fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                lineHeight: 1,
                              }}
                            >
                              {isSelected ? '✓' : '+'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {unavailable.map(p => (
                      <div key={p.store} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', borderTop: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.store}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Not carried</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {cart.length > 0 && (
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setActiveTab('cart')}>
              View cart ({cart.length} item{cart.length !== 1 ? 's' : ''}) →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
