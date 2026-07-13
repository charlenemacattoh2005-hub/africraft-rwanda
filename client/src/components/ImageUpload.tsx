import React, { useRef, useState } from 'react';
import { getAuthToken } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Props {
  /** Current image URL (shown as preview) */
  value: string;
  /** Called with the new Cloudinary URL after a successful upload */
  onChange: (url: string) => void;
  /** Optional label shown below the drop zone */
  label?: string;
}

/**
 * ImageUpload
 * ──────────
 * Click the zone or drag & drop to upload.
 * The file is sent to POST /api/upload (multipart/form-data, field "image").
 * Returns the Cloudinary secure_url via `onChange`.
 * No URL text box — upload only.
 */
export default function ImageUpload({ value, onChange, label = 'Product image' }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [dragOver,  setDragOver]  = useState(false);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const token = getAuthToken();
      const fd    = new FormData();
      fd.append('image', file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Upload failed');
      }

      onChange(data.url);
    } catch (e: any) {
      setError(e?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after a failure
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="img-upload-wrapper">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={onInputChange}
        aria-label={label}
      />

      {/* Drop zone / preview */}
      <div
        className={`img-upload-zone${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        aria-label={value ? 'Change image' : 'Upload image'}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {uploading ? (
          /* Loading state */
          <div className="img-upload-loading">
            <div className="img-upload-spinner" />
            <span>Uploading…</span>
          </div>
        ) : value ? (
          /* Preview state */
          <div className="img-upload-preview">
            <img
              src={value}
              alt="Product preview"
              className="img-upload-img"
              onError={e => { (e.target as HTMLImageElement).src = ''; }}
            />
            <div className="img-upload-overlay">
              <span>🔄 Change image</span>
            </div>
            <button
              type="button"
              className="img-upload-remove"
              onClick={onRemove}
              aria-label="Remove image"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="img-upload-empty">
            <div className="img-upload-icon">📷</div>
            <div className="img-upload-text">
              <strong>Click to upload</strong> or drag &amp; drop
            </div>
            <div className="img-upload-hint">JPG, PNG, WEBP — max 5 MB</div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="img-upload-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Cloudinary URL shown as read-only info (not editable) */}
      {value && !uploading && (
        <div className="img-upload-url" title={value}>
          ✅ Saved to Cloudinary
        </div>
      )}
    </div>
  );
}
