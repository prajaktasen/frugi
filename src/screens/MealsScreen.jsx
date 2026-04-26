import { useState } from 'react'
import { useApp } from '../AppContext'
import { searchRecipes } from '../services/spoonacular'
import traderJoes from '../data/traderjoes.json'

function findTJPrice(ingredientName) {
  const lower = ingredientName.toLowerCase()
  const match = traderJoes.find(item =>
    item.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  )
  return match ? { price: match.price, name: match.name } : null
}

function RecipeCard({ recipe }) {
  const { addToCart } = useApp()
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{recipe.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, display: 'flex', gap: 12 }}>
          {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} min</span>}
          {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? 'Hide ingredients ▲' : 'Show ingredients ▼'}
        </button>

        {expanded && recipe.extendedIngredients?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {recipe.extendedIngredients.map(ing => {
              const tj = findTJPrice(ing.name)
              return (
                <div key={ing.id ?? ing.name} className="row-item">
                  <div className="row-item-left">
                    <span className="row-item-name" style={{ fontSize: 13 }}>{ing.original}</span>
                    <span className="row-item-sub">
                      {tj ? `TJ's $${tj.price.toFixed(2)}` : "Not at TJ's"}
                    </span>
                  </div>
                  <button
                    className="plus-btn"
                    onClick={() => addToCart({
                      name: ing.nameClean ?? ing.name,
                      price: tj?.price ?? 0,
                      store: tj ? "Trader Joe's" : 'TBD',
                    })}
                  >+</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MealsScreen() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState(null)
  const [error, setError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await searchRecipes(query)
      setRecipes(data)
    } catch {
      setError('Recipe search unavailable.')
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Meals</div>
        <div className="screen-sub">Find a recipe · add ingredients to cart</div>
      </div>

      <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. pasta, chicken soup..."
            style={{
              flex: 1, fontSize: 14, padding: '10px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              fontSize: 13, padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--green)', color: 'var(--green-dark)',
              background: 'var(--green-light)', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '…' : 'Search'}
          </button>
        </form>

        {loading && (
          <div style={{ padding: '30px 0' }}>
            <div className="spinner" />
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 10 }}>Finding recipes...</div>
          </div>
        )}

        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {recipes !== null && !loading && recipes.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 13 }}>No recipes found.</div>
        )}

        {recipes?.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}

        {!recipes && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍳</div>
            <div style={{ fontSize: 14 }}>Search for a recipe</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add ingredients to cart with TJ's price hints</div>
          </div>
        )}
      </div>
    </div>
  )
}
