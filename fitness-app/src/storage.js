// Thin localStorage wrapper. Every read is defensive (corrupt/missing data
// never crashes the app, it just falls back to a sane default).

const KEYS = {
  settings: 'fittrack_settings',
  log: 'fittrack_log',
  weights: 'fittrack_weights',
  photos: 'fittrack_photos',
  workoutCompleted: 'fittrack_workout_completed',
  workoutPlan: 'fittrack_workout_plan',
  meals: 'fittrack_meals',
  ingredients: 'fittrack_ingredients',
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

// Meals and ingredients are both just "foods" (name + calories + macros) that
// the user can edit or delete — the only difference is which list they live
// in and, by convention, whether they represent a whole plate or a single
// item. Logged entries always copy the values at log time, so editing or
// deleting a food later never rewrites history.

function makeFoodStore(key, seedFn) {
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

const mealStore = makeFoodStore(KEYS.meals, () => [
  { name: 'Chicken & Rice', calories: 620, protein: 52, carbs: 70, fat: 12 },
  { name: 'Minced Beef Pasta', calories: 710, protein: 45, carbs: 78, fat: 22 },
  { name: 'Eggs & Bread', calories: 420, protein: 26, carbs: 38, fat: 18 },
  { name: 'Tuna Pasta', calories: 560, protein: 40, carbs: 65, fat: 10 },
  { name: 'Oats & Yogurt', calories: 380, protein: 24, carbs: 52, fat: 8 },
].map((m) => ({ ...m, id: crypto.randomUUID() })));

const ingredientStore = makeFoodStore(KEYS.ingredients, () => [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'White Rice, cooked (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Greek Yogurt (100g)', calories: 97, protein: 9, carbs: 3.6, fat: 5 },
  { name: 'Almonds (30g)', calories: 174, protein: 6.4, carbs: 6.5, fat: 15 },
].map((i) => ({ ...i, id: crypto.randomUUID() })));

export const getMeals = mealStore.getAll;
export const addMeal = mealStore.add;
export const updateMeal = mealStore.update;
export const deleteMeal = mealStore.remove;

export const getIngredients = ingredientStore.getAll;
export const addIngredient = ingredientStore.add;
export const updateIngredient = ingredientStore.update;
export const deleteIngredient = ingredientStore.remove;

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    log: getLog(),
    weights: getWeights(),
    photos: getPhotos(),
    workoutCompleted: getWorkoutCompleted(),
    workoutPlan: getWorkoutPlan(),
    meals: getMeals(),
    ingredients: getIngredients(),
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
  if (data.meals) write(KEYS.meals, data.meals);
  if (data.ingredients) write(KEYS.ingredients, data.ingredients);
}
