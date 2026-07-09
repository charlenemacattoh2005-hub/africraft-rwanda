import React, { useEffect, useRef } from 'react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number | string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => { prev?.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as any,
        background: 'rgba(28,10,0,.55)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn .18s ease',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth, background: 'var(--card)',
          borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
          boxShadow: '0 24px 60px rgba(194,65,12,.18)',
          padding: 28, outline: 'none',
          animation: 'scaleIn .2s ease',
        }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div id="modal-title" className="h1" style={{ fontSize: 20, marginBottom: 0 }}>{title}</div>
            <Button
              onClick={onClose}
              aria-label="Close modal"
              style={{ width: 32, height: 32, padding: 0, borderRadius: 8, fontSize: 16 }}
            >
              ✕
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
