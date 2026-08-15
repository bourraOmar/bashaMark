import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Compass, Settings, MoreHorizontal, Trash2, MapPin, Check, WifiOff } from 'lucide-react';
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

export default function PrayerWidget({ id, board, onUpdate, onDelete }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right');
  const menuRef = useRef(null);

  // Settings from board state or defaults
  const [method, setMethod] = useState(board?.method !== undefined ? board?.method : 2);
  const [city, setCity] = useState(board?.city || 'Safi');
  const [country, setCountry] = useState(board?.country || 'Morocco');

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
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'auto'
  };

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetCity = city;
      const targetCountry = country;
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(targetCity)}&country=${encodeURIComponent(targetCountry)}&method=${method}`;
      const locLabel = `${targetCity}, ${targetCountry}`;

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
    } catch {
      setError('Network error loading prayer times.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPrayerTimes();
  }, [city, country, method]);

  const handleSaveSettings = () => {
    onUpdate(id, { method, city, country });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
          <Compass size={16} style={{ color: 'var(--text-color)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-color)' }}>
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>CITY</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
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
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>COUNTRY</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
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
          </div>

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
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '8px', padding: '10px', opacity: 0.85 }}>
              <WifiOff size={24} style={{ color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginTop: '2px' }}>Connection Lost</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Unable to fetch prayer times</div>
              <button 
                onClick={fetchPrayerTimes}
                style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                Retry
              </button>
            </div>
          ) : prayerTimes ? (
            <>
              {locationDisplay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.7, marginBottom: '6px' }}>
                  <MapPin size={12} />
                  <span>{locationDisplay}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {Object.entries(prayerTimes).map(([name, time]) => {
                  const isNext = name === nextPrayer;
                  return (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        backgroundColor: isNext ? 'var(--primary-color)' : 'rgba(0,0,0,0.04)',
                        color: isNext ? 'white' : 'var(--text-color)',
                        fontWeight: isNext ? 700 : 400,
                        transition: 'background 0.2s'
                      }}
                    >
                      <span>{name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>{time}</span>
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
