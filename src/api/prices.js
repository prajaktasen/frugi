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

  // Single-store totals
  const singleStore = STORES.map(store => {
    const stops = priceResults.map(({ item, prices }) => {
      const p = prices.find(p => p.store === store)
      return { item, store, price: p?.price ?? null }
    })
    const total = parseFloat(stops.reduce((s, x) => s + (x.price ?? 0), 0).toFixed(2))
    return { store, total, stops }
  }).sort((a, b) => a.total - b.total)

  const cheapestSingle = singleStore[0].total

  // Find the best 2-store combination (exhaustive search over all pairs)
  let bestPair = null
  for (let i = 0; i < STORES.length; i++) {
    for (let j = i + 1; j < STORES.length; j++) {
      const [storeA, storeB] = [STORES[i], STORES[j]]
      const stops = priceResults.map(({ item, prices }) => {
        const pA = prices.find(p => p.store === storeA)?.price ?? null
        const pB = prices.find(p => p.store === storeB)?.price ?? null
        if (pA != null && pB != null) {
          return pA <= pB
            ? { item, store: storeA, price: pA }
            : { item, store: storeB, price: pB }
        }
        return pA != null
          ? { item, store: storeA, price: pA }
          : { item, store: storeB, price: pB ?? null }
      })
      const total = parseFloat(stops.reduce((s, x) => s + (x.price ?? 0), 0).toFixed(2))
      if (!bestPair || total < bestPair.total) {
        bestPair = { storeA, storeB, total, stops }
      }
    }
  }

  const pairSavings = bestPair ? parseFloat((cheapestSingle - bestPair.total).toFixed(2)) : 0

  const options = [
    {
      id: `single-${singleStore[0].store}`,
      title: singleStore[0].store,
      subtitle: '1 stop · lowest single-store total',
      stopCount: 1,
      recommended: pairSavings < 2,
      total: singleStore[0].total,
      savings: 0,
      stops: singleStore[0].stops,
    },
  ]

  if (bestPair && pairSavings >= 1) {
    // Work out per-store subtotals for the subtitle
    const byStore = {}
    bestPair.stops.forEach(s => {
      if (!byStore[s.store]) byStore[s.store] = 0
      byStore[s.store] += s.price ?? 0
    })
    const storeSummary = Object.entries(byStore)
      .map(([s, t]) => `${s} $${t.toFixed(2)}`)
      .join(' · ')

    options.push({
      id: 'split-2',
      title: `${bestPair.storeA} + ${bestPair.storeB}`,
      subtitle: `2 stops · ${storeSummary}`,
      stopCount: 2,
      recommended: pairSavings >= 2,
      total: bestPair.total,
      savings: pairSavings,
      stops: bestPair.stops,
    })
  }

  if (singleStore[1]) {
    options.push({
      id: `single-${singleStore[1].store}`,
      title: singleStore[1].store,
      subtitle: '1 stop',
      stopCount: 1,
      recommended: false,
      total: singleStore[1].total,
      savings: 0,
      stops: singleStore[1].stops,
    })
  }

  // Recommended option first
  return options.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
}
