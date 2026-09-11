import { useEffect, useState } from 'react';
import {
  getSupplements,
  addSupplement,
  updateSupplement,
  deleteSupplement,
  getSupplementLog,
  logSupplement,
  unlogSupplement,
  getSupplementLastNDays,
  todayISO,
} from '../storage.js';
import { EmptyState } from './shared.jsx';
import SupplementFormSheet from './SupplementFormSheet.jsx';
import { IconPencil, IconPlus, IconCheck } from './icons.jsx';
import { formatDay } from '../utils.js';

export default function PillsTab({ refreshTick, onDataChange }) {
  const [supplements, setSupplements] = useState([]);
  const [todayTaken, setTodayTaken] = useState({});
  const [last7, setLast7] = useState([]);
  const [sheet, setSheet] = useState(null); // { item?: supplement } | 'add'
  const date = todayISO();

  useEffect(() => {
    setSupplements(getSupplements());
    setTodayTaken(getSupplementLog()[date] || {});
    setLast7(getSupplementLastNDays(7));
  }, [refreshTick]);

  const toggleToday = (supplement) => {
    if (todayTaken[supplement.id] !== undefined) {
      unlogSupplement(date, supplement.id);
    } else {
      logSupplement(date, supplement.id, supplement.amount);
    }
    onDataChange();
  };

  const openAdd = () => setSheet({ item: null });
  const openEdit = (item) => setSheet({ item });

  const handleSave = (values) => {
    if (sheet.item) updateSupplement(sheet.item.id, values);
    else addSupplement(values);
    setSheet(null);
    onDataChange();
  };

  const handleDelete = () => {
    deleteSupplement(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Pills</div>

      {supplements.length === 0 ? (
        <EmptyState>No supplements yet — add one below</EmptyState>
      ) : (
        supplements.map((s) => {
          const taken = todayTaken[s.id] !== undefined;
          return (
            <div
              key={s.id}
              className="card"
              style={{
                marginBottom: 12,
                border: taken ? '1px solid var(--green)' : '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
                    {s.amount}
                    {s.unit}
                  </div>
                </div>
                <button className="icon-btn" onClick={() => openEdit(s)} aria-label="Edit">
                  <IconPencil />
                </button>
              </div>

              <button
                className="btn btn-block"
                onClick={() => toggleToday(s)}
                style={{
                  marginTop: 12,
                  background: taken ? 'var(--green)' : 'var(--bg-elevated)',
                  color: taken ? '#04140b' : 'var(--text)',
                  border: taken ? 'none' : '1px solid var(--border)',
                }}
              >
                {taken ? '✓ Taken Today' : 'Mark Taken'}
              </button>

              <div className="week-strip">
                {last7.map((day) => {
                  const dayTaken = day.taken[s.id] !== undefined;
                  return (
                    <div className="day" key={day.date}>
                      <div className={`dot${dayTaken ? ' taken' : ''}`}>
                        {dayTaken && <IconCheck />}
                      </div>
                      <span className="label">{formatDay(day.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <button
        className="btn btn-secondary btn-block"
        onClick={openAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <IconPlus style={{ width: 16, height: 16 }} />
        Add Supplement
      </button>

      {sheet && (
        <SupplementFormSheet
          initial={sheet.item}
          onClose={() => setSheet(null)}
          onSave={handleSave}
          onDelete={sheet.item ? handleDelete : undefined}
        />
      )}
    </>
  );
}
