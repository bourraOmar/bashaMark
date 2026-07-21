import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { defaultSettings } from '../hooks/useSettings';

export default function SettingsModal({ isOpen, onClose, settings, setSettings }) {
  // Local state for fast updates without triggering full app re-renders immediately,
  // or we can just use the global state. Let's use local state for the sliders for performance,
  // and sync to global on change. Actually, syncing directly works fine if performance is okay.
  // We'll sync directly to global state so changes are instantly reflected in CSS variables.
  
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const getMaxColumns = () => {
    const screenWidth = window.innerWidth;
    // Account for paddings/gaps (e.g. 40px right padding, 24px gaps)
    // Rough estimate: available space / (boardWidth + gap)
    const available = screenWidth - 40; 
    const colWidth = settings.boardWidth + 24;
    return Math.max(1, Math.floor(available / colWidth));
  };

  const maxColumns = getMaxColumns();

  const handleColumnsChange = (val) => {
    if (val !== 'Auto') {
      const num = parseInt(val, 10);
      if (num > maxColumns) {
        alert(`Your screen fits up to ${maxColumns} columns.`);
        handleChange('numberOfColumns', maxColumns);
        return;
      }
    }
    handleChange('numberOfColumns', val);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
        width: '400px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(20, 20, 25, 0.85)', // Darker background based on screenshot
        padding: '24px',
        borderRadius: '16px',
        color: '#f1f1f1',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8892a0', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* APPEARANCE SECTION */}
        <div className="settings-section">
          <SectionTitle>APPEARANCE</SectionTitle>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Primary color</label>
              <div style={{ display: 'flex', height: '36px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input 
                  type="color" 
                  value={settings.primaryColor} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={{ width: '100%', height: '150%', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} 
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Board color</label>
              <div style={{ display: 'flex', height: '36px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input 
                  type="color" 
                  value={settings.boardColor} 
                  onChange={(e) => handleChange('boardColor', e.target.value)}
                  style={{ width: '100%', height: '150%', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} 
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Opacity</label>
              <span style={valueStyle}>{settings.opacity}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={settings.opacity} 
              onChange={(e) => handleChange('opacity', parseInt(e.target.value, 10))}
              style={rangeStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Blur</label>
              <span style={valueStyle}>{settings.blur}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="50" 
              value={settings.blur} 
              onChange={(e) => handleChange('blur', parseInt(e.target.value, 10))}
              style={rangeStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={btnOutlineStyle}>Cancel</button>
            <button onClick={handleReset} style={btnOutlineStyle}>Reset</button>
          </div>
        </div>

        <div style={dividerStyle} />

        {/* BOARD TEXT SECTION */}
        <div className="settings-section">
          <SectionTitle>BOARD TEXT</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Size</label>
            <div style={toggleGroupStyle}>
              {['S', 'M', 'L'].map(size => (
                <button 
                  key={size}
                  onClick={() => handleChange('textSize', size)}
                  style={toggleBtnStyle(settings.textSize === size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Weight</label>
            <div style={toggleGroupStyle}>
              {['Normal', 'Bold'].map(weight => (
                <button 
                  key={weight}
                  onClick={() => handleChange('textWeight', weight)}
                  style={toggleBtnStyle(settings.textWeight === weight)}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={dividerStyle} />

        {/* BOARDS SECTION */}
        <div className="settings-section">
          <SectionTitle>BOARDS</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Number of columns</label>
            <select 
              value={settings.numberOfColumns} 
              onChange={(e) => handleColumnsChange(e.target.value)}
              style={selectStyle}
            >
              <option value="Auto">Auto</option>
              {/* Include the current value if it's clamped below 4 */}
              {settings.numberOfColumns !== 'Auto' && settings.numberOfColumns < 4 && (
                <option value={settings.numberOfColumns}>{settings.numberOfColumns}</option>
              )}
              {[4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Board width</label>
              <span style={valueStyle}>{settings.boardWidth}px</span>
            </div>
            <input 
              type="range" 
              min="200" max="500" 
              value={settings.boardWidth} 
              onChange={(e) => handleChange('boardWidth', parseInt(e.target.value, 10))}
              style={rangeStyle}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8892a0', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>
    {children}
  </h3>
);

const labelStyle = { fontSize: '0.9rem', color: '#cbd5e0', marginBottom: '8px', display: 'block' };
const valueStyle = { fontSize: '0.85rem', color: '#8892a0' };

const dividerStyle = { height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '24px 0' };

const rangeStyle = {
  width: '100%',
  accentColor: '#cbd5e0',
  height: '4px',
  borderRadius: '2px',
  outline: 'none',
  marginTop: '8px',
  cursor: 'pointer'
};

const toggleGroupStyle = {
  display: 'flex',
  backgroundColor: 'rgba(0,0,0,0.2)',
  borderRadius: '8px',
  padding: '4px'
};

const toggleBtnStyle = (active) => ({
  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
  color: active ? '#fff' : '#8892a0',
  border: 'none',
  padding: '4px 12px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const selectStyle = {
  backgroundColor: 'rgba(0,0,0,0.2)',
  color: '#cbd5e0',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.9rem',
  outline: 'none',
  cursor: 'pointer'
};

const btnOutlineStyle = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#cbd5e0',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '6px 16px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer'
};
