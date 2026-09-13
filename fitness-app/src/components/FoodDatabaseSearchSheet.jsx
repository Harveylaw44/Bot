import { useState } from 'react';
import { searchFoods } from '../foodSearch.js';
import { EmptyState } from './shared.jsx';

export default function FoodDatabaseSearchSheet({ onClose, onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const found = await searchFoods(q);
      setResults(found);
    } catch {
      setError("Couldn't reach the food database — check your connection and try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">Search Food Database</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            type="text"
            placeholder="e.g. chicken breast"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            autoFocus
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={runSearch}
            disabled={loading || !query.trim()}
            style={{ padding: '0 18px', opacity: loading || !query.trim() ? 0.5 : 1 }}
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {error && (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 14 }}>{error}</div>
        )}

        {loading && <EmptyState>Searching...</EmptyState>}

        {!loading && results !== null && results.length === 0 && !error && (
          <EmptyState>No results for "{query.trim()}" — try a simpler search term</EmptyState>
        )}

        {!loading && results && results.length > 0 && (
          <>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>
              TAP TO ADD TO YOUR INGREDIENTS
            </div>
            {results.map((food, i) => (
              <button
                key={i}
                onClick={() => onPick(food)}
                className="list-row"
                style={{ width: '100%', textAlign: 'left', border: '1px solid var(--border)' }}
              >
                <div className="main">
                  <div className="title">
                    {food.name}
                    {food.brand && (
                      <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}> · {food.brand}</span>
                    )}
                  </div>
                  <div className="sub">
                    {food.calories} cal · P {food.protein}g · C {food.carbs}g · F {food.fat}g (per 100g)
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {results === null && !loading && !error && (
          <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5 }}>
            Search real foods and branded products — results are per 100g and get saved straight
            into your own ingredient list, so once you've added one it works offline too.
          </div>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px',
  color: 'var(--text)',
  fontSize: 16,
};
