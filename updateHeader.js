import fs from 'fs';

// Update StylePicker.jsx
let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px'/g,
  "position: 'absolute', left: 0, top: 0, right: 0, height: '6px'"
);
stylePicker = stylePicker.replace(/>\s*Corner\s*<\/button>/g, ">Header</button>");
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
      /position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px',\s*backgroundColor: board\.styleColor, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'/g,
      "position: 'absolute', top: 0, left: 0, right: 0, height: '6px',\n          backgroundColor: board.styleColor, borderTopLeftRadius: '12px', borderTopRightRadius: '12px'"
    );
    
    fs.writeFileSync(file, code);
  }
});
console.log('Done');
