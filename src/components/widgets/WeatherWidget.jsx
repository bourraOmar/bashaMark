import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cloud, Settings, MoreHorizontal, Trash2, MapPin, Check, RefreshCw, Wind, WifiOff } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

function getSamsungWeatherIcon(iconCode, size = 'large') {
  const isLarge = size === 'large';
  const width = isLarge ? 68 : 26;
  const height = isLarge ? 68 : 26;

  if (!iconCode) iconCode = '02d';
  const code = iconCode.slice(0, 2);
  const isNight = iconCode.endsWith('n');

  // Sun / Clear Day
  if (code === '01' && !isNight) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx="50" cy="50" r="38" fill="url(#sunGrad)" filter="drop-shadow(0 4px 10px rgba(255, 170, 0, 0.45))" />
        <defs>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE853" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Moon / Clear Night
  if (code === '01' && isNight) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d="M70 55 A 35 35 0 1 1 45 15 A 28 28 0 0 0 70 55 Z" fill="url(#moonGrad)" filter="drop-shadow(0 3px 8px rgba(130, 170, 255, 0.35))" />
        <defs>
          <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F7FA" />
            <stop offset="100%" stopColor="#A0B4CF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Rain or Drizzle
  if (code === '09' || code === '10') {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d="M24 58 L76 58 A 16 16 0 0 0 76 26 A 22 22 0 0 0 32 32 A 15 15 0 0 0 24 58 Z" fill="#D8E2EC" filter="drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2))" />
        <line x1="37" y1="66" x2="31" y2="82" stroke="#38BDF8" strokeWidth={isLarge ? "4.5" : "2.5"} strokeLinecap="round" />
        <line x1="53" y1="66" x2="47" y2="82" stroke="#38BDF8" strokeWidth={isLarge ? "4.5" : "2.5"} strokeLinecap="round" />
        <line x1="69" y1="66" x2="63" y2="82" stroke="#38BDF8" strokeWidth={isLarge ? "4.5" : "2.5"} strokeLinecap="round" />
      </svg>
    );
  }

  // Thunderstorm
  if (code === '11') {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d="M24 54 L76 54 A 16 16 0 0 0 76 22 A 22 22 0 0 0 32 28 A 15 15 0 0 0 24 54 Z" fill="#64748B" filter="drop-shadow(0 3px 8px rgba(0, 0, 0, 0.25))" />
        <path d="M55 50 L41 68 L51 68 L44 88 L65 64 L53 64 Z" fill="#FACC15" filter="drop-shadow(0 2px 6px rgba(250, 204, 21, 0.45))" />
      </svg>
    );
  }

  // Snow
  if (code === '13') {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d="M24 58 L76 58 A 16 16 0 0 0 76 26 A 22 22 0 0 0 32 32 A 15 15 0 0 0 24 58 Z" fill="#FFFFFF" filter="drop-shadow(0 3px 8px rgba(0, 0, 0, 0.18))" />
        <circle cx="37" cy="72" r={isLarge ? 4 : 2} fill="#BAE6FD" />
        <circle cx="53" cy="78" r={isLarge ? 4.5 : 2.2} fill="#BAE6FD" />
        <circle cx="69" cy="70" r={isLarge ? 4 : 2} fill="#BAE6FD" />
      </svg>
    );
  }

  // Overcast clouds (04)
  if (code === '04') {
    return (
      <svg width={width} height={height} viewBox="0 0 110 90" style={{ flexShrink: 0 }}>
        <path d="M50 68 L88 68 A 15 15 0 0 0 88 38 A 20 20 0 0 0 52 41 A 14 14 0 0 0 50 68 Z" fill="#94A3B8" opacity="0.85" />
        <path d="M24 78 L68 78 A 16 16 0 0 0 68 46 A 22 22 0 0 0 28 51 A 15 15 0 0 0 24 78 Z" fill="#FFFFFF" filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))" />
      </svg>
    );
  }

  // Partly cloudy Day or Night
  if (isNight) {
    return (
      <svg width={width} height={height} viewBox="0 0 110 90" style={{ flexShrink: 0 }}>
        <path d="M78 44 A 22 22 0 1 1 56 16 A 18 18 0 0 0 78 44 Z" fill="#B8C6DB" filter="drop-shadow(0 2px 4px rgba(100, 150, 255, 0.2))" />
        <path d="M28 75 L74 75 A 16 16 0 0 0 74 43 A 22 22 0 0 0 33 48 A 15 15 0 0 0 28 75 Z" fill="#FFFFFF" filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))" />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} viewBox="0 0 110 90" style={{ flexShrink: 0 }}>
      <circle cx="70" cy="34" r="24" fill="url(#sunGradCloud)" filter="drop-shadow(0 2px 6px rgba(255, 170, 0, 0.35))" />
      <path d="M28 75 L74 75 A 16 16 0 0 0 74 43 A 22 22 0 0 0 33 48 A 15 15 0 0 0 28 75 Z" fill="#FFFFFF" filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))" />
      <defs>
        <linearGradient id="sunGradCloud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE853" />
          <stop offset="100%" stopColor="#FF9900" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Convert Open-Meteo WMO weather codes into clean single-line descriptions & icons
function getWMODescription(code, isNight = false) {
  let base = isNight ? "Clear night" : "Clear sky";
  let icon = isNight ? "01n" : "01d";
  
  if ([1, 2].includes(code)) { base = "Partly cloudy"; icon = isNight ? "02n" : "02d"; }
  else if (code === 3) { base = "Cloudy"; icon = "04d"; }
  else if ([45, 48].includes(code)) { base = "Foggy"; icon = "50d"; }
  else if ([51, 53, 55, 56, 57, 80, 81, 82].includes(code)) { base = "Showers"; icon = "09d"; }
  else if ([61, 63, 65, 66, 67].includes(code)) { base = "Rain"; icon = "10d"; }
  else if ([71, 73, 75, 77, 85, 86].includes(code)) { base = "Snow"; icon = "13d"; }
  else if ([95, 96, 99].includes(code)) { base = "Thunderstorm"; icon = "11d"; }

  return { condition: base, icon };
}

export default function WeatherWidget({ id, board, onUpdate, onDelete }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const menuRef = useRef(null);

  const [city, setCity] = useState(board?.city || 'Safi, Morocco');
  const [units, setUnits] = useState(board?.units || 'metric');

  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locationDisplay, setLocationDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
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
    zIndex: isDragging ? 1000 : (isMenuOpen || isConfirmOpen || isSettingsOpen) ? 100 : undefined,
    position: 'relative',
    cursor: 'default',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'auto'
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      let lat, lon, locLabel;
      let targetCity = city;
      if (targetCity === 'Auto-detect') targetCity = 'Safi, Morocco';

      // 1. Geocode the city name via Open-Meteo geocoding API
      const geocodeRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`);
      const geocodeData = await geocodeRes.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error(`Could not find location "${targetCity}". Please verify the city name.`);
      }

      const match = geocodeData.results[0];
      lat = match.latitude;
      lon = match.longitude;
      locLabel = match.country ? `${match.name}, ${match.country}` : match.name;

      // 2. Fetch High-Resolution ECMWF smartphone weather modeling from Open-Meteo
      const tempUnitParam = units === 'imperial' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';
      const omRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto${tempUnitParam}`
      );
      const omData = await omRes.json();

      if (!omData.current || !omData.daily) {
        throw new Error("Unable to read weather data.");
      }

      const temp = Math.round(omData.current.temperature_2m);
      const windSpeed = Math.round(omData.current.wind_speed_10m);
      const windUnit = units === 'imperial' ? 'mph' : 'km/h';
      
      // Exact high-precision Day/Night check against actual sunrise and sunset times down to the minute
      let isNight = omData.current.is_day === 0;
      const sunsetIso = omData.daily.sunset?.[0];
      const sunriseIso = omData.daily.sunrise?.[0];
      const tomorrowSunriseIso = omData.daily.sunrise?.[1];
      const nowMs = Date.now();
      
      if (sunsetIso && sunriseIso) {
        const sunsetMs = new Date(sunsetIso).getTime();
        const sunriseMs = new Date(sunriseIso).getTime();
        if (!isNaN(sunsetMs) && !isNaN(sunriseMs)) {
          isNight = (nowMs >= sunsetMs || nowMs < sunriseMs);
        }
      }
      
      const { condition, icon } = getWMODescription(omData.current.weather_code, isNight);

      let sunTimeText = "";
      const targetIso = isNight ? (tomorrowSunriseIso || sunriseIso) : (sunsetIso || sunriseIso);
      if (targetIso) {
        const timeDate = new Date(targetIso);
        sunTimeText = `${isNight ? "Sunrise" : "Sunset"} ${timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      }

      setCurrentWeather({
        temp,
        condition,
        icon,
        sunTimeText,
        windSpeed,
        windUnit,
        isNight
      });
      setLocationDisplay(locLabel);

      // Parse 4-day Samsung One UI forecast
      const daysList = [];
      for (let i = 1; i <= Math.min(4, omData.daily.time.length - 1); i++) {
        const dateStr = omData.daily.time[i];
        const minTemp = Math.round(omData.daily.temperature_2m_min[i]);
        const maxTemp = Math.round(omData.daily.temperature_2m_max[i]);
        const dayCode = omData.daily.weather_code[i];
        const dayInfo = getWMODescription(dayCode, false);
        daysList.push({
          dayName: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          minTemp,
          maxTemp,
          icon: dayInfo.icon
        });
      }
      setForecast(daysList);
    } catch (err) {
      console.error('Failed to fetch high-res weather data:', err);
      setError(err.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSaveSettings = () => {
    onUpdate(id, {
      ...board,
      units,
      city
    });
    setIsSettingsOpen(false);
    fetchWeather();
  };

  // Determine dynamic One UI atmospheric background glow based on real-time Day/Night and weather condition
  let atmosphereGlow = null;
  if (currentWeather) {
    if (currentWeather.isNight) {
      // Deep mystic indigo twilight nightfall aura
      atmosphereGlow = 'radial-gradient(circle at 82% 25%, rgba(68, 88, 175, 0.42) 0%, rgba(30, 42, 90, 0.25) 55%, transparent 88%)';
    } else if (currentWeather.condition.includes('Rain') || currentWeather.condition.includes('Showers') || currentWeather.condition.includes('Thunder')) {
      // Stormy cool aqua/slate aura
      atmosphereGlow = 'radial-gradient(circle at 82% 25%, rgba(56, 189, 248, 0.30) 0%, rgba(100, 116, 139, 0.20) 55%, transparent 88%)';
    } else {
      // Warm golden/celeste daytime sunburst aura
      atmosphereGlow = 'radial-gradient(circle at 82% 25%, rgba(255, 175, 15, 0.35) 0%, rgba(56, 189, 248, 0.14) 50%, transparent 88%)';
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      {/* Dynamic Day/Night Samsung One UI Atmospheric Aura */}
      {atmosphereGlow && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: atmosphereGlow,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.8s ease'
        }} />
      )}
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 10 }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: isDragging ? 'grabbing' : 'grab',
            flex: 1
          }}
        >
          <Cloud size={16} style={{ color: 'var(--text-color)', opacity: 0.85 }} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-color)' }}>
            Weather
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button 
            onClick={fetchWeather}
            title="Refresh Weather"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', opacity: 0.7, padding: '4px', display: 'flex' }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Configure Weather Settings"
            style={{ 
              background: isSettingsOpen ? 'rgba(255,255,255,0.1)' : 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--text-color)', 
              opacity: isSettingsOpen ? 1 : 0.7, 
              padding: '4px',
              borderRadius: '4px',
              display: 'flex'
            }}
          >
            <Settings size={15} />
          </button>
          
          <div style={{ position: 'relative' }} ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => {
              if (!isMenuOpen && menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                setDropdownPosition(window.innerWidth - rect.right < 250 ? 'left' : 'right');
              }
              setIsMenuOpen(!isMenuOpen);
            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', display: 'flex' }}>
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
                  Delete widget
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal Inline */}
      {isSettingsOpen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.04em' }}>CITY / REGION</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London, UK"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.04em' }}>TEMPERATURE UNITS</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setUnits('metric')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: units === 'metric' ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: units === 'metric' ? 'white' : 'var(--text-color)',
                  fontWeight: units === 'metric' ? 600 : 400
                }}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setUnits('imperial')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: units === 'imperial' ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: units === 'imperial' ? 'white' : 'var(--text-color)',
                  fontWeight: units === 'imperial' ? 600 : 400
                }}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            style={{
              marginTop: '4px',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Check size={16} /> Save Settings
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
          {loading && !currentWeather ? (
            <div style={{ padding: '30px 0', textAlign: 'center', opacity: 0.7, fontSize: '0.88rem' }}>
              Loading weather...
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '8px', padding: '20px 10px', opacity: 0.8 }}>
              <WifiOff size={28} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>Connection Lost</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unable to fetch data</div>
              <button 
                onClick={fetchWeather}
                style={{ marginTop: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Retry
              </button>
            </div>
          ) : currentWeather ? (
            <>
              {/* Samsung One UI Clean & Spacious Weather Card */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 2px 2px 2px' }}>
                
                {/* Location Banner at Top */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.86rem', fontWeight: 600, opacity: 0.85, color: 'var(--text-color)', marginBottom: '2px' }}>
                  <MapPin size={13} style={{ flexShrink: 0, opacity: 0.9 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {locationDisplay}
                  </span>
                </div>

                {/* Main Temperature and Big Icon Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0 6px 0' }}>
                  <div style={{ fontSize: '3.2rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-color)', letterSpacing: '-0.03em' }}>
                    {currentWeather.temp}°
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getSamsungWeatherIcon(currentWeather.icon, 'large')}
                  </div>
                </div>

                {/* Condition & Subtle Horizontal Telemetry Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-color)' }}>
                    {currentWeather.condition}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', opacity: 0.75, color: 'var(--text-color)', fontWeight: 500 }}>
                    {currentWeather.windSpeed !== undefined && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Wind size={13} style={{ opacity: 0.9 }} />
                        {currentWeather.windSpeed} {currentWeather.windUnit}
                      </span>
                    )}
                    {currentWeather.sunTimeText && (
                      <>
                        {currentWeather.windSpeed !== undefined && <span style={{ opacity: 0.4 }}>•</span>}
                        <span>{currentWeather.sunTimeText}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Thin Divider Line */}
              {forecast && forecast.length > 0 && (
                <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '14px 0 12px 0', opacity: 0.6 }} />
              )}

              {/* 4-Day Forecast List (Samsung 4x2 style) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {forecast.map((day, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '2px 2px',
                      fontSize: '0.92rem',
                      color: 'var(--text-color)' 
                    }}
                  >
                    <span style={{ width: '45px', fontWeight: 500, opacity: 0.9 }}>{day.dayName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getSamsungWeatherIcon(day.icon, 'small')}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontFamily: 'sans-serif', fontWeight: 500 }}>
                      <span style={{ fontWeight: 700, minWidth: '26px', textAlign: 'right' }}>{day.maxTemp}°</span>
                      <span style={{ opacity: 0.6, minWidth: '26px', textAlign: 'right' }}>{day.minTemp}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => {
          onDelete();
          setIsConfirmOpen(false);
        }}
        title="Delete Weather Widget"
        message="Are you sure you want to delete this weather widget?"
      />
    </div>
  );
}
