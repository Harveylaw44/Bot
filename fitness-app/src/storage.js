// Thin localStorage wrapper. Every read is defensive (corrupt/missing data
// never crashes the app, it just falls back to a sane default).

const KEYS = {
  settings: 'fittrack_settings',
  log: 'fittrack_log',
  weights: 'fittrack_weights',
  photos: 'fittrack_photos',
  workoutCompleted: 'fittrack_workout_completed',
  workoutPlan: 'fittrack_workout_plan',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, app keeps working in-memory
  }
}

export const DEFAULT_SETTINGS = {
  calorieGoal: 2400,
  proteinGoal: 150,
  carbGoal: 250,
  fatGoal: 80,
};

export const DEFAULT_WORKOUT_PLAN = {
  0: 'Rest Day', // Sunday
  1: 'Chest & Biceps',
  2: 'Back & Triceps',
  3: 'Legs',
  4: 'Shoulders & Abs',
  5: 'Cardio',
  6: 'Rest Day', // Saturday
};

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

export function getWorkoutPlan() {
  return { ...DEFAULT_WORKOUT_PLAN, ...read(KEYS.workoutPlan, {}) };
}

export function getLog() {
  return read(KEYS.log, {});
}

export function getDayEntries(date) {
  const log = getLog();
  return log[date] || [];
}

export function addEntry(date, entry) {
  const log = getLog();
  const entries = log[date] || [];
  const withId = { ...entry, id: crypto.randomUUID(), time: Date.now() };
  log[date] = [withId, ...entries];
  write(KEYS.log, log);
  return log[date];
}

export function deleteEntry(date, id) {
  const log = getLog();
  const entries = log[date] || [];
  log[date] = entries.filter((e) => e.id !== id);
  write(KEYS.log, log);
  return log[date];
}

export function getLastNDaysTotals(n) {
  const log = getLog();
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = todayISO(-i);
    const entries = log[date] || [];
    const calories = entries
      .filter((e) => e.type === 'meal')
      .reduce((sum, e) => sum + e.calories, 0);
    days.push({ date, calories });
  }
  return days;
}

export function getWeights() {
  return read(KEYS.weights, []);
}

export function addWeight(kg) {
  const weights = getWeights();
  const entry = { id: crypto.randomUUID(), date: todayISO(), kg, time: Date.now() };
  const next = [entry, ...weights];
  write(KEYS.weights, next);
  return next;
}

export function deleteWeight(id) {
  const next = getWeights().filter((w) => w.id !== id);
  write(KEYS.weights, next);
  return next;
}

export function getPhotos() {
  return read(KEYS.photos, []);
}

export function addPhoto(dataUrl) {
  const photos = getPhotos();
  const entry = { id: crypto.randomUUID(), date: todayISO(), dataUrl, time: Date.now() };
  const next = [entry, ...photos];
  write(KEYS.photos, next);
  return next;
}

export function deletePhoto(id) {
  const next = getPhotos().filter((p) => p.id !== id);
  write(KEYS.photos, next);
  return next;
}

export function getWorkoutCompleted() {
  return read(KEYS.workoutCompleted, {});
}

export function setWorkoutCompleted(date, done) {
  const map = getWorkoutCompleted();
  if (done) map[date] = true;
  else delete map[date];
  write(KEYS.workoutCompleted, map);
  return map;
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    log: getLog(),
    weights: getWeights(),
    photos: getPhotos(),
    workoutCompleted: getWorkoutCompleted(),
    workoutPlan: getWorkoutPlan(),
  };
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
  if (data.settings) write(KEYS.settings, data.settings);
  if (data.log) write(KEYS.log, data.log);
  if (data.weights) write(KEYS.weights, data.weights);
  if (data.photos) write(KEYS.photos, data.photos);
  if (data.workoutCompleted) write(KEYS.workoutCompleted, data.workoutCompleted);
  if (data.workoutPlan) write(KEYS.workoutPlan, data.workoutPlan);
}
