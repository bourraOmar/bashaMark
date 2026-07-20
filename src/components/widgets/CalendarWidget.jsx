import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, MoreHorizontal, Trash2 } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

export default function CalendarWidget({ id, onDelete }) {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    data: { type: 'board' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: 'default',
    padding: '16px'
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      {/* Header / Drag Handle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={prevMonth}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ padding: '4px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div 
            {...attributes} 
            {...listeners} 
            style={{ cursor: 'grab', fontWeight: 600, color: 'var(--text-color)', fontSize: '1.05rem' }}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={nextMonth} style={{ padding: '4px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>
            <ChevronRight size={16} />
          </button>
          <div style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ padding: '4px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent', opacity: 0.7, color: 'var(--text-muted)' }}>
              <MoreHorizontal size={16} />
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu" style={{ right: 0 }}>
                <button className="dropdown-item danger" onClick={() => { setIsConfirmOpen(true); setIsMenuOpen(false); }}>
                  <Trash2 size={16} />
                  Delete board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayStr = d.toISOString().split('T')[0];
          const isToday = isCurrentMonth && d.getDate() === today.getDate();
          return (
            <div 
              key={dayStr}
              style={{ 
                textAlign: 'center', 
                fontSize: '0.9rem', 
                padding: '6px 0',
                backgroundColor: isToday ? '#5c8c9e' : 'transparent',
                borderRadius: '8px',
                color: isToday ? 'white' : (isCurrentMonth ? 'var(--text-color)' : 'var(--text-muted)'),
                opacity: isCurrentMonth ? 1 : 0.5,
                fontWeight: isToday ? 700 : 400,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => !isToday && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
              onMouseOut={e => !isToday && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete Calendar"
        message="Are you sure you want to delete this Calendar widget?"
      />
    </div>
  );
}
