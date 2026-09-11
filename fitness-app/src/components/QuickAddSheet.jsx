import { useState } from 'react';

export default function QuickAddSheet({ variant, onClose, onSubmit }) {
  const [calories, setCalories] = useState('');
  const [name, setName] = useState('');
  const [kg, setKg] = useState('');

  const isCardio = variant === 'cardio';

  const submit = () => {
    if (isCardio) {
      const cal = parseInt(calories, 10);
      if (!cal || cal <= 0) return;
      onSubmit({ name: name.trim() || 'Cardio', calories: cal });
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
            <input
              className="field"
              type="text"
              placeholder="Name (e.g. Running)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldStyle}
            />
            <input
              className="field"
              type="number"
              inputMode="numeric"
              placeholder="Calories burned"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              autoFocus
              style={fieldStyle}
            />
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
