import { useEffect, useState } from 'react';

function computeCalories(protein, carbs, fat) {
  return Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9);
}

// Add/edit sheet shared by Meals and Ingredients — both are just
// name + calories + macros, saved into whichever store the caller passes.
export default function FoodFormSheet({ title, initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [protein, setProtein] = useState(initial?.protein ?? '');
  const [carbs, setCarbs] = useState(initial?.carbs ?? '');
  const [fat, setFat] = useState(initial?.fat ?? '');
  const [calories, setCalories] = useState(initial?.calories ?? '');
  // New foods start in "auto" mode so calories fills itself in as macros are
  // typed. Editing an existing food respects whatever calories it already
  // has (it may not follow 4/4/9 exactly) until the macros are touched.
  const [caloriesAuto, setCaloriesAuto] = useState(!initial);

  useEffect(() => {
    if (!caloriesAuto) return;
    setCalories(String(computeCalories(protein, carbs, fat)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protein, carbs, fat, caloriesAuto]);

  const valid = name.trim() && Number(calories) > 0;

  const submit = () => {
    if (!valid) return;
    onSave({
      name: name.trim(),
      calories: Math.round(Number(calories)) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{title}</div>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Fat (g)"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
        </div>

        <input
          type="number"
          inputMode="numeric"
          placeholder="Calories"
          value={calories}
          onChange={(e) => {
            setCalories(e.target.value);
            setCaloriesAuto(false);
          }}
          style={{ ...fieldStyle, marginBottom: 4 }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 10 }}>
          {caloriesAuto ? (
            'Auto-calculated from protein/carbs/fat'
          ) : (
            <button
              onClick={() => setCaloriesAuto(true)}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}
            >
              Use calculated value ({computeCalories(protein, carbs, fat)} cal) instead
            </button>
          )}
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
