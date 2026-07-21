import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkItem from './BookmarkItem';
import { Plus, MoreHorizontal, Type, Layers, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useSettings } from '../hooks/useSettings';

export default function Board({ id, title, bookmarks, onAddBookmark, onRenameBoard, onDeleteBoard, onEditBookmark, onDeleteBookmark }) {
  const { settings } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [renameTitle, setRenameTitle] = useState(title);
  const menuRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id, 
    data: { type: 'board' } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : (isMenuOpen || isConfirmOpen) ? 100 : undefined,
    position: 'relative',
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newUrl.trim() && newTitle.trim()) {
      onAddBookmark(id, newTitle.trim(), newUrl.trim());
      setNewUrl('');
      setNewTitle('');
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
  let hiddenCount = 0;
  if (settings.hideExtraBookmarksEnabled && settings.hideExtraBookmarks !== 'All') {
    const limit = parseInt(settings.hideExtraBookmarks, 10);
    if (bookmarks.length > limit) {
      displayedBookmarks = bookmarks.slice(0, limit);
      hiddenCount = bookmarks.length - limit;
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
          <button onClick={() => setIsAdding(!isAdding)} style={{ padding: '4px' }}>
            <Plus size={16} />
          </button>
          
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
      
      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Title" 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            onKeyDown={(e) => e.stopPropagation()}
            className="glass-input" 
            autoFocus
          />
          <input 
            type="url" 
            placeholder="URL (https://...)" 
            value={newUrl} 
            onChange={(e) => setNewUrl(e.target.value)} 
            onKeyDown={(e) => e.stopPropagation()}
            className="glass-input" 
          />
          <button type="submit" className="glass-btn">Save</button>
        </form>
      )}

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
            />
          ))}
        </SortableContext>
        
        {hiddenCount > 0 && (
          <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            + {hiddenCount} more
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
