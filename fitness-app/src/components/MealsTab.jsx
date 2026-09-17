import { useEffect, useState } from 'react';
import {
  getSettings,
  getDayEntries,
  addEntry,
  deleteEntry,
  todayISO,
  getMeals,
  addMeal,
  updateMeal,
  deleteMeal,
  getIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
} from '../storage.js';
import { computeMealNutrition } from '../mealCalc.js';
import { DeleteButton, EmptyState } from './shared.jsx';
import IngredientFormSheet from './IngredientFormSheet.jsx';
import LogIngredientSheet from './LogIngredientSheet.jsx';
import MealFormSheet from './MealFormSheet.jsx';
import FoodDatabaseSearchSheet from './FoodDatabaseSearchSheet.jsx';
import { IconPencil, IconPlus, IconSearch } from './icons.jsx';
import { formatTime } from '../utils.js';
import { MEAL_CATEGORIES, categoryLabel } from '../mealCategories.js';

export default function MealsTab({ refreshTick, onDataChange }) {
  const [tab, setTab] = useState('meals'); // 'meals' | 'ingredients'
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // '' (All) | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  const [settings, setSettings] = useState(getSettings());
  const [entries, setEntries] = useState([]);
  const [meals, setMeals] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [justAdded, setJustAdded] = useState(null);
  const [sheet, setSheet] = useState(null); // { item?: meal/ingredient } | null
  const [logSheet, setLogSheet] = useState(null); // ingredient being logged at a custom amount, or null
  const [dbSearch, setDbSearch] = useState(false);
  const date = todayISO();

  useEffect(() => {
    setSettings(getSettings());
    setEntries(getDayEntries(date));
    setMeals(getMeals());
    setIngredients(getIngredients());
  }, [refreshTick]);

  const isMealsTab = tab === 'meals';
  const allFoods = isMealsTab ? meals : ingredients;
  const foods = allFoods
    .filter((f) => !categoryFilter || f.category === categoryFilter)
    .filter((f) => !query.trim() || f.name.toLowerCase().includes(query.trim().toLowerCase()));
  const loggedFoods = entries.filter((e) => e.type === 'meal');
  const totals = loggedFoods.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleLog = (food, nutrition) => {
    addEntry(date, {
      type: 'meal',
      name: food.name,
      calories: Math.round(nutrition.calories),
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    });
    setJustAdded(food.id);
    setTimeout(() => setJustAdded(null), 350);
    onDataChange();
  };

  // Logs an ingredient at whatever amount was entered in LogIngredientSheet
  // rather than its full reference serving — a standalone log entry, not a
  // meal edit, so topping up ("extra 20g of oats") doesn't require touching
  // any meal's recipe. The amount is folded into the entry's name so the
  // log reads clearly (e.g. "Oats (20g)") even though the ingredient itself
  // is always defined per its reference serving.
  const handleLogIngredient = (ingredient, amount, nutrition) => {
    addEntry(date, {
      type: 'meal',
      name: `${ingredient.name} (${amount}${ingredient.unit})`,
      calories: Math.round(nutrition.calories),
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    });
    setJustAdded(ingredient.id);
    setTimeout(() => setJustAdded(null), 350);
    setLogSheet(null);
    onDataChange();
  };

  const handleDeleteEntry = (id) => {
    deleteEntry(date, id);
    onDataChange();
  };

  const openAdd = () => setSheet({ item: null });
  const openEdit = (item) => setSheet({ item });

  const handleSaveMeal = (values) => {
    if (sheet.item) updateMeal(sheet.item.id, values);
    else addMeal(values);
    setSheet(null);
    onDataChange();
  };

  const handleSaveIngredient = (values) => {
    if (sheet.item?.id) updateIngredient(sheet.item.id, values);
    else addIngredient(values);
    setSheet(null);
    onDataChange();
  };

  const handleDeleteFood = () => {
    isMealsTab ? deleteMeal(sheet.item.id) : deleteIngredient(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  const handlePickFromDatabase = (food) => {
    setDbSearch(false);
    setSheet({
      item: {
        name: food.name,
        unit: 'g',
        servingAmount: 100,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
    });
  };

  return (
    <>
      <div className="page-title">Meals</div>

      <div className="segmented">
        <button className={tab === 'meals' ? 'active' : ''} onClick={() => { setTab('meals'); setQuery(''); }}>
          Meals
        </button>
        <button className={tab === 'ingredients' ? 'active' : ''} onClick={() => { setTab('ingredients'); setQuery(''); }}>
          Ingredients
        </button>
      </div>

      <div className="chip-row">
        <button className={categoryFilter === '' ? 'chip active' : 'chip'} onClick={() => setCategoryFilter('')}>
          All
        </button>
        {MEAL_CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={categoryFilter === c.value ? 'chip active' : 'chip'}
            onClick={() => setCategoryFilter(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {allFoods.length > 5 && (
        <input
          type="text"
          placeholder={`Search ${tab}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px',
            color: 'var(--text)',
            fontSize: 14.5,
            marginBottom: 14,
          }}
        />
      )}

      <div className="section-label">Tap to Log</div>
      {foods.length === 0 ? (
        <EmptyState>
          {query.trim()
            ? `No matches for "${query.trim()}"`
            : categoryFilter
              ? `No ${categoryLabel(categoryFilter)} ${tab} yet — add one below and tag it ${categoryLabel(categoryFilter)}`
              : 'Nothing here yet — add your first one below'}
        </EmptyState>
      ) : (
        foods.map((food) => {
          const nutrition = isMealsTab ? computeMealNutrition(food, ingredients) : food;
          return (
            <div
              key={food.id}
              className="list-row"
              style={{
                borderColor: justAdded === food.id ? 'var(--green)' : undefined,
                transition: 'border-color 0.2s ease',
              }}
            >
              <button
                onClick={() => (isMealsTab ? handleLog(food, nutrition) : setLogSheet(food))}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <div className="main">
                  <div className="title">{food.name}</div>
                  <div className="sub">
                    {!categoryFilter && food.category && (
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{categoryLabel(food.category)} · </span>
                    )}
                    P{Math.round(nutrition.protein)} · C{Math.round(nutrition.carbs)} · F{Math.round(nutrition.fat)}g
                  </div>
                </div>
                <span className="amount" style={{ color: 'var(--green)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {Math.round(nutrition.calories)} cal
                </span>
              </button>
              <button className="icon-btn" onClick={() => openEdit(food)} aria-label="Edit" style={{ width: 28, height: 28 }}>
                <IconPencil style={{ width: 14, height: 14 }} />
              </button>
            </div>
          );
        })
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button
          className="btn btn-secondary"
          onClick={openAdd}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <IconPlus style={{ width: 16, height: 16 }} />
          Add {isMealsTab ? 'Meal' : 'Ingredient'}
        </button>

        {!isMealsTab && (
          <button
            className="btn"
            onClick={() => setDbSearch(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <IconSearch style={{ width: 16, height: 16 }} />
            Search
          </button>
        )}
      </div>

      <div className="section-label">Today's Total</div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        {[
          ['Calories', totals.calories, settings.calorieGoal, ''],
          ['Protein', Math.round(totals.protein), settings.proteinGoal, 'g'],
          ['Carbs', Math.round(totals.carbs), settings.carbGoal, 'g'],
          ['Fat', Math.round(totals.fat), settings.fatGoal, 'g'],
        ].map(([label, value, goal, unit]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                letterSpacing: 0.3,
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {value}
              {unit}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              / {goal}
              {unit}
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">Log</div>
      {loggedFoods.length === 0 ? (
        <EmptyState>Nothing logged today</EmptyState>
      ) : (
        loggedFoods.map((m) => (
          <div className="list-row" key={m.id} onClick={() => handleDeleteEntry(m.id)}>
            <div className="main">
              <div className="title">{m.name}</div>
              <div className="sub">{formatTime(m.time)}</div>
            </div>
            <div className="right">
              <span className="amount">{m.calories} cal</span>
              <DeleteButton onClick={() => handleDeleteEntry(m.id)} />
            </div>
          </div>
        ))
      )}

      {sheet && isMealsTab && (
        <MealFormSheet
          initial={sheet.item}
          ingredients={ingredients}
          onClose={() => setSheet(null)}
          onSave={handleSaveMeal}
          onDelete={sheet.item ? handleDeleteFood : undefined}
        />
      )}

      {sheet && !isMealsTab && (
        <IngredientFormSheet
          initial={sheet.item}
          onClose={() => setSheet(null)}
          onSave={handleSaveIngredient}
          onDelete={sheet.item?.id ? handleDeleteFood : undefined}
        />
      )}

      {dbSearch && (
        <FoodDatabaseSearchSheet onClose={() => setDbSearch(false)} onPick={handlePickFromDatabase} />
      )}

      {logSheet && (
        <LogIngredientSheet
          ingredient={logSheet}
          onClose={() => setLogSheet(null)}
          onLog={(amount, nutrition) => handleLogIngredient(logSheet, amount, nutrition)}
        />
      )}
    </>
  );
}
