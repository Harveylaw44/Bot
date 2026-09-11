import {
  getDayEntries,
  getSettings,
  getWorkoutForDate,
  getWorkoutCompleted,
  getWeights,
  getWaterTotalForDate,
} from '../storage.js';
import { formatDateLabel, formatMl, kgToLbs, round1 } from '../utils.js';

export default function DayDetailSheet({ date, onClose }) {
  const settings = getSettings();
  const isImperial = settings.units === 'imperial';
  const entries = getDayEntries(date);
  const meals = entries.filter((e) => e.type === 'meal');
  const eaten = meals.reduce((s, e) => s + e.calories, 0);
  const burned = entries.filter((e) => e.type === 'cardio').reduce((s, e) => s + e.calories, 0);
  const protein = meals.reduce((s, e) => s + (e.protein || 0), 0);
  const carbs = meals.reduce((s, e) => s + (e.carbs || 0), 0);
  const fat = meals.reduce((s, e) => s + (e.fat || 0), 0);
  const workout = getWorkoutForDate(date);
  const workoutDone = !!getWorkoutCompleted()[date];
  const weightEntry = getWeights().find((w) => w.date === date);
  const water = getWaterTotalForDate(date);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{formatDateLabel(date)}</div>

        <div className="card" style={{ marginBottom: 10, background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-dim)' }}>Calories</span>
            <span style={{ fontWeight: 700 }}>
              {eaten}
              {burned > 0 ? ` (-${burned} burned)` : ''} / {settings.calorieGoal}
            </span>
          </div>
          {meals.length > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 8 }}>
              P {Math.round(protein)}g · C {Math.round(carbs)}g · F {Math.round(fat)}g
            </div>
          )}
        </div>

        <div
          className="card"
          style={{
            marginBottom: 10,
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>Workout</span>
          <span style={{ fontWeight: 700, color: workoutDone ? 'var(--green)' : 'var(--text)' }}>
            {workout}
            {workout !== 'Rest Day' && workoutDone ? ' ✓' : ''}
          </span>
        </div>

        {weightEntry && (
          <div
            className="card"
            style={{
              marginBottom: 10,
              background: 'var(--bg-elevated)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>Weight</span>
            <span style={{ fontWeight: 700 }}>
              {isImperial ? round1(kgToLbs(weightEntry.kg)) : weightEntry.kg} {isImperial ? 'lbs' : 'kg'}
            </span>
          </div>
        )}

        {water > 0 && (
          <div
            className="card"
            style={{ background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between' }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>Water</span>
            <span style={{ fontWeight: 700 }}>{formatMl(water)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
