import fs from 'fs';

// Update StylePicker.jsx
let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /<div style=\{\{\s*position: 'absolute',\s*left: 0,\s*top: 0,\s*width: '6px',\s*height: '12px',\s*backgroundColor: styleColor \|\| 'var\(--text-muted\)',\s*borderBottomRightRadius: '4px'\s*\}\}\s*\/>/g,
  "<div style={{ position: 'absolute', left: '-2px', top: '4px', width: '4px', height: '12px', backgroundColor: styleColor || 'var(--text-muted)', borderRadius: '4px' }} />"
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
      /position: 'absolute', top: 0, left: 0, width: '6px', height: '32px',\s*backgroundColor: board\.styleColor, borderTopLeftRadius: '12px', borderBottomRightRadius: '8px'/g,
      "position: 'absolute', top: '16px', left: '-4px', width: '8px', height: '24px',\n          backgroundColor: board.styleColor, borderRadius: '4px'"
    );
    
    fs.writeFileSync(file, code);
  }
});
console.log('Done');
