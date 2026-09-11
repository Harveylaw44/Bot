import { useEffect, useState } from 'react';
import { MEAL_PRESETS } from '../data/mealPresets.js';
import { getSettings, getDayEntries, addEntry, deleteEntry, todayISO } from '../storage.js';
import { DeleteButton, EmptyState } from './shared.jsx';
import { formatTime } from '../utils.js';

export default function MealsTab({ refreshTick, onDataChange }) {
  const [settings, setSettings] = useState(getSettings());
  const [entries, setEntries] = useState([]);
  const [justAdded, setJustAdded] = useState(null);
  const date = todayISO();

  useEffect(() => {
    setSettings(getSettings());
    setEntries(getDayEntries(date));
  }, [refreshTick]);

  const meals = entries.filter((e) => e.type === 'meal');
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAdd = (preset) => {
    addEntry(date, {
      type: 'meal',
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
    });
    setJustAdded(preset.id);
    setTimeout(() => setJustAdded(null), 350);
    onDataChange();
  };

  const handleDelete = (id) => {
    deleteEntry(date, id);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Meals</div>

      <div className="section-label">Tap to Add</div>
      {MEAL_PRESETS.map((preset) => (
        <button
          key={preset.id}
          className="card"
          style={{
            width: '100%',
            textAlign: 'left',
            marginBottom: 10,
            display: 'block',
            border:
              justAdded === preset.id ? '1px solid var(--green)' : '1px solid var(--border)',
            transition: 'border-color 0.2s ease',
          }}
          onClick={() => handleAdd(preset)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{preset.name}</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>{preset.calories} cal</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
            P {preset.protein}g · C {preset.carbs}g · F {preset.fat}g
          </div>
        </button>
      ))}

      <div className="section-label">Today's Total</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-dim)' }}>Calories</span>
          <span style={{ fontWeight: 700 }}>
            {totals.calories} / {settings.calorieGoal} cal
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Protein</span>
          <span style={{ fontWeight: 700 }}>
            {totals.protein} / {settings.proteinGoal}g
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Carbs</span>
          <span style={{ fontWeight: 700 }}>
            {totals.carbs} / {settings.carbGoal}g
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Fat</span>
          <span style={{ fontWeight: 700 }}>
            {totals.fat} / {settings.fatGoal}g
          </span>
        </div>
      </div>

      <div className="section-label">Recently Added</div>
      {meals.length === 0 ? (
        <EmptyState>No meals logged today</EmptyState>
      ) : (
        meals.map((m) => (
          <div className="list-row" key={m.id} onClick={() => handleDelete(m.id)}>
            <div className="main">
              <div className="title">{m.name}</div>
              <div className="sub">{formatTime(m.time)}</div>
            </div>
            <div className="right">
              <span className="amount">{m.calories} cal</span>
              <DeleteButton onClick={() => handleDelete(m.id)} />
            </div>
          </div>
        ))
      )}
    </>
  );
}
