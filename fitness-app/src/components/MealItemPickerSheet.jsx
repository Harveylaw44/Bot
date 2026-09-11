import { useState } from 'react';
import { EmptyState } from './shared.jsx';

export default function MealItemPickerSheet({ ingredients, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // the ingredient being quantified
  const [quantity, setQuantity] = useState('');

  const filtered = query.trim()
    ? ingredients.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()))
    : ingredients;

  const pick = (ingredient) => {
    setSelected(ingredient);
    setQuantity(String(ingredient.servingAmount));
  };

  const confirm = () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;
    onAdd({ type: 'ingredient', ingredientId: selected.id, quantity: qty });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <button className="modal-close" onClick={selected ? () => setSelected(null) : onClose} aria-label="Close">
          ×
        </button>

        {!selected ? (
          <>
            <div className="modal-title">Add Ingredient</div>
            <input
              type="text"
              placeholder="Search ingredients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ ...fieldStyle, marginBottom: 14 }}
            />
            {filtered.length === 0 ? (
              <EmptyState>No ingredients match "{query}"</EmptyState>
            ) : (
              filtered.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => pick(ing)}
                  className="list-row"
                  style={{ width: '100%', textAlign: 'left', border: '1px solid var(--border)' }}
                >
                  <div className="main">
                    <div className="title">{ing.name}</div>
                    <div className="sub">
                      {ing.calories} cal per {ing.servingAmount}
                      {ing.unit}
                    </div>
                  </div>
                </button>
              ))
            )}
          </>
        ) : (
          <>
            <div className="modal-title">{selected.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 14 }}>
              {selected.calories} cal per {selected.servingAmount}
              {selected.unit}
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder={`Quantity (${selected.unit})`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirm()}
              autoFocus
              style={{ ...fieldStyle, fontSize: 22, fontWeight: 700, textAlign: 'center' }}
            />
            <button className="btn btn-primary btn-block" onClick={confirm} style={{ marginTop: 4 }}>
              Add to Meal
            </button>
          </>
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
  marginBottom: 10,
};
