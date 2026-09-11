import { useEffect, useState } from 'react';
import { getWeights, addWeight, deleteWeight, getSettings } from '../storage.js';
import { DeleteButton, EmptyState, TrendLineChart } from './shared.jsx';
import MeasurementsSection from './MeasurementsSection.jsx';
import { formatDateLabel, movingAverage, kgToLbs, lbsToKg, round1 } from '../utils.js';

export default function WeightTab({ refreshTick, onDataChange }) {
  const [tab, setTab] = useState('weight'); // 'weight' | 'measurements'
  const [weights, setWeights] = useState([]);
  const [value, setValue] = useState('');
  const [units, setUnits] = useState(getSettings().units);

  useEffect(() => {
    setWeights(getWeights());
    setUnits(getSettings().units);
  }, [refreshTick]);

  const isImperial = units === 'imperial';
  const unitLabel = isImperial ? 'lbs' : 'kg';

  const handleLog = () => {
    const entered = parseFloat(value);
    if (!entered || entered <= 0) return;
    const kg = isImperial ? round1(lbsToKg(entered)) : entered;
    addWeight(kg);
    setValue('');
    onDataChange();
  };

  const handleDelete = (id) => {
    deleteWeight(id);
    onDataChange();
  };

  const last10 = weights.slice(0, 10);
  const chartPoints = [...weights]
    .slice(0, 20)
    .reverse()
    .map((w) => ({ date: w.date, value: w.kg }));
  const average = chartPoints.length >= 2 ? movingAverage(chartPoints, 7) : null;

  return (
    <>
      <div className="page-title">Weight</div>

      <div className="segmented">
        <button className={tab === 'weight' ? 'active' : ''} onClick={() => setTab('weight')}>
          Weight
        </button>
        <button className={tab === 'measurements' ? 'active' : ''} onClick={() => setTab('measurements')}>
          Measurements
        </button>
      </div>

      {tab === 'measurements' ? (
        <MeasurementsSection refreshTick={refreshTick} onDataChange={onDataChange} />
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <input
              type="number"
              inputMode="decimal"
              placeholder={`Enter weight (${unitLabel})`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLog()}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '18px',
                color: 'var(--text)',
                fontSize: 28,
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
            <TrendLineChart points={chartPoints} average={average} emptyLabel="Log at least 2 weigh-ins to see your trend" />
            {average && (
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11.5, color: 'var(--text-dim)' }}>
                <span>
                  <span style={{ color: 'var(--green)' }}>●</span> 7-day average
                </span>
                <span>
                  <span style={{ color: 'var(--text-faint)' }}>●</span> raw weigh-ins
                </span>
              </div>
            )}
          </div>

          <div className="section-label">Last 10 Weigh-ins</div>
          {last10.length === 0 ? (
            <EmptyState>No weigh-ins yet</EmptyState>
          ) : (
            last10.map((w) => (
              <div className="list-row" key={w.id} onClick={() => handleDelete(w.id)}>
                <div className="main">
                  <div className="title">
                    {isImperial ? round1(kgToLbs(w.kg)) : w.kg} {unitLabel}
                  </div>
                  <div className="sub">{formatDateLabel(w.date)}</div>
                </div>
                <div className="right">
                  <DeleteButton onClick={() => handleDelete(w.id)} />
                </div>
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}
