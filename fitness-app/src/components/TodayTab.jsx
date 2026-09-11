import { useEffect, useState } from 'react';
import {
  getSettings,
  getDayEntries,
  deleteEntry,
  addEntry,
  addWeight,
  addPhoto,
  getLastNDaysTotals,
  getLoggingStreak,
  getGymStreak,
  todayISO,
} from '../storage.js';
import { ProgressBar, DeleteButton, EmptyState, CalorieBarChart } from './shared.jsx';
import QuickAddSheet from './QuickAddSheet.jsx';
import { IconMeals, IconCardio, IconScale, IconCamera, IconFire, IconGym } from './icons.jsx';
import { calorieStatus, macroStatus, formatTime } from '../utils.js';
import { downscaleImage } from '../imageUtils.js';

export default function TodayTab({ refreshTick, onDataChange, goToTab }) {
  const [settings, setSettings] = useState(getSettings());
  const [entries, setEntries] = useState([]);
  const [last7, setLast7] = useState([]);
  const [loggingStreak, setLoggingStreak] = useState(0);
  const [gymStreak, setGymStreak] = useState(0);
  const [sheet, setSheet] = useState(null); // 'cardio' | 'weight' | null
  const date = todayISO();

  useEffect(() => {
    setSettings(getSettings());
    setEntries(getDayEntries(date));
    setLast7(getLastNDaysTotals(7));
    setLoggingStreak(getLoggingStreak());
    setGymStreak(getGymStreak());
  }, [refreshTick]);

  const eaten = entries
    .filter((e) => e.type === 'meal')
    .reduce((s, e) => s + e.calories, 0);
  const burned = entries
    .filter((e) => e.type === 'cardio')
    .reduce((s, e) => s + e.calories, 0);
  const remaining = settings.calorieGoal - eaten + burned;
  const status = calorieStatus(remaining, settings.calorieGoal);

  const protein = entries.filter((e) => e.type === 'meal').reduce((s, e) => s + (e.protein || 0), 0);
  const carbs = entries.filter((e) => e.type === 'meal').reduce((s, e) => s + (e.carbs || 0), 0);
  const fat = entries.filter((e) => e.type === 'meal').reduce((s, e) => s + (e.fat || 0), 0);

  const handleDelete = (id) => {
    deleteEntry(date, id);
    onDataChange();
  };

  const handlePhotoClick = () => {
    document.getElementById('quick-photo-input').click();
  };

  const handlePhotoFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const dataUrl = await downscaleImage(file);
    addPhoto(dataUrl);
    onDataChange();
  };

  return (
    <>
      <div className="page-title">Today</div>

      <div className="card" style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>
          CALORIES LEFT
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.15,
            color: `var(--${status})`,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(remaining)}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
          {eaten} eaten{burned > 0 ? ` · ${burned} burned` : ''} · {settings.calorieGoal} goal
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <ProgressBar
          label="Protein"
          consumed={protein}
          goal={settings.proteinGoal}
          status={macroStatus(protein, settings.proteinGoal)}
        />
        <ProgressBar
          label="Carbs"
          consumed={carbs}
          goal={settings.carbGoal}
          status={macroStatus(carbs, settings.carbGoal)}
        />
        <ProgressBar
          label="Fat"
          consumed={fat}
          goal={settings.fatGoal}
          status={macroStatus(fat, settings.fatGoal)}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <IconFire style={{ width: 20, height: 20, color: 'var(--yellow)' }} />
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{loggingStreak}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 600 }}>
            day logging streak
          </div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <IconGym style={{ width: 20, height: 20, color: 'var(--green)' }} />
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{gymStreak}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 600 }}>
            day gym streak
          </div>
        </div>
      </div>

      <div className="section-label">Quick Add</div>
      <div className="quick-add-grid" style={{ marginBottom: 4 }}>
        <button className="quick-add-btn" onClick={() => goToTab('meals')}>
          <IconMeals />
          Meal
        </button>
        <button className="quick-add-btn" onClick={() => setSheet('cardio')}>
          <IconCardio />
          Cardio
        </button>
        <button className="quick-add-btn" onClick={() => setSheet('weight')}>
          <IconScale />
          Weight-in
        </button>
        <button className="quick-add-btn" onClick={handlePhotoClick}>
          <IconCamera />
          Photo
        </button>
      </div>
      <input
        id="quick-photo-input"
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handlePhotoFile}
      />

      <div className="section-label">Log</div>
      {entries.length === 0 ? (
        <EmptyState>Nothing logged yet — tap Quick Add above</EmptyState>
      ) : (
        entries.map((e) => (
          <div className="list-row" key={e.id} onClick={() => handleDelete(e.id)}>
            <div className="main">
              <div className="title">{e.name}</div>
              <div className="sub">
                {e.type === 'cardio' ? 'Cardio · ' : ''}
                {formatTime(e.time)}
              </div>
            </div>
            <div className="right">
              <span className="amount">
                {e.type === 'cardio' ? '-' : ''}
                {e.calories} cal
              </span>
              <DeleteButton onClick={() => handleDelete(e.id)} />
            </div>
          </div>
        ))
      )}

      <div className="section-label">Last 7 Days</div>
      <div className="card">
        <CalorieBarChart days={last7} goal={settings.calorieGoal} />
      </div>

      {sheet && (
        <QuickAddSheet
          variant={sheet}
          onClose={() => setSheet(null)}
          onSubmit={(value) => {
            if (sheet === 'cardio') {
              addEntry(date, { type: 'cardio', name: value.name, calories: value.calories });
            } else {
              addWeight(value);
            }
            setSheet(null);
            onDataChange();
          }}
        />
      )}
    </>
  );
}
