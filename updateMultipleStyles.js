import fs from 'fs';

let stylePicker = fs.readFileSync('src/components/StylePicker.jsx', 'utf8');
stylePicker = stylePicker.replace(
  /border: styleType === 'corner' \? '2px solid var\(--primary-color\)' : '1px solid var\(--dropdown-border\)',\n\s*background: styleType === 'corner' \? 'var\(--item-hover-bg\)' : 'transparent',/g,
  "border: (styleType || '').includes('corner') ? '2px solid var(--primary-color)' : '1px solid var(--dropdown-border)',\n                background: (styleType || '').includes('corner') ? 'var(--item-hover-bg)' : 'transparent',"
);
stylePicker = stylePicker.replace(
  /border: styleType === 'outline' \? '2px solid var\(--primary-color\)' : '1px solid var\(--dropdown-border\)',\n\s*background: styleType === 'outline' \? 'var\(--item-hover-bg\)' : 'transparent',/g,
  "border: (styleType || '').includes('outline') ? '2px solid var(--primary-color)' : '1px solid var(--dropdown-border)',\n                background: (styleType || '').includes('outline') ? 'var(--item-hover-bg)' : 'transparent',"
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
      /board\?\.styleType === 'outline'/g,
      "(board?.styleType || '').includes('outline')"
    );

    code = code.replace(
      /board\?\.styleType === 'corner'/g,
      "(board?.styleType || '').includes('corner')"
    );
    
    fs.writeFileSync(file, code);
  }
});
console.log('Done');
