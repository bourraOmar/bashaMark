import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { defaultSettings } from '../hooks/useSettings';

export default function SettingsModal({ isOpen, onClose, settings, setSettings, boards }) {
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
    const available = screenWidth - 40; 
    const colWidth = settings.boardWidth + 24;
    return Math.max(1, Math.floor(available / colWidth));
  };

  const maxColumns = getMaxColumns();

  const getMaxBoardWidth = (cols = settings.numberOfColumns) => {
    if (cols === 'Auto') return 500;
    const screenWidth = window.innerWidth;
    const numCols = parseInt(cols, 10);
    const max = Math.floor((screenWidth - 40 - (numCols - 1) * 24) / numCols);
    return Math.max(200, Math.min(max, 500));
  };

  const handleColumnsChange = (val) => {
    if (val !== 'Auto') {
      const num = parseInt(val, 10);
      if (num > maxColumns) {
        alert(`Your screen fits up to ${maxColumns} columns with the current board width.`);
        val = maxColumns;
      }
      
      // Clamp board width if it exceeds the new max
      const newMaxWidth = getMaxBoardWidth(val);
      if (settings.boardWidth > newMaxWidth) {
        handleChange('boardWidth', newMaxWidth);
      }
    }
    handleChange('numberOfColumns', val);
  };

  const getSliderBackground = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #cbd5e0 ${percentage}%, rgba(255,255,255,0.12) ${percentage}%)`;
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
                  className="color-picker-input"
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
                  className="color-picker-input"
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
              className="custom-slider"
              style={{ background: getSliderBackground(settings.opacity, 0, 100) }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={labelStyle}>Blur</label>
            <div style={toggleGroupStyle}>
              {[
                { label: 'None', value: 0 },
                { label: 'Low', value: 8 },
                { label: 'Med', value: 24 },
                { label: 'High', value: 48 }
              ].map(opt => {
                // If it's an old custom value, highlight the closest option
                const closestValue = [0, 8, 24, 48].reduce((prev, curr) => 
                  Math.abs(curr - settings.blur) < Math.abs(prev - settings.blur) ? curr : prev
                );
                return (
                  <button 
                    key={opt.label}
                    onClick={() => handleChange('blur', opt.value)}
                    style={toggleBtnStyle(closestValue === opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
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
            <CustomSelect 
              value={settings.numberOfColumns}
              onChange={(val) => handleColumnsChange(val)}
              options={[
                { value: 'Auto', label: 'Auto' },
                ...(settings.numberOfColumns !== 'Auto' && settings.numberOfColumns < 4 
                  ? [{ value: settings.numberOfColumns, label: String(settings.numberOfColumns) }] 
                  : []),
                ...[4, 5, 6, 7, 8, 9].map(num => ({ value: num, label: String(num) }))
              ]}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Board width</label>
              <span style={valueStyle}>{settings.boardWidth}px</span>
            </div>
            <input 
              type="range" 
              min="200" max={getMaxBoardWidth()} 
              value={settings.boardWidth} 
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                // Also clamp when sliding just in case
                handleChange('boardWidth', Math.min(val, getMaxBoardWidth()));
              }}
              className="custom-slider"
              style={{ background: getSliderBackground(settings.boardWidth, 200, getMaxBoardWidth()) }}
            />
          </div>
        </div>

        <div style={dividerStyle} />

        {/* GENERAL SECTION */}
        <div className="settings-section">
          <SectionTitle>GENERAL</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Open links in new tab</label>
            <ToggleSwitch 
              checked={settings.openLinksInNewTab} 
              onChange={(val) => handleChange('openLinksInNewTab', val)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Hide extra bookmarks</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CustomSelect 
                value={settings.hideExtraBookmarks}
                onChange={(val) => handleChange('hideExtraBookmarks', val)}
                options={[
                  { value: '10', label: 'Show 10' },
                  { value: '20', label: 'Show 20' },
                  { value: 'All', label: 'Show All' }
                ]}
              />
              <ToggleSwitch 
                checked={settings.hideExtraBookmarksEnabled} 
                onChange={(val) => handleChange('hideExtraBookmarksEnabled', val)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Show descriptions</label>
            <ToggleSwitch 
              checked={settings.showDescriptions} 
              onChange={(val) => handleChange('showDescriptions', val)} 
            />
          </div>
        </div>

        <div style={dividerStyle} />

        {/* QUICK SAVE SECTION */}
        <div className="settings-section">
          <SectionTitle>QUICK SAVE</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Save to board</label>
            <CustomSelect 
              value={settings.quickSaveBoard}
              onChange={(val) => handleChange('quickSaveBoard', val)}
              options={[
                { value: 'None', label: 'None' },
                ...(boards?.filter(b => !b.type || b.type === 'board').map(b => ({ value: b.id, label: b.title })) || [])
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Shortcut</label>
            <div style={toggleGroupStyle}>
              <button style={{ ...toggleBtnStyle(false), cursor: 'default' }}>
                {settings.quickSaveShortcut || 'Not set'}
              </button>
              <button 
                onClick={() => alert("Shortcut configuration coming soon!")} 
                style={toggleBtnStyle(false)}
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div style={dividerStyle} />

        {/* REGION SECTION */}
        <div className="settings-section">
          <SectionTitle>REGION</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={btnOutlineStyle}>
              Auto-detect
            </button>
            <button style={btnOutlineStyle}>
              Advanced ›
            </button>
          </div>
        </div>

        <div style={dividerStyle} />

        {/* SIDEBAR SECTION */}
        <div className="settings-section">
          <SectionTitle>SIDEBAR</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Always show all buttons</label>
            <ToggleSwitch 
              checked={settings.alwaysShowAllButtons} 
              onChange={(val) => handleChange('alwaysShowAllButtons', val)} 
            />
          </div>
        </div>

        <div style={dividerStyle} />

        {/* SUPPORT SECTION */}
        <div className="settings-section">
          <SectionTitle>SUPPORT</SectionTitle>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={labelStyle}>Version</label>
            <span style={valueStyle}>1.3.1</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Contact</label>
            <a href="mailto:markmezapp@gmail.com" style={{ ...valueStyle, textDecoration: 'none' }}>
              markmezapp@gmail.com
            </a>
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

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '40px',
      height: '22px',
      backgroundColor: checked ? '#b47b44' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '11px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      flexShrink: 0
    }}
  >
    <div 
      style={{
        width: '18px',
        height: '18px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '20px' : '2px',
        transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    />
  </div>
);

const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ ...selectStyle, paddingRight: '32px', display: 'flex', alignItems: 'center', userSelect: 'none' }}
      >
        {selectedOption ? selectedOption.label : value}
        <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e0', pointerEvents: 'none' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#1e1e1e',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 10000,
          minWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.9rem',
                color: String(opt.value) === String(value) ? '#fff' : 'rgba(255,255,255,0.7)',
                backgroundColor: String(opt.value) === String(value) ? '#2b6cb0' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (String(opt.value) !== String(value)) e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                if (String(opt.value) !== String(value)) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
