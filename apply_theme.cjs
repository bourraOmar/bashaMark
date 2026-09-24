const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.jsx', 'utf8');

// Modal Backgrounds
code = code.replace(/backgroundColor: '#f1f3f5'/g, "backgroundColor: 'var(--dropdown-bg)'");
code = code.replace(/backgroundColor: '#e9ecef'/g, "backgroundColor: 'var(--glass-bg-hover)'");

// Borders
code = code.replace(/borderBottom: '1px solid #e2e8f0'/g, "borderBottom: '1px solid var(--dropdown-border)'");
code = code.replace(/borderRight: '1px solid #e2e8f0'/g, "borderRight: '1px solid var(--dropdown-border)'");
code = code.replace(/borderTop: '1px solid #e2e8f0'/g, "borderTop: '1px solid var(--dropdown-border)'");
code = code.replace(/border: '1px solid #e2e8f0'/g, "border: '1px solid var(--dropdown-border)'");

// Text Colors
code = code.replace(/color: '#334155'/g, "color: 'var(--text-color)'");
code = code.replace(/color: '#475569'/g, "color: 'var(--text-color)'");
code = code.replace(/color: '#8892a0'/g, "color: 'var(--text-muted)'");
code = code.replace(/color: '#94a3b8'/g, "color: 'var(--text-muted)'");
code = code.replace(/color: '#64748b'/g, "color: 'var(--text-muted)'");
code = code.replace(/color: '#1e293b'/g, "color: 'var(--text-color)'");

// Hovers and Accents
code = code.replace(/backgroundColor = 'rgba\\(0,0,0,0\\.05\\)'/g, "backgroundColor = 'var(--item-hover-bg)'");
code = code.replace(/backgroundColor: active \? '#4f8096' : 'transparent'/g, "backgroundColor: active ? 'var(--primary-color)' : 'transparent'");
code = code.replace(/backgroundColor: checked \? '#4f8096'/g, "backgroundColor: checked ? 'var(--primary-color)'");
code = code.replace(/accentColor: '#4f8096'/g, "accentColor: 'var(--primary-color)'");

// Segmented Controls and other borders
code = code.replace(/backgroundColor: '#e2e8f0'/g, "backgroundColor: 'var(--item-hover-bg)'");
code = code.replace(/backgroundColor: '#cbd5e1'/g, "backgroundColor: 'var(--item-hover-bg)'");
code = code.replace(/border: '1px solid #cbd5e1'/g, "border: '1px solid var(--dropdown-border)'");
code = code.replace(/background: value === opt\.value \? '#cbd5e1' : 'transparent'/g, "background: value === opt.value ? 'var(--primary-color)' : 'transparent'");
code = code.replace(/color: value === opt\.value \? '#1e293b' : '#64748b'/g, "color: value === opt.value ? '#ffffff' : 'var(--text-muted)'");

// Backdrop filter for modal container
code = code.replace(/overflow: 'hidden',/g, "overflow: 'hidden', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',");

fs.writeFileSync('src/components/SettingsModal.jsx', code);
console.log("Success");
