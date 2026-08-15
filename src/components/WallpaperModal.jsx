import { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Search, ExternalLink } from 'lucide-react';
import { useBackground } from '../hooks/useBackground';
import { extractColorsFromImage } from '../utils/colorMatcher';

const PRESETS = [
  '/background/bashaMark-background1.jpg',
  '/background/bashaMark-background2.jpg',
  '/background/bashaMark-background3.jpg',
  '/background/bashaMark-background4.jpg',
  '/background/bashaMark-background5.jpg',
  '/background/bashaMark-background6.jpg',
  '/background/bashaMark-background7.jpg',
  '/background/bashaMark-background8.jpg',
  '/background/bashaMark-background9.jpg',
  '/background/bashaMark-background10.jpg',
  '/background/bashaMark-background11.jpg',
  '/background/bashaMark-background12.jpg'
];

export default function WallpaperModal({ isOpen, onClose, settings, setSettings }) {
  const fileInputRef = useRef(null);
  const { background: currentBg, changeBackground } = useBackground();
  
  const [adjusting, setAdjusting] = useState(false);
  const [initialState, setInitialState] = useState(null);
  const [extractedColors, setExtractedColors] = useState({ primary: '#b47b44', board: '#1e293b' });

  useEffect(() => {
    if (!isOpen) {
      setAdjusting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const applyBackground = async (bgUrl) => {
    setInitialState({
      bg: currentBg,
      settings: settings ? { ...settings } : null
    });

    changeBackground(bgUrl);
    
    if (settings && setSettings) {
      let prim = settings.primaryColor || '#b47b44';
      let brd = settings.boardColor || '#1e293b';
      try {
        const { primary, board } = await extractColorsFromImage(bgUrl);
        prim = primary;
        brd = board;
        setSettings({ ...settings, primaryColor: primary, boardColor: board });
      } catch (e) {
        console.warn("Could not extract color from wallpaper", e);
      }
      setExtractedColors({ primary: prim, board: brd });
      setAdjusting(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        applyBackground(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLuminance = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000');
    if (!result) return 0;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const getSliderBackground = (value, min, max, primaryHex) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const activeColor = primaryHex || '#2563eb';
    return `linear-gradient(to right, ${activeColor} ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`;
  };

  const isLight = getLuminance(settings?.boardColor) > 0.55;

  const handleCancelAdjust = () => {
    if (initialState) {
      if (initialState.bg !== undefined) changeBackground(initialState.bg);
      if (initialState.settings && setSettings) setSettings(initialState.settings);
    }
    setAdjusting(false);
  };

  const handleResetAdjust = () => {
    if (settings && setSettings) {
      setSettings({
        ...settings,
        primaryColor: extractedColors.primary,
        boardColor: extractedColors.board,
        opacity: 20,
        blur: 12,
        textSize: 'M',
        textWeight: 'Normal'
      });
    }
  };

  const handleSaveAdjust = () => {
    setAdjusting(false);
    onClose();
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(6px)'
      }}
      onClick={handleOverlayClick}
    >
      {adjusting && settings ? (
        /* Adjust Wallpaper Style Modal (Dynamically matching wallpaper & theme) */
        <div 
          className="glass-panel hide-scrollbar"
          style={{
            width: '480px',
            maxWidth: '92vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            color: 'var(--text-color)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)',
            border: '1px solid var(--glass-border)',
            padding: '28px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-color)' }}>
              Adjust Wallpaper Style
            </h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {isLight ? 'Light theme detected.' : 'Dark theme detected.'}
            </span>
          </div>

          {/* Color Pickers Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Primary Color */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PRIMARY COLOR</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color)', textTransform: 'uppercase' }}>{settings.primaryColor}</span>
              </div>
              <div 
                style={{
                  height: '52px',
                  width: '100%',
                  borderRadius: '12px',
                  backgroundColor: settings.primaryColor,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <input 
                  type="color" 
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '200%',
                    height: '200%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Board Color */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BOARD COLOR</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color)', textTransform: 'uppercase' }}>{settings.boardColor}</span>
              </div>
              <div 
                style={{
                  height: '52px',
                  width: '100%',
                  borderRadius: '12px',
                  backgroundColor: settings.boardColor,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <input 
                  type="color" 
                  value={settings.boardColor}
                  onChange={(e) => setSettings({ ...settings, boardColor: e.target.value })}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '200%',
                    height: '200%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Board Opacity Slider */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BOARD OPACITY</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{settings.opacity}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={settings.opacity}
              onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value, 10) })}
              className="custom-slider"
              style={{ background: getSliderBackground(settings.opacity, 0, 100, settings.primaryColor), width: '100%' }}
            />
          </div>

          {/* Board Blur Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BOARD BLUR</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{settings.blur}PX</span>
            </div>
            <input 
              type="range"
              min="0"
              max="40"
              value={settings.blur}
              onChange={(e) => setSettings({ ...settings, blur: parseInt(e.target.value, 10) })}
              className="custom-slider"
              style={{ background: getSliderBackground(settings.blur, 0, 40, settings.primaryColor), width: '100%' }}
            />
          </div>

          {/* Text Size Options */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
              TEXT SIZE
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['S', 'M', 'L'].map((size) => {
                const isActive = settings.textSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSettings({ ...settings, textSize: size })}
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? settings.primaryColor : 'rgba(0, 0, 0, 0.15)',
                      border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'var(--glass-border)'}`,
                      color: isActive ? '#ffffff' : 'var(--text-color)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? `0 4px 14px ${settings.primaryColor}50` : 'none'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Weight Options */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
              TEXT WEIGHT
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {['Normal', 'Bold'].map((weight) => {
                const isActive = settings.textWeight === weight;
                return (
                  <button
                    key={weight}
                    onClick={() => setSettings({ ...settings, textWeight: weight })}
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? settings.primaryColor : 'rgba(0, 0, 0, 0.15)',
                      border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'var(--glass-border)'}`,
                      color: isActive ? '#ffffff' : 'var(--text-color)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? `0 4px 14px ${settings.primaryColor}50` : 'none'
                    }}
                  >
                    {weight}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleCancelAdjust}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'var(--text-color)',
                border: '1px solid var(--glass-border)',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            >
              Cancel
            </button>
            <button
              onClick={handleResetAdjust}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'var(--text-color)',
                border: '1px solid var(--glass-border)',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            >
              Reset
            </button>
            <button
              onClick={handleSaveAdjust}
              style={{
                backgroundColor: settings.primaryColor,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '10px 28px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${settings.primaryColor}60`,
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${settings.primaryColor}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 14px ${settings.primaryColor}60`;
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Standard Wallpaper Picker Modal */
        <div 
          className="glass-panel"
          style={{
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Wallpaper</h2>
            <button 
              onClick={onClose}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-muted)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1px dashed var(--text-muted)',
                borderRadius: '12px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.02)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
            >
              <UploadCloud size={24} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>Upload image or video</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG · PNG · MP4</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/jpeg, image/png, image/webp, video/mp4"
                onChange={handleFileChange}
              />
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                PRESETS
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {PRESETS.map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => applyBackground(url)}
                    style={{
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      backgroundImage: `url(${url.replace('/background/', '/background/thumbnails/')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Find Wallpapers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                FIND WALLPAPERS
              </span>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search the web for wallpapers" 
                  style={{
                    width: '100%',
                    padding: '12px 36px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-color)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      window.open(`https://unsplash.com/s/photos/${encodeURIComponent(e.target.value)} wallpaper`, '_blank');
                    }
                  }}
                />
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <ExternalLink size={16} />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
