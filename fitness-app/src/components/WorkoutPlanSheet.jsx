import { useState } from 'react';

// JS Date#getDay() values, ordered Monday-first for a more natural weekly view.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export default function WorkoutPlanSheet({ initial, onClose, onSave }) {
  const [plan, setPlan] = useState(() => ({ ...initial }));

  const setName = (dow, name) => setPlan((p) => ({ ...p, [dow]: name }));
  const toggleRest = (dow) =>
    setPlan((p) => ({ ...p, [dow]: p[dow] === 'Rest Day' ? '' : 'Rest Day' }));

  const submit = () => {
    const cleaned = {};
    DAY_ORDER.forEach((dow) => {
      cleaned[dow] = (plan[dow] || '').trim() || 'Rest Day';
    });
    onSave(cleaned);
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

        {DAY_ORDER.map((dow) => {
          const isRest = plan[dow] === 'Rest Day';
          return (
            <div key={dow} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)' }}>{DAY_LABELS[dow]}</span>
                <button className={`chip${isRest ? ' active' : ''}`} onClick={() => toggleRest(dow)}>
                  Rest Day
                </button>
              </div>
              {!isRest && (
                <input
                  type="text"
                  placeholder="Workout name (e.g. Push, Legs)"
                  value={plan[dow] === 'Rest Day' ? '' : plan[dow] || ''}
                  onChange={(e) => setName(dow, e.target.value)}
                  style={fieldStyle}
                />
              )}
            </div>
          );
        })}

        <button className="btn btn-primary btn-block" onClick={submit} style={{ marginTop: 4 }}>
          Save Split
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
};
