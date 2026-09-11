import { useEffect, useState } from 'react';
import { MEASURE_UNITS, defaultServingAmount } from '../foodUnits.js';

function computeCalories(protein, carbs, fat) {
  return Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9);
}

export default function IngredientFormSheet({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [unit, setUnit] = useState(initial?.unit || 'g');
  const [servingAmount, setServingAmount] = useState(String(initial?.servingAmount ?? defaultServingAmount('g')));
  const [servingTouched, setServingTouched] = useState(!!initial);
  const [protein, setProtein] = useState(initial?.protein ?? '');
  const [carbs, setCarbs] = useState(initial?.carbs ?? '');
  const [fat, setFat] = useState(initial?.fat ?? '');
  const [calories, setCalories] = useState(initial?.calories ?? '');
  // New ingredients start in "auto" calorie mode so it fills itself in as
  // macros are typed. Editing an existing one respects whatever calories it
  // already has (may not follow 4/4/9 exactly) until macros are touched.
  const [caloriesAuto, setCaloriesAuto] = useState(!initial);

  useEffect(() => {
    if (!caloriesAuto) return;
    setCalories(String(computeCalories(protein, carbs, fat)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protein, carbs, fat, caloriesAuto]);

  const handleUnitChange = (nextUnit) => {
    setUnit(nextUnit);
    if (!servingTouched) setServingAmount(String(defaultServingAmount(nextUnit)));
  };

  const valid = name.trim() && Number(calories) > 0 && Number(servingAmount) > 0;

  const submit = () => {
    if (!valid) return;
    onSave({
      name: name.trim(),
      unit,
      servingAmount: Number(servingAmount) || 1,
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
        <div className="modal-title">{initial ? 'Edit Ingredient' : 'Add Ingredient'}</div>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 4 }}>
          NUTRITION PER
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            inputMode="decimal"
            value={servingAmount}
            onChange={(e) => {
              setServingAmount(e.target.value);
              setServingTouched(true);
            }}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            style={{ ...selectStyle, marginBottom: 0, flex: 1.6 }}
          >
            {MEASURE_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

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

const selectStyle = {
  ...fieldStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
};
