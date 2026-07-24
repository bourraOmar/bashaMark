export function extractColorsFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error("No image URL provided"));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        
        const data = ctx.getImageData(0, 0, 64, 64).data;
        
        // Advanced Color Palette Extraction using 3D Color Histogram (Binning)
        const bins = {};
        let maxCount = 0;
        let dominantColor = { r: 0, g: 0, b: 0 };
        
        let fallbackR = 0, fallbackG = 0, fallbackB = 0;
        let fallbackCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Skip fully transparent pixels
          if (data[i+3] < 128) continue;
          
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];

          // Average for fallback in case everything is grey/black
          fallbackR += r;
          fallbackG += g;
          fallbackB += b;
          fallbackCount++;
          
          // Calculate saturation to ignore muddy/grey colors
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          
          // Skip very dark, very light, or very desaturated (grey) colors
          if (max < 30 || min > 230 || saturation < 0.15) {
             continue;
          }

          // Bin into 32x32x32 chunks (8 values per channel)
          const rBin = Math.floor(r / 32);
          const gBin = Math.floor(g / 32);
          const bBin = Math.floor(b / 32);
          const binKey = `${rBin},${gBin},${bBin}`;
          
          if (!bins[binKey]) {
            bins[binKey] = { r: 0, g: 0, b: 0, count: 0 };
          }
          
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
          // Found a vibrant dominant color
          finalR = Math.floor(dominantColor.r / dominantColor.count);
          finalG = Math.floor(dominantColor.g / dominantColor.count);
          finalB = Math.floor(dominantColor.b / dominantColor.count);
        } else if (fallbackCount > 0) {
          // Fallback to average color if the image is entirely black/white/grey
          finalR = Math.floor(fallbackR / fallbackCount);
          finalG = Math.floor(fallbackG / fallbackCount);
          finalB = Math.floor(fallbackB / fallbackCount);
        } else {
           reject(new Error("Image is fully transparent"));
           return;
        }

        // To make primary color pop like "Vibrant.js", we boost its saturation slightly if needed
        const primaryHex = '#' + [finalR, finalG, finalB].map(x => x.toString(16).padStart(2, '0')).join('');
        
        // Darken significantly (by 75%) for the board glass background
        const darkR = Math.floor(finalR * 0.25);
        const darkG = Math.floor(finalG * 0.25);
        const darkB = Math.floor(finalB * 0.25);
        const boardHex = '#' + [darkR, darkG, darkB].map(x => x.toString(16).padStart(2, '0')).join('');
        
        resolve({ primary: primaryHex, board: boardHex });
        
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error("Could not load image (CORS)"));
    };
    
    // For Unsplash images, request a tiny thumbnail (100px) so it downloads instantly for analysis
    let fastUrl = imageUrl;
    if (fastUrl.includes('images.unsplash.com')) {
      fastUrl = fastUrl.replace(/w=\d+/, 'w=100').replace(/q=\d+/, 'q=50');
    }

    // Add a unique query param to bypass the browser's non-CORS cache
    const separator = fastUrl.includes('?') ? '&' : '?';
    img.src = fastUrl.startsWith('data:') 
      ? fastUrl 
      : fastUrl + separator + 'cors=' + Date.now();
  });
}
