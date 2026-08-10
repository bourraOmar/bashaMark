import { X, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function TrashModal({ isOpen, onClose, trashItems, onRestore, onEmptyTrash, onPermanentDelete }) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose}
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
    >
      <div 
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '480px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(20, 20, 25, 0.85)',
          borderRadius: '16px',
          color: '#f1f1f1',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Trash</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {trashItems.length > 0 && (
              <button 
                onClick={onEmptyTrash}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#e53e3e', 
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Empty trash
              </button>
            )}
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8892a0', cursor: 'pointer', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="hide-scrollbar" style={{ padding: '8px 0', overflowY: 'auto', flex: 1 }}>
          {trashItems.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8892a0' }}>
              <Trash2 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ margin: 0 }}>Trash is empty</p>
            </div>
          ) : (
            trashItems.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', opacity: 0.9 }}>📋</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.title || (item.type === 'weather' ? 'Weather Widget' : item.type === 'prayer' ? 'Prayer Times Widget' : 'Widget')}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8892a0', marginLeft: '26px' }}>
                    {item.type === 'board' ? `Board • ${item.bookmarks?.length || 0} links` : 'Widget'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => onRestore(item)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#8892a0', 
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8892a0'; }}
                  >
                    Restore
                  </button>
                  <button 
                    onClick={() => onPermanentDelete(item.id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#8892a0', 
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(229, 62, 62, 0.1)'; e.currentTarget.style.color = '#e53e3e'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8892a0'; }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
