import { useState } from 'react'
import { getNearestStore, searchProducts } from '../../services/kroger.js'
import traderJoes from '../../data/traderjoes.json'
import Results from '../Results/Results.jsx'
import './Search.css'

function searchTJ(term) {
  const lower = term.toLowerCase().trim()
  return traderJoes.find((item) =>
    item.keywords.some((kw) => lower.includes(kw) || kw.includes(lower))
  ) ?? null
}

export default function Search({ onAddToCart }) {
  const [term, setTerm] = useState('')
  const [zip, setZip] = useState('98011')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!term.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)

    const tjResult = searchTJ(term)

    let krogerResult = null
    let storeName = null
    try {
      const store = await getNearestStore(zip)
      storeName = store.name
      const products = await searchProducts(term, store.locationId)
      krogerResult = products[0] ?? null
    } catch (err) {
      console.warn('[Kroger]', err)
      storeName = 'Kroger (unavailable)'
    }

    setResults({ tjResult, krogerResult, storeName })
    setLoading(false)
  }

  return (
    <div className="search-page">
      <h1 className="search-heading">Compare Grocery Prices</h1>
      <p className="search-sub">Search any item to compare Trader Joe's vs your nearest Kroger store.</p>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-inputs">
          <input
            className="search-input"
            type="text"
            placeholder="e.g. eggs, milk, chicken…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <input
            className="search-input search-input--zip"
            type="text"
            placeholder="ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={10}
          />
        </div>
        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Compare Prices'}
        </button>
      </form>

      {error && <p className="search-error">{error}</p>}

      {loading && (
        <div className="search-loading">
          <div className="spinner" />
          <span>Fetching prices…</span>
        </div>
      )}

      {results && !loading && (
        <Results
          term={term}
          tjResult={results.tjResult}
          krogerResult={results.krogerResult}
          storeName={results.storeName}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  )
}
