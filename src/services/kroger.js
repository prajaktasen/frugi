import krogerMock from '../data/kroger_mock.json'

const CLIENT_ID = import.meta.env.VITE_KROGER_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_KROGER_CLIENT_SECRET
// Requests go through the Vite proxy (/kroger-api → https://api.kroger.com/v1)
const BASE = '/kroger-api'

let cachedToken = null
let tokenExpiry = 0

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  const res = await fetch(`${BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Kroger auth ${res.status}: ${body}`)
  }
  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 30) * 1000
  return cachedToken
}

async function getNearestStoreLive(zipCode) {
  const token = await getToken()
  const res = await fetch(
    `${BASE}/locations?filter.zipCode.near=${zipCode}&filter.limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Locations ${res.status}`)
  const data = await res.json()
  const loc = data.data?.[0]
  if (!loc) throw new Error('No store found')
  return {
    locationId: loc.locationId,
    name: `${loc.name} – ${loc.address?.city ?? ''} ${loc.address?.state ?? ''}`.trim(),
  }
}

async function searchProductsLive(term, locationId) {
  const token = await getToken()
  const params = new URLSearchParams({
    'filter.term': term,
    'filter.locationId': locationId,
    'filter.limit': '5',
  })
  const res = await fetch(`${BASE}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Products ${res.status}`)
  const data = await res.json()

  return (data.data ?? []).map((p) => {
    const item = p.items?.[0] ?? {}
    const price = item.price?.regular ?? null
    const promoPrice = item.price?.promo ?? null
    const image =
      p.images?.find((img) => img.perspective === 'front')
        ?.sizes?.find((s) => s.size === 'medium')?.url ??
      p.images?.[0]?.sizes?.[0]?.url ??
      null
    return { name: p.description, price, promoPrice, size: item.size ?? '', image }
  })
}

// --- mock fallback ---

function mockStore() {
  return { locationId: 'mock', name: 'Kroger (demo data)' }
}

function searchMock(term) {
  const lower = term.toLowerCase().trim()
  const hit = krogerMock.find((item) =>
    item.keywords.some((kw) => lower.includes(kw) || kw.includes(lower))
  )
  if (!hit) return []
  return [{ name: hit.name, price: hit.price, promoPrice: null, size: hit.size, image: null }]
}

// --- public API (tries live, falls back to mock) ---

export async function getNearestStore(zipCode) {
  try {
    return await getNearestStoreLive(zipCode)
  } catch (err) {
    console.warn('[Kroger] live API unavailable, using mock data:', err.message)
    return mockStore()
  }
}

export async function searchProducts(term, locationId) {
  if (locationId === 'mock') return searchMock(term)
  try {
    return await searchProductsLive(term, locationId)
  } catch (err) {
    console.warn('[Kroger] product search failed, using mock data:', err.message)
    return searchMock(term)
  }
}
