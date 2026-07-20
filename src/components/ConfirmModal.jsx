import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '320px',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(229, 62, 62, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '4px'
        }}>
          <AlertCircle size={28} color="#e53e3e" />
        </div>
        
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: 'var(--text-color)' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%' }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.05)', 
              color: 'var(--text-color)', 
              fontWeight: 600, 
              border: 'none', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              background: '#e53e3e', 
              color: 'white', 
              fontWeight: 600, 
              border: 'none', 
              cursor: 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#c53030'}
            onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
