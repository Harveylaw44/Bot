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
              className="card"
              style={{
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: justAdded === food.id ? '1px solid var(--green)' : '1px solid var(--border)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <button
                onClick={() => handleLog(food, nutrition)}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {food.name}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                    {Math.round(nutrition.calories)} cal
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
                  {!categoryFilter && food.category && (
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{categoryLabel(food.category)} · </span>
                  )}
                  P {Math.round(nutrition.protein)}g · C {Math.round(nutrition.carbs)}g · F {Math.round(nutrition.fat)}g
                  {!isMealsTab && ` · per ${food.servingAmount}${food.unit}`}
                  {isMealsTab && Array.isArray(food.items) && ` · ${food.items.length} ingredient${food.items.length === 1 ? '' : 's'}`}
                </div>
              </button>
              <button className="icon-btn" onClick={() => openEdit(food)} aria-label="Edit">
                <IconPencil />
              </button>
            </div>
          );
        })
      )}

      <button
        className="btn btn-secondary btn-block"
        onClick={openAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: isMealsTab ? 4 : 10 }}
      >
        <IconPlus style={{ width: 16, height: 16 }} />
        Add {isMealsTab ? 'Meal' : 'Ingredient'}
      </button>

      {!isMealsTab && (
        <button
          className="btn btn-block"
          onClick={() => setDbSearch(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 4,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <IconSearch style={{ width: 16, height: 16 }} />
          Search Food Database
        </button>
      )}

      <div className="section-label">Today's Total</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--text-dim)' }}>Calories</span>
          <span style={{ fontWeight: 700 }}>
            {totals.calories} / {settings.calorieGoal} cal
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Protein</span>
          <span style={{ fontWeight: 700 }}>
            {Math.round(totals.protein)} / {settings.proteinGoal}g
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Carbs</span>
          <span style={{ fontWeight: 700 }}>
            {Math.round(totals.carbs)} / {settings.carbGoal}g
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
          <span style={{ color: 'var(--text-dim)' }}>Fat</span>
          <span style={{ fontWeight: 700 }}>
            {Math.round(totals.fat)} / {settings.fatGoal}g
          </span>
        </div>
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
    </>
  );
}
