/* Stored avatars are bounded, decoded PNG rasters. Metadata never reaches storage. */
const {inflateSync,deflateSync}=require('node:zlib');
const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]),MAX_BYTES=300000,MAX_SIDE=256;
const fail=message=>{throw Object.assign(new Error(message),{status:400});};
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(bytes){let n=0xffffffff;for(const b of bytes)n=table[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;}
function chunk(type,payload){const b=Buffer.alloc(payload.length+12);b.writeUInt32BE(payload.length);b.write(type,4,4,'ascii');payload.copy(b,8);b.writeUInt32BE(crc(b.subarray(4,b.length-4)),b.length-4);return b;}
function cleanAvatar(encoded){
 if(typeof encoded!=='string'||encoded.length>Math.ceil(MAX_BYTES/3)*4||!encoded.length||encoded.length%4||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))fail('Choose a valid profile photo.');
 const input=Buffer.from(encoded,'base64');if(input.toString('base64')!==encoded||input.length>MAX_BYTES||!input.subarray(0,8).equals(SIGNATURE))fail('Profile photos must be converted to PNG.');
 const chunks=[],data=[];let offset=8,width,height,channels,ended=false,count=0;
 while(offset<input.length){
  if(++count>128||offset+12>input.length)fail('The photo is not a valid PNG.');
  const length=input.readUInt32BE(offset),end=offset+12+length;if(end>input.length)fail('The photo is incomplete.');
  const type=input.toString('ascii',offset+4,offset+8),payload=input.subarray(offset+8,offset+8+length);
  if(!/^[A-Za-z]{4}$/.test(type)||crc(input.subarray(offset+4,offset+8+length))!==input.readUInt32BE(offset+8+length))fail('The photo is damaged.');
  if(count===1&&type!=='IHDR')fail('The photo is not a valid PNG.');
  if(type==='IHDR'){
   if(count!==1||length!==13)fail('The photo has an invalid header.');width=payload.readUInt32BE(0);height=payload.readUInt32BE(4);
   if(!width||!height||width>MAX_SIDE||height>MAX_SIDE||payload[8]!==8||![2,6].includes(payload[9])||payload[10]||payload[11]||payload[12])fail('Use a still photo up to 256 × 256 pixels.');
   channels=payload[9]===6?4:3;chunks.push(input.subarray(offset,end));
  }else if(type==='IDAT'){data.push(payload);chunks.push(input.subarray(offset,end));}
  else if(type==='IEND'){if(length||!data.length||end!==input.length)fail('The photo has an invalid ending.');chunks.push(input.subarray(offset,end));ended=true;}
  else if(type==='acTL'||type==='fcTL'||type==='fdAT')fail('Choose a still photo instead of an animated image.');
  else if(type[0]===type[0].toUpperCase()&&type!=='PLTE')fail('The photo has an unsupported image format.');
  // EXIF, comments, text, filenames and all other optional chunks are discarded.
  offset=end;
 }
 if(!ended)fail('The photo is incomplete.');
 const stride=width*channels+1,expected=stride*height;let pixels;
 try{pixels=inflateSync(Buffer.concat(data),{maxOutputLength:expected});}catch{fail('The photo could not be decoded.');}
 if(pixels.length!==expected)fail('The photo has invalid pixel data.');for(let y=0;y<height;y++)if(pixels[y*stride]>4)fail('The photo has invalid pixel data.');
 // Re-encode the bounded pixel stream as well, discarding hidden/trailing original bytes.
 return Buffer.concat([SIGNATURE,chunks[0],chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
module.exports={cleanAvatar,crc,MAX_BYTES,MAX_SIDE};
