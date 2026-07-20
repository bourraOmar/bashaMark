import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useBoards } from '../hooks/useBoards';

export default function BookmarkSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { boards } = useBoards();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !boards) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches = [];
    boards.forEach(board => {
      board.bookmarks.forEach(bm => {
        if (bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)) {
          matches.push({ ...bm, boardTitle: board.title });
        }
      });
    });
    setResults(matches);
  }, [query, boards]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        backdropFilter: 'blur(8px)', 
        WebkitBackdropFilter: 'blur(8px)', 
        background: 'rgba(0,0,0,0.4)', 
        alignItems: 'flex-start', 
        paddingTop: '15vh' 
      }}
    >
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '600px', 
          maxWidth: '90%', 
          padding: '16px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          background: 'rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Search bookmarks..." 
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-color)', 
              fontSize: '1.1rem', 
              outline: 'none' 
            }}
          />
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '4px 8px', 
            borderRadius: '6px' 
          }}>Esc</div>
        </div>

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            {results.map((bm, idx) => {
              // Ensure we have a valid URL before attempting to parse it
              let domain = '';
              try {
                domain = new URL(bm.url).hostname;
              } catch (e) {
                // Ignore invalid URLs
              }
              
              const fallbackIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
              
              return (
                <a 
                  key={idx} 
                  href={bm.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    color: 'var(--text-color)' 
                  }} 
                  className="search-result-item"
                >
                  <img 
                    src={domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : fallbackIcon} 
                    alt="" 
                    style={{ width: '24px', height: '24px', borderRadius: '4px' }} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackIcon;
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.95rem' }}>{bm.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bm.boardTitle} {domain ? `• ${domain}` : ''}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
