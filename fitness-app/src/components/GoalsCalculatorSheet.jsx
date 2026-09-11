import { useState } from 'react';
import { ACTIVITY_LEVELS, GOAL_TYPES, calculateGoals } from '../calorieCalc.js';
import { kgToLbs, lbsToKg, cmToFtIn, ftInToCm } from '../utils.js';

export default function GoalsCalculatorSheet({ initial, latestWeightKg, onClose, onApply }) {
  const isImperial = initial.units === 'imperial';
  const initialFtIn = initial.heightCm ? cmToFtIn(initial.heightCm) : { ft: '', inch: '' };

  const [sex, setSex] = useState(initial.sex || 'male');
  const [age, setAge] = useState(initial.age || '');
  const [heightCmInput, setHeightCmInput] = useState(initial.heightCm || '');
  const [heightFt, setHeightFt] = useState(initialFtIn.ft || '');
  const [heightIn, setHeightIn] = useState(initialFtIn.inch || '');
  const [weightInput, setWeightInput] = useState(
    latestWeightKg != null ? (isImperial ? Math.round(kgToLbs(latestWeightKg)) : latestWeightKg) : ''
  );
  const [activityLevel, setActivityLevel] = useState(initial.activityLevel || 'moderate');
  const [goalType, setGoalType] = useState(initial.goalType || 'maintain');

  const heightCm = isImperial ? ftInToCm(heightFt, heightIn) : Number(heightCmInput);
  const weightKg = isImperial ? lbsToKg(Number(weightInput) || 0) : Number(weightInput) || 0;

  const valid = Number(age) > 0 && heightCm > 0 && weightKg > 0;
  const result = valid
    ? calculateGoals({ sex, age: Number(age), heightCm, weightKg, activityLevel, goalType })
    : null;

  const apply = () => {
    if (!result) return;
    onApply({
      profile: { sex, age: Number(age), heightCm: Math.round(heightCm), activityLevel, goalType },
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

          {isImperial ? (
            <>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Height (ft)"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="(in)"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
              />
            </>
          ) : (
            <input
              type="number"
              inputMode="numeric"
              placeholder="Height (cm)"
              value={heightCmInput}
              onChange={(e) => setHeightCmInput(e.target.value)}
              style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
            />
          )}

          <input
            type="number"
            inputMode="decimal"
            placeholder={isImperial ? 'Weight (lbs)' : 'Weight (kg)'}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
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
