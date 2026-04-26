const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY
const BASE = 'https://api.spoonacular.com'

export async function searchRecipes(query) {
  const params = new URLSearchParams({
    query,
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    number: '10',
    apiKey: API_KEY,
  })
  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`)
  if (!res.ok) throw new Error(`Spoonacular search failed: ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}

export async function getRecommendations() {
  const params = new URLSearchParams({
    number: '8',
    instructionsRequired: 'true',
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    apiKey: API_KEY,
  })
  const res = await fetch(`${BASE}/recipes/random?${params}`)
  if (!res.ok) throw new Error(`Spoonacular recommendations failed: ${res.status}`)
  const data = await res.json()
  return data.recipes ?? []
}
