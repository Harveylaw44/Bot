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
