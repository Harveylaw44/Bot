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
import { DeleteButton, EmptyState } from './shared.jsx';
import FoodFormSheet from './FoodFormSheet.jsx';
import { IconPencil, IconPlus } from './icons.jsx';
import { formatTime } from '../utils.js';

export default function MealsTab({ refreshTick, onDataChange }) {
  const [tab, setTab] = useState('meals'); // 'meals' | 'ingredients'
  const [settings, setSettings] = useState(getSettings());
  const [entries, setEntries] = useState([]);
  const [meals, setMeals] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [justAdded, setJustAdded] = useState(null);
  const [sheet, setSheet] = useState(null); // { store: 'meals'|'ingredients', item?: food }
  const date = todayISO();

  useEffect(() => {
    setSettings(getSettings());
    setEntries(getDayEntries(date));
    setMeals(getMeals());
    setIngredients(getIngredients());
  }, [refreshTick]);

  const foods = tab === 'meals' ? meals : ingredients;
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

  const handleLog = (food) => {
    addEntry(date, {
      type: 'meal',
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setJustAdded(food.id);
    setTimeout(() => setJustAdded(null), 350);
    onDataChange();
  };

  const handleDeleteEntry = (id) => {
    deleteEntry(date, id);
    onDataChange();
  };

  const openAdd = () => setSheet({ store: tab, item: null });
  const openEdit = (item) => setSheet({ store: tab, item });

  const handleSave = (values) => {
    const isMeals = sheet.store === 'meals';
    if (sheet.item) {
      isMeals ? updateMeal(sheet.item.id, values) : updateIngredient(sheet.item.id, values);
    } else {
      isMeals ? addMeal(values) : addIngredient(values);
    }
    setSheet(null);
    onDataChange();
  };

  const handleDeleteFood = () => {
    const isMeals = sheet.store === 'meals';
    isMeals ? deleteMeal(sheet.item.id) : deleteIngredient(sheet.item.id);
    setSheet(null);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Meals</div>

      <div className="segmented">
        <button className={tab === 'meals' ? 'active' : ''} onClick={() => setTab('meals')}>
          Meals
        </button>
        <button className={tab === 'ingredients' ? 'active' : ''} onClick={() => setTab('ingredients')}>
          Ingredients
        </button>
      </div>

      <div className="section-label">Tap to Log</div>
      {foods.length === 0 ? (
        <EmptyState>Nothing here yet — add your first one below</EmptyState>
      ) : (
        foods.map((food) => (
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
              onClick={() => handleLog(food)}
              style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {food.name}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{food.calories} cal</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
                P {food.protein}g · C {food.carbs}g · F {food.fat}g
              </div>
            </button>
            <button className="icon-btn" onClick={() => openEdit(food)} aria-label="Edit">
              <IconPencil />
            </button>
          </div>
        ))
      )}

      <button
        className="btn btn-secondary btn-block"
        onClick={openAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}
      >
        <IconPlus style={{ width: 16, height: 16 }} />
        Add {tab === 'meals' ? 'Meal' : 'Ingredient'}
      </button>

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

      {sheet && (
        <FoodFormSheet
          title={
            sheet.item
              ? `Edit ${sheet.store === 'meals' ? 'Meal' : 'Ingredient'}`
              : `Add ${sheet.store === 'meals' ? 'Meal' : 'Ingredient'}`
          }
          initial={sheet.item}
          onClose={() => setSheet(null)}
          onSave={handleSave}
          onDelete={sheet.item ? handleDeleteFood : undefined}
        />
      )}
    </>
  );
}
