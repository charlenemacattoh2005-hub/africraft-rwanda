import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', style, ...rest }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {label && (
        <label htmlFor={inputId} className="small" style={{ fontWeight: 600, color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <input
        {...rest}
        id={inputId}
        className={['input', className].filter(Boolean).join(' ')}
        style={{ ...(error ? { borderColor: 'rgba(220,38,38,.5)' } : {}), ...style }}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span id={`${inputId}-error`} style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
