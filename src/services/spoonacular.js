const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY
const BASE = 'https://api.spoonacular.com'

export async function searchRecipes(query) {
  const params = new URLSearchParams({
    query,
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    number: '12',
    apiKey: API_KEY,
  })
  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`)
  if (!res.ok) throw new Error(`Spoonacular fetch failed: ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}
