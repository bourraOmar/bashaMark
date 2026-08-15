import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkItem from './BookmarkItem';
import { Plus, MoreHorizontal, Type, Layers, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

function extractTitleFromUrl(inputUrl) {
  if (!inputUrl) return "New Link";
  try {
    let urlStr = inputUrl.trim();
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    const urlObj = new URL(urlStr);
    let hostname = urlObj.hostname.replace(/^www\./i, '');
    const parts = hostname.split('.');
    let domain = parts[0] || "Link";
    
    if (domain.toLowerCase() === 'github') return 'GitHub';
    if (domain.toLowerCase() === 'chatgpt') return 'ChatGPT';
    if (domain.toLowerCase() === 'youtube') return 'YouTube';
    if (domain.toLowerCase() === 'linkedin') return 'LinkedIn';
    if (domain.toLowerCase() === 'instagram') return 'Instagram';
    if (domain.toLowerCase() === 'facebook') return 'Facebook';
    if (domain.toLowerCase() === 'twitter' || domain.toLowerCase() === 'x') return 'X (Twitter)';
    if (domain.toLowerCase() === 'reddit') return 'Reddit';
    
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return inputUrl.trim();
  }
}

export default function Board({ id, title, bookmarks, onAddBookmark, onRenameBoard, onDeleteBoard, onEditBookmark, onDeleteBookmark, settings }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [childMenuOpen, setChildMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const [newUrl, setNewUrl] = useState('');
  const [renameTitle, setRenameTitle] = useState(title);
  const menuRef = useRef(null);
  const addRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id, 
    data: { type: 'board' } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : (isMenuOpen || isAdding || isConfirmOpen || childMenuOpen) ? 100 : undefined,
    position: 'relative',
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (addRef.current && !addRef.current.contains(event.target)) {
        setIsAdding(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newUrl.trim()) {
      let targetUrl = newUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      const derivedTitle = extractTitleFromUrl(targetUrl);
      onAddBookmark(id, derivedTitle, targetUrl);
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (renameTitle.trim()) {
      onRenameBoard(id, renameTitle.trim());
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
    setIsMenuOpen(false);
  };

  const handleOpenAll = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      bookmarks.forEach(bm => {
        chrome.tabs.create({ url: bm.url, active: false });
      });
    } else {
      bookmarks.forEach(bm => {
        window.open(bm.url, '_blank');
      });
    }
    setIsMenuOpen(false);
  };

  let displayedBookmarks = bookmarks;
  let hasHiddenBookmarks = false;
  let hiddenCount = 0;
  
  if (settings.hideExtraBookmarksEnabled && settings.hideExtraBookmarks !== 'All') {
    const limit = parseInt(settings.hideExtraBookmarks, 10);
    if (bookmarks.length > limit) {
      hasHiddenBookmarks = true;
      hiddenCount = bookmarks.length - limit;
      if (!isExpanded) {
        displayedBookmarks = bookmarks.slice(0, limit);
      }
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      <div className="board-header" {...attributes} {...listeners}>
        {isRenaming ? (
          <form onSubmit={handleRename} style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={renameTitle} 
              onChange={(e) => setRenameTitle(e.target.value)}
              className="glass-input"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
              style={{ flex: 1, padding: '2px 8px' }}
            />
          </form>
        ) : (
          <span style={{ cursor: 'grab' }}>{title}</span>
        )}
        <div className="board-header-actions" onPointerDown={(e) => e.stopPropagation()}>
          <div ref={addRef} style={{ position: 'relative' }}>
            <button onClick={() => setIsAdding(!isAdding)} style={{ padding: '4px' }}>
              <Plus size={16} />
            </button>

            {isAdding && (
              <div 
                className="dropdown-menu" 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: '-28px',
                  left: 'auto',
                  width: '270px',
                  maxWidth: 'calc(var(--board-width) - 24px)',
                  margin: '8px 0 0 0', 
                  padding: '14px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  zIndex: 1000,
                  cursor: 'default'
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Paste URL..." 
                    value={newUrl} 
                    onChange={(e) => setNewUrl(e.target.value)} 
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--item-hover-bg, rgba(150, 150, 160, 0.2))',
                      color: 'var(--text-color)',
                      outline: 'none',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit'
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <button 
                      type="button" 
                      onClick={() => { setIsAdding(false); setNewUrl(''); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--item-hover-bg, rgba(150, 150, 160, 0.25))',
                        color: 'var(--text-color)',
                        fontWeight: 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        flex: '1'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        flex: '1.4',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      Add Link
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (!isMenuOpen && menuRef.current) {
                  const rect = menuRef.current.getBoundingClientRect();
                  setDropdownPosition(window.innerWidth - rect.right < 200 ? 'left' : 'right');
                }
                setIsMenuOpen(!isMenuOpen);
              }} 
              style={{ padding: '4px' }}
            >
              <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu" style={{ 
                right: dropdownPosition === 'left' ? '100%' : 'auto', 
                left: dropdownPosition === 'right' ? '100%' : 'auto', 
                top: '0', 
                marginLeft: dropdownPosition === 'right' ? '8px' : 0, 
                marginRight: dropdownPosition === 'left' ? '8px' : 0, 
                marginTop: 0 
              }}>
                <button className="dropdown-item" onClick={() => { setIsRenaming(true); setIsMenuOpen(false); }}>
                  <Type size={16} />
                  Rename
                </button>
                <button className="dropdown-item" onClick={handleOpenAll}>
                  <Layers size={16} />
                  Open all links
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Delete board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bookmark-list">
        <SortableContext items={bookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {displayedBookmarks.map((bm) => (
            <BookmarkItem 
              key={bm.id} 
              id={bm.id} 
              title={bm.title} 
              url={bm.url} 
              iconUrl={bm.iconUrl} 
              description={bm.description}
              onEdit={(newTitle, newUrl, newDescription) => onEditBookmark(id, bm.id, newTitle, newUrl, newDescription)}
              onDelete={() => onDeleteBookmark(id, bm.id)}
              settings={settings}
              onMenuToggle={setChildMenuOpen}
            />
          ))}
        </SortableContext>
        
        {hasHiddenBookmarks && (
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '8px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-color)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {isExpanded ? 'Show less' : `+ ${hiddenCount} more`}
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onDeleteBoard(id)}
        title="Delete Board"
        message={`Are you sure you want to delete "${title}"? All bookmarks inside will be lost.`}
      />
    </div>
  );
}
