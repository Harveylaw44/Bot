// Thin localStorage wrapper. Every read is defensive (corrupt/missing data
// never crashes the app, it just falls back to a sane default).

const KEYS = {
  settings: 'fittrack_settings',
  log: 'fittrack_log',
  weights: 'fittrack_weights',
  photos: 'fittrack_photos',
  workoutCompleted: 'fittrack_workout_completed',
  workoutCycle: 'fittrack_workout_cycle',
  meals: 'fittrack_meals',
  ingredients: 'fittrack_ingredients',
  supplements: 'fittrack_supplements',
  supplementLog: 'fittrack_supplement_log',
  measurementTypes: 'fittrack_measurement_types',
  measurements: 'fittrack_measurements',
  water: 'fittrack_water',
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
  waterGoalMl: 3000,
  units: 'metric', // 'metric' (kg/cm) | 'imperial' (lbs/ft-in)
  // Profile fields, only used to prefill the goals calculator next time.
  sex: 'male',
  age: '',
  heightCm: '',
  activityLevel: 'moderate',
  goalType: 'maintain',
};

// A repeating N-day rotation, not tied to weekdays (e.g. train 2 days,
// rest 1, repeat) — anchorDate is the calendar date on which steps[0]
// falls, so any date's workout is (days since anchor) mod steps.length.
export const DEFAULT_WORKOUT_CYCLE = {
  steps: ['Chest & Biceps', 'Back', 'Rest Day', 'Legs', 'Shoulders & Triceps', 'Rest Day'],
  anchorDate: new Date().toISOString().slice(0, 10),
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

export function getWorkoutCycle() {
  return { ...DEFAULT_WORKOUT_CYCLE, ...read(KEYS.workoutCycle, {}) };
}

export function saveWorkoutCycle(cycle) {
  write(KEYS.workoutCycle, cycle);
}

export function getWorkoutForDate(dateISO) {
  const { steps, anchorDate } = getWorkoutCycle();
  if (!steps || steps.length === 0) return 'Rest Day';
  const anchor = new Date(anchorDate + 'T00:00:00');
  const d = new Date(dateISO + 'T00:00:00');
  const diffDays = Math.round((d - anchor) / 86400000);
  const idx = ((diffDays % steps.length) + steps.length) % steps.length;
  return steps[idx];
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

// Meals, ingredients and supplements are all just editable lists of objects
// with an id — the only difference is the shape of the object and which key
// they're stored under. Logged entries (food log or supplement log) always
// copy values at log time, so editing or deleting a definition later never
// rewrites history.

function makeStore(key, seedFn) {
  const getAll = () => {
    const existing = read(key, null);
    if (existing) return existing;
    const seeded = seedFn();
    write(key, seeded);
    return seeded;
  };

  const add = (food) => {
    const all = getAll();
    const withId = { ...food, id: crypto.randomUUID() };
    const next = [...all, withId];
    write(key, next);
    return next;
  };

  const update = (id, food) => {
    const all = getAll();
    const next = all.map((f) => (f.id === id ? { ...f, ...food, id } : f));
    write(key, next);
    return next;
  };

  const remove = (id) => {
    const next = getAll().filter((f) => f.id !== id);
    write(key, next);
    return next;
  };

  return { getAll, add, update, remove };
}

const mealStore = makeStore(KEYS.meals, () => [
  { name: 'Chicken & Rice', calories: 620, protein: 52, carbs: 70, fat: 12 },
  { name: 'Minced Beef Pasta', calories: 710, protein: 45, carbs: 78, fat: 22 },
  { name: 'Eggs & Bread', calories: 420, protein: 26, carbs: 38, fat: 18 },
  { name: 'Tuna Pasta', calories: 560, protein: 40, carbs: 65, fat: 10 },
  { name: 'Oats & Yogurt', calories: 380, protein: 24, carbs: 52, fat: 8 },
].map((m) => ({ ...m, id: crypto.randomUUID() })));

const ingredientStore = makeStore(KEYS.ingredients, () => [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'White Rice, cooked (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Greek Yogurt (100g)', calories: 97, protein: 9, carbs: 3.6, fat: 5 },
  { name: 'Almonds (30g)', calories: 174, protein: 6.4, carbs: 6.5, fat: 15 },
].map((i) => ({ ...i, id: crypto.randomUUID() })));

const supplementStore = makeStore(KEYS.supplements, () => [
  { name: 'Creatine', amount: 5, unit: 'g' },
].map((s) => ({ ...s, id: crypto.randomUUID() })));

export const getMeals = mealStore.getAll;
export const addMeal = mealStore.add;
export const updateMeal = mealStore.update;
export const deleteMeal = mealStore.remove;

export const getIngredients = ingredientStore.getAll;
export const addIngredient = ingredientStore.add;
export const updateIngredient = ingredientStore.update;
export const deleteIngredient = ingredientStore.remove;

export const getSupplements = supplementStore.getAll;
export const addSupplement = supplementStore.add;
export const updateSupplement = supplementStore.update;
export const deleteSupplement = supplementStore.remove;

// Supplement log: { [date]: { [supplementId]: amountTaken } }. A key's
// presence (not its value) is what "taken that day" means, so unlogging
// just deletes the key rather than setting it to zero.
export function getSupplementLog() {
  return read(KEYS.supplementLog, {});
}

export function logSupplement(date, supplementId, amount) {
  const log = getSupplementLog();
  const day = { ...(log[date] || {}), [supplementId]: amount };
  const next = { ...log, [date]: day };
  write(KEYS.supplementLog, next);
  return next;
}

export function unlogSupplement(date, supplementId) {
  const log = getSupplementLog();
  const day = { ...(log[date] || {}) };
  delete day[supplementId];
  const next = { ...log, [date]: day };
  write(KEYS.supplementLog, next);
  return next;
}

export function getSupplementLastNDays(n) {
  const log = getSupplementLog();
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = todayISO(-i);
    days.push({ date, taken: log[date] || {} });
  }
  return days;
}

const measurementTypeStore = makeStore(KEYS.measurementTypes, () =>
  ['Waist', 'Chest', 'Arms', 'Thighs', 'Hips'].map((name) => ({ name, id: crypto.randomUUID() }))
);

export const getMeasurementTypes = measurementTypeStore.getAll;
export const addMeasurementType = measurementTypeStore.add;
export const updateMeasurementType = measurementTypeStore.update;
export const deleteMeasurementType = measurementTypeStore.remove;

export function getMeasurements() {
  return read(KEYS.measurements, []);
}

export function addMeasurement(typeId, value) {
  const all = getMeasurements();
  const entry = { id: crypto.randomUUID(), typeId, date: todayISO(), value, time: Date.now() };
  const next = [entry, ...all];
  write(KEYS.measurements, next);
  return next;
}

export function deleteMeasurement(id) {
  const next = getMeasurements().filter((m) => m.id !== id);
  write(KEYS.measurements, next);
  return next;
}

export function getWaterEntries() {
  return read(KEYS.water, []);
}

export function addWater(amountMl) {
  const all = getWaterEntries();
  const entry = { id: crypto.randomUUID(), date: todayISO(), amount: amountMl, time: Date.now() };
  const next = [entry, ...all];
  write(KEYS.water, next);
  return next;
}

export function deleteWater(id) {
  const next = getWaterEntries().filter((w) => w.id !== id);
  write(KEYS.water, next);
  return next;
}

export function getWaterTotalForDate(date) {
  return getWaterEntries()
    .filter((w) => w.date === date)
    .reduce((sum, w) => sum + w.amount, 0);
}

const MAX_STREAK_LOOKBACK = 3650; // 10 years — a safety cap, not a real limit

// A day counts toward the logging streak if any food (meal or ingredient)
// was logged on it. Today not having anything logged yet doesn't break a
// streak built on previous days — the day isn't over.
export function getLoggingStreak() {
  const log = getLog();
  const hasFood = (date) => (log[date] || []).some((e) => e.type === 'meal');
  const startOffset = hasFood(todayISO()) ? 0 : 1;
  let streak = 0;
  for (let i = startOffset; i < MAX_STREAK_LOOKBACK; i++) {
    if (hasFood(todayISO(-i))) streak++;
    else break;
  }
  return streak;
}

// Only days with a scheduled (non-rest) workout count toward the gym streak;
// rest days are skipped over rather than breaking or extending it. Same
// "today isn't over yet" carve-out as the logging streak.
export function getGymStreak() {
  const completed = getWorkoutCompleted();
  let streak = 0;
  for (let i = 0; i < MAX_STREAK_LOOKBACK; i++) {
    const date = todayISO(-i);
    if (getWorkoutForDate(date) === 'Rest Day') continue;
    if (completed[date]) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    log: getLog(),
    weights: getWeights(),
    photos: getPhotos(),
    workoutCompleted: getWorkoutCompleted(),
    workoutCycle: getWorkoutCycle(),
    meals: getMeals(),
    ingredients: getIngredients(),
    supplements: getSupplements(),
    supplementLog: getSupplementLog(),
    measurementTypes: getMeasurementTypes(),
    measurements: getMeasurements(),
    water: getWaterEntries(),
  };
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
  if (data.settings) write(KEYS.settings, data.settings);
  if (data.log) write(KEYS.log, data.log);
  if (data.weights) write(KEYS.weights, data.weights);
  if (data.photos) write(KEYS.photos, data.photos);
  if (data.workoutCompleted) write(KEYS.workoutCompleted, data.workoutCompleted);
  if (data.workoutCycle) write(KEYS.workoutCycle, data.workoutCycle);
  if (data.meals) write(KEYS.meals, data.meals);
  if (data.ingredients) write(KEYS.ingredients, data.ingredients);
  if (data.supplements) write(KEYS.supplements, data.supplements);
  if (data.supplementLog) write(KEYS.supplementLog, data.supplementLog);
  if (data.measurementTypes) write(KEYS.measurementTypes, data.measurementTypes);
  if (data.measurements) write(KEYS.measurements, data.measurements);
  if (data.water) write(KEYS.water, data.water);
}
