import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function NotesWidget({ id, initialText, onUpdate }) {
  const [text, setText] = useState(initialText || '');

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
      {/* Drag Handle area */}
      <div 
        {...attributes} 
        {...listeners} 
        style={{ 
          cursor: 'grab', 
          fontWeight: 600, 
          color: '#4a5568', 
          fontSize: '1.1rem',
          marginBottom: '12px',
          paddingBottom: '4px'
        }}
      >
        Notes
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write anything..."
        style={{
          flex: 1,
          width: '100%',
          resize: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: '#718096',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
}
