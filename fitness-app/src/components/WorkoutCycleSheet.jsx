import { useState } from 'react';
import { IconChevronUp, IconChevronDown, IconX, IconPlus } from './icons.jsx';

function computeTodayIndex(steps, anchorDate) {
  if (!steps.length) return 0;
  const anchor = new Date(anchorDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - anchor) / 86400000);
  return ((diffDays % steps.length) + steps.length) % steps.length;
}

export default function WorkoutCycleSheet({ initial, onClose, onSave }) {
  const [steps, setSteps] = useState(() => [...initial.steps]);
  const [todayIndex, setTodayIndex] = useState(() => computeTodayIndex(initial.steps, initial.anchorDate));

  const setName = (i, name) => setSteps((prev) => prev.map((s, idx) => (idx === i ? name : s)));
  const toggleRest = (i) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? (s === 'Rest Day' ? '' : 'Rest Day') : s)));
  const moveStep = (i, dir) =>
    setSteps((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const removeStep = (i) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const addStep = () => setSteps((prev) => [...prev, '']);

  const clampedTodayIndex = Math.min(todayIndex, Math.max(steps.length - 1, 0));

  const submit = () => {
    const cleanSteps = steps.map((s) => s.trim() || 'Rest Day');
    if (cleanSteps.length === 0) return;
    const idx = Math.min(clampedTodayIndex, cleanSteps.length - 1);
    const anchor = new Date();
    anchor.setHours(0, 0, 0, 0);
    anchor.setDate(anchor.getDate() - idx);
    onSave({ steps: cleanSteps, anchorDate: anchor.toISOString().slice(0, 10) });
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
        <div className="modal-title">Edit Workout Split</div>
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: -8, marginBottom: 14 }}>
          A repeating cycle, not tied to specific weekdays — set "Today is" below to sync it.
        </p>

        {steps.map((s, i) => {
          const isRest = s === 'Rest Day';
          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: 0.4 }}>
                  DAY {i + 1}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="icon-btn"
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    style={{ opacity: i === 0 ? 0.35 : 1 }}
                  >
                    <IconChevronUp />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => moveStep(i, 1)}
                    disabled={i === steps.length - 1}
                    aria-label="Move down"
                    style={{ opacity: i === steps.length - 1 ? 0.35 : 1 }}
                  >
                    <IconChevronDown />
                  </button>
                  <button className="icon-btn" onClick={() => removeStep(i)} aria-label="Remove day">
                    <IconX />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Workout name (e.g. Push, Legs)"
                  value={isRest ? '' : s}
                  disabled={isRest}
                  onChange={(e) => setName(i, e.target.value)}
                  style={{ ...fieldStyle, flex: 1, opacity: isRest ? 0.4 : 1 }}
                />
                <button className={`chip${isRest ? ' active' : ''}`} onClick={() => toggleRest(i)}>
                  Rest
                </button>
              </div>
            </div>
          );
        })}

        <button
          className="btn btn-secondary btn-block"
          onClick={addStep}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}
        >
          <IconPlus style={{ width: 16, height: 16 }} />
          Add Day
        </button>

        {steps.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8 }}>
              Today is
            </div>
            <select
              value={clampedTodayIndex}
              onChange={(e) => setTodayIndex(Number(e.target.value))}
              style={{ ...selectStyle, marginBottom: 18 }}
            >
              {steps.map((s, i) => (
                <option key={i} value={i}>
                  Day {i + 1}: {s.trim() || 'Rest Day'}
                </option>
              ))}
            </select>
          </>
        )}

        <button className="btn btn-primary btn-block" onClick={submit} disabled={steps.length === 0}>
          Save Split
        </button>
      </div>
    </div>
  );
}

const fieldStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '12px 14px',
  color: 'var(--text)',
  fontSize: 15,
};

const selectStyle = {
  ...fieldStyle,
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
};
