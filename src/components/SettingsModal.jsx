import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { defaultSettings } from '../hooks/useSettings';
import { useBackground } from '../hooks/useBackground';
import { signInWithGoogle, logoutUser, onAuthStateChange } from '../utils/sync';

export default function SettingsModal({ isOpen, onClose, settings, setSettings, boards, user }) {
  // Local state for fast updates without triggering full app re-renders immediately,
  // or we can just use the global state. Let's use local state for the sliders for performance,
  // and sync to global on change. Actually, syncing directly works fine if performance is okay.
  // We'll sync directly to global state so changes are instantly reflected in CSS variables.
  
  // Local state for fast updates without triggering full app re-renders immediately
  const [shortcutLabel, setShortcutLabel] = useState('Not set');
  const [columnAlertMessage, setColumnAlertMessage] = useState(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.commands) {
      chrome.commands.getAll((commands) => {
        const cmd = commands.find(c => c.name === 'quick-save');
        if (cmd && cmd.shortcut) {
          setShortcutLabel(cmd.shortcut);
        }
      });
    }
  }, []);


  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('boards');
      localStorage.removeItem('pages');
      localStorage.removeItem('currentPageId');
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['boards', 'pendingBookmarks']);
      }
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const getAbsoluteMaxColumns = () => {
    const screenWidth = window.innerWidth;
    // App.jsx uses padding = 140, gap = 18. Formula: (screenWidth - 140 + 18) / (boardWidth + 18)
    const availableWidth = screenWidth - 140 + 18;
    // Min allowed width is 190, gap is 18
    return Math.max(1, Math.floor(availableWidth / (190 + 18)));
  };

  const getRawMaxWidth = (cols) => {
    const screenWidth = window.innerWidth;
    const availableWidth = screenWidth - 140 + 18;
    return Math.floor((availableWidth / cols) - 18);
  };

  const getMinBoardWidth = (cols = settings.numberOfColumns) => {
    if (cols === 'Auto') return 190;
    const numCols = parseInt(cols, 10);
    // Min width to ensure it doesn't fit numCols + 1
    return Math.max(190, getRawMaxWidth(numCols + 1) + 1);
  };

  const getMaxBoardWidth = (cols = settings.numberOfColumns) => {
    if (cols === 'Auto') return 380;
    const numCols = parseInt(cols, 10);
    // Max width to ensure it still fits numCols
    return Math.min(380, getRawMaxWidth(numCols));
  };

  const handleColumnsChange = (val) => {
    setColumnAlertMessage(null); // Clear previous alerts
    let newSettings = { ...settings };

    if (val !== 'Auto') {
      let num = parseInt(val, 10);
      const absMax = getAbsoluteMaxColumns();
      if (num > absMax) {
        setColumnAlertMessage(`Your screen fits up to ${absMax} columns.`);
        num = absMax;
        val = String(num);
      }
      
      // Clamp board width into the exact bounds for this new column count
      const newMin = getMinBoardWidth(val);
      const newMax = getMaxBoardWidth(val);
      let newWidth = settings.boardWidth;
      
      if (newWidth > newMax) newWidth = newMax;
      if (newWidth < newMin) newWidth = newMin;
      
      newSettings.boardWidth = newWidth;
    }
    
    newSettings.numberOfColumns = val;
    setSettings(newSettings);
  };

  const getSliderBackground = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, var(--primary-color) ${percentage}%, rgba(255,255,255,0.12) ${percentage}%)`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel hide-scrollbar" onClick={e => e.stopPropagation()} style={{
        width: '480px',
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

        {/* ACCOUNT SECTION */}
        <div className="settings-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '-10px', marginBottom: '20px' }}>
          <SectionTitle>ACCOUNT</SectionTitle>
          {!user ? (
            <>
              <p style={{ color: '#8892a0', fontSize: '0.9rem', marginBottom: '16px' }}>
                Sign in to sync your boards and widgets across devices.
              </p>
              <button 
                onClick={handleSignIn}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '10px', borderRadius: '8px', 
                  backgroundColor: '#f1f1f1', color: '#111', 
                  fontWeight: 600, cursor: 'pointer', border: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />
                Sign in with Google
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', 
                  backgroundColor: '#e65100', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 600
                }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.displayName || 'User'}</div>
                  <div style={{ color: '#8892a0', fontSize: '0.85rem' }}>{user.email}</div>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                style={{ 
                  padding: '6px 16px', borderRadius: '6px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', color: '#f1f1f1', 
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </div>
          )}
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

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Blur</label>
              <span style={valueStyle}>{settings.blur}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="64" 
              value={settings.blur} 
              onChange={(e) => handleChange('blur', parseInt(e.target.value, 10))}
              className="custom-slider"
              style={{ background: getSliderBackground(settings.blur, 0, 64) }}
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
            <CustomSelect 
              value={settings.numberOfColumns}
              onChange={(val) => handleColumnsChange(val)}
              options={[
                { value: 'Auto', label: 'Auto' },
                ...[4, 5, 6, 7, 8, 9]
                  .filter(num => num <= getAbsoluteMaxColumns())
                  .map(num => ({ value: String(num), label: String(num) }))
              ]}
            />
          </div>
          
          {columnAlertMessage && (
            <div style={{
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#d1d5db' }}>{columnAlertMessage}</span>
              <button 
                onClick={() => setColumnAlertMessage(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Board width</label>
              <span style={valueStyle}>{settings.boardWidth}px</span>
            </div>
            <input 
              type="range" 
              min={getMinBoardWidth()} 
              max={getMaxBoardWidth()} 
              value={settings.boardWidth} 
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                handleChange('boardWidth', Math.max(getMinBoardWidth(), Math.min(val, getMaxBoardWidth())));
              }}
              className="custom-slider"
              style={{ background: getSliderBackground(settings.boardWidth, getMinBoardWidth(), getMaxBoardWidth()) }}
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
                {shortcutLabel}
              </button>
              <button 
                onClick={() => {
                  if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
                  } else {
                    alert("Please open chrome://extensions/shortcuts in your browser.");
                  }
                }} 
                style={toggleBtnStyle(false)}
              >
                Change
              </button>
            </div>
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
            <span style={valueStyle}>0.0.0</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={labelStyle}>Contact</label>
            <a href="mailto:obourra662@gmail.com" style={{ ...valueStyle, textDecoration: 'none' }}>
              obourra662@gmail.com
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
      backgroundColor: checked ? 'var(--primary-color)' : 'rgba(100, 116, 139, 0.45)',
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
                backgroundColor: String(opt.value) === String(value) ? 'var(--primary-color)' : 'transparent',
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
