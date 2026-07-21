export function extractColorFromImage(imageUrl) {
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
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          // Skip fully transparent pixels
          if (data[i+3] < 128) continue;
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
          resolve(hex);
        } else {
          reject(new Error("Image is fully transparent"));
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error("Could not load image (CORS)"));
    };
    img.src = imageUrl;
  });
}
