import { useState } from 'react';

export default function ShoppingItemFormSheet({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [note, setNote] = useState(initial?.note || '');

  const valid = name.trim() && Number(price) >= 0;

  const submit = () => {
    if (!valid) return;
    onSave({ name: name.trim(), price: Number(price) || 0, note: note.trim() });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">{initial ? 'Edit Item' : 'Add Item'}</div>

        <input
          type="text"
          placeholder="Item name (e.g. Chicken breast)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={fieldStyle}
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Price (£)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={fieldStyle}
        />
        <input
          type="text"
          placeholder="Note (optional — brand, size, aisle...)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
