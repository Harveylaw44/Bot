import { useState } from 'react';

export default function SupplementFormSheet({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [unit, setUnit] = useState(initial?.unit || '');

  const valid = name.trim() && Number(amount) > 0 && unit.trim();

  const submit = () => {
    if (!valid) return;
    onSave({ name: name.trim(), amount: Number(amount), unit: unit.trim() });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{initial ? 'Edit Supplement' : 'Add Supplement'}</div>

        <input
          type="text"
          placeholder="Name (e.g. Creatine, Vitamin D)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="text"
            placeholder="Unit (g, capsule...)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1.4 }}
          />
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
