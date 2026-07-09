import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: React.CSSProperties;
}

export default function SearchBar({ value, onChange, placeholder = 'Search…', onClear, style }: SearchBarProps) {
  return (
    <div className="search-wrap" style={style}>
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        className="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => { onChange(''); onClear?.(); }}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
