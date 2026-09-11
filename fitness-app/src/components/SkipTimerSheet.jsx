import { useEffect, useRef, useState } from 'react';
import { getTimerSettings, saveTimerSettings, getWeights, addEntry, todayISO } from '../storage.js';
import { estimateCaloriesBurned } from '../calorieBurnCalc.js';
import { beep, beepSequence } from '../beep.js';

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function computeNext(phase, round, rounds, workSec, restSec) {
  if (phase === 'work') {
    if (round >= rounds) return { phase: 'done', round, seconds: 0 };
    if (restSec > 0) return { phase: 'rest', round, seconds: restSec };
    return { phase: 'work', round: round + 1, seconds: workSec };
  }
  return { phase: 'work', round: round + 1, seconds: workSec };
}

export default function SkipTimerSheet({ onClose, onDataChange }) {
  const [config, setConfig] = useState(getTimerSettings());
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'done'
  const [phase, setPhase] = useState('work');
  const [round, setRound] = useState(1);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(config.workSec);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [logged, setLogged] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setElapsedSec((e) => e + 1);
      setPhaseSecondsLeft((secs) => {
        const next = secs - 1;
        if (next > 0) {
          if (next <= 3) beep(600, 80, 0.12);
          return next;
        }
        const result = computeNext(phase, round, config.rounds, config.workSec, config.restSec);
        if (result.phase === 'done') {
          setStatus('done');
          beepSequence([
            { freq: 660, duration: 150, delay: 0 },
            { freq: 880, duration: 150, delay: 180 },
            { freq: 1100, duration: 300, delay: 180 },
          ]);
          return 0;
        }
        setPhase(result.phase);
        setRound(result.round);
        beep(result.phase === 'work' ? 880 : 440, 220, 0.22);
        return result.seconds;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status, phase, round, config]);

  useEffect(() => {
    if (status !== 'running' || !('wakeLock' in navigator)) return;
    let cancelled = false;
    navigator.wakeLock
      .request('screen')
      .then((wl) => {
        if (cancelled) wl.release().catch(() => {});
        else wakeLockRef.current = wl;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      wakeLockRef.current?.release?.().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [status]);

  const start = () => {
    saveTimerSettings(config);
    setPhase('work');
    setRound(1);
    setPhaseSecondsLeft(config.workSec);
    setElapsedSec(0);
    setLogged(false);
    setStatus('running');
    beep(880, 220, 0.22);
  };

  const pause = () => setStatus('paused');
  const resume = () => setStatus('running');
  const stopEarly = () => setStatus('done');
  const reset = () => {
    setStatus('idle');
    setPhase('work');
    setRound(1);
    setPhaseSecondsLeft(config.workSec);
    setElapsedSec(0);
    setLogged(false);
  };

  const weightKg = getWeights()[0]?.kg ?? 70;
  const estimatedCalories = estimateCaloriesBurned(11.8, weightKg, elapsedSec / 60);

  const handleLog = () => {
    addEntry(todayISO(), { type: 'cardio', name: 'Jump Rope / Skipping', calories: estimatedCalories });
    setLogged(true);
    onDataChange();
  };

  const totalConfigured = config.rounds * config.workSec + Math.max(config.rounds - 1, 0) * config.restSec;

  return (
    <div className="modal-backdrop" onClick={status === 'idle' ? onClose : undefined}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {status === 'idle' && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <div className="modal-title">Skip Timer</div>

        {status === 'idle' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Work (sec)</div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={config.workSec}
                  onChange={(e) => setConfig((c) => ({ ...c, workSec: Number(e.target.value) || 0 }))}
                  style={fieldStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Rest (sec)</div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={config.restSec}
                  onChange={(e) => setConfig((c) => ({ ...c, restSec: Number(e.target.value) || 0 }))}
                  style={fieldStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Rounds</div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={config.rounds}
                  onChange={(e) => setConfig((c) => ({ ...c, rounds: Number(e.target.value) || 1 }))}
                  style={fieldStyle}
                />
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 18, textAlign: 'center' }}>
              Total: {formatClock(totalConfigured)}
            </div>
            <button className="btn btn-primary btn-block" onClick={start}>
              Start
            </button>
          </>
        )}

        {(status === 'running' || status === 'paused') && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <span
                className="timer-phase-badge"
                style={{
                  background: phase === 'work' ? 'var(--green-dim)' : 'var(--blue-dim)',
                  color: phase === 'work' ? 'var(--green)' : 'var(--blue)',
                }}
              >
                {phase === 'work' ? 'WORK' : 'REST'}
              </span>
            </div>
            <div
              className={`timer-clock${status === 'running' && phaseSecondsLeft <= 3 ? ' pulsing' : ''}`}
              style={{ color: phase === 'work' ? 'var(--green)' : 'var(--blue)' }}
            >
              {formatClock(phaseSecondsLeft)}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
              Round {round} / {config.rounds} · {formatClock(elapsedSec)} elapsed
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {status === 'running' ? (
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={pause}>
                  Pause
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={resume}>
                  Resume
                </button>
              )}
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--red-dim)', color: 'var(--red)' }}
                onClick={stopEarly}
              >
                Stop
              </button>
            </div>
          </>
        )}

        {status === 'done' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>
              Session Complete
            </div>
            <div className="timer-clock" style={{ fontSize: 44 }}>
              {formatClock(elapsedSec)}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
              ~{estimatedCalories} cal estimated
            </div>

            {logged ? (
              <>
                <div style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 700, color: 'var(--green)', marginBottom: 12 }}>
                  Logged to today's cardio ✓
                </div>
                <button className="btn btn-secondary btn-block" onClick={onClose}>
                  Close
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-block" onClick={handleLog} style={{ marginBottom: 10 }}>
                  Log to Today ({estimatedCalories} cal)
                </button>
                <button className="btn btn-secondary btn-block" onClick={onClose}>
                  Discard
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: 'var(--text-faint)',
  marginBottom: 4,
};

const fieldStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '12px',
  color: 'var(--text)',
  fontSize: 16,
  textAlign: 'center',
};
