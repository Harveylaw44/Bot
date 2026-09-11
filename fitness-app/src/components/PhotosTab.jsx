import { useEffect, useState } from 'react';
import { getPhotos, addPhoto, deletePhoto } from '../storage.js';
import { downscaleImage } from '../imageUtils.js';
import { EmptyState } from './shared.jsx';
import { IconCamera, IconEye, IconEyeOff } from './icons.jsx';
import { formatDateLabel } from '../utils.js';

function groupByMonth(photos) {
  const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date) || b.time - a.time);
  const groups = [];
  let currentKey = null;
  for (const p of sorted) {
    const key = new Date(p.date + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    if (key !== currentKey) {
      groups.push({ label: key, items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(p);
  }
  return groups;
}

export default function PhotosTab({ refreshTick, onDataChange }) {
  const [photos, setPhotos] = useState([]);
  const [preview, setPreview] = useState(null);
  // Defaults to hidden every time this tab mounts — not persisted, so a
  // fresh app open (or just switching back to this tab) never leaves
  // progress photos visible to anyone else picking up the phone.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setPhotos(getPhotos());
  }, [refreshTick]);

  const handleClick = () => document.getElementById('photo-upload-input').click();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const dataUrl = await downscaleImage(file);
    addPhoto(dataUrl);
    onDataChange();
  };

  const handleDelete = (id) => {
    deletePhoto(id);
    setPreview(null);
    onDataChange();
  };

  const groups = groupByMonth(photos);

  return (
    <>
      <div className="page-title">Photos</div>

      <button
        onClick={handleClick}
        className="card"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '28px 16px',
          marginBottom: 12,
          border: '1px dashed var(--border)',
        }}
      >
        <IconCamera style={{ width: 34, height: 34, color: 'var(--green)' }} />
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>Tap to add a progress photo</span>
      </button>
      <input
        id="photo-upload-input"
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {photos.length > 0 && (
        <button
          className="btn btn-secondary btn-block"
          onClick={() => setRevealed((r) => !r)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }}
        >
          {revealed ? <IconEyeOff style={{ width: 16, height: 16 }} /> : <IconEye style={{ width: 16, height: 16 }} />}
          {revealed ? 'Hide Photos' : 'Show Photos'}
        </button>
      )}

      {photos.length === 0 ? (
        <EmptyState>No photos yet</EmptyState>
      ) : (
        groups.map((group) => (
          <div key={group.label}>
            <div className="section-label">{group.label}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 18,
              }}
            >
              {group.items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => revealed && setPreview(p)}
                  style={{
                    position: 'relative',
                    border: 'none',
                    padding: 0,
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    aspectRatio: '1 / 1',
                    cursor: revealed ? 'pointer' : 'default',
                  }}
                >
                  <img
                    src={p.dataUrl}
                    alt={p.date}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: revealed ? 'none' : 'blur(22px)',
                      transform: revealed ? 'none' : 'scale(1.1)',
                      transition: 'filter 0.2s ease',
                    }}
                  />
                  {!revealed && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconEyeOff style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.85)' }} />
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      fontSize: 10.5,
                      fontWeight: 700,
                      background: 'rgba(0,0,0,0.55)',
                      padding: '2px 7px',
                      borderRadius: 20,
                    }}
                  >
                    {formatDateLabel(p.date)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div
            style={{ maxWidth: 480, width: '100%', padding: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.dataUrl}
              alt={preview.date}
              style={{ width: '100%', borderRadius: 16, display: 'block', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPreview(null)}>
                Close
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--red-dim)', color: 'var(--red)' }}
                onClick={() => handleDelete(preview.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
