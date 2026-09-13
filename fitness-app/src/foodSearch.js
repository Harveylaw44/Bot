// Open Food Facts is a free, open, community-maintained food database with
// no API key or signup required — a good fit for a static app with no
// backend of its own. Its *_100g nutrient fields are already normalized
// per 100g, which lines up exactly with this app's own "g" ingredient
// reference amount.
//
// Two different endpoints can serve a free-text search, and neither is
// consistently reliable on its own from a browser: /cgi/search.pl (the
// legacy endpoint OFF's own apps use) gives much better keyword matching
// and can be sorted by popularity, but as an older Perl endpoint its CORS
// behaviour is occasionally flaky; /api/v2/search is a modern REST API
// with solid CORS support but weaker free-text relevance. searchFoods
// tries the legacy endpoint first and falls back to v2 if it fails or
// comes back empty, so a hiccup in one doesn't take the feature down.
const LEGACY_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const V2_SEARCH_URL = 'https://world.openfoodfacts.org/api/v2/search';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Cheap singular/plural tolerance for the relevance filter below — "eggs"
// should still match a product literally named "Egg", and vice versa.
function wordVariants(word) {
  if (word.length <= 3) return [word];
  return word.endsWith('s') ? [word, word.slice(0, -1)] : [word, `${word}s`];
}

function mapProducts(products) {
  return products
    .map((p) => {
      const n = p.nutriments || {};
      const kcal = n['energy-kcal_100g'];
      const name = (p.product_name || p.generic_name || '').trim();
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
    .filter(Boolean);
}

async function fetchProducts(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Food database request failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data.products) ? data.products : [];
}

// Looks up a single product by its scanned barcode (EAN/UPC). Returns null
// if the barcode isn't in the database, or is but has no usable calorie
// data — the caller falls back to manual entry or a name search either way.
export async function lookupBarcode(code) {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const url = `${PRODUCT_URL}/${encodeURIComponent(trimmed)}.json?fields=product_name,generic_name,brands,nutriments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Food database request failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const [found] = mapProducts([data.product]);
  return found || null;
}

export async function searchFoods(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const queryWords = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  // Fetch a much bigger candidate pool than we'll show (100, not 25):
  // sorting by popularity means a broad single-word query like "eggs" can
  // match thousands of loosely-related products, and the ones that are
  // actually named "egg" can get buried behind unrelated bestsellers
  // within just the first 25-40. A bigger pool plus our own relevance
  // filter below reliably finds them.
  const legacyParams = new URLSearchParams({
    search_terms: trimmed,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '100',
    sort_by: 'unique_scans_n',
    fields: 'product_name,generic_name,brands,nutriments',
  });
  const v2Params = new URLSearchParams({
    search_terms: trimmed,
    page_size: '100',
    json: '1',
    fields: 'product_name,generic_name,brands,nutriments',
  });

  const attempts = [
    `${LEGACY_SEARCH_URL}?${legacyParams.toString()}`,
    `${V2_SEARCH_URL}?${v2Params.toString()}`,
  ];

  let lastError = null;
  for (const url of attempts) {
    try {
      const products = await fetchProducts(url);
      const mapped = mapProducts(products);
      // Prefer results whose name actually contains every query word —
      // the server's own matching pulls in brands/categories/ingredient
      // lists too, so this re-ranks for what the user is actually typing
      // rather than trusting server order blindly.
      const relevant = mapped.filter((f) => {
        const lower = f.name.toLowerCase();
        return queryWords.every((w) => wordVariants(w).some((v) => lower.includes(v)));
      });
      const ranked = relevant.length > 0 ? relevant : mapped;
      if (ranked.length > 0) return ranked.slice(0, 25);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  return [];
}
