// green / yellow / red status against a goal-based remaining value.
export function calorieStatus(remaining, goal) {
  if (remaining < 0) return 'red';
  if (remaining <= goal * 0.1) return 'yellow';
  return 'green';
}

export function macroStatus(consumed, goal) {
  if (goal <= 0) return 'green';
  const pct = consumed / goal;
  if (pct > 1) return 'red';
  if (pct >= 0.9) return 'yellow';
  return 'green';
}

export function clampPct(consumed, goal) {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(100, (consumed / goal) * 100));
}

export function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(ms) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Unit conversion. Storage always stays canonical (kg, cm) regardless of
// display preference — only these boundary functions ever convert, so
// switching units back and forth never touches saved data.
const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function kgToLbs(kg) {
  return kg / KG_PER_LB;
}

export function lbsToKg(lbs) {
  return lbs * KG_PER_LB;
}

export function cmToIn(cm) {
  return cm / CM_PER_IN;
}

export function inToCm(inches) {
  return inches * CM_PER_IN;
}

export function cmToFtIn(cm) {
  const totalIn = Math.round(cmToIn(cm));
  return { ft: Math.floor(totalIn / 12), inch: totalIn % 12 };
}

export function ftInToCm(ft, inch) {
  return inToCm(Number(ft || 0) * 12 + Number(inch || 0));
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

export function formatMl(ml) {
  if (ml >= 1000) {
    const l = ml / 1000;
    return `${l % 1 === 0 ? l : l.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}L`;
  }
  return `${ml}ml`;
}

// Trailing N-calendar-day average, computed per point from however many
// entries actually fall in that window — not a fixed entry count, since
// weigh-ins aren't always daily. points: [{date, value}], chronological.
export function movingAverage(points, windowDays = 7) {
  return points.map((point, i) => {
    const cutoff = new Date(point.date + 'T00:00:00');
    cutoff.setDate(cutoff.getDate() - (windowDays - 1));
    const window = points
      .slice(0, i + 1)
      .filter((p) => new Date(p.date + 'T00:00:00') >= cutoff);
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    return { date: point.date, value: avg };
  });
}
