import React, { useState, useEffect, useRef } from 'react';
import { X, User, Sliders, Image as ImageIcon, Globe, Info, Download, ChevronDown } from 'lucide-react';
import { defaultSettings } from '../hooks/useSettings';
import { useBackground } from '../hooks/useBackground';
import { signInWithGoogle, logoutUser } from '../utils/sync';
import { extractColorsFromImage } from '../utils/colorMatcher';

export default function SettingsModal({ isOpen, onClose, settings, setSettings, boards, user }) {
  const [activeTab, setActiveTab] = useState('Account');
  const [shortcutLabel, setShortcutLabel] = useState('Not set');
  const { background } = useBackground();

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.commands) {
      chrome.commands.getAll((commands) => {
        const cmd = commands.find(c => c.name === 'quick-save');
        if (cmd && cmd.shortcut) {
          setShortcutLabel(cmd.shortcut);
        }
      });
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSignIn = async () => {
    try { await signInWithGoogle(); } catch (error) { console.error(error); }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('boards');
      localStorage.removeItem('pages');
      localStorage.removeItem('currentPageId');
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['boards', 'pendingBookmarks']);
      }
      window.location.reload();
    } catch (error) { console.error(error); }
  };

  const handleReset = async () => {
    let newSettings = { ...settings, opacity: defaultSettings.opacity, blur: defaultSettings.blur };
    if (background) {
      try {
        const { primary, board } = await extractColorsFromImage(background);
        newSettings.primaryColor = primary;
        newSettings.boardColor = board;
      } catch (e) {
        newSettings.primaryColor = defaultSettings.primaryColor;
        newSettings.boardColor = defaultSettings.boardColor;
      }
    }
    setSettings(newSettings);
  };

  const handleDownload = () => {
    const data = { boards, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bashamark_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetShortcut = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    } else {
      alert('Open your browser extensions shortcuts page to configure this.');
    }
  };

  const TabButton = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', padding: '10px 16px',
        borderRadius: '8px', border: 'none',
        backgroundColor: active ? 'var(--primary-color)' : 'transparent',
        color: active ? '#ffffff' : '#64748b',
        fontWeight: active ? 500 : 400,
        fontSize: '0.9rem', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', marginTop: '24px' }}>
      {children}
    </div>
  );

  const Row = ({ label, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{children}</div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        backgroundColor: checked ? 'var(--primary-color)' : '#cbd5e1',
        position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
        position: 'absolute', top: '2px', left: checked ? '20px' : '2px',
        transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  const Slider = ({ value, onChange, min = 0, max = 100, suffix = '' }) => (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}></span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{value}{suffix}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%', accentColor: 'var(--primary-color)', height: '4px' }}
      />
    </div>
  );

  const SegmentedControl = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', backgroundColor: 'var(--item-hover-bg)', borderRadius: '8px', padding: '2px' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, border: 'none', background: value === opt.value ? 'var(--primary-color)' : 'transparent',
            padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem',
            color: value === opt.value ? '#ffffff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: value === opt.value ? 500 : 400
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const SelectDropdown = ({ value, options, onChange }) => (
    <div style={{ position: 'relative' }}>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none', backgroundColor: 'var(--item-hover-bg)', border: 'none',
          padding: '6px 32px 6px 12px', borderRadius: '8px', fontSize: '0.9rem',
          color: 'var(--text-color)', cursor: 'pointer', outline: 'none'
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      
      <div style={{
        position: 'relative', width: '850px', height: '700px',
        backgroundColor: 'var(--dropdown-bg)', borderRadius: '16px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', color: 'var(--text-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--dropdown-border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '220px', backgroundColor: 'var(--glass-bg-hover)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--dropdown-border)' }}>
            <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <TabButton icon={<User size={18}/>} label="Account" active={activeTab === 'Account'} onClick={() => setActiveTab('Account')} />
              <TabButton icon={<Sliders size={18}/>} label="General" active={activeTab === 'General'} onClick={() => setActiveTab('General')} />
              <TabButton icon={<ImageIcon size={18}/>} label="Appearance" active={activeTab === 'Appearance'} onClick={() => setActiveTab('Appearance')} />
              <TabButton icon={<Globe size={18}/>} label="Language & Region" active={activeTab === 'Language & Region'} onClick={() => setActiveTab('Language & Region')} />
              <TabButton icon={<Info size={18}/>} label="Support" active={activeTab === 'Support'} onClick={() => setActiveTab('Support')} />
            </div>
            <div style={{ padding: '16px 12px' }}>
              <TabButton icon={<Download size={18}/>} label="Download data" onClick={handleDownload} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px 32px', backgroundColor: 'var(--dropdown-bg)' }}>
            
            {activeTab === 'Account' && (
              <div>
                <SectionTitle>ACCOUNT</SectionTitle>
                <div style={{ marginBottom: '24px' }}>
                  {!user ? (
                    <>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Sign in to sync your boards and license across devices.</p>
                      <button 
                        onClick={handleSignIn}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--dropdown-border)', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                      >
                        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />
                        Sign in with Google
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--dropdown-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4f8096', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.displayName || 'User'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</div>
                        </div>
                      </div>
                      <button onClick={handleSignOut} style={{ padding: '6px 16px', borderRadius: '6px', backgroundColor: 'var(--item-hover-bg)', color: 'var(--text-color)', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Sign out</button>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', paddingTop: '8px' }}>
                  <SectionTitle>PLAN & BILLING</SectionTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Free trial</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>7 days left</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--dropdown-border)', backgroundColor: 'var(--item-hover-bg)', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer' }}>Yearly · $9</button>
                    <button style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2f3136', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>Lifetime · $25</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'General' && (
              <div>
                <SectionTitle>BEHAVIOR</SectionTitle>
                <Row label="Open links in new tab">
                  <Toggle checked={settings.openLinksInNewTab} onChange={(v) => handleChange('openLinksInNewTab', v)} />
                </Row>
                <Row label="Hide extra bookmarks">
                  <Toggle checked={settings.hideExtraBookmarksEnabled} onChange={(v) => handleChange('hideExtraBookmarksEnabled', v)} />
                </Row>
                <Row label="Show descriptions">
                  <Toggle checked={settings.showDescriptions} onChange={(v) => handleChange('showDescriptions', v)} />
                </Row>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>LAYOUT</SectionTitle>
                <Row label="Number of columns">
                  <SelectDropdown 
                    value={settings.numberOfColumns} 
                    onChange={(v) => handleChange('numberOfColumns', v)}
                    options={[{label:'Auto', value:'Auto'},{label:'4',value:'4'},{label:'5',value:'5'},{label:'6',value:'6'},{label:'7',value:'7'},{label:'8',value:'8'}]}
                  />
                </Row>
                <div style={{ marginBottom: '16px' }}>
                  <Row label="Board width"><span style={{fontSize:'0.85rem', color:'#64748b'}}>{settings.boardWidth}px</span></Row>
                  <Slider value={settings.boardWidth} min={190} max={400} onChange={(v) => handleChange('boardWidth', v)} />
                </div>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>SIDEBAR</SectionTitle>
                <Row label="Always show all buttons">
                  <Toggle checked={settings.alwaysShowAllButtons} onChange={(v) => handleChange('alwaysShowAllButtons', v)} />
                </Row>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>QUICK SAVE</SectionTitle>
                <Row label="Shortcut">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--item-hover-bg)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shortcutLabel}</span>
                    <button onClick={handleSetShortcut} style={{ backgroundColor: 'var(--item-hover-bg)', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-color)' }}>Change</button>
                  </div>
                </Row>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div>
                <SectionTitle>BOARD</SectionTitle>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Primary color</div>
                    <input type="color" value={settings.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Board color</div>
                    <input type="color" value={settings.boardColor} onChange={(e) => handleChange('boardColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
                  </div>
                </div>
                
                <Row label="Opacity"><span style={{fontSize:'0.85rem', color:'#64748b'}}>{settings.opacity}%</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={settings.opacity} min={0} max={100} onChange={(v) => handleChange('opacity', v)} /></div>
                
                <Row label="Blur"><span style={{fontSize:'0.85rem', color:'#64748b'}}>{settings.blur}px</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={settings.blur} min={0} max={40} onChange={(v) => handleChange('blur', v)} /></div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button onClick={() => onClose()} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--dropdown-border)', backgroundColor: 'var(--item-hover-bg)', color: 'var(--text-color)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleReset} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--dropdown-border)', backgroundColor: 'var(--item-hover-bg)', color: 'var(--text-color)', cursor: 'pointer' }}>Reset</button>
                </div>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>SEARCH BAR</SectionTitle>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Search bar color</div>
                  <input type="color" value="#ffffff" onChange={()=>{}} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
                </div>
                <Row label="Opacity"><span style={{fontSize:'0.85rem', color:'#64748b'}}>60%</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={60} min={0} max={100} onChange={()=>{}} /></div>
                
                <Row label="Blur"><span style={{fontSize:'0.85rem', color:'#64748b'}}>12px</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={12} min={0} max={40} onChange={()=>{}} /></div>

                <Row label="Width"><span style={{fontSize:'0.85rem', color:'#64748b'}}>340px</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={340} min={100} max={800} onChange={()=>{}} /></div>

                <Row label="Match board style"><span style={{fontSize:'0.85rem', color:'#94a3b8'}}></span></Row>


                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>BOARD TEXT</SectionTitle>
                <Row label="Size">
                  <SegmentedControl options={[{label:'S',value:'S'},{label:'M',value:'M'},{label:'L',value:'L'}]} value={settings.textSize} onChange={(v) => handleChange('textSize', v)} />
                </Row>
                <Row label="Weight">
                  <SegmentedControl options={[{label:'Normal',value:'Normal'},{label:'Bold',value:'Bold'}]} value={settings.textWeight} onChange={(v) => handleChange('textWeight', v)} />
                </Row>

                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '16px' }} />
                <SectionTitle>ST.BULKOUTLINE</SectionTitle>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>st.outlineColor</div>
                  <input type="color" value="#ffffff" onChange={()=>{}} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
                </div>
                <Row label="Opacity"><span style={{fontSize:'0.85rem', color:'#64748b'}}>75%</span></Row>
                <div style={{ marginTop: '-12px', marginBottom: '24px' }}><Slider value={75} min={0} max={100} onChange={()=>{}} /></div>
                <Row label="Match board style"><span style={{fontSize:'0.85rem', color:'#94a3b8'}}>st.outlineRemoveAll</span></Row>

              </div>
            )}

            {activeTab === 'Language & Region' && (
              <div>
                <SectionTitle>LANGUAGE</SectionTitle>
                <SegmentedControl options={[{label:'English',value:'en'},{label:'Deutsch',value:'de'},{label:'Русский',value:'ru'}]} value="en" onChange={()=>{}} />
                
                <div style={{ borderTop: '1px solid var(--dropdown-border)', marginTop: '24px' }} />
                <SectionTitle>FORMATTING</SectionTitle>
                <div style={{ marginBottom: '24px' }}><button style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--dropdown-border)', backgroundColor: 'var(--item-hover-bg)', color: 'var(--text-color)', cursor: 'pointer' }}>Auto-detect</button></div>
                
                <Row label="Time format">
                  <SegmentedControl options={[{label:'24h',value:'24'},{label:'12h AM/PM',value:'12'}]} value="12" onChange={()=>{}} />
                </Row>
                <Row label="Date format">
                  <SegmentedControl options={[{label:'DD/MM/YY',value:'dmy'},{label:'MM/DD/YY',value:'mdy'},{label:'YY-MM-DD',value:'ymd'}]} value="mdy" onChange={()=>{}} />
                </Row>
                <Row label="Week starts on">
                  <SegmentedControl options={[{label:'Monday',value:'mon'},{label:'Sunday',value:'sun'}]} value="mon" onChange={()=>{}} />
                </Row>
                <Row label="Temperature">
                  <SegmentedControl options={[{label:'°C',value:'c'},{label:'°F',value:'f'}]} value="c" onChange={()=>{}} />
                </Row>
              </div>
            )}

            {activeTab === 'Support' && (
              <div>
                <SectionTitle>SUPPORT</SectionTitle>
                <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  If you need help or want to report an issue, please contact us at support@bashamark.com or visit our GitHub repository.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
