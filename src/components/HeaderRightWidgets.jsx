import React, { useState, useEffect } from 'react';

export default function HeaderRightWidgets() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayName = days[time.getDay()];
  const dayNum = time.getDate();
  const monthName = months[time.getMonth()];
  const dateString = `${dayName}, ${dayNum} ${monthName}`;

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      {/* Pill 1: Free Trial */}
      <div className="header-pill-widget">
        <span className="pill-widget-label">FREE TRIAL</span>
        <span className="pill-widget-value">2 days left</span>
      </div>

      {/* Pill 2: Focus Today */}
      <div className="header-pill-widget">
        <span className="pill-widget-label">FOCUS TODAY</span>
        <span className="pill-widget-value">0m</span>
      </div>

      {/* Pill 3: Live Date & Time */}
      <div className="header-pill-widget">
        <span className="pill-widget-label">{dateString}</span>
        <span className="pill-widget-value">{timeString}</span>
      </div>
    </div>
  );
}
