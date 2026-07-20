import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, ExternalLink, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { getFaviconUrl } from '../utils/favicon';

export default function BookmarkItem({ id, title, url, iconUrl, onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editUrl, setEditUrl] = useState(url);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const menuRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: (isMenuOpen || isEditing) ? 100 : undefined,
    position: 'relative'
  };

  const favicon = iconUrl || getFaviconUrl(url);
  const fallbackIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';

  const handleOpenIncognito = (e) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.create({ url, incognito: true });
    } else {
      window.open(url, '_blank');
    }
    setIsMenuOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim() && editUrl.trim()) {
      onEdit(editTitle.trim(), editUrl.trim());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bookmark-item glass-item">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <input 
            type="text" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            className="glass-input" 
            autoFocus 
            style={{ padding: '2px 4px', fontSize: '0.9rem' }}
          />
          <input 
            type="url" 
            value={editUrl} 
            onChange={(e) => setEditUrl(e.target.value)} 
            className="glass-input" 
            style={{ padding: '2px 4px', fontSize: '0.8rem' }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <button type="submit" className="glass-btn" style={{ padding: '2px 8px', fontSize: '0.8rem', flex: 1 }}>Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="glass-btn" style={{ padding: '2px 8px', fontSize: '0.8rem', flex: 1, background: 'rgba(0,0,0,0.1)' }}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bookmark-item glass-item">
      <img 
        src={favicon} 
        alt="" 
        className="bookmark-icon" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackIcon;
        }}
      />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
      <div className="bookmark-item-actions" ref={menuRef} onPointerDown={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!isMenuOpen && menuRef.current) {
              const rect = menuRef.current.getBoundingClientRect();
              setDropdownPosition(window.innerWidth - rect.right < 200 ? 'left' : 'right');
            }
            setIsMenuOpen(!isMenuOpen);
          }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: '4px' }}
        >
          <MoreVertical size={14} />
        </button>

        {isMenuOpen && (
          <div className="dropdown-menu" style={{ 
            right: dropdownPosition === 'left' ? '100%' : 'auto', 
            left: dropdownPosition === 'right' ? '100%' : 'auto', 
            top: '100%', 
            marginLeft: dropdownPosition === 'right' ? '4px' : 0, 
            marginRight: dropdownPosition === 'left' ? '4px' : 0, 
            marginTop: '4px',
            minWidth: '160px',
            zIndex: 1000
          }}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="dropdown-item" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ExternalLink size={14} />
              Open
            </a>
            <button className="dropdown-item" onClick={handleOpenIncognito}>
              <EyeOff size={14} />
              Open in incognito
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}>
              <Edit2 size={14} />
              Edit
            </button>
            <button className="dropdown-item danger" onClick={() => { onDelete(); setIsMenuOpen(false); }}>
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
