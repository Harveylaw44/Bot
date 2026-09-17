import { useState } from 'react';
import { scaleIngredient } from '../foodUnits.js';
import { round1 } from '../utils.js';

// Lets you log any amount of an ingredient — not just its full reference
// serving — as a standalone entry in today's log. For topping up ("I had
// an extra 20g of oats") without touching a meal or its recipe.
export default function LogIngredientSheet({ ingredient, onClose, onLog }) {
  const [amount, setAmount] = useState(String(ingredient.servingAmount));
  const amt = Number(amount) || 0;
  const nutrition = scaleIngredient(ingredient, amt);
  const valid = amt > 0;

  const submit = () => {
    if (!valid) return;
    onLog(amt, nutrition);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">Log {ingredient.name}</div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>
          AMOUNT
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            style={{ ...fieldStyle, flex: 1 }}
          />
          <div
            style={{
              ...fieldStyle,
              flex: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
            }}
          >
            {ingredient.unit}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-dim)' }}>Calories</span>
            <span style={{ fontWeight: 700 }}>{Math.round(nutrition.calories)} cal</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
            P {round1(nutrition.protein)}g · C {round1(nutrition.carbs)}g · F {round1(nutrition.fat)}g
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={submit}
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5 }}
        >
          Add to Today's Log
        </button>
      </div>
    </div>
  );
}

const fieldStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px',
  color: 'var(--text)',
  fontSize: 16,
};
