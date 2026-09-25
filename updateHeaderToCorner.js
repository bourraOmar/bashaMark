import fs from 'fs';

// Update StylePicker.jsx
let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /<div style=\{\{ position: 'absolute', left: 0, top: 0, right: 0, height: '6px', backgroundColor: styleColor \|\| 'var\(--text-muted\)' \}\} \/>\s*<\/div>Header<\/button>/,
  "<div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '12px', backgroundColor: styleColor || 'var(--text-muted)', borderBottomRightRadius: '4px' }} />\n              </div>\n              Corner\n            </button>"
);
fs.writeFileSync('src/components/StylePicker.jsx', stylePicker);

// Update all widgets and board
const files = [
  'src/components/Board.jsx',
  'src/components/widgets/NotesWidget.jsx',
  'src/components/widgets/CalendarWidget.jsx',
  'src/components/widgets/PomodoroWidget.jsx',
  'src/components/widgets/PrayerWidget.jsx',
  'src/components/widgets/WeatherWidget.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    code = code.replace(
      /position: 'absolute', top: 0, left: 0, right: 0, height: '6px',\s*backgroundColor: board\.styleColor, borderTopLeftRadius: '12px', borderTopRightRadius: '12px'/g,
      "position: 'absolute', top: 0, left: 0, width: '6px', height: '32px',\n          backgroundColor: board.styleColor, borderTopLeftRadius: '12px', borderBottomRightRadius: '8px'"
    );
    
    fs.writeFileSync(file, code);
  }
});
console.log('Done');
