import { useEffect, useState } from 'react';
import { getLog, getSettings, getWorkoutCompleted, getRoutineItems, getRoutineLog, todayISO } from '../storage.js';
import { calorieStatus } from '../utils.js';
import DayDetailSheet from './DayDetailSheet.jsx';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Matches storage.js#todayISO's convention (Date -> toISOString -> slice)
// so grid cells key into the same log/completed maps that entries are
// actually stored under.
function dateKey(year, month, day) {
  return new Date(year, month, day).toISOString().slice(0, 10);
}

export default function CalendarSection({ refreshTick }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [log, setLog] = useState({});
  const [completed, setCompleted] = useState({});
  const [settings, setSettings] = useState(getSettings());
  const [routineItems, setRoutineItems] = useState([]);
  const [routineLog, setRoutineLog] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setLog(getLog());
    setCompleted(getWorkoutCompleted());
    setSettings(getSettings());
    setRoutineItems(getRoutineItems());
    setRoutineLog(getRoutineLog());
  }, [refreshTick]);

  const today = todayISO();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const first = new Date(viewYear, viewMonth, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(dateKey(viewYear, viewMonth, d));

  const routineFullyDone = (date) => {
    if (routineItems.length === 0) return false;
    const day = routineLog[date] || {};
    return routineItems.every((i) => day[i.id]);
  };

  const dayStatus = (date) => {
    const entries = log[date] || [];
    const meals = entries.filter((e) => e.type === 'meal');
    if (meals.length === 0) return null;
    const eaten = meals.reduce((s, e) => s + e.calories, 0);
    const burned = entries.filter((e) => e.type === 'cardio').reduce((s, e) => s + e.calories, 0);
    return calorieStatus(settings.calorieGoal - eaten + burned, settings.calorieGoal);
  };

  const monthLabel = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={goPrev} aria-label="Previous month">
          ‹
        </button>
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>{monthLabel}</span>
        <button
          className="calendar-nav-btn"
          onClick={goNext}
          disabled={isCurrentMonth}
          aria-label="Next month"
          style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="calendar-day empty" />;
          const isFuture = date > today;
          const status = dayStatus(date);
          const workoutDone = !!completed[date];
          const routineDone = routineFullyDone(date);
          const bg = status ? `var(--${status}-dim)` : 'var(--bg-elevated)';
          const color = status ? `var(--${status})` : 'var(--text-faint)';
          return (
            <button
              key={date}
              className={`calendar-day${date === today ? ' today' : ''}`}
              onClick={() => !isFuture && setSelectedDate(date)}
              disabled={isFuture}
              style={{
                background: isFuture ? 'transparent' : bg,
                color: isFuture ? 'var(--text-faint)' : color,
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              {Number(date.slice(8, 10))}
              {(workoutDone || routineDone) && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {workoutDone && <span className="dot" />}
                  {routineDone && <span className="dot" style={{ background: 'var(--blue)' }} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {routineItems.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'var(--text-faint)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot" style={{ background: 'currentColor', position: 'static' }} />
            Workout
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot" style={{ background: 'var(--blue)', position: 'static' }} />
            Routine
          </span>
        </div>
      )}

      {selectedDate && <DayDetailSheet date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
