import { useState, useEffect, useRef, useMemo } from 'react'
import { useApp } from '../AppContext'
import { searchRecipes, getRecommendations } from '../services/spoonacular'
import { getPricesForList } from '../api/prices'
import traderJoes from '../data/traderjoes.json'
import krogerMock from '../data/kroger_mock.json'
import mockRecipes from '../data/recipes_mock.json'

const POPULAR_SEARCHES = ['pasta', 'chicken', 'tacos', 'soup', 'salad', 'salmon', 'curry', 'stir fry', 'breakfast', 'vegetarian', 'rice', 'eggs']

function findTJPrice(name) {
  const lower = name.toLowerCase()
  const match = traderJoes.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  )
  return match ? match.price : null
}

function findKrogerPrice(name) {
  const lower = name.toLowerCase()
  const match = krogerMock.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  )
  return match ? match.price : null
}

function estimateRecipeCost(ingredients) {
  let total = 0
  let found = 0
  const breakdown = ingredients.map(ing => {
    const name = ing.nameClean ?? ing.name
    const tj = findTJPrice(name)
    const kr = findKrogerPrice(name)
    const price = tj !== null && kr !== null ? Math.min(tj, kr) : (tj ?? kr)
    const store = price === tj && tj !== null ? "TJ's" : price === kr && kr !== null ? 'Kroger' : null
    if (price !== null) { total += price; found++ }
    return { name, price, store }
  })
  return { total: parseFloat(total.toFixed(2)), found, total_ingredients: ingredients.length, breakdown }
}

function RecipeCard({ recipe, expanded, onToggle, addedNames, onAddIngredient }) {
  const steps = recipe.analyzedInstructions?.[0]?.steps ?? []
  const ingredients = recipe.extendedIngredients ?? []
  const cost = ingredients.length > 0 ? estimateRecipeCost(ingredients) : null

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 14,
      overflow: 'hidden', marginBottom: 12,
      boxShadow: expanded ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Image */}
      {recipe.image && (
        <div style={{ position: 'relative' }}>
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{ width: '100%', height: expanded ? 200 : 150, objectFit: 'cover', display: 'block', transition: 'height 0.2s' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
          }} />
          <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces, serif', lineHeight: 1.3 }}>
              {recipe.title}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {recipe.readyInMinutes && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.3)', padding: '2px 7px', borderRadius: 20 }}>
                  ⏱ {recipe.readyInMinutes} min
                </span>
              )}
              {recipe.servings && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.3)', padding: '2px 7px', borderRadius: 20 }}>
                  🍽 {recipe.servings} servings
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toggle row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '10px 14px', background: expanded ? 'var(--green-light)' : 'var(--bg)',
          border: 'none', borderTop: recipe.image ? '1px solid var(--border)' : 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {!recipe.image && (
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'Fraunces, serif' }}>
              {recipe.title}
            </span>
          )}
          {recipe.image && (
            <span style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600 }}>
              {ingredients.length} ingredients · {steps.length} steps
            </span>
          )}
          {cost && cost.found > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--green-dark)',
              background: 'var(--green-light)', border: '1px solid var(--green-mid)',
              padding: '2px 7px', borderRadius: 20,
            }}>
              ~${cost.total.toFixed(2)} to cook
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
          {expanded ? 'Close ▲' : 'See recipe ▼'}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>

          {/* Cost summary */}
          {cost && cost.found > 0 && (
            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 10,
              background: 'var(--green-light)', border: '1px solid var(--green-mid)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>
                  Est. cost to cook
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  {cost.found} of {cost.total_ingredients} ingredients priced · cheapest local store
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)' }}>
                ~${cost.total.toFixed(2)}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 12 }}>
                Ingredients
                <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 6, textTransform: 'none', fontSize: 11 }}>
                  — tap + to add to your price list
                </span>
              </div>
              {ingredients.map(ing => {
                const name = ing.nameClean ?? ing.name
                const tjPrice = findTJPrice(name)
                const isAdded = addedNames.has(name.toLowerCase())
                return (
                  <div key={ing.id ?? ing.original} className="row-item">
                    <div className="row-item-left">
                      <span className="row-item-name" style={{ fontSize: 13 }}>{ing.original}</span>
                      {tjPrice !== null
                        ? <span className="row-item-sub" style={{ color: 'var(--green-dark)' }}>TJ's ~${tjPrice.toFixed(2)}</span>
                        : <span className="row-item-sub">price TBD</span>
                      }
                    </div>
                    <button
                      onClick={() => !isAdded && onAddIngredient(name)}
                      className="plus-btn"
                      style={isAdded ? { background: 'var(--green)', color: '#fff', borderColor: 'var(--green)' } : {}}
                      title={isAdded ? 'Added to list' : 'Add to list'}
                    >
                      {isAdded ? '✓' : '+'}
                    </button>
                  </div>
                )
              })}
            </>
          )}

          {/* Instructions */}
          {steps.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 18 }}>Instructions</div>
              {steps.map(step => (
                <div key={step.number} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div className="step-num" style={{ flexShrink: 0, marginTop: 1 }}>{step.number}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{step.step}</div>
                </div>
              ))}
            </>
          )}

          {ingredients.length === 0 && steps.length === 0 && (
            <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
              No details available for this recipe.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MealsScreen() {
  const { addToList, list, setPriceResults, setActiveTab } = useApp()
  const [query, setQuery] = useState('')
  const [recs, setRecs] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [addedNames, setAddedNames] = useState(new Set())
  const [findingPrices, setFindingPrices] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchWrapperRef = useRef(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return POPULAR_SEARCHES.slice(0, 6)
    const fromRecipes = mockRecipes
      .filter(r => r.title.toLowerCase().includes(q))
      .map(r => r.title)
    const fromPopular = POPULAR_SEARCHES.filter(p => p.includes(q) && p !== q)
    return [...new Set([...fromRecipes, ...fromPopular])].slice(0, 6)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    getRecommendations()
      .then(setRecs)
      .catch(() => setRecs([]))
      .finally(() => setLoadingRecs(false))
  }, [])

  function handleIngredientAdd(name) {
    addToList(name)
    setAddedNames(prev => new Set([...prev, name.toLowerCase()]))
  }

  async function handleFindPrices() {
    if (!list.length) return
    setFindingPrices(true)
    try {
      const results = await getPricesForList(list)
      setPriceResults(results)
      setActiveTab('map')
    } catch (e) {
      console.error(e)
    } finally {
      setFindingPrices(false)
    }
  }

  async function runSearch(q) {
    if (!q) { setSearchResults(null); return }
    setSearching(true)
    setShowSuggestions(false)
    try {
      const data = await searchRecipes(q)
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    runSearch(query.trim())
  }

  function selectSuggestion(s) {
    setQuery(s)
    runSearch(s)
  }

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
    setExpandedId(null)
    setShowSuggestions(false)
  }

  const recipes = searchResults ?? recs
  const isLoading = searchResults === null ? loadingRecs : searching
  const isSearching = searchResults !== null

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Meals</div>
        <div className="screen-sub">Browse recipes · add ingredients to your price list</div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div ref={searchWrapperRef} style={{ position: 'relative' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search recipes (e.g. pasta, tacos…)"
              style={{
                flex: 1, fontSize: 14, padding: '9px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", outline: 'none',
              }}
            />
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text-3)', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                }}
              >✕</button>
            )}
            <button
              type="submit"
              disabled={searching}
              style={{
                padding: '9px 14px', borderRadius: 8, border: 'none',
                background: 'var(--green)', color: '#fff', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                opacity: searching ? 0.6 : 1,
              }}
            >
              {searching ? '…' : 'Search'}
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, zIndex: 200, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {!query.trim() && (
                <div style={{ padding: '7px 12px 3px', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Popular
                </div>
              )}
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  style={{
                    width: '100%', padding: '9px 12px', background: 'none', border: 'none',
                    textAlign: 'left', fontSize: 13, color: 'var(--text)',
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    borderTop: i === 0 && !query.trim() ? '1px solid var(--border)' : i > 0 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: 'var(--text-3)', fontSize: 11 }}>↗</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Added-items CTA */}
      {addedNames.size > 0 && (
        <div style={{ padding: '8px 18px', background: 'var(--green-light)', borderBottom: '1px solid var(--green-mid)' }}>
          <button
            onClick={handleFindPrices}
            disabled={findingPrices}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              background: 'var(--green)', color: '#fff', border: 'none',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
              cursor: findingPrices ? 'not-allowed' : 'pointer',
              opacity: findingPrices ? 0.7 : 1,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>
              {addedNames.size} ingredient{addedNames.size !== 1 ? 's' : ''} added to list
            </span>
            <span>{findingPrices ? 'Finding prices…' : 'Find prices →'}</span>
          </button>
        </div>
      )}

      {/* Recipe list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

        {/* Section label */}
        <div className="section-label">
          {isSearching
            ? `${recipes.length} result${recipes.length !== 1 ? 's' : ''} for "${query}"`
            : 'Recommended for you'}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="spinner" />
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>
              {isSearching ? 'Searching…' : 'Loading recommendations…'}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && recipes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🍳</div>
            <div style={{ fontSize: 14 }}>
              {isSearching ? 'No recipes found' : 'Recommendations unavailable'}
            </div>
            {isSearching && (
              <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</div>
            )}
          </div>
        )}

        {/* Cards */}
        {!isLoading && recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            expanded={expandedId === recipe.id}
            onToggle={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
            addedNames={addedNames}
            onAddIngredient={handleIngredientAdd}
          />
        ))}
      </div>
    </div>
  )
}
