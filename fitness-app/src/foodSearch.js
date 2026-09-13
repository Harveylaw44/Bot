// Open Food Facts is a free, open, community-maintained food database with
// no API key or signup required, and its API is CORS-enabled for direct
// browser use — a good fit for a static app with no backend of its own.
// Its *_100g nutrient fields are already normalized per 100g, which lines
// up exactly with this app's own "g" ingredient reference amount.
const SEARCH_URL = 'https://world.openfoodfacts.org/api/v2/search';

function round1(n) {
  return Math.round(n * 10) / 10;
}

const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

// Looks up a single product by its scanned barcode (EAN/UPC). Returns null
// if the barcode isn't in the database, or is but has no usable calorie
// data — the caller falls back to manual entry or a name search either way.
export async function lookupBarcode(code) {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const url = `${PRODUCT_URL}/${encodeURIComponent(trimmed)}.json?fields=product_name,brands,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Food database request failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'];
  const name = (p.product_name || '').trim();
  if (!name || typeof kcal !== 'number' || kcal <= 0) return null;

  return {
    name,
    brand: (p.brands || '').split(',')[0].trim(),
    calories: Math.round(kcal),
    protein: round1(n.proteins_100g || 0),
    carbs: round1(n.carbohydrates_100g || 0),
    fat: round1(n.fat_100g || 0),
  };
}

export async function searchFoods(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(trimmed)}&fields=product_name,brands,nutriments&page_size=25&json=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Food database request failed (${res.status})`);
  const data = await res.json();
  const products = Array.isArray(data.products) ? data.products : [];

  return products
    .map((p) => {
      const n = p.nutriments || {};
      const kcal = n['energy-kcal_100g'];
      const name = (p.product_name || '').trim();
      if (!name || typeof kcal !== 'number' || kcal <= 0) return null;
      return {
        name,
        brand: (p.brands || '').split(',')[0].trim(),
        calories: Math.round(kcal),
        protein: round1(n.proteins_100g || 0),
        carbs: round1(n.carbohydrates_100g || 0),
        fat: round1(n.fat_100g || 0),
      };
    })
    .filter(Boolean)
    .slice(0, 20);
}
