import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkItem from './BookmarkItem';
import { Plus, MoreHorizontal, Type, Layers, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function Board({ id, title, bookmarks, onAddBookmark, onRenameBoard, onDeleteBoard, onEditBookmark, onDeleteBookmark }) {
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
    if (newUrl && newTitle) {
      onAddBookmark(id, newTitle, newUrl);
      setNewUrl('');
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (renameTitle.trim() && renameTitle !== title) {
      onRenameBoard(id, renameTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleOpenAll = () => {
    bookmarks.forEach(bm => {
      window.open(bm.url, '_blank', 'noopener,noreferrer');
    });
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      <div className="board-header" {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} style={{ flex: 1, marginRight: '8px' }}>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="glass-input"
              autoFocus
              onBlur={handleRenameSubmit}
              style={{ padding: '4px 8px' }}
            />
          </form>
        ) : (
          <span>{title}</span>
        )}
        <div className="board-header-actions" style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => setIsAdding(!isAdding)} className="add-btn" title="Add Link">
            <Plus size={16} />
          </button>
          <button onClick={() => {
            if (!isMenuOpen && menuRef.current) {
              const rect = menuRef.current.getBoundingClientRect();
              setDropdownPosition(window.innerWidth - rect.right < 250 ? 'left' : 'right');
            }
            setIsMenuOpen(!isMenuOpen);
          }} className="add-btn" title="More options">
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu" style={{ 
              right: dropdownPosition === 'left' ? '100%' : 'auto', 
              left: dropdownPosition === 'right' ? '100%' : 'auto', 
              top: '24px', 
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
          {bookmarks.map((bm) => (
            <BookmarkItem 
              key={bm.id} 
              id={bm.id} 
              title={bm.title} 
              url={bm.url} 
              iconUrl={bm.iconUrl} 
              onEdit={(newTitle, newUrl) => onEditBookmark(id, bm.id, newTitle, newUrl)}
              onDelete={() => onDeleteBookmark(id, bm.id)}
            />
          ))}
        </SortableContext>
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
