import { useState, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Pause, RotateCcw, SkipForward, Settings, MoreHorizontal, Trash2 } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { useRef } from 'react';

const MODES = {
  FOCUS: { label: 'Focus', time: 25 * 60 },
  SHORT_BREAK: { label: 'Short Break', time: 5 * 60 },
  LONG_BREAK: { label: 'Long Break', time: 15 * 60 }
};

export default function PomodoroWidget({ id, onDelete }) {
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  
  const [settings, setSettings] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakAfter: 4
  });

  const menuRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setIsSettingsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'board' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : (isMenuOpen || isSettingsOpen || isConfirmOpen) ? 100 : undefined,
    position: 'relative',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px'
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Auto-switch mode on complete
      setIsRunning(false);
      if (mode === 'FOCUS') {
        setSessionsCompleted(s => s + 1);
        const nextMode = (sessionsCompleted + 1) % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
        setMode(nextMode);
        setTimeLeft(MODES[nextMode].time);
      } else {
        setMode('FOCUS');
        setTimeLeft(MODES.FOCUS.time);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessionsCompleted]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'FOCUS' ? settings.focus * 60 : mode === 'SHORT_BREAK' ? settings.shortBreak * 60 : settings.longBreak * 60);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSettings = {
      focus: parseInt(formData.get('focus')) || 25,
      shortBreak: parseInt(formData.get('shortBreak')) || 5,
      longBreak: parseInt(formData.get('longBreak')) || 15,
      longBreakAfter: parseInt(formData.get('longBreakAfter')) || 4
    };
    setSettings(newSettings);
    
    // Update current time if timer is not running
    if (!isRunning) {
      if (mode === 'FOCUS') setTimeLeft(newSettings.focus * 60);
      else if (mode === 'SHORT_BREAK') setTimeLeft(newSettings.shortBreak * 60);
      else if (mode === 'LONG_BREAK') setTimeLeft(newSettings.longBreak * 60);
    }
    setIsSettingsOpen(false);
  };

  const skipTimer = () => {
    setTimeLeft(0);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'FOCUS' ? settings.focus * 60 : newMode === 'SHORT_BREAK' ? settings.shortBreak * 60 : settings.longBreak * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      {/* Header / Drag Handle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            fontWeight: 500, 
            color: 'var(--text-color)', 
            fontSize: '1.05rem',
            flex: 1
          }}
        >
          Pomodoro
        </div>
        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', opacity: 0.7 }}>
          <div style={{ position: 'relative' }} ref={settingsRef} onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => {
              if (!isSettingsOpen && settingsRef.current) {
                const rect = settingsRef.current.getBoundingClientRect();
                setDropdownPosition(window.innerWidth - rect.right < 250 ? 'left' : 'right');
              }
              setIsSettingsOpen(!isSettingsOpen);
            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <Settings size={16} />
            </button>
            {isSettingsOpen && (
              <div className="dropdown-menu" style={{ 
                width: '220px', padding: '16px', 
                right: dropdownPosition === 'left' ? '100%' : 'auto', 
                left: dropdownPosition === 'right' ? '100%' : 'auto', 
                top: '24px', 
                marginLeft: dropdownPosition === 'right' ? '8px' : 0, 
                marginRight: dropdownPosition === 'left' ? '8px' : 0, 
                marginTop: 0, 
                cursor: 'default' 
              }}>
                <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'focus', label: 'Focus (min)', value: settings.focus },
                    { id: 'shortBreak', label: 'Short break (min)', value: settings.shortBreak },
                    { id: 'longBreak', label: 'Long break (min)', value: settings.longBreak },
                    { id: 'longBreakAfter', label: 'Long break after', value: settings.longBreakAfter }
                  ].map(field => (
                    <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>{field.label}</label>
                      <input 
                        name={field.id}
                        type="number" 
                        defaultValue={field.value}
                        style={{ width: '48px', padding: '4px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.05)', color: 'var(--text-color)', textAlign: 'center' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setIsSettingsOpen(false)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: '#5c8c9e', color: 'white', cursor: 'pointer' }}>Save</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => {
              if (!isMenuOpen && menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                setDropdownPosition(window.innerWidth - rect.right < 250 ? 'left' : 'right');
              }
              setIsMenuOpen(!isMenuOpen);
            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <MoreHorizontal size={16} />
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu" style={{ 
                right: dropdownPosition === 'left' ? '100%' : 'auto', 
                left: dropdownPosition === 'right' ? '100%' : 'auto', 
                top: '24px', 
                marginLeft: dropdownPosition === 'right' ? '8px' : 0, 
                marginRight: dropdownPosition === 'left' ? '8px' : 0, 
                marginTop: 0 
              }}>
                <button className="dropdown-item danger" onClick={() => { setIsConfirmOpen(true); setIsMenuOpen(false); }}>
                  <Trash2 size={16} />
                  Delete board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', fontSize: '0.75rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
        {Object.entries(MODES).map(([key, config]) => (
          <div 
            key={key}
            onClick={() => changeMode(key)}
            style={{
              padding: '6px 10px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: mode === key ? 'var(--text-color)' : 'var(--text-muted)',
              backgroundColor: mode === key ? 'rgba(0,0,0,0.1)' : 'transparent',
              fontWeight: mode === key ? 500 : 400,
              opacity: mode === key ? 1 : 0.6,
              transition: 'all 0.2s'
            }}
          >
            {config.label}
          </div>
        ))}
      </div>

      {/* Timer Display */}
      <div style={{ textAlign: 'center', fontSize: '4.5rem', fontWeight: 300, color: 'var(--text-color)', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {formatTime(timeLeft)}
      </div>

      {/* Dots (Sessions) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        {Array.from({ length: settings.longBreakAfter }).map((_, i) => (
          <div 
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: i < (sessionsCompleted % settings.longBreakAfter) ? '#5c8c9e' : 'rgba(0,0,0,0.2)'
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={resetTimer}
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <RotateCcw size={18} />
        </button>
        
        <button 
          onClick={toggleTimer}
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: 'none', backgroundColor: '#5c8c9e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(92, 140, 158, 0.3)' }}
        >
          {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
        </button>

        <button 
          onClick={skipTimer}
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <SkipForward size={18} />
        </button>
      </div>
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete Pomodoro"
        message="Are you sure you want to delete this Pomodoro widget?"
      />
    </div>
  );
}
