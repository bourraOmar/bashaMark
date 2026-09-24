import fs from 'fs';

const files = [
  'src/components/widgets/PomodoroWidget.jsx',
  'src/components/widgets/PrayerWidget.jsx',
  'src/components/widgets/WeatherWidget.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('import StylePicker')) {
    code = code.replace(/import ConfirmModal from '\.\.\/ConfirmModal';/, "import ConfirmModal from '../ConfirmModal';\nimport StylePicker from '../StylePicker';");
  }

  code = code.replace(/    padding: '14px 14px'\n  };/, "    padding: '14px 14px',\n    ...(board?.styleType === 'outline' ? { border: `2px solid ${board.styleColor}`, outline: 'none' } : {}),\n  };");

  code = code.replace(/    <div ref=\{setNodeRef\} style=\{style\} className=\"board glass-panel\">/, "    <div ref={setNodeRef} style={style} className=\"board glass-panel\">\n      {board?.styleType === 'corner' && (\n        <div style={{\n          position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px',\n          backgroundColor: board.styleColor, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px',\n          zIndex: 0\n        }} />\n      )}");

  code = code.replace(/                <button className=\"dropdown-item danger\" onClick=\{/, "                <StylePicker \n                  styleType={board?.styleType} \n                  styleColor={board?.styleColor} \n                  onChange={(updates) => onUpdate(id, updates)} \n                />\n                <div className=\"dropdown-divider\"></div>\n                <button className=\"dropdown-item danger\" onClick={");

  fs.writeFileSync(file, code);
});
console.log('Done');
