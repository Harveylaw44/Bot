import { useEffect, useState } from 'react';
import { getWeights, addWeight, deleteWeight } from '../storage.js';
import { DeleteButton, EmptyState, WeightLineChart } from './shared.jsx';
import { formatDateLabel } from '../utils.js';

export default function WeightTab({ refreshTick, onDataChange }) {
  const [weights, setWeights] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    setWeights(getWeights());
  }, [refreshTick]);

  const handleLog = () => {
    const kg = parseFloat(value);
    if (!kg || kg <= 0) return;
    addWeight(kg);
    setValue('');
    onDataChange();
  };

  const handleDelete = (id) => {
    deleteWeight(id);
    onDataChange();
  };

  const last10 = weights.slice(0, 10);
  const chartPoints = [...weights].slice(0, 20).reverse();

  return (
    <>
      <div className="page-title">Weight</div>

      <div className="card" style={{ marginBottom: 18 }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Enter weight (kg)"
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
        <WeightLineChart points={chartPoints} />
      </div>

      <div className="section-label">Last 10 Weigh-ins</div>
      {last10.length === 0 ? (
        <EmptyState>No weigh-ins yet</EmptyState>
      ) : (
        last10.map((w) => (
          <div className="list-row" key={w.id} onClick={() => handleDelete(w.id)}>
            <div className="main">
              <div className="title">{w.kg} kg</div>
              <div className="sub">{formatDateLabel(w.date)}</div>
            </div>
            <div className="right">
              <DeleteButton onClick={() => handleDelete(w.id)} />
            </div>
          </div>
        ))
      )}
    </>
  );
}
