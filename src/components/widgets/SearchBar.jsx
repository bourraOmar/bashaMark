import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('youtube'); // 'youtube' or 'google'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (engine === 'youtube') {
        window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
  };

  const toggleEngine = () => {
    setEngine(prev => prev === 'youtube' ? 'google' : 'youtube');
  };

  return (
    <form className="search-bar glass-panel" onSubmit={handleSubmit}>
      <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.65)' }} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Search..." 
      />
      <div 
        onClick={toggleEngine}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: engine === 'youtube' ? '#ff0000' : 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: '8px',
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        title={engine === 'youtube' ? 'Search on YouTube (Click to switch to Google)' : 'Search on Google (Click to switch to YouTube)'}
      >
        {engine === 'youtube' ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M23.54 12.28c0-.85-.07-1.68-.22-2.48H12v4.69h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.89c2.28-2.1 3.58-5.19 3.58-8.86z" fill="#4285F4"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.02c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.12C3.33 21.3 7.37 24 12 24z" fill="#34A853"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.32 14.3A7.16 7.16 0 0 1 4.94 12c0-.8.14-1.57.38-2.3V6.58H1.36A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.12z" fill="#FBBC05"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.37 0 3.33 2.7 1.36 6.58l3.96 3.12c.94-2.83 3.57-4.93 6.68-4.93z" fill="#EA4335"/>
          </svg>
        )}
      </div>
    </form>
  );
}
