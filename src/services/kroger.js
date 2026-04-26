const CLIENT_ID = import.meta.env.VITE_KROGER_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_KROGER_CLIENT_SECRET
// All Kroger requests go through the Vite proxy (/kroger-api → https://api.kroger.com/v1)
// so the browser never hits kroger.com directly, bypassing their CORS restriction.
const BASE = '/kroger-api'

let cachedToken = null
let tokenExpiry = 0

export async function getToken() {
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

  if (!res.ok) throw new Error(`Kroger auth failed: ${res.status}`)
  const data = await res.json()
  cachedToken = data.access_token
  // subtract 30s buffer from expiry
  tokenExpiry = Date.now() + (data.expires_in - 30) * 1000
  return cachedToken
}

export async function getNearestStore(zipCode) {
  const token = await getToken()
  const res = await fetch(
    `${BASE}/locations?filter.zipCode.near=${zipCode}&filter.limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Locations fetch failed: ${res.status}`)
  const data = await res.json()
  const loc = data.data?.[0]
  if (!loc) throw new Error('No store found near that zip code')
  return {
    locationId: loc.locationId,
    name: `${loc.name} - ${loc.address?.city ?? ''} ${loc.address?.state ?? ''}`.trim(),
  }
}

export async function searchProducts(term, locationId) {
  const token = await getToken()
  const params = new URLSearchParams({
    'filter.term': term,
    'filter.locationId': locationId,
    'filter.limit': '5',
  })
  const res = await fetch(`${BASE}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`)
  const data = await res.json()

  return (data.data ?? []).map((p) => {
    const item = p.items?.[0] ?? {}
    const price = item.price?.regular ?? null
    const promoPrice = item.price?.promo ?? null
    const image = p.images?.find((img) => img.perspective === 'front')?.sizes?.find((s) => s.size === 'medium')?.url
      ?? p.images?.[0]?.sizes?.[0]?.url
      ?? null
    return {
      name: p.description,
      price,
      promoPrice,
      size: item.size ?? '',
      image,
    }
  })
}
