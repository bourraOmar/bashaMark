import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({ id }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'board' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    backgroundColor: 'rgba(235, 238, 245, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: isDragging ? '0 12px 40px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
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
    <div ref={setNodeRef} style={style}>
      {/* Header / Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'grab', 
          marginBottom: '16px',
          color: '#4a5568',
          position: 'relative'
        }}
      >
        <button 
          onClick={prevMonth}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
          style={{ position: 'absolute', left: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          <ChevronLeft size={16} />
        </button>
        
        <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>

        <button 
          onClick={nextMonth}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of Week */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a0aec0', fontWeight: 500 }}>
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
          const day = i + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div 
              key={day} 
              style={{ 
                textAlign: 'center', 
                fontSize: '0.85rem', 
                color: isToday ? 'white' : '#718096',
                padding: '4px 0',
                backgroundColor: isToday ? '#5c8c9e' : 'transparent',
                borderRadius: '6px',
                fontWeight: isToday ? 600 : 400
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
