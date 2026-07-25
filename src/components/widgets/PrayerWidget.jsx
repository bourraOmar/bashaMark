import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Compass, Settings, MoreHorizontal, Trash2, MapPin, Check } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

const CALCULATION_METHODS = [
  { id: 0, name: 'Shia Ithna-Ashari' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League (MWL)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore' },
  { id: 12, name: 'Union Organization Islamic de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
];

export default function PrayerWidget({ id, board, onUpdate, onDelete, settings: appSettings }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const menuRef = useRef(null);

  // Settings from board state or defaults
  const [locationType, setLocationType] = useState(board?.locationType || 'auto');
  const [city, setCity] = useState(board?.city || 'Mecca');
  const [country, setCountry] = useState(board?.country || 'Saudi Arabia');
  const [method, setMethod] = useState(board?.method !== undefined ? board?.method : 2);

  // Fetched data state
  const [prayerTimes, setPrayerTimes] = useState(null);
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
    minHeight: '280px'
  };

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      let locLabel = '';
      
      if (locationType === 'auto') {
        try {
          const geoRes = await fetch('https://ipapi.co/json/');
          const geoData = await geoRes.json();
          if (geoData.latitude && geoData.longitude) {
            url = `https://api.aladhan.com/v1/timings?latitude=${geoData.latitude}&longitude=${geoData.longitude}&method=${method}`;
            locLabel = `${geoData.city || 'Local'}, ${geoData.country_name || 'Region'}`;
          }
        } catch (e) {
          console.warn('Auto Geo-IP failed, falling back to City/Country API');
        }
      }

      if (!url) {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
        locLabel = `${city}, ${country}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        setPrayerTimes({
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
        });
        setLocationDisplay(locLabel);
      } else {
        setError('Could not load prayer times. Check location.');
      }
    } catch (e) {
      setError('Network error loading prayer times.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [board?.locationType, board?.city, board?.country, board?.method]);

  const handleSaveSettings = () => {
    onUpdate(id, { locationType, city, country, method });
    setIsSettingsOpen(false);
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const name of order) {
      const timeStr = prayerTimes[name];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        return name;
      }
    }
    return 'Fajr'; // Next day Fajr
  };

  const nextPrayer = getNextPrayer();

  return (
    <div ref={setNodeRef} style={style} className="board glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
          <Compass size={18} style={{ color: 'var(--text-color)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-color)' }}>
            Prayer Times
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Configure Location & Method"
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
            <Settings size={16} />
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

      {isSettingsOpen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, fontSize: '0.85rem' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>LOCATION MODE</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setLocationType('auto')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: locationType === 'auto' ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: locationType === 'auto' ? 'white' : 'var(--text-color)',
                  fontWeight: locationType === 'auto' ? 600 : 400
                }}
              >
                Auto (IP)
              </button>
              <button
                type="button"
                onClick={() => setLocationType('manual')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: locationType === 'manual' ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: locationType === 'manual' ? 'white' : 'var(--text-color)',
                  fontWeight: locationType === 'manual' ? 600 : 400
                }}
              >
                Manual
              </button>
            </div>
          </div>

          {locationType === 'manual' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>City</label>
                <input 
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', outline: 'none', fontSize: '0.8rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Country</label>
                <input 
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', outline: 'none', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>CALCULATION METHOD</label>
            <select
              value={method}
              onChange={e => setMethod(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {CALCULATION_METHODS.map(m => (
                <option key={m.id} value={m.id} style={{ color: '#000' }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveSettings}
            style={{
              marginTop: 'auto',
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
              gap: '6px'
            }}
          >
            <Check size={16} /> Save Settings
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.7, fontSize: '0.85rem' }}>
              Loading times...
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', textAlign: 'center', fontSize: '0.85rem', padding: '10px' }}>
              {error}
            </div>
          ) : prayerTimes ? (
            <>
              {locationDisplay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.7, marginBottom: '10px' }}>
                  <MapPin size={12} />
                  <span>{locationDisplay}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(prayerTimes).map(([name, time]) => {
                  const isNext = name === nextPrayer;
                  return (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        backgroundColor: isNext ? 'var(--primary-color)' : 'rgba(0,0,0,0.04)',
                        color: isNext ? 'white' : 'var(--text-color)',
                        fontWeight: isNext ? 700 : 400,
                        transition: 'background 0.2s'
                      }}
                    >
                      <span>{name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{time}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete Prayer Times"
        message="Are you sure you want to delete this Prayer Times widget?"
      />
    </div>
  );
}
