import mockRecipes from '../data/recipes_mock.json'

const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY
const BASE = 'https://api.spoonacular.com'

export async function searchRecipes(query) {
  try {
    const params = new URLSearchParams({
      query,
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      number: '10',
      apiKey: API_KEY,
    })
    const res = await fetch(`${BASE}/recipes/complexSearch?${params}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (data.results?.length) return data.results
  } catch {}

  // Fall back to mock data filtered by query
  const q = query.toLowerCase()
  return mockRecipes.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.extendedIngredients.some(i => i.nameClean?.includes(q) || i.name?.includes(q))
  )
}

export async function getRecommendations() {
  try {
    const params = new URLSearchParams({
      number: '8',
      instructionsRequired: 'true',
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      apiKey: API_KEY,
    })
    const res = await fetch(`${BASE}/recipes/random?${params}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (data.recipes?.length) return data.recipes
  } catch {}

  return mockRecipes
}
