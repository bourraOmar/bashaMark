import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form className="search-bar glass-panel" onSubmit={handleSubmit}>
      <Search size={18} style={{ color: 'rgba(255, 255, 255, 0.65)' }} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Search..." 
      />
      <div 
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: '8px',
          cursor: 'pointer'
        }}
        title="Google Search"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M23.54 12.28c0-.85-.07-1.68-.22-2.48H12v4.69h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.89c2.28-2.1 3.58-5.19 3.58-8.86z" fill="#4285F4"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.02c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.12C3.33 21.3 7.37 24 12 24z" fill="#34A853"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M5.32 14.3A7.16 7.16 0 0 1 4.94 12c0-.8.14-1.57.38-2.3V6.58H1.36A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.12z" fill="#FBBC05"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.37 0 3.33 2.7 1.36 6.58l3.96 3.12c.94-2.83 3.57-4.93 6.68-4.93z" fill="#EA4335"/>
        </svg>
      </div>
    </form>
  );
}
