import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const PRESET_COLORS = [
  '#a855f7', // Purple
  '#14b8a6', // Teal
  '#f59e0b', // Orange
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#84cc16', // Green
];

export default function StylePicker({ styleType, styleColor, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const handleTypeChange = (type) => {
    // If clicking the same type, toggle it off. Otherwise, set it.
    // If turning on for the first time, set a default color if none exists.
    const newType = styleType === type ? null : type;
    const newColor = styleColor || PRESET_COLORS[0];
    onChange({ styleType: newType, styleColor: newColor });
  };

  const handleColorChange = (color) => {
    // If no type is selected, select 'corner' by default when clicking a color
    const newType = styleType || 'corner';
    onChange({ styleType: newType, styleColor: color });
  };

  return (
    <div style={{ padding: '4px 8px', borderTop: '1px solid var(--dropdown-border)', borderBottom: '1px solid var(--dropdown-border)', margin: '4px 0' }}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          width: '100%', padding: '6px 4px', background: 'none', border: 'none', 
          color: 'var(--text-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} />
          Customize
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '8px', padding: '0 4px 8px 4px', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Corner Button */}
            <button 
              onClick={() => handleTypeChange('corner')}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: '8px',
                border: styleType === 'corner' ? '2px solid var(--primary-color)' : '1px solid var(--dropdown-border)',
                background: styleType === 'corner' ? 'var(--item-hover-bg)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.8rem'
              }}
            >
              <div style={{ 
                width: '32px', height: '24px', borderRadius: '4px', border: '1px solid var(--dropdown-border)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '6px', backgroundColor: styleColor || 'var(--text-muted)' }} />
              </div>Header</button>

            {/* Outline Button */}
            <button 
              onClick={() => handleTypeChange('outline')}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: '8px',
                border: styleType === 'outline' ? '2px solid var(--primary-color)' : '1px solid var(--dropdown-border)',
                background: styleType === 'outline' ? 'var(--item-hover-bg)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.8rem'
              }}
            >
              <div style={{ 
                width: '32px', height: '24px', borderRadius: '4px', border: `2px solid ${styleColor || 'var(--text-muted)'}`
              }} />
              Outline
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color,
                  border: styleColor === color ? '2px solid white' : 'none',
                  boxShadow: styleColor === color ? '0 0 0 1px var(--text-color)' : 'none',
                  cursor: 'pointer', padding: 0
                }}
              />
            ))}
            <div style={{ position: 'relative' }}>
              <input 
                type="color"
                value={styleColor || '#ffffff'}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer'
                }}
              />
              <button style={{
                width: '20px', height: '20px', borderRadius: '50%', border: '1px dashed var(--text-muted)',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', cursor: 'pointer', padding: 0
              }}>
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
