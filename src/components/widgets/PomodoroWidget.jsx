import { useState, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Pause, RotateCcw, SkipForward, Settings, MoreHorizontal } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'board' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
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
    setTimeLeft(MODES[mode].time);
  };

  const skipTimer = () => {
    setTimeLeft(0);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
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
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <Settings size={16} />
          </button>
          <button onClick={() => setIsConfirmOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', fontSize: '0.8rem', justifyContent: 'center' }}>
        {Object.entries(MODES).map(([key, config]) => (
          <div 
            key={key}
            onClick={() => changeMode(key)}
            style={{
              padding: '6px 16px',
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: i < (sessionsCompleted % 4) ? '#5c8c9e' : 'rgba(0,0,0,0.2)'
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
