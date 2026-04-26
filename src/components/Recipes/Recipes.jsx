import { useState } from 'react'
import { searchRecipes } from '../../services/spoonacular.js'
import traderJoes from '../../data/traderjoes.json'
import './Recipes.css'

function findTJPrice(ingredientName) {
  const lower = ingredientName.toLowerCase()
  const match = traderJoes.find((item) =>
    item.keywords.some((kw) => lower.includes(kw) || kw.includes(lower))
  )
  return match ? { price: match.price, name: match.name } : null
}

function RecipeCard({ recipe, onAddToCart }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="recipe-card">
      {recipe.image && (
        <img className="recipe-img" src={recipe.image} alt={recipe.title} />
      )}
      <div className="recipe-body">
        <h3 className="recipe-title">{recipe.title}</h3>
        <div className="recipe-meta">
          {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} min</span>}
          {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
        </div>
        <button
          className="recipe-expand-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide ingredients ▲' : 'Show ingredients ▼'}
        </button>

        {expanded && recipe.extendedIngredients?.length > 0 && (
          <ul className="recipe-ingredients">
            {recipe.extendedIngredients.map((ing) => {
              const tj = findTJPrice(ing.name)
              return (
                <li key={ing.id ?? ing.name} className="recipe-ingredient">
                  <div className="recipe-ingredient-info">
                    <span className="recipe-ingredient-name">
                      {ing.original}
                    </span>
                    {tj && (
                      <span className="recipe-ingredient-price">
                        TJ's: <strong>${tj.price.toFixed(2)}</strong>
                      </span>
                    )}
                    {!tj && (
                      <span className="recipe-ingredient-price recipe-ingredient-price--na">
                        Not at TJ's
                      </span>
                    )}
                  </div>
                  <button
                    className="recipe-add-btn"
                    onClick={() => onAddToCart({
                      id: `recipe-${recipe.id}-${ing.id ?? ing.name}`,
                      name: ing.nameClean ?? ing.name,
                      price: tj?.price ?? 0,
                      store: tj ? "Trader Joe's" : 'Unknown',
                    })}
                  >
                    + Cart
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Recipes({ onAddToCart }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState(null)
  const [error, setError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setRecipes(null)
    try {
      const data = await searchRecipes(query)
      setRecipes(data)
    } catch {
      setError('Recipe search unavailable. Please try again later.')
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recipes-page">
      <h1 className="recipes-heading">Recipe Search</h1>
      <p className="recipes-sub">Find a recipe and add ingredients straight to your cart with TJ price hints.</p>

      <form className="recipes-form" onSubmit={handleSearch}>
        <input
          className="recipes-input"
          type="text"
          placeholder="e.g. pasta, chicken soup, tacos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="recipes-btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Find Recipes'}
        </button>
      </form>

      {error && <p className="recipes-error">{error}</p>}

      {loading && (
        <div className="recipes-loading">
          <div className="spinner" />
          <span>Loading recipes…</span>
        </div>
      )}

      {recipes !== null && !loading && recipes.length === 0 && !error && (
        <p className="recipes-empty">No recipes found. Try a different search.</p>
      )}

      {recipes && recipes.length > 0 && (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
