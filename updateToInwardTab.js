import fs from 'fs';

let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /position: 'absolute', left: '-2px', top: '4px', width: '3px', height: '9px', backgroundColor: styleColor \|\| 'var\(--text-muted\)', borderRadius: '3px'/g,
  "position: 'absolute', left: 0, top: '4px', width: '4px', height: '12px', backgroundColor: styleColor || 'var(--text-muted)', borderTopRightRadius: '4px', borderBottomRightRadius: '4px'"
);
fs.writeFileSync('src/components/StylePicker.jsx', stylePicker);

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
      /position: 'absolute', top: '14px', left: '-4px', width: '6px', height: '18px',\s*backgroundColor: board\.styleColor, borderRadius: '4px'/g,
      "position: 'absolute', top: '14px', left: 0, width: '6px', height: '24px',\n          backgroundColor: board.styleColor, borderTopRightRadius: '6px', borderBottomRightRadius: '6px'"
    );
    
    fs.writeFileSync(file, code);
  }
});
console.log('Done');
