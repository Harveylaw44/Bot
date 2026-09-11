import { useState } from 'react';
import { computeMealNutrition, migrateLegacyMeal } from '../mealCalc.js';
import { scaleIngredient } from '../foodUnits.js';
import { DeleteButton } from './shared.jsx';
import { IconPlus } from './icons.jsx';
import MealItemPickerSheet from './MealItemPickerSheet.jsx';

export default function MealFormSheet({ initial, ingredients, onClose, onSave, onDelete }) {
  const migrated = initial ? migrateLegacyMeal(initial) : null;
  const [name, setName] = useState(migrated?.name || '');
  const [items, setItems] = useState(migrated?.items || []);
  const [showPicker, setShowPicker] = useState(false);

  const totals = computeMealNutrition({ items }, ingredients);
  const valid = name.trim() && items.length > 0;

  const updateQuantity = (index, qty) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, quantity: qty } : it)));
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const addItem = (item) => {
    setItems((prev) => [...prev, item]);
    setShowPicker(false);
  };

  const submit = () => {
    if (!valid) return;
    onSave({ name: name.trim(), items });
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
        <div className="modal-title">{initial ? 'Edit Meal' : 'Add Meal'}</div>

        <input
          type="text"
          placeholder="Meal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>
          INGREDIENTS
        </div>

        {items.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 14 }}>
            No ingredients yet — add one below
          </div>
        ) : (
          items.map((item, i) => {
            if (item.type === 'custom') {
              return (
                <div className="list-row" key={i}>
                  <div className="main">
                    <div className="title">{item.name}</div>
                    <div className="sub">original recipe · {item.calories} cal</div>
                  </div>
                  <div className="right">
                    <DeleteButton onClick={() => removeItem(i)} />
                  </div>
                </div>
              );
            }
            const ing = ingredients.find((x) => x.id === item.ingredientId);
            if (!ing) {
              return (
                <div className="list-row" key={i}>
                  <div className="main">
                    <div className="title">(deleted ingredient)</div>
                  </div>
                  <div className="right">
                    <DeleteButton onClick={() => removeItem(i)} />
                  </div>
                </div>
              );
            }
            const scaled = scaleIngredient(ing, item.quantity);
            return (
              <div className="list-row" key={i} style={{ alignItems: 'center' }}>
                <div className="main">
                  <div className="title">{ing.name}</div>
                  <div className="sub">{Math.round(scaled.calories)} cal</div>
                </div>
                <div className="right" style={{ gap: 8 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(i, Number(e.target.value) || 0)}
                    style={qtyFieldStyle}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{ing.unit}</span>
                  <DeleteButton onClick={() => removeItem(i)} />
                </div>
              </div>
            );
          })
        )}

        <button
          className="btn btn-secondary btn-block"
          onClick={() => setShowPicker(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}
        >
          <IconPlus style={{ width: 16, height: 16 }} />
          Add Ingredient
        </button>

        <div className="card" style={{ marginBottom: 18, background: 'var(--bg-elevated)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginBottom: 6 }}>
            {Math.round(totals.calories)} cal
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={submit}
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5, marginBottom: onDelete ? 10 : 0 }}
        >
          Save
        </button>
        {onDelete && (
          <button
            className="btn btn-block"
            onClick={onDelete}
            style={{ background: 'var(--red-dim)', color: 'var(--red)' }}
          >
            Delete
          </button>
        )}

        {showPicker && (
          <MealItemPickerSheet ingredients={ingredients} onClose={() => setShowPicker(false)} onAdd={addItem} />
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
  marginBottom: 14,
};

const qtyFieldStyle = {
  width: 56,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '6px 4px',
  color: 'var(--text)',
  fontSize: 14,
  textAlign: 'center',
};
