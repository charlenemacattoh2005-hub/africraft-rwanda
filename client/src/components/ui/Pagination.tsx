import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 24 }}>
      <button
        className="btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        style={{ padding: '7px 12px', fontSize: 13 }}
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            className="btn"
            onClick={() => onChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            style={{
              padding: '7px 12px', fontSize: 13, minWidth: 36,
              ...(p === page ? {
                background: 'linear-gradient(135deg,#c2410c,#ea580c)',
                color: '#fff', borderColor: 'transparent',
                boxShadow: '0 4px 14px rgba(194,65,12,.35)',
              } : {}),
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        className="btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        style={{ padding: '7px 12px', fontSize: 13 }}
      >
        ›
      </button>
    </nav>
  );
}
