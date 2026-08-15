const sharp = require('sharp');

function analyzeCanvasData(data) {
  const bins = {};
  let maxCount = 0;
  let dominantColor = { r: 0, g: 0, b: 0 };
  
  let fallbackR = 0, fallbackG = 0, fallbackB = 0;
  let fallbackCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] < 128) continue;
    
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    fallbackR += r;
    fallbackG += g;
    fallbackB += b;
    fallbackCount++;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    if (max < 30 || min > 230 || saturation < 0.15) continue;

    const rBin = Math.floor(r / 32);
    const gBin = Math.floor(g / 32);
    const bBin = Math.floor(b / 32);
    const binKey = `${rBin},${gBin},${bBin}`;
    
    if (!bins[binKey]) bins[binKey] = { r: 0, g: 0, b: 0, count: 0 };
    
    bins[binKey].r += r;
    bins[binKey].g += g;
    bins[binKey].b += b;
    bins[binKey].count++;
    
    if (bins[binKey].count > maxCount) {
      maxCount = bins[binKey].count;
      dominantColor = bins[binKey];
    }
  }
  
  let finalR, finalG, finalB;

  if (maxCount > 0) {
    finalR = Math.floor(dominantColor.r / dominantColor.count);
    finalG = Math.floor(dominantColor.g / dominantColor.count);
    finalB = Math.floor(dominantColor.b / dominantColor.count);
  } else if (fallbackCount > 0) {
    finalR = Math.floor(fallbackR / fallbackCount);
    finalG = Math.floor(fallbackG / fallbackCount);
    finalB = Math.floor(fallbackB / fallbackCount);
  } else {
     throw new Error("Media is fully transparent");
  }

  const primaryHex = '#' + [finalR, finalG, finalB].map(x => x.toString(16).padStart(2, '0')).join('');
  const boardR = Math.min(255, Math.floor(finalR * 0.8));
  const boardG = Math.min(255, Math.floor(finalG * 0.8));
  const boardB = Math.min(255, Math.floor(finalB * 0.8));
  const boardHex = '#' + [boardR, boardG, boardB].map(x => x.toString(16).padStart(2, '0')).join('');
  
  return { primary: primaryHex, board: boardHex };
}

async function extract() {
  const { data } = await sharp('public/background/bashaMark-background1.jpg')
    .resize(64, 64, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  const res = analyzeCanvasData(data);
  console.log(res);
}
extract();
