import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw Scanlines
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(rowStride * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Helper to draw rounded rectangle
function isInsideRoundedRect(x, y, rx, ry, rw, rh, rad) {
  if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false;
  const dx = Math.min(x - rx, rx + rw - 1 - x);
  const dy = Math.min(y - ry, ry + rh - 1 - y);
  if (dx < rad && dy < rad) {
    const ddx = rad - dx;
    const ddy = rad - dy;
    return ddx * ddx + ddy * ddy <= rad * rad;
  }
  return true;
}

function renderCalcxIcon(width, height, isMaskable = false) {
  return createPng(width, height, (x, y, w, h) => {
    // Coordinate normalization (0 to 1)
    const nx = x / w;
    const ny = y / h;

    // Maskable icons use a full background with safe padding
    if (isMaskable) {
      if (nx < 0.1 || nx > 0.9 || ny < 0.1 || ny > 0.9) {
        return [9, 13, 22, 255]; // Deep cosmic navy background (#090D16)
      }
    }

    // Outer Shell
    const shellMargin = isMaskable ? 0.12 : 0.04;
    const shellW = 1 - shellMargin * 2;
    const shellH = 1 - shellMargin * 2;
    const shellCorner = (shellW * w) * 0.22;

    const inOuterShell = isInsideRoundedRect(
      x, y,
      shellMargin * w, shellMargin * h,
      shellW * w, shellH * h,
      shellCorner
    );

    if (!inOuterShell) {
      return isMaskable ? [9, 13, 22, 255] : [0, 0, 0, 0];
    }

    // Shell border highlight
    const inInnerShell = isInsideRoundedRect(
      x, y,
      (shellMargin + 0.02) * w, (shellMargin + 0.02) * h,
      (shellW - 0.04) * w, (shellH - 0.04) * h,
      shellCorner * 0.9
    );

    if (!inInnerShell) {
      return [59, 130, 246, 255]; // Accent electric blue border (#3B82F6)
    }

    // Calculator Shell Body
    const inDisplay = isInsideRoundedRect(
      x, y,
      (shellMargin + 0.08) * w, (shellMargin + 0.08) * h,
      (shellW - 0.16) * w, (shellH * 0.26) * h,
      w * 0.05
    );

    if (inDisplay) {
      // Screen inside: Deep cosmic display (#090D16)
      // Small readout accent bars inside display
      if (ny >= shellMargin + 0.18 && ny <= shellMargin + 0.24) {
        if (nx >= shellMargin + 0.14 && nx <= shellMargin + 0.22) {
          return [59, 130, 246, 255]; // Cyan readout glyph
        }
        if (nx >= shellMargin + 0.26 && nx <= shellMargin + 0.38) {
          return [248, 250, 252, 230]; // Primary text readout
        }
      }
      return [9, 13, 22, 255]; // Display inset background
    }

    // Keypad Grid (Rows & Cols)
    const gridTop = shellMargin + 0.40;
    const gridBottom = shellMargin + shellH - 0.08;
    const gridLeft = shellMargin + 0.08;
    const gridRight = shellMargin + shellW - 0.08;
    const gridH = gridBottom - gridTop;
    const gridW = gridRight - gridLeft;

    const rowH = gridH / 3;
    const colW = gridW / 4;

    if (ny >= gridTop && ny <= gridBottom && nx >= gridLeft && nx <= gridRight) {
      const colIdx = Math.floor((nx - gridLeft) / colW);
      const rowIdx = Math.floor((ny - gridTop) / rowH);

      const cellLeft = gridLeft + colIdx * colW;
      const cellTop = gridTop + rowIdx * rowH;

      const keyMarginX = colW * 0.12;
      const keyMarginY = rowH * 0.14;

      const inKey = isInsideRoundedRect(
        x, y,
        (cellLeft + keyMarginX) * w, (cellTop + keyMarginY) * h,
        (colW - keyMarginX * 2) * w, (rowH - keyMarginY * 2) * h,
        w * 0.03
      );

      if (inKey) {
        // Distinct color variants matching Calcx-Pro
        if (colIdx === 3 && rowIdx === 0) return [245, 158, 11, 255]; // Amber Operator (#F59E0B)
        if (colIdx === 3 && rowIdx === 1) return [37, 99, 235, 255];  // Blue Operator (#2563EB)
        if (colIdx === 3 && rowIdx === 2) return [59, 130, 246, 255]; // Equals Primary (#3B82F6)
        if (colIdx === 2 && rowIdx === 2) return [16, 185, 129, 255]; // Emerald Action (#10B981)
        return [30, 41, 59, 255]; // Number key surface (#1E293B)
      }
    }

    // Default Calculator Shell Surface
    return [19, 27, 46, 255]; // #131B2E
  });
}

// Generate Icons
const publicIconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

console.log('Generating PWA icons in:', publicIconsDir);

const icon192 = renderCalcxIcon(192, 192, false);
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), icon192);
console.log('Generated icon-192.png (192x192)');

const icon512 = renderCalcxIcon(512, 512, false);
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), icon512);
console.log('Generated icon-512.png (512x512)');

const iconMaskable = renderCalcxIcon(512, 512, true);
fs.writeFileSync(path.join(publicIconsDir, 'icon-maskable-512.png'), iconMaskable);
console.log('Generated icon-maskable-512.png (512x512 maskable)');
