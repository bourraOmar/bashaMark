import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

export default function NotesWidget({ id, initialText = '', onUpdate, onDelete }) {
  const [text, setText] = useState(initialText);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'board' } // treated as board for sorting purposes
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    height: '200px', // matches screenshot roughly
    padding: '16px',
    backgroundColor: 'rgba(235, 238, 245, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: isDragging ? '0 12px 40px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
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
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            fontWeight: 600, 
            color: '#4a5568', 
            fontSize: '0.9rem',
            flex: 1
          }}
        >
          Notes
        </div>
        <button onClick={() => setIsConfirmOpen(true)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
          <Trash2 size={16} />
        </button>
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
          color: '#2d3748',
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
