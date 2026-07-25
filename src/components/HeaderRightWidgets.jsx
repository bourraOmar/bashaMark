import React, { useState, useEffect } from 'react';

export default function HeaderRightWidgets() {
  const [time, setTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState({ name: 'Next Prayer', timeRest: 'Calculating...' });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Prayer Times and calculate next prayer countdown
  useEffect(() => {
    let isMounted = true;
    const fetchPrayers = async () => {
      try {
        let lat = 21.4225, lon = 39.8262; // Default Mecca fallback
        try {
          const geo = await fetch('https://get.geojs.io/v1/ip/geo.json').then(r => r.json());
          if (geo.latitude && geo.longitude) {
            lat = parseFloat(geo.latitude);
            lon = parseFloat(geo.longitude);
          }
        } catch (e) {}

        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
        const json = await res.json();
        if (json?.data?.timings && isMounted) {
          calculateNextPrayer(json.data.timings);
        }
      } catch (e) {
        console.warn('Prayer fetch error in header:', e);
      }
    };

    const calculateNextPrayer = (timings) => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      let found = null;
      for (const pName of order) {
        const timeStr = timings[pName];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const pMins = h * 60 + m;
        if (pMins > currentMins) {
          const diff = pMins - currentMins;
          const hrs = Math.floor(diff / 60);
          const mins = diff % 60;
          const timeRest = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
          found = { name: pName, timeRest };
          break;
        }
      }

      if (!found) {
        // Next is tomorrow's Fajr
        const [h, m] = timings['Fajr'].split(':').map(Number);
        const pMins = h * 60 + m + 24 * 60;
        const diff = pMins - currentMins;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        found = { name: 'Fajr', timeRest: hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m` };
      }

      setPrayerData(found);
    };

    fetchPrayers();
    const interval = setInterval(fetchPrayers, 60000);
    return () => { isMounted = false; clearInterval(interval); };
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
      {/* Pill 1: Next Prayer Countdown (Replaced Free Trial) */}
      <div className="header-pill-widget" title={`Next prayer is ${prayerData.name}`}>
        <span className="pill-widget-label">NEXT PRAYER ({prayerData.name.toUpperCase()})</span>
        <span className="pill-widget-value">{prayerData.timeRest}</span>
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
