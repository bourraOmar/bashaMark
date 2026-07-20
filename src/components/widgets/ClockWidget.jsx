import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="widget glass-panel">
      <div className="clock-time">
        {format(time, 'HH:mm')}
      </div>
      <div className="clock-date">
        {format(time, 'EEEE, MMMM do')}
      </div>
    </div>
  );
}
