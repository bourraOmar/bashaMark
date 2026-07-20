import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="widget glass-panel">
      <div style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Focus Session</div>
      <div className="pomodoro-timer">
        {minutes}:{seconds}
      </div>
      <div className="pomodoro-controls">
        <button className="pomodoro-btn" onClick={resetTimer} title="Reset">
          <RotateCcw size={20} />
        </button>
        <button className={`pomodoro-btn ${isActive ? 'active' : ''}`} onClick={toggleTimer} title={isActive ? 'Pause' : 'Start'}>
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </div>
  );
}
