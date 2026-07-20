import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

export default function NotesWidget({ id, initialText = '', onUpdate, onDelete }) {
  const [text, setText] = useState(initialText);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    zIndex: isDragging ? 1000 : 1,
    cursor: 'default',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '240px'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            fontWeight: 600, 
            color: 'var(--text-color)', 
            fontSize: '1rem',
            flex: 1
          }}
        >
          Notes
        </div>
        <div style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
            <MoreHorizontal size={16} />
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu" style={{ right: 'auto', left: '100%', top: '24px', marginLeft: '8px', marginTop: 0 }}>
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
          flex: 1,
          width: '100%',
          resize: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-color)',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          fontFamily: 'inherit'
        }}
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete Notes"
        message="Are you sure you want to delete this Notes widget? The text will be lost."
      />
    </div>
  );
}
