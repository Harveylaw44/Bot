import { clampPct } from '../utils.js';

const COLOR_VAR = {
  green: 'var(--green)',
  yellow: 'var(--yellow)',
  red: 'var(--red)',
};

export function ProgressBar({ label, consumed, goal, unit = 'g', status }) {
  const pct = clampPct(consumed, goal);
  return (
    <div className="progress-row">
      <div className="progress-row-head">
        <span className="label">{label}</span>
        <span className="value">
          {Math.round(consumed)}
          {unit} / {Math.round(goal)}
          {unit}
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: COLOR_VAR[status] || COLOR_VAR.green }}
        />
      </div>
    </div>
  );
}

export function DeleteButton({ onClick }) {
  return (
    <button
      className="delete-x"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Delete"
    >
      ×
    </button>
  );
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

// Simple last-N-days calorie bar chart, no charting library.
export function CalorieBarChart({ days, goal }) {
  const max = Math.max(goal, ...days.map((d) => d.calories), 1);
  const width = 320;
  const height = 120;
  const barGap = 8;
  const barWidth = (width - barGap * (days.length - 1)) / days.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {days.map((d, i) => {
        const h = Math.max(2, (d.calories / max) * (height - 22));
        const x = i * (barWidth + barGap);
        const y = height - 22 - h;
        const over = d.calories > goal;
        const dow = new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
          weekday: 'narrow',
        });
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={4}
              fill={over ? 'var(--red)' : 'var(--green)'}
              opacity={d.calories === 0 ? 0.25 : 1}
            />
            <text
              x={x + barWidth / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-faint)"
            >
              {dow}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Generic trend line chart, no charting library. `points` and the optional
// `average` overlay are both [{date, value}], index-aligned to the same
// dates. When `average` is given, the raw points fade into a thin dotted
// line and the average becomes the bold one — otherwise the raw line is
// bold on its own (e.g. for measurements, which don't have an average).
export function TrendLineChart({ points, average, emptyLabel = 'Log at least 2 entries to see your trend' }) {
  const width = 320;
  const height = 140;
  const padding = 14;

  if (points.length < 2) {
    return <EmptyState>{emptyLabel}</EmptyState>;
  }

  const allValues = [...points.map((p) => p.value), ...(average || []).map((p) => p.value)];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const toCoords = (arr) =>
    arr.map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (p.value - min) / range) * (height - padding * 2);
      return [x, y];
    });

  const rawCoords = toCoords(points);
  const avgCoords = average ? toCoords(average) : null;
  const toPath = (coords) => coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      <path
        d={toPath(rawCoords)}
        fill="none"
        stroke={avgCoords ? 'var(--text-faint)' : 'var(--green)'}
        strokeWidth={avgCoords ? 1.5 : 2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={avgCoords ? 0.6 : 1}
      />
      {rawCoords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={avgCoords ? 2 : 3} fill={avgCoords ? 'var(--text-faint)' : 'var(--green)'} />
      ))}
      {avgCoords && (
        <path
          d={toPath(avgCoords)}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
