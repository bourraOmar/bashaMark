function analyzeCanvasData(data) {
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
     throw new Error("Media is fully transparent");
  }

  const primaryHex = '#' + [finalR, finalG, finalB].map(x => x.toString(16).padStart(2, '0')).join('');
  
  // Retain 80% of the dominant color's brightness for vibrant, colorful glassmorphic boards instead of forcing a dark tone
  const boardR = Math.min(255, Math.floor(finalR * 0.8));
  const boardG = Math.min(255, Math.floor(finalG * 0.8));
  const boardB = Math.min(255, Math.floor(finalB * 0.8));
  const boardHex = '#' + [boardR, boardG, boardB].map(x => x.toString(16).padStart(2, '0')).join('');
  
  return { primary: primaryHex, board: boardHex };
}

export function extractColorsFromImage(mediaUrl) {
  return new Promise((resolve, reject) => {
    if (!mediaUrl) {
      reject(new Error("No media URL provided"));
      return;
    }

    const isVideo = mediaUrl.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl);

    if (isVideo) {
      const video = document.createElement('video');
      video.crossOrigin = 'Anonymous';
      video.muted = true;
      video.playsInline = true;

      const processVideoFrame = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(video, 0, 0, 64, 64);
          const data = ctx.getImageData(0, 0, 64, 64).data;
          const result = analyzeCanvasData(data);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      video.onloadeddata = () => {
        try {
          if (video.duration && video.duration > 0.1) {
            video.currentTime = Math.min(0.5, video.duration);
          } else {
            processVideoFrame();
          }
        } catch {
          processVideoFrame();
        }
      };

      video.onseeked = () => {
        processVideoFrame();
      };

      video.onerror = () => {
        reject(new Error("Could not load video for color extraction"));
      };

      video.src = mediaUrl;
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
        const result = analyzeCanvasData(data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error("Could not load image (CORS)"));
    };
    
    let fastUrl = mediaUrl;
    if (fastUrl.includes('images.unsplash.com')) {
      fastUrl = fastUrl.replace(/w=\d+/, 'w=100').replace(/q=\d+/, 'q=50');
    }

    const separator = fastUrl.includes('?') ? '&' : '?';
    img.src = fastUrl.startsWith('data:') 
      ? fastUrl 
      : fastUrl + separator + 'cors=' + Date.now();
  });
}
