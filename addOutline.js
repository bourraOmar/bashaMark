import fs from 'fs';

let pCode = fs.readFileSync('src/components/widgets/PrayerWidget.jsx', 'utf8');
pCode = pCode.replace(
  /minHeight: 'auto'\n\s*\};/,
  "minHeight: 'auto',\n    ...((board?.styleType || '').includes('outline') ? { border: `2px solid ${board.styleColor}`, outline: 'none' } : {})\n  };"
);
fs.writeFileSync('src/components/widgets/PrayerWidget.jsx', pCode);

let wCode = fs.readFileSync('src/components/widgets/WeatherWidget.jsx', 'utf8');
wCode = wCode.replace(
  /minHeight: 'auto'\n\s*\};/,
  "minHeight: 'auto',\n    ...((board?.styleType || '').includes('outline') ? { border: `2px solid ${board.styleColor}`, outline: 'none' } : {})\n  };"
);
fs.writeFileSync('src/components/widgets/WeatherWidget.jsx', wCode);

console.log('Done');
