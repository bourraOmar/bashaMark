import { useState, useRef, useEffect, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Trash2, Type } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import StylePicker from '../StylePicker';

export default memo(function NotesWidget({ id, initialText = '', board, onUpdate, onDelete, settings, pages }) {
  const [text, setText] = useState(initialText);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameTitle, setRenameTitle] = useState(board?.title || 'Notes');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'board' } // treated as board for sorting purposes
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : (isMenuOpen || isConfirmOpen) ? 100 : undefined,
    position: 'relative',
    cursor: 'default',
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    minHeight: '120px',
    ...((board?.styleType || '').includes('outline') ? { border: `2px solid ${board.styleColor}`, outline: 'none' } : {}),
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (renameTitle.trim()) {
      onUpdate(id, { title: renameTitle.trim() });
      setIsRenaming(false);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== initialText) {
        onUpdate(id, { text });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [text, id, initialText, onUpdate]);

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      {(board?.styleType || '').includes('corner') && (
        <div style={{
          position: 'absolute', top: '14px', left: 0, width: '6px', height: '24px',
          backgroundColor: board.styleColor, borderTopRightRadius: '6px', borderBottomRightRadius: '6px',
          zIndex: 0
        }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            fontWeight: 600, 
            color: 'var(--text-color)', 
            fontSize: '0.92rem',
            flex: 1
          }}
        >
          {isRenaming ? (
            <form onSubmit={handleRename} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={renameTitle} 
                onChange={(e) => setRenameTitle(e.target.value)}
                className="glass-input"
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
                style={{ flex: 1, padding: '2px 8px' }}
                onBlur={() => setIsRenaming(false)}
              />
            </form>
          ) : (
            board?.title || 'Notes'
          )}
        </div>
        <div className="board-header-actions" style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => {
            if (!isMenuOpen && menuRef.current) {
              const rect = menuRef.current.getBoundingClientRect();
              setDropdownPosition(window.innerWidth - rect.right < 250 ? 'left' : 'right');
            }
            setIsMenuOpen(!isMenuOpen);
          }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
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
              <StylePicker 
                styleType={board?.styleType} 
                styleColor={board?.styleColor} 
                onChange={(updates) => onUpdate(id, updates)} 
              />
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={() => { setIsConfirmOpen(true); setIsMenuOpen(false); }}>
                <Trash2 size={16} />
                Delete board
              </button>
            </div>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write anything..."
        style={{
          width: '100%',
          height: board?.height ? `${board.height}px` : '170px',
          minHeight: '50px',
          resize: 'vertical',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-color)',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          fontFamily: 'inherit'
        }}
        onMouseUp={(e) => {
          if (board && e.target.offsetHeight) {
            const currentSavedHeight = board.height || 170;
            if (e.target.offsetHeight !== currentSavedHeight) {
              onUpdate(id, { ...board, height: e.target.offsetHeight });
            }
          }
        }}
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onDelete(id)}
        title="Delete Notes"
        message="Are you sure you want to delete this Notes widget? The text will be lost."
      />
    </div>
  );
});
