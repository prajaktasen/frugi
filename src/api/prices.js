import traderJoes from '../data/traderjoes.json'
import krogerMock from '../data/kroger_mock.json'

function findTJ(term) {
  const lower = term.toLowerCase().trim()
  return traderJoes.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  ) ?? null
}

function findKroger(term) {
  const lower = term.toLowerCase().trim()
  return krogerMock.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  ) ?? null
}

function estimate(base, factor) {
  return base != null ? parseFloat((base * factor).toFixed(2)) : null
}

// Returns [{ item, prices: [{ store, price, real }] }]
export async function getPricesForList(items) {
  return items.map(item => {
    const tj = findTJ(item)
    const kr = findKroger(item)
    const tjPrice = tj?.price ?? null
    const krPrice = kr?.price ?? null
    const base = krPrice ?? tjPrice
    return {
      item,
      prices: [
        { store: "Trader Joe's", price: tjPrice,              real: !!tj },
        { store: 'Kroger/QFC',   price: krPrice,              real: !!kr },
        { store: 'Fred Meyer',   price: estimate(base, 1.04), real: false },
        { store: 'Walmart',      price: estimate(base, 0.91), real: false },
      ],
    }
  })
}

// Returns trip options for the cart screen
export function calculateTripOptions(priceResults) {
  const STORES = ["Trader Joe's", 'Kroger/QFC', 'Fred Meyer', 'Walmart']

  const singleStore = STORES.map(store => {
    const stops = priceResults.map(({ item, prices }) => {
      const p = prices.find(p => p.store === store)
      return { item, store, price: p?.price ?? null }
    })
    const total = parseFloat(stops.reduce((s, x) => s + (x.price ?? 0), 0).toFixed(2))
    return { store, total, stops }
  }).sort((a, b) => a.total - b.total)

  const optimizedStops = priceResults.map(({ item, prices }) => {
    const available = prices.filter(p => p.price != null).sort((a, b) => a.price - b.price)
    const best = available[0]
    return { item, store: best?.store ?? '—', price: best?.price ?? null }
  })
  const optimizedTotal = parseFloat(
    optimizedStops.reduce((s, x) => s + (x.price ?? 0), 0).toFixed(2)
  )
  const savings = parseFloat((singleStore[0].total - optimizedTotal).toFixed(2))

  const options = [
    {
      id: `single-${singleStore[0].store}`,
      title: `Shop at ${singleStore[0].store}`,
      subtitle: 'One stop · lowest single-store total',
      recommended: savings < 2,
      total: singleStore[0].total,
      savings: 0,
      stops: singleStore[0].stops,
    },
  ]

  if (savings >= 1) {
    options.push({
      id: 'optimized',
      title: 'Best price each item',
      subtitle: `Split across ${new Set(optimizedStops.map(s => s.store)).size} stores`,
      recommended: savings >= 2,
      total: optimizedTotal,
      savings,
      stops: optimizedStops,
    })
  }

  if (singleStore[1]) {
    options.push({
      id: `single-${singleStore[1].store}`,
      title: `Shop at ${singleStore[1].store}`,
      subtitle: 'One stop',
      recommended: false,
      total: singleStore[1].total,
      savings: 0,
      stops: singleStore[1].stops,
    })
  }

  return options
}
