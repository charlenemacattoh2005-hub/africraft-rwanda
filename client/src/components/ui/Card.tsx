import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
  hover?: boolean;
}

export default function Card({ padding, hover = false, children, className = '', style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={['card', hover ? 'card-hover' : '', className].filter(Boolean).join(' ')}
      style={{ ...(padding !== undefined ? { padding } : {}), ...style }}
    >
      {children}
    </div>
  );
}
