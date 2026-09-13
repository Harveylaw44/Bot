import { useEffect, useRef, useState } from 'react';
import { lookupBarcode } from '../foodSearch.js';

export default function BarcodeScannerSheet({ onClose, onFound }) {
  const videoRef = useRef(null);
  const scanningRef = useRef(true);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('starting'); // starting | scanning | looking-up | not-found | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    let controls;
    scanningRef.current = true;
    setStatus('starting');

    const handleDetected = async (code, ctrls) => {
      ctrls.stop();
      setStatus('looking-up');
      try {
        const food = await lookupBarcode(code);
        if (cancelled) return;
        if (food) onFound(food);
        else setStatus('not-found');
      } catch {
        if (!cancelled) {
          setErrorMsg("Couldn't reach the food database — check your connection and try again.");
          setStatus('error');
        }
      }
    };

    // The scanning library is ~120KB gzipped — loaded on demand here so it
    // never costs anything for people who never tap "Scan Barcode".
    import('@zxing/browser')
      .then(({ BrowserMultiFormatReader }) => {
        if (cancelled) return undefined;
        const reader = new BrowserMultiFormatReader();
        return reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current,
          (result, err, ctrls) => {
            controls = ctrls;
            if (cancelled || !scanningRef.current) return;
            if (result) {
              scanningRef.current = false;
              handleDetected(result.getText(), ctrls);
            }
          }
        );
      })
      .then((ctrls) => {
        if (!ctrls) return;
        controls = ctrls;
        if (cancelled) {
          ctrls.stop();
          return;
        }
        setStatus('scanning');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(
          err?.name === 'NotAllowedError'
            ? 'Camera access was denied — allow it in your browser settings to scan barcodes.'
            : "Couldn't access the camera on this device."
        );
        setStatus('error');
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [attempt, onFound]);

  const retry = () => setAttempt((a) => a + 1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">Scan Barcode</div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            marginBottom: 14,
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
          />
          {(status === 'starting' || status === 'looking-up') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(0,0,0,0.45)',
                textAlign: 'center',
                padding: 16,
              }}
            >
              {status === 'looking-up' ? 'Looking up product...' : 'Starting camera...'}
            </div>
          )}
        </div>

        {status === 'scanning' && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center' }}>
            Point your camera at a barcode
          </div>
        )}

        {status === 'not-found' && (
          <>
            <div
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}
            >
              That product isn't in the database — try searching by name instead.
            </div>
            <button className="btn btn-secondary btn-block" onClick={retry}>
              Scan Another
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}>
              {errorMsg}
            </div>
            <button className="btn btn-secondary btn-block" onClick={retry}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
