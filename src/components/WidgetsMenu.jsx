import { LayoutTemplate, PenTool, Calendar, Clock, Compass, Cloud } from 'lucide-react';

export default function WidgetsMenu({ isOpen, onClose, addBoard }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Click outside detection helper */}
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div 
        className="widgets-menu glass-panel"
        style={{
          position: 'absolute',
          right: '70px',
          bottom: '80px',
          width: '280px',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 1000,
          border: '1px solid var(--glass-border)'
        }}
      >
      
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px', marginLeft: '4px' }}>
        WIDGETS
      </span>

      {/* Addable Widgets */}
      <WidgetItem icon={<LayoutTemplate size={18} />} title="Board" type="add" onAdd={() => { addBoard({ type: 'board', title: 'New Board' }); onClose(); }} />
      <WidgetItem icon={<PenTool size={18} />} title="Notes" type="add" onAdd={() => { addBoard({ type: 'notes' }); onClose(); }} />
      <WidgetItem icon={<Calendar size={18} />} title="Calendar" type="add" onAdd={() => { addBoard({ type: 'calendar' }); onClose(); }} />
      <WidgetItem icon={<Clock size={18} />} title="Pomodoro" type="add" onAdd={() => { addBoard({ type: 'pomodoro' }); onClose(); }} />
      <WidgetItem icon={<Compass size={18} />} title="Prayer Times" type="add" onAdd={() => { addBoard({ type: 'prayer' }); onClose(); }} />
      <WidgetItem icon={<Cloud size={18} />} title="Weather" type="add" onAdd={() => { addBoard({ type: 'weather' }); onClose(); }} />
    </div>
    </>
  );
}

function WidgetItem({ icon, title, type, defaultChecked, onAdd }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      padding: '10px 14px',
      borderRadius: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)' }}>
        {icon}
        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{title}</span>
      </div>
      
      {type === 'add' ? (
        <button 
          onClick={onAdd}
          onMouseEnter={(e) => e.target.style.filter = 'brightness(0.9)'}
          onMouseLeave={(e) => e.target.style.filter = 'none'}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'filter 0.2s'
          }}
        >
          Add
        </button>
      ) : (
        <div style={{
          width: '36px',
          height: '20px',
          backgroundColor: defaultChecked ? 'var(--primary-color)' : 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          transition: 'background-color 0.2s'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transform: defaultChecked ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
        </div>
      )}
    </div>
  );
}
