import { useEffect, useState } from 'react';
import { getWorkoutPlan, getWorkoutCompleted, setWorkoutCompleted, todayISO } from '../storage.js';
import { formatDateLabel } from '../utils.js';
import { IconCheck } from './icons.jsx';

export default function GymTab({ refreshTick, onDataChange }) {
  const [plan, setPlan] = useState({});
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    setPlan(getWorkoutPlan());
    setCompleted(getWorkoutCompleted());
  }, [refreshTick]);

  const date = todayISO();
  const dow = new Date().getDay();
  const todayWorkout = plan[dow];
  const isRestDay = todayWorkout === 'Rest Day';
  const todayDone = !!completed[date];

  const toggleToday = () => {
    setWorkoutCompleted(date, !todayDone);
    onDataChange();
  };

  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d = todayISO(i);
    const dayOfWeek = new Date(d + 'T00:00:00').getDay();
    return { date: d, workout: plan[dayOfWeek], done: !!completed[d] };
  });

  const toggleDay = (d, done) => {
    setWorkoutCompleted(d, !done);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Gym</div>

      <div
        className="card"
        style={{
          textAlign: 'center',
          marginBottom: 16,
          border: todayDone ? '1px solid var(--green)' : '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 6 }}>
          TODAY'S WORKOUT
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>{todayWorkout}</div>
        <button
          className="btn btn-block"
          onClick={toggleToday}
          disabled={isRestDay}
          style={{
            background: todayDone ? 'var(--green)' : isRestDay ? 'var(--bg-elevated)' : 'var(--bg-card)',
            color: todayDone ? '#04140b' : isRestDay ? 'var(--text-faint)' : 'var(--text)',
            border: todayDone ? 'none' : '1px solid var(--border)',
          }}
        >
          {isRestDay ? 'Rest Day' : todayDone ? '✓ Completed' : 'Mark Complete'}
        </button>
      </div>

      <div className="section-label">Next 7 Days</div>
      {next7.map((d) => (
        <div
          className="list-row"
          key={d.date}
          onClick={() => d.workout !== 'Rest Day' && toggleDay(d.date, d.done)}
        >
          <div className="main">
            <div className="title">{d.workout}</div>
            <div className="sub">{formatDateLabel(d.date)}</div>
          </div>
          <div className="right">
            {d.workout !== 'Rest Day' && (
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: d.done ? 'var(--green)' : 'var(--bg-elevated)',
                  border: d.done ? 'none' : '1px solid var(--border)',
                }}
              >
                {d.done && <IconCheck style={{ width: 15, height: 15, color: '#04140b' }} />}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
