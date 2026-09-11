import { useEffect, useRef, useState } from 'react';
import { exportAllData, importAllData, getSettings, saveSettings, getWeights } from '../storage.js';
import GoalsCalculatorSheet from './GoalsCalculatorSheet.jsx';

export default function SettingsTab({ refreshTick, onDataChange }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(getSettings());
  const [calorieGoal, setCalorieGoal] = useState(settings.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState(settings.proteinGoal);
  const [carbGoal, setCarbGoal] = useState(settings.carbGoal);
  const [fatGoal, setFatGoal] = useState(settings.fatGoal);
  const [goalsStatus, setGoalsStatus] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    setCalorieGoal(s.calorieGoal);
    setProteinGoal(s.proteinGoal);
    setCarbGoal(s.carbGoal);
    setFatGoal(s.fatGoal);
  }, [refreshTick]);

  const handleUnitsChange = (units) => {
    const next = { ...settings, units };
    saveSettings(next);
    setSettings(next);
    onDataChange();
  };

  const handleSaveGoals = () => {
    const next = {
      ...settings,
      calorieGoal: Number(calorieGoal) || 0,
      proteinGoal: Number(proteinGoal) || 0,
      carbGoal: Number(carbGoal) || 0,
      fatGoal: Number(fatGoal) || 0,
    };
    saveSettings(next);
    setSettings(next);
    onDataChange();
    setGoalsStatus('Goals saved.');
    setTimeout(() => setGoalsStatus(null), 2000);
  };

  const handleApplyCalculated = ({ profile, goals }) => {
    const next = { ...settings, ...profile, ...goals };
    saveSettings(next);
    setSettings(next);
    setCalorieGoal(goals.calorieGoal);
    setProteinGoal(goals.proteinGoal);
    setCarbGoal(goals.carbGoal);
    setFatGoal(goals.fatGoal);
    setShowCalc(false);
    onDataChange();
    setGoalsStatus('Goals calculated and saved.');
    setTimeout(() => setGoalsStatus(null), 2500);
  };

  const handleBackup = async () => {
    const data = exportAllData();
    const filename = `fittrack-backup-${data.exportedAt.slice(0, 10)}.json`;
    const json = JSON.stringify(data, null, 2);

    // iOS home-screen apps can't reliably save an <a download> file — the
    // share sheet (Save to Files / AirDrop / Mail) is the path that works there.
    const file = new File([json], filename, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'FitTrack Backup' });
        setStatus({ type: 'ok', text: 'Backup ready — choose "Save to Files" to keep it safe.' });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user closed the share sheet
        // fall through to the download fallback below
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus({ type: 'ok', text: 'Backup file downloaded.' });
  };

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importAllData(data);
      onDataChange();
      setStatus({ type: 'ok', text: 'Data restored successfully.' });
    } catch {
      setStatus({ type: 'err', text: 'That file could not be read as a valid backup.' });
    }
  };

  return (
    <>
      <div className="page-title">Settings</div>

      <div className="section-label">Units</div>
      <div className="card" style={{ marginBottom: 18, padding: 6 }}>
        <div className="segmented" style={{ margin: 0 }}>
          <button className={settings.units !== 'imperial' ? 'active' : ''} onClick={() => handleUnitsChange('metric')}>
            Metric (kg / cm)
          </button>
          <button className={settings.units === 'imperial' ? 'active' : ''} onClick={() => handleUnitsChange('imperial')}>
            Imperial (lbs / ft-in)
          </button>
        </div>
      </div>

      <div className="section-label">Goals</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Calorie goal"
          value={calorieGoal}
          onChange={(e) => setCalorieGoal(e.target.value)}
          style={fieldStyle}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Protein (g)"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Carbs (g)"
            value={carbGoal}
            onChange={(e) => setCarbGoal(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Fat (g)"
            value={fatGoal}
            onChange={(e) => setFatGoal(e.target.value)}
            style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
          />
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSaveGoals} style={{ marginBottom: 10 }}>
          Save Goals
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => setShowCalc(true)}>
          Calculate My Goals
        </button>

        {goalsStatus && (
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{goalsStatus}</div>
        )}
      </div>

      <div className="section-label">Data Backup</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <button className="btn btn-primary btn-block" onClick={handleBackup} style={{ marginBottom: 10 }}>
          Backup Data
        </button>
        <button className="btn btn-secondary btn-block" onClick={handleRestoreClick}>
          Restore Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleRestoreFile}
        />

        {status && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              fontWeight: 600,
              color: status.type === 'ok' ? 'var(--green)' : 'var(--red)',
            }}
          >
            {status.text}
          </div>
        )}
      </div>

      <div className="section-label">How it works</div>
      <div className="card">
        <p style={instructionStyle}>
          All your data — meals, weight, photos, and workouts — is stored only on this
          device, in your browser.
        </p>
        <p style={instructionStyle}>
          <strong>Backup Data</strong> packages everything into one .json file. On iPhone
          this opens the share sheet — pick <strong>Save to Files</strong> (or AirDrop/Mail
          it to yourself) so it's kept somewhere safe, not just on this device.
        </p>
        <p style={{ ...instructionStyle, marginBottom: 0 }}>
          <strong>Restore Data</strong> loads a previously saved .json file back into the
          app — useful after clearing your browser, reinstalling, or switching devices.
        </p>
      </div>

      {showCalc && (
        <GoalsCalculatorSheet
          initial={settings}
          latestWeightKg={getWeights()[0]?.kg}
          onClose={() => setShowCalc(false)}
          onApply={handleApplyCalculated}
        />
      )}
    </>
  );
}

const instructionStyle = {
  fontSize: 13.5,
  lineHeight: 1.5,
  color: 'var(--text-dim)',
  margin: '0 0 12px',
};

const fieldStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px',
  color: 'var(--text)',
  fontSize: 16,
  marginBottom: 10,
};
