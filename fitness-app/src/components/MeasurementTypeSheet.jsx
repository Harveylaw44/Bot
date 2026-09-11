import { useState } from 'react';

export default function MeasurementTypeSheet({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const valid = name.trim().length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{initial ? 'Edit Measurement' : 'Add Measurement'}</div>

        <input
          type="text"
          placeholder="Name (e.g. Waist, Biceps)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px',
            color: 'var(--text)',
            fontSize: 16,
            marginBottom: 14,
          }}
        />

        <button
          className="btn btn-primary btn-block"
          onClick={() => valid && onSave({ name: name.trim() })}
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
