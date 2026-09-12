import { useEffect, useState } from 'react';
import {
  getShoppingItems,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  toggleShoppingItem,
  getShoppingHistory,
  completeShop,
  deleteShoppingHistoryEntry,
} from '../storage.js';
import { DeleteButton, EmptyState } from './shared.jsx';
import ShoppingItemFormSheet from './ShoppingItemFormSheet.jsx';
import { IconPencil, IconPlus, IconCheck } from './icons.jsx';

const fmt = (n) => `£${(Number(n) || 0).toFixed(2)}`;

export default function ShopTab({ refreshTick, onDataChange }) {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [sheet, setSheet] = useState(null); // { item?: item } | null
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setItems(getShoppingItems());
    setHistory(getShoppingHistory());
  }, [refreshTick]);

  const checkedItems = items.filter((i) => i.checked);
  const totalAll = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const totalChecked = checkedItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const now = new Date();
  const thisMonthTotal = history
    .filter((h) => {
      const d = new Date(h.date + 'T00:00:00');
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, h) => sum + (Number(h.total) || 0), 0);

  const handleToggle = (id) => {
    toggleShoppingItem(id);
    onDataChange();
  };

  const openAdd = () => setSheet({ item: null });
  const openEdit = (item) => setSheet({ item });

  const handleSave = (values) => {
    if (sheet.item) updateShoppingItem(sheet.item.id, values);
    else addShoppingItem(values);
    setSheet(null);
    onDataChange();
  };

  const handleDeleteItem = () => {
    deleteShoppingItem(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  const handleCompleteShop = () => {
    completeShop();
    onDataChange();
    setStatus('Shop complete — logged to your spending history.');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDeleteHistory = (id) => {
    deleteShoppingHistoryEntry(id);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Shopping</div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-dim)' }}>Picked up</span>
          <span style={{ fontWeight: 700 }}>
            {checkedItems.length} / {items.length}
          </span>
        </div>
        <div className="progress-track" style={{ marginTop: 8, marginBottom: 14 }}>
          <div
            className="progress-fill"
            style={{
              width: `${items.length ? (checkedItems.length / items.length) * 100 : 0}%`,
              background: 'var(--green)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-dim)' }}>So far</span>
          <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(totalChecked)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Full list</span>
          <span style={{ fontWeight: 700 }}>{fmt(totalAll)}</span>
        </div>
      </div>

      <div className="section-label">Your List</div>
      {items.length === 0 ? (
        <EmptyState>Nothing on your list yet — add your first item below</EmptyState>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              border: item.checked ? '1px solid var(--green)' : '1px solid var(--border)',
              opacity: item.checked ? 0.7 : 1,
              transition: 'border-color 0.2s ease, opacity 0.2s ease',
            }}
          >
            <button
              onClick={() => handleToggle(item.id)}
              aria-label={item.checked ? 'Mark not picked up' : 'Mark picked up'}
              style={{
                width: 26,
                height: 26,
                flexShrink: 0,
                borderRadius: '50%',
                border: item.checked ? 'none' : '1px solid var(--border)',
                background: item.checked ? 'var(--green)' : 'var(--bg-elevated)',
                color: '#04140b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.checked && <IconCheck style={{ width: 15, height: 15 }} />}
            </button>

            <button
              onClick={() => handleToggle(item.id)}
              style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: item.checked ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </div>
              {item.note && (
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{item.note}</div>
              )}
            </button>

            <span style={{ fontWeight: 700, flexShrink: 0 }}>{fmt(item.price)}</span>
            <button className="icon-btn" onClick={() => openEdit(item)} aria-label="Edit">
              <IconPencil />
            </button>
          </div>
        ))
      )}

      <button
        className="btn btn-secondary btn-block"
        onClick={openAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}
      >
        <IconPlus style={{ width: 16, height: 16 }} />
        Add Item
      </button>

      <button
        className="btn btn-primary btn-block"
        onClick={handleCompleteShop}
        disabled={checkedItems.length === 0}
        style={{ opacity: checkedItems.length === 0 ? 0.5 : 1, marginBottom: status ? 10 : 22 }}
      >
        Complete Shop ({fmt(totalChecked)})
      </button>

      {status && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 22 }}>{status}</div>
      )}

      <div className="section-label">Spending History</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-dim)' }}>This month</span>
          <span style={{ fontWeight: 700 }}>{fmt(thisMonthTotal)}</span>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState>Complete a shop to start tracking your spending</EmptyState>
      ) : (
        history.map((h) => (
          <div className="list-row" key={h.id}>
            <div className="main">
              <div className="title">
                {new Date(h.date + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
              <div className="sub">
                {h.itemCount} item{h.itemCount === 1 ? '' : 's'}
              </div>
            </div>
            <div className="right">
              <span className="amount">{fmt(h.total)}</span>
              <DeleteButton onClick={() => handleDeleteHistory(h.id)} />
            </div>
          </div>
        ))
      )}

      {sheet && (
        <ShoppingItemFormSheet
          initial={sheet.item}
          onClose={() => setSheet(null)}
          onSave={handleSave}
          onDelete={sheet.item ? handleDeleteItem : undefined}
        />
      )}
    </>
  );
}
