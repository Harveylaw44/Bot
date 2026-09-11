import { useEffect, useState } from 'react';
import { getWeights } from '../storage.js';
import { CARDIO_ACTIVITIES, estimateCaloriesBurned } from '../calorieBurnCalc.js';

const FALLBACK_WEIGHT_KG = 70;

export default function QuickAddSheet({ variant, onClose, onSubmit }) {
  const [kg, setKg] = useState('');

  const [activity, setActivity] = useState('jump_rope');
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [caloriesAuto, setCaloriesAuto] = useState(true);

  const isCardio = variant === 'cardio';
  const activityInfo = CARDIO_ACTIVITIES.find((a) => a.value === activity);
  const isOther = activity === 'other';

  const loggedWeight = getWeights()[0]?.kg;
  const weightKg = loggedWeight ?? FALLBACK_WEIGHT_KG;

  useEffect(() => {
    if (!isCardio || isOther || !caloriesAuto) return;
    const est = estimateCaloriesBurned(activityInfo?.met, weightKg, Number(duration));
    setCalories(est > 0 ? String(est) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, duration, caloriesAuto]);

  const submit = () => {
    if (isCardio) {
      const cal = parseInt(calories, 10);
      if (!cal || cal <= 0) return;
      const name = isOther ? customName.trim() || 'Cardio' : activityInfo.label;
      onSubmit({ name, calories: cal });
    } else {
      const val = parseFloat(kg);
      if (!val || val <= 0) return;
      onSubmit(val);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{isCardio ? 'Log Cardio' : 'Weight-in'}</div>

        {isCardio ? (
          <>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} style={selectStyle}>
              {CARDIO_ACTIVITIES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>

            {isOther && (
              <input
                type="text"
                placeholder="Name (e.g. Football)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={fieldStyle}
              />
            )}

            {!isOther && (
              <>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  autoFocus
                  style={fieldStyle}
                />
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginBottom: 10 }}>
                  {loggedWeight
                    ? `Estimated using your last logged weight (${loggedWeight}kg)`
                    : `Estimated using a default weight of ${FALLBACK_WEIGHT_KG}kg — log your weight for a more accurate number`}
                </div>
              </>
            )}

            <input
              type="number"
              inputMode="numeric"
              placeholder="Calories burned"
              value={calories}
              onChange={(e) => {
                setCalories(e.target.value);
                setCaloriesAuto(false);
              }}
              style={{ ...fieldStyle, marginBottom: 4 }}
            />
            {!isOther && (
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 10 }}>
                {caloriesAuto ? (
                  'Auto-estimated from activity, duration and weight'
                ) : (
                  <button
                    onClick={() => setCaloriesAuto(true)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}
                  >
                    Use estimated value instead
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <input
            type="number"
            inputMode="decimal"
            placeholder="Weight in kg"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            autoFocus
            style={fieldStyle}
          />
        )}

        <button className="btn btn-primary btn-block" onClick={submit} style={{ marginTop: 6 }}>
          Log
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
