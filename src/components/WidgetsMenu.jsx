import { LayoutTemplate, PenTool, Calendar, Clock, Search } from 'lucide-react';

export default function WidgetsMenu({ isOpen, onClose, addBoard }) {
  if (!isOpen) return null;

  return (
    <div 
      className="widgets-menu glass-panel"
      style={{
        position: 'absolute',
        right: '70px', // to the left of the FAB menu
        bottom: '80px', // aligned with the 3rd icon roughly
        width: '280px',
        backgroundColor: 'rgba(235, 238, 245, 0.95)', // light grey/blue matching the image
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000
      }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8892a0', letterSpacing: '0.05em', marginBottom: '4px', marginLeft: '4px' }}>
        WIDGETS
      </span>

      {/* Addable Widgets */}
      <WidgetItem icon={<LayoutTemplate size={18} />} title="Board" type="add" onAdd={() => addBoard({ type: 'board', title: 'New Board' })} />
      <WidgetItem icon={<PenTool size={18} />} title="Notes" type="add" onAdd={() => addBoard({ type: 'notes' })} />
      <WidgetItem icon={<Calendar size={18} />} title="Calendar" type="add" onAdd={() => addBoard({ type: 'calendar' })} />
      <WidgetItem icon={<Clock size={18} />} title="Pomodoro" type="add" onAdd={() => addBoard({ type: 'pomodoro' })} />

      {/* Togglable Widgets */}
      <WidgetItem icon={<Clock size={18} />} title="Clock" type="toggle" defaultChecked={false} />
      <WidgetItem icon={<Search size={18} />} title="Search" type="toggle" defaultChecked={true} />
    </div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4a5568' }}>
        {icon}
        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{title}</span>
      </div>
      
      {type === 'add' ? (
        <button 
          onClick={onAdd}
          style={{
            backgroundColor: '#5c8c9e', // matching the teal/blue in the screenshot
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      ) : (
        <div style={{
          width: '36px',
          height: '20px',
          backgroundColor: defaultChecked ? '#5c8c9e' : '#cbd5e0',
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
