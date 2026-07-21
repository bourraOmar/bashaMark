import { useState, useRef } from 'react';
import { X, UploadCloud, Search, ExternalLink } from 'lucide-react';
import { useBackground } from '../hooks/useBackground';
import { extractColorsFromImage } from '../utils/colorMatcher';

const PRESETS = [
  'https://images.unsplash.com/photo-1506259091721-347e791bab0f?w=2560&q=100',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=2560&q=100',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=100',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&q=100',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2560&q=100',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=2560&q=100',
  'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=2560&q=100',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=2560&q=100',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2560&q=100',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2560&q=100',
  'https://images.unsplash.com/photo-1501862700950-18382cd41497?w=2560&q=100',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2560&q=100'
];

export default function WallpaperModal({ isOpen, onClose, settings, setSettings }) {
  const fileInputRef = useRef(null);
  const { changeBackground } = useBackground();
  
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const applyBackground = async (bgUrl) => {
    changeBackground(bgUrl);
    
    // Auto match colors
    if (settings && setSettings) {
      try {
        const { primary, board } = await extractColorsFromImage(bgUrl);
        setSettings({ ...settings, primaryColor: primary, boardColor: board });
      } catch (e) {
        console.warn("Could not extract color from wallpaper", e);
      }
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

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleOverlayClick}
    >
      <div 
        className="glass-panel"
        style={{
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-color)', // match the light/dark theme
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
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
                    backgroundImage: `url(${url})`,
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
    </div>
  );
}
