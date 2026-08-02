import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height) {
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const cornerR = width * 0.22;
      const dx = Math.max(0, Math.abs(x - cx + 0.5) - (cx - cornerR));
      const dy = Math.max(0, Math.abs(y - cy + 0.5) - (cy - cornerR));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= cornerR) {
        const t = (x + y) / (width + height);
        let red = Math.round(134 * (1 - t) + 99 * t);
        let green = Math.round(59 * (1 - t) + 36 * t);
        let blue = Math.round(255 * (1 - t) + 212 * t);
        let alpha = 255;

        const glowDist = Math.hypot(x - width * 0.75, y - height * 0.25);
        if (glowDist < width * 0.4) {
          const glowT = Math.max(0, 1 - glowDist / (width * 0.4));
          red = Math.round(red * (1 - glowT * 0.6) + 71 * glowT * 0.6);
          green = Math.round(green * (1 - glowT * 0.6) + 191 * glowT * 0.6);
          blue = Math.round(blue * (1 - glowT * 0.6) + 255 * glowT * 0.6);
        }

        const bx = (x - cx) / (width / 32);
        const by = (y - cy) / (height / 32);
        
        const inRibbon = (bx >= -6 && bx <= 6 && by >= -9 && by <= 9) &&
          !(by > 3 && Math.abs(bx) < (9 - by) * 1.2);

        if (inRibbon) {
          red = 255;
          green = 255;
          blue = 255;
        }

        buffer[idx] = red;
        buffer[idx + 1] = green;
        buffer[idx + 2] = blue;
        buffer[idx + 3] = alpha;
      } else {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    buffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let table = global._crc32Table;
    if (!table) {
      table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
      }
      global._crc32Table = table;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

[16, 32, 48, 128].forEach(size => {
  const png = createPNG(size, size);
  fs.writeFileSync(`./public/icon${size}.png`, png);
  console.log(`Generated icon${size}.png (${png.length} bytes)`);
});
