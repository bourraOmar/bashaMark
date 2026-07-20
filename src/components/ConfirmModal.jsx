import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 8px' }}>
        <AlertCircle size={48} color="#e53e3e" style={{ opacity: 0.8 }} />
        <p style={{ textAlign: 'center', fontSize: '1.05rem', color: 'var(--text-color)', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', width: '100%' }}>
          <button 
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-color)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#e53e3e', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
