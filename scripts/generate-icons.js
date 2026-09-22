import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}
function createPng(width, height, getPixel) {
  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const ihd = Buffer.alloc(13);
  ihd.writeUInt32BE(width,0); ihd.writeUInt32BE(height,4); ihd[8]=8; ihd[9]=6;
  const rowStride = 1 + width*4;
  const raw = Buffer.alloc(rowStride * height);
  for (let y=0;y<height;y++) {
    const ro = y*rowStride; raw[ro]=0;
    for (let x=0;x<width;x++) {
      const [r,g,b,a] = getPixel(x,y,width,height);
      const po = ro+1+x*4; raw[po]=r; raw[po+1]=g; raw[po+2]=b; raw[po+3]=a;
    }
  }
  return Buffer.concat([sig, createChunk('IHDR',ihd), createChunk('IDAT',zlib.deflateSync(raw)), createChunk('IEND',Buffer.alloc(0))]);
}
function inRR(x,y,rx,ry,rw,rh,rad) {
  if(x<rx||x>=rx+rw||y<ry||y>=ry+rh) return false;
  const dx=Math.min(x-rx,rx+rw-1-x), dy=Math.min(y-ry,ry+rh-1-y);
  if(dx<rad&&dy<rad){const a=rad-dx,b=rad-dy;return a*a+b*b<=rad*rad;}
  return true;
}
function logoPixel(x,y,w,h,outside) {
  const nx=x/w,ny=y/h;
  if(!inRR(x,y,0,0,w,h,w*0.22)) return outside;
  if(!inRR(x,y,0.025*w,0.025*h,0.95*w,0.95*h,w*0.195)) return [59,130,246,255];
  if(inRR(x,y,0.10*w,0.10*h,0.80*w,0.28*h,w*0.055)) {
    if(nx>=0.13&&nx<=0.22&&ny>=0.20&&ny<=0.30) return [59,130,246,255];
    if(nx>=0.25&&nx<=0.40&&ny>=0.20&&ny<=0.30) return [248,250,252,230];
    return [9,13,22,255];
  }
  const gl=0.10,gt=0.44,gr=0.90,gb=0.90,cw=(gr-gl)/4,rh2=(gb-gt)/3;
  if(nx>=gl&&nx<=gr&&ny>=gt&&ny<=gb) {
    const ci=Math.min(3,Math.floor((nx-gl)/cw)),ri=Math.min(2,Math.floor((ny-gt)/rh2));
    const cl=gl+ci*cw,ct=gt+ri*rh2,kmx=cw*0.10,kmy=rh2*0.12;
    if(inRR(x,y,(cl+kmx)*w,(ct+kmy)*h,(cw-kmx*2)*w,(rh2-kmy*2)*h,w*0.030)) {
      if(ci===3&&ri===0) return [245,158,11,255];
      if(ci===3&&ri===1) return [37,99,235,255];
      if(ci===3&&ri===2) return [59,130,246,255];
      if(ci===2&&ri===2) return [16,185,129,255];
      return [30,41,59,255];
    }
  }
  return [19,27,46,255];
}
function renderIcon(width, height, isMaskable) {
  return createPng(width, height, (x,y,w,h) => {
    if (!isMaskable) {
      const p=0.04, sx=(x/w-p)/(1-p*2), sy=(y/h-p)/(1-p*2);
      if(sx<0||sx>1||sy<0||sy>1) return [0,0,0,0];
      return logoPixel(sx*w,sy*h,w,h,[0,0,0,0]);
    }
    // Maskable: logo in central 58% (21% safe padding per side > Android 16.6% min)
    const BG=[9,13,22,255], PAD=0.21, lsz=1-PAD*2;
    const lx=(x/w-PAD)/lsz, ly=(y/h-PAD)/lsz;
    if(lx<0||lx>1||ly<0||ly>1) return BG;
    return logoPixel(lx*w,ly*h,w,h,BG);
  });
}
const dir = path.resolve(__dirname,'../public/icons');
if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'icon-192.png'), renderIcon(192,192,false)); console.log('icon-192.png');
fs.writeFileSync(path.join(dir,'icon-512.png'), renderIcon(512,512,false)); console.log('icon-512.png');
fs.writeFileSync(path.join(dir,'icon-maskable-192.png'), renderIcon(192,192,true)); console.log('icon-maskable-192.png');
fs.writeFileSync(path.join(dir,'icon-maskable-512.png'), renderIcon(512,512,true)); console.log('icon-maskable-512.png');
console.log('Done. Safe zone padding: 21% per side (logo in central 58%)');
