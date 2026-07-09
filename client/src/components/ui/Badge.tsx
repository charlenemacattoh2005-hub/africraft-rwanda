import React from 'react';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default: {},
  success: {
    background: 'rgba(21,128,61,.08)',
    color: 'var(--green)',
    borderColor: 'rgba(21,128,61,.22)',
  },
  error: {
    background: 'rgba(220,38,38,.08)',
    color: 'var(--danger)',
    borderColor: 'rgba(220,38,38,.25)',
  },
  warning: {
    background: 'rgba(234,179,8,.12)',
    color: '#92400e',
    borderColor: 'rgba(234,179,8,.3)',
  },
  info: {
    background: 'rgba(59,130,246,.1)',
    color: '#1d4ed8',
    borderColor: 'rgba(59,130,246,.25)',
  },
};

export default function Badge({ variant = 'default', children, className = '', style, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={['badge', className].filter(Boolean).join(' ')}
      style={{ ...VARIANT_STYLES[variant], ...style }}
    >
      {children}
    </span>
  );
}
