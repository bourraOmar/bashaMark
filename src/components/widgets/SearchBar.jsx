import { useState, useEffect, useRef } from 'react';
import { Search, Globe } from 'lucide-react';

const ENGINES = [
  {
    id: 'default',
    name: 'Default browser',
    url: 'https://www.google.com/search?q=',
    icon: <Globe size={18} style={{ color: 'var(--text-muted)' }} />
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M23.54 12.28c0-.85-.07-1.68-.22-2.48H12v4.69h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.89c2.28-2.1 3.58-5.19 3.58-8.86z" fill="#4285F4"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.02c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.12C3.33 21.3 7.37 24 12 24z" fill="#34A853"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M5.32 14.3A7.16 7.16 0 0 1 4.94 12c0-.8.14-1.57.38-2.3V6.58H1.36A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.12z" fill="#FBBC05"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.37 0 3.33 2.7 1.36 6.58l3.96 3.12c.94-2.83 3.57-4.93 6.68-4.93z" fill="#EA4335"/>
      </svg>
    )
  },
  {
    id: 'yandex',
    name: 'Yandex',
    url: 'https://yandex.com/search/?text=',
    icon: (
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#FC3F1D',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '11px',
        fontFamily: 'sans-serif',
        lineHeight: 1
      }}>
        Я
      </div>
    )
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#008373">
        <path d="M5 3v15.86l7.8 2.76 6.2-3.61V9.74l-6.2 2.22v3.74l-3.23-1.07V8.14L19 5.86V2.6L5 3z" />
      </svg>
    )
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="12" fill="#DE5833"/>
        <ellipse cx="12" cy="11.5" rx="7" ry="6" fill="#F4F4F4"/>
        <path d="M8 12.5C8 12.5 9 14.5 12 14.5C15 14.5 16 12.5 16 12.5C16 12.5 14.5 13.5 12 13.5C9.5 13.5 8 12.5 8 12.5Z" fill="#DE5833"/>
        <ellipse cx="12" cy="13.5" rx="5" ry="2" fill="#F8B132"/>
        <circle cx="9.5" cy="10" r="1.2" fill="#2A2F35"/>
        <circle cx="14.5" cy="10" r="1.2" fill="#2A2F35"/>
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=',
    icon: (
      <svg width="20" height="14" viewBox="0 0 24 18" fill="none">
        <rect width="24" height="18" rx="4.5" fill="#FF0000"/>
        <path d="M9.5 5.5V12.5L16 9L9.5 5.5Z" fill="white"/>
      </svg>
    )
  },
  {
    id: 'ecosia',
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    icon: (
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#3FA554',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L6 8h3v4H6l6 8 6-8h-3V8h3L12 2z"/>
        </svg>
      </div>
    )
  }
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('default');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);



  useEffect(() => {
    const savedEngine = localStorage.getItem('selectedSearchEngine');
    if (savedEngine && ENGINES.some(e => e.id === savedEngine)) {
      setEngine(savedEngine);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEngine = (id) => {
    setEngine(id);
    localStorage.setItem('selectedSearchEngine', id);
    setIsMenuOpen(false);
  };

  const activeEngine = ENGINES.find(e => e.id === engine) || ENGINES[1];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `${activeEngine.url}${encodeURIComponent(query)}`;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={containerRef}>
      <form className="search-bar glass-panel" onSubmit={handleSubmit}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Search..." 
        />
        <div 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '8px',
            cursor: 'pointer',
            padding: '2px',
            transition: 'transform 0.15s ease'
          }}
          title={`Search via ${activeEngine.name} (Click to select search engine)`}
        >
          {activeEngine.icon}
        </div>
      </form>

      {isMenuOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            padding: '8px 6px',
            borderRadius: '18px',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {ENGINES.map((item) => {
            const isSelected = item.id === engine;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectEngine(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--item-hover-bg)' : 'transparent',
                  fontWeight: isSelected ? 700 : 500,
                  color: 'var(--text-color)',
                  fontSize: '0.92rem',
                  transition: 'background 0.15s ease, transform 0.1s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--item-hover-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

