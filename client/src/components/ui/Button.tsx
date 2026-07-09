import React from 'react';

type Variant = 'default' | 'primary' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  as?: 'button';
}

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm: { fontSize: 12, padding: '6px 11px', borderRadius: 8 },
  md: {},
  lg: { fontSize: 15, padding: '13px 20px' },
};

export default function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = ['btn', variant !== 'default' ? variant : '', className].filter(Boolean).join(' ');
  return (
    <button
      {...rest}
      className={cls}
      disabled={disabled || loading}
      style={{ ...(fullWidth ? { width: '100%' } : {}), ...SIZE_STYLES[size], ...style }}
    >
      {loading && <span className="auth-spinner" style={{ marginRight: 6 }} />}
      {children}
    </button>
  );
}
