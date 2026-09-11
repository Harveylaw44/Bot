import { useEffect, useState } from 'react';
import {
  getMeasurementTypes,
  addMeasurementType,
  updateMeasurementType,
  deleteMeasurementType,
  getMeasurements,
  addMeasurement,
  deleteMeasurement,
} from '../storage.js';
import { DeleteButton, EmptyState, TrendLineChart } from './shared.jsx';
import MeasurementTypeSheet from './MeasurementTypeSheet.jsx';
import { IconPencil, IconPlus } from './icons.jsx';
import { formatDateLabel } from '../utils.js';

export default function MeasurementsSection({ refreshTick, onDataChange }) {
  const [types, setTypes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [value, setValue] = useState('');
  const [sheet, setSheet] = useState(null); // 'add' | { item }

  useEffect(() => {
    const t = getMeasurementTypes();
    setTypes(t);
    setSelectedId((prev) => prev && t.some((x) => x.id === prev) ? prev : t[0]?.id ?? null);
    setMeasurements(getMeasurements());
  }, [refreshTick]);

  const selectedType = types.find((t) => t.id === selectedId);
  const entriesForType = measurements.filter((m) => m.typeId === selectedId);
  const last10 = entriesForType.slice(0, 10);
  const chartPoints = [...entriesForType]
    .slice(0, 20)
    .reverse()
    .map((m) => ({ date: m.date, value: m.value }));

  const handleLog = () => {
    const val = parseFloat(value);
    if (!val || val <= 0 || !selectedId) return;
    addMeasurement(selectedId, val);
    setValue('');
    onDataChange();
  };

  const handleDeleteEntry = (id) => {
    deleteMeasurement(id);
    onDataChange();
  };

  const handleSaveType = (values) => {
    if (sheet !== 'add' && sheet?.item) {
      updateMeasurementType(sheet.item.id, values);
    } else {
      addMeasurementType(values);
    }
    setSheet(null);
    onDataChange();
  };

  const handleDeleteType = () => {
    deleteMeasurementType(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  return (
    <>
      <div className="chip-row">
        {types.map((t) => (
          <button
            key={t.id}
            className={`chip${t.id === selectedId ? ' active' : ''}`}
            onClick={() => setSelectedId(t.id)}
          >
            {t.name}
          </button>
        ))}
        <button className="chip" onClick={() => setSheet('add')}>
          <IconPlus style={{ width: 12, height: 12, verticalAlign: -1, marginRight: 3 }} />
          New
        </button>
      </div>

      {!selectedType ? (
        <EmptyState>Add a measurement to start tracking</EmptyState>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{selectedType.name} (cm)</span>
              <button className="icon-btn" onClick={() => setSheet({ item: selectedType })} aria-label="Edit">
                <IconPencil />
              </button>
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder={`Enter ${selectedType.name.toLowerCase()} (cm)`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLog()}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px',
                color: 'var(--text)',
                fontSize: 22,
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: 12,
              }}
            />
            <button className="btn btn-primary btn-block" onClick={handleLog}>
              Log
            </button>
          </div>

          <div className="section-label">Trend</div>
          <div className="card" style={{ marginBottom: 18 }}>
            <TrendLineChart points={chartPoints} emptyLabel="Log at least 2 entries to see your trend" />
          </div>

          <div className="section-label">Last 10</div>
          {last10.length === 0 ? (
            <EmptyState>No {selectedType.name.toLowerCase()} entries yet</EmptyState>
          ) : (
            last10.map((m) => (
              <div className="list-row" key={m.id} onClick={() => handleDeleteEntry(m.id)}>
                <div className="main">
                  <div className="title">{m.value} cm</div>
                  <div className="sub">{formatDateLabel(m.date)}</div>
                </div>
                <div className="right">
                  <DeleteButton onClick={() => handleDeleteEntry(m.id)} />
                </div>
              </div>
            ))
          )}
        </>
      )}

      {sheet && (
        <MeasurementTypeSheet
          initial={sheet !== 'add' ? sheet.item : null}
          onClose={() => setSheet(null)}
          onSave={handleSaveType}
          onDelete={sheet !== 'add' ? handleDeleteType : undefined}
        />
      )}
    </>
  );
}
