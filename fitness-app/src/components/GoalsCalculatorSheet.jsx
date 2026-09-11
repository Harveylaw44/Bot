import { useState } from 'react';
import { ACTIVITY_LEVELS, GOAL_TYPES, calculateGoals } from '../calorieCalc.js';

export default function GoalsCalculatorSheet({ initial, latestWeightKg, onClose, onApply }) {
  const [sex, setSex] = useState(initial.sex || 'male');
  const [age, setAge] = useState(initial.age || '');
  const [heightCm, setHeightCm] = useState(initial.heightCm || '');
  const [weightKg, setWeightKg] = useState(latestWeightKg ?? '');
  const [activityLevel, setActivityLevel] = useState(initial.activityLevel || 'moderate');
  const [goalType, setGoalType] = useState(initial.goalType || 'maintain');

  const valid = Number(age) > 0 && Number(heightCm) > 0 && Number(weightKg) > 0;
  const result = valid
    ? calculateGoals({ sex, age: Number(age), heightCm: Number(heightCm), weightKg: Number(weightKg), activityLevel, goalType })
    : null;

  const apply = () => {
    if (!result) return;
    onApply({
      profile: { sex, age: Number(age), heightCm: Number(heightCm), activityLevel, goalType },
      goals: {
        calorieGoal: result.calorieGoal,
        proteinGoal: result.proteinGoal,
        carbGoal: result.carbGoal,
        fatGoal: result.fatGoal,
      },
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">Calculate My Goals</div>

        <div className="segmented" style={{ marginBottom: 10 }}>
          <button className={sex === 'male' ? 'active' : ''} onClick={() => setSex('male')}>
            Male
          </button>
          <button className={sex === 'female' ? 'active' : ''} onClick={() => setSex('female')}>
            Female
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Height (cm)"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
        </div>

        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} style={selectStyle}>
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label} — {a.hint}
            </option>
          ))}
        </select>

        <div className="segmented" style={{ marginBottom: 14 }}>
          {GOAL_TYPES.map((g) => (
            <button key={g.value} className={goalType === g.value ? 'active' : ''} onClick={() => setGoalType(g.value)}>
              {g.label}
            </button>
          ))}
        </div>

        {result && (
          <div className="card" style={{ marginBottom: 14, background: 'var(--bg-card)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 }}>
              Maintenance (TDEE): {result.tdee} cal/day
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginBottom: 8 }}>
              {result.calorieGoal} cal/day
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
              P {result.proteinGoal}g · C {result.carbGoal}g · F {result.fatGoal}g
            </div>
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={apply}
          disabled={!result}
          style={{ opacity: result ? 1 : 0.5 }}
        >
          Apply to Goals
        </button>
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
