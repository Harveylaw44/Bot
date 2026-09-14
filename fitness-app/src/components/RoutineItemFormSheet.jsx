import { useState } from 'react';

export default function RoutineItemFormSheet({ initial, onClose, onSave, onDelete }) {
  const [time, setTime] = useState(initial?.time || '08:00');
  const [label, setLabel] = useState(initial?.label || '');

  const valid = time && label.trim();

  const submit = () => {
    if (!valid) return;
    onSave({ time, label: label.trim() });
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
          style={{ ...fieldStyle, marginBottom: 10 }}
        />

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
