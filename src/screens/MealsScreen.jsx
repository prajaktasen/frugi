import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { searchRecipes, getRecommendations } from '../services/spoonacular'
import traderJoes from '../data/traderjoes.json'

function findTJPrice(name) {
  const lower = name.toLowerCase()
  const match = traderJoes.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  )
  return match ? match.price : null
}

function RecipeCard({ recipe, expanded, onToggle, addedNames, onAddIngredient }) {
  const steps = recipe.analyzedInstructions?.[0]?.steps ?? []
  const ingredients = recipe.extendedIngredients ?? []

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
        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
          {expanded ? 'Close ▲' : 'See recipe ▼'}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>

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
  const { addToList, setActiveTab } = useApp()
  const [query, setQuery] = useState('')
  const [recs, setRecs] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [addedNames, setAddedNames] = useState(new Set())

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

  async function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) { setSearchResults(null); return }
    setSearching(true)
    try {
      const data = await searchRecipes(q)
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
    setExpandedId(null)
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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
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
      </div>

      {/* Added-items CTA */}
      {addedNames.size > 0 && (
        <div style={{ padding: '8px 18px', background: 'var(--green-light)', borderBottom: '1px solid var(--green-mid)' }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              background: 'var(--green)', color: '#fff', border: 'none',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>
              {addedNames.size} ingredient{addedNames.size !== 1 ? 's' : ''} added to your list
            </span>
            <span>Find prices →</span>
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
