import { useState } from 'react';
import { todayISO } from '../storage.js';

export default function RoutineItemFormSheet({ initial, onClose, onSave, onDelete }) {
  const [time, setTime] = useState(initial?.time || '08:00');
  const [label, setLabel] = useState(initial?.label || '');
  const [oneOff, setOneOff] = useState(!!initial?.date);

  const valid = time && label.trim();

  const submit = () => {
    if (!valid) return;
    onSave({ time, label: label.trim(), date: oneOff ? todayISO() : undefined });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{initial ? 'Edit Step' : 'Add Step'}</div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={fieldStyle}
        />
        <input
          type="text"
          placeholder="What do you do? (e.g. Take creatine)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          style={fieldStyle}
        />

        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>
          REPEATS
        </div>
        <div className="segmented" style={{ margin: 0, marginBottom: 6 }}>
          <button className={!oneOff ? 'active' : ''} onClick={() => setOneOff(false)}>
            Every day
          </button>
          <button className={oneOff ? 'active' : ''} onClick={() => setOneOff(true)}>
            Just today
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 14 }}>
          {oneOff
            ? "Only shows today, and won't count toward your routine streak."
            : 'Shows every day and counts toward your routine streak.'}
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
