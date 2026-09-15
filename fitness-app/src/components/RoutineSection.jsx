import { useEffect, useState } from 'react';
import {
  getRoutineItems,
  addRoutineItem,
  updateRoutineItem,
  deleteRoutineItem,
  getRoutineLog,
  toggleRoutineDone,
  getRoutineLastNDays,
  getRoutineStreak,
  todayISO,
} from '../storage.js';
import { EmptyState } from './shared.jsx';
import RoutineItemFormSheet from './RoutineItemFormSheet.jsx';
import { IconCheck, IconPencil, IconPlus, IconFire } from './icons.jsx';
import { formatDay } from '../utils.js';

function formatTimeLabel(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function RoutineSection({ refreshTick, onDataChange }) {
  const [items, setItems] = useState([]);
  const [doneMap, setDoneMap] = useState({});
  const [last7, setLast7] = useState([]);
  const [streak, setStreak] = useState(0);
  const [sheet, setSheet] = useState(null); // { item?: routineItem } | null
  const date = todayISO();

  useEffect(() => {
    setItems(getRoutineItems());
    setDoneMap(getRoutineLog()[date] || {});
    setLast7(getRoutineLastNDays(7));
    setStreak(getRoutineStreak());
  }, [refreshTick]);

  const doneCount = items.filter((i) => doneMap[i.id]).length;

  const handleToggle = (id) => {
    toggleRoutineDone(date, id);
    onDataChange();
  };

  const openAdd = () => setSheet({ item: null });
  const openEdit = (item) => setSheet({ item });

  const handleSave = (values) => {
    if (sheet.item) updateRoutineItem(sheet.item.id, values);
    else addRoutineItem(values);
    setSheet(null);
    onDataChange();
  };

  const handleDelete = () => {
    deleteRoutineItem(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  return (
    <>
      <div
        className="section-label"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <span>Today's Routine</span>
        {items.length > 0 && (
          <span style={{ color: 'var(--text-faint)', fontWeight: 700, fontSize: 12 }}>
            {doneCount} / {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState>No routine steps yet — add your first one below</EmptyState>
      ) : (
        items.map((item) => {
          const done = !!doneMap[item.id];
          return (
            <div
              key={item.id}
              className="card"
              style={{
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: done ? '1px solid var(--green)' : '1px solid var(--border)',
                opacity: done ? 0.7 : 1,
                transition: 'border-color 0.2s ease, opacity 0.2s ease',
              }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                aria-label={done ? 'Mark not done' : 'Mark done'}
                style={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: '50%',
                  border: done ? 'none' : '1px solid var(--border)',
                  background: done ? 'var(--green)' : 'var(--bg-elevated)',
                  color: '#04140b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done && <IconCheck style={{ width: 15, height: 15 }} />}
              </button>

              <button
                onClick={() => handleToggle(item.id)}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14.5,
                    textDecoration: done ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                  {formatTimeLabel(item.time)}
                </div>
              </button>

              <button className="icon-btn" onClick={() => openEdit(item)} aria-label="Edit">
                <IconPencil />
              </button>
            </div>
          );
        })
      )}

      {items.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconFire style={{ width: 18, height: 18, color: 'var(--yellow)' }} />
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>
              {streak} day streak
            </span>
          </div>
          <div className="week-strip">
            {last7.map((day) => {
              const full = day.total > 0 && day.done === day.total;
              const partial = day.done > 0 && !full;
              return (
                <div className="day" key={day.date}>
                  <div
                    className={`dot${full ? ' taken' : ''}`}
                    style={partial ? { background: 'var(--yellow-dim)', borderColor: 'var(--yellow)' } : undefined}
                    title={`${day.done} / ${day.total}`}
                  >
                    {full && <IconCheck />}
                  </div>
                  <span className="label">{formatDay(day.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        className="btn btn-secondary btn-block"
        onClick={openAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}
      >
        <IconPlus style={{ width: 16, height: 16 }} />
        Add Step
      </button>

      {sheet && (
        <RoutineItemFormSheet
          initial={sheet.item}
          onClose={() => setSheet(null)}
          onSave={handleSave}
          onDelete={sheet.item ? handleDelete : undefined}
        />
      )}
    </>
  );
}
