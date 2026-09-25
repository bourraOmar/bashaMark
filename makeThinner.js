import fs from 'fs';

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
      /width: '6px', height: '24px'/g,
      "width: '4px', height: '24px'"
    );
    
    fs.writeFileSync(file, code);
  }
});

let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /width: '4px', height: '12px'/g,
  "width: '3px', height: '12px'"
);
fs.writeFileSync('src/components/StylePicker.jsx', stylePicker);

console.log('Done');
