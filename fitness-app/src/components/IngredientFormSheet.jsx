import { useEffect, useRef, useState } from 'react';
import { MEASURE_UNITS, defaultServingAmount } from '../foodUnits.js';
import { round1 } from '../utils.js';
import { MEAL_CATEGORIES } from '../mealCategories.js';

function computeCalories(protein, carbs, fat) {
  return Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9);
}

export default function IngredientFormSheet({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [unit, setUnit] = useState(initial?.unit || 'g');
  const [servingAmount, setServingAmount] = useState(String(initial?.servingAmount ?? defaultServingAmount('g')));
  // Tracks whether the user has typed directly into the serving-amount
  // field during THIS time the form is open — not whether the ingredient
  // already had data. Always starts false so switching the unit dropdown
  // (add, edit, or a database-search prefill alike) resets the amount to
  // that unit's sensible default, right up until the user overrides it
  // by hand — otherwise editing/prefilled ingredients could never have
  // their serving amount follow a unit change at all.
  const [servingTouched, setServingTouched] = useState(false);
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

  // "Nutrition per 1 unit" — the actual source of truth the amount field
  // scales against. Recomputed (not compounded) on every amount keystroke,
  // so results stay exact instead of drifting through repeated rounding,
  // and updated whenever a macro is edited directly so a hand-typed
  // correction becomes the new basis for any further amount changes.
  const density = useRef({
    protein: (Number(initial?.protein) || 0) / (Number(initial?.servingAmount) || 1),
    carbs: (Number(initial?.carbs) || 0) / (Number(initial?.servingAmount) || 1),
    fat: (Number(initial?.fat) || 0) / (Number(initial?.servingAmount) || 1),
    calories: (Number(initial?.calories) || 0) / (Number(initial?.servingAmount) || 1),
  });

  const handleAmountChange = (value) => {
    setServingAmount(value);
    setServingTouched(true);
    const amt = Number(value);
    if (!(amt > 0)) return;
    const d = density.current;
    setProtein(round1(d.protein * amt));
    setCarbs(round1(d.carbs * amt));
    setFat(round1(d.fat * amt));
    if (!caloriesAuto) setCalories(String(Math.round(d.calories * amt)));
  };

  const updateDensity = (field, value) => {
    const amt = Number(servingAmount) || 1;
    density.current = { ...density.current, [field]: (Number(value) || 0) / amt };
  };

  const handleUnitChange = (nextUnit) => {
    setUnit(nextUnit);
    if (servingTouched) return;

    const nextAmount = defaultServingAmount(nextUnit);
    const prevAmount = Number(servingAmount) || 1;
    setServingAmount(String(nextAmount));
    if (nextAmount === prevAmount) return;

    // Switching between a weight/volume unit (g/ml, 100-reference) and a
    // count unit (tbsp/tsp/piece, 1-reference) has no real conversion we
    // can invent — scaling by that raw amount ratio produced nonsense
    // (e.g. a 300cal/100g bread becoming "3 cal" for "1 piece"). Clear
    // the macros instead so the true per-unit values get entered fresh.
    setProtein('');
    setCarbs('');
    setFat('');
    setCalories('');
    setCaloriesAuto(true);
    density.current = { protein: 0, carbs: 0, fat: 0, calories: 0 };
  };

  const valid = name.trim() && Number(calories) > 0 && Number(servingAmount) > 0;

  const submit = () => {
    if (!valid) return;
    onSave({
      name: name.trim(),
      category,
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
        <div className="modal-title">{initial?.id ? 'Edit Ingredient' : 'Add Ingredient'}</div>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>
          WHEN (OPTIONAL)
        </div>
        <div className="chip-row">
          {MEAL_CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={category === c.value ? 'chip active' : 'chip'}
              onClick={() => setCategory(category === c.value ? '' : c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 4 }}>
          NUTRITION PER
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            inputMode="decimal"
            value={servingAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
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
            onChange={(e) => {
              setProtein(e.target.value);
              updateDensity('protein', e.target.value);
            }}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => {
              setCarbs(e.target.value);
              updateDensity('carbs', e.target.value);
            }}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Fat (g)"
            value={fat}
            onChange={(e) => {
              setFat(e.target.value);
              updateDensity('fat', e.target.value);
            }}
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
            updateDensity('calories', e.target.value);
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
