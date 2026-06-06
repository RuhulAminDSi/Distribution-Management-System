import zlib from 'zlib';

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));
  return Buffer.concat([length, crcData, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function generateOGImage(title = 'DMS', subtitle = 'Distribution Management System') {
  const width = 1200;
  const height = 630;
  const pixels = Buffer.alloc(width * height * 4, 0);

  // Background gradient simulated (dark blue-purple)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ratio = y / height;
      pixels[i] = Math.round(25 + ratio * 20);      // R
      pixels[i + 1] = Math.round(55 + ratio * 30);   // G
      pixels[i + 2] = Math.round(109 + ratio * 40);  // B
      pixels[i + 3] = 255;                            // A
    }
  }

  // Simple centered horizontal line accent
  const lineY = Math.round(height * 0.55);
  for (let x = Math.round(width * 0.15); x < Math.round(width * 0.85); x++) {
    const i = (lineY * width + x) * 4;
    pixels[i] = 59; pixels[i + 1] = 130; pixels[i + 2] = 246; pixels[i + 3] = 255;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Convert to filter bytes (each row starts with filter byte 0)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter byte
    pixels.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}
