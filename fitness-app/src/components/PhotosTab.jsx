import { useEffect, useState } from 'react';
import { getPhotos, addPhoto, deletePhoto } from '../storage.js';
import { downscaleImage } from '../imageUtils.js';
import { EmptyState } from './shared.jsx';
import { IconCamera } from './icons.jsx';
import { formatDateLabel } from '../utils.js';

export default function PhotosTab({ refreshTick, onDataChange }) {
  const [photos, setPhotos] = useState([]);
  const [preview, setPreview] = useState(null);

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
          marginBottom: 18,
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

      {photos.length === 0 ? (
        <EmptyState>No photos yet</EmptyState>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreview(p)}
              style={{
                position: 'relative',
                border: 'none',
                padding: 0,
                borderRadius: 12,
                overflow: 'hidden',
                background: 'var(--bg-card)',
                aspectRatio: '1 / 1',
              }}
            >
              <img
                src={p.dataUrl}
                alt={p.date}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
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
