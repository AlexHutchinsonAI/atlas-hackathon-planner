const {test}=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const {cleanAvatar,crc}=require('../lib/member-image.cjs'),{handlers,memberKey,label}=require('../lib/members.cjs');
function chunk(type,data){const t=Buffer.from(type),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);t.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc(Buffer.concat([t,data])),b.length-4);return b;}
function png({width=2,height=2,meta=true,pixels}={}){const h=Buffer.alloc(13);h.writeUInt32BE(width);h.writeUInt32BE(height,4);h[8]=8;h[9]=6;const raw=pixels||Buffer.alloc(height*(width*4+1));return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),...(meta?[chunk('eXIf',Buffer.from('GPS_PRIVATE_ORIGINAL')),chunk('tEXt',Buffer.from('Filename\0PRIVATE_FILE'))]:[]),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
function response(){return{headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(v){this.statusCode=v;return this;},json(v){this.value=v;return this;},send(v){this.value=v;return this;}};}
const req=(method,body,headers={})=>({method,body,headers:{'content-type':'application/json',...headers},query:{}});
test('PNG CRC matches the published standard vector',()=>assert.equal(crc(Buffer.from('123456789')),0xcbf43926));
test('avatar keeps pixel data while stripping EXIF, location text and original filenames',()=>{const source=png(),clean=cleanAvatar(source.toString('base64'));assert.deepEqual(clean,png({meta:false}));assert(!clean.includes('PRIVATE'));});
test('normalization strips hidden bytes after the compressed pixel stream',()=>{const raw=Buffer.alloc(18),original=png({meta:false}),source=Buffer.concat([original.subarray(0,33),chunk('IDAT',Buffer.concat([zlib.deflateSync(raw),Buffer.from('PRIVATE_STREAM_PAYLOAD')])),chunk('IEND',Buffer.alloc(0))]);assert.deepEqual(cleanAvatar(source.toString('base64')),original);});
test('invalid formats, oversized input, CRC corruption, trailing bytes and decompression bombs fail closed',()=>{
 const bad=png();bad[bad.length-5]^=1;
 for(const image of [Buffer.from('<svg onload="alert(1)"></svg>'),Buffer.from('<script>photo</script>'),bad,Buffer.concat([png(),Buffer.from('junk')]),png({width:257}),png({pixels:Buffer.alloc(1000000)})])assert.throws(()=>cleanAvatar(image.toString('base64')),e=>e.status===400);
 for(const b64 of ['https://attacker.example/photo','A'.repeat(500000),'a===','!!!!'])assert.throws(()=>cleanAvatar(b64),e=>e.status===400);
});
test('malformed filters and animated PNG uploads fail closed',()=>{const raw=Buffer.alloc(18);raw[0]=5;assert.throws(()=>cleanAvatar(png({pixels:raw}).toString('base64')),e=>e.status===400);const p=png({meta:false}),animated=Buffer.concat([p.subarray(0,33),chunk('acTL',Buffer.alloc(8)),p.subarray(33)]);assert.throws(()=>cleanAvatar(animated.toString('base64')),e=>e.status===400);});
test('member identifiers are scoped and do not disclose a UID or email; labels never fall back to email',()=>{
 const actor={id:'firebase:private-user',email:'private@example.com'};const a=memberKey(actor,'preview');assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,memberKey(actor,'production'));assert(!a.includes('private'));assert.equal(label(actor.email),'Workspace member');assert.equal(label('  Test Person  '),'Test Person');assert.equal(label('a'.repeat(100)).length,60);
});
test('disabled feature, missing auth and rejected account never query storage',async()=>{
 for(const [enabled,identity,status]of [[()=>false,()=>{throw Error('must not authenticate');},503],[()=>true,()=>{throw Object.assign(Error('Sign in'),{status:401});},401],[()=>true,()=>{throw Object.assign(Error('Access denied'),{status:403});},403]]){
  const h=handlers({enabled,identity,sql:()=>{throw Error('must not query');}});for(const name of ['profile','photo','presence']){const r=response();await h[name](req('GET'),r);assert.equal(r.statusCode,status);assert.equal(r.headers['Cache-Control'],'private, no-store');}
 }
});
test('unsupported methods and client-supplied identity/URL/script fields cannot write a profile',async()=>{
 let queries=0;const h=handlers({enabled:()=>true,identity:async()=>({id:'fixture'}),environment:()=> 'preview',sql:()=>async()=>{queries++;return[];}});
 for(const request of [req('POST',{}),req('PUT',{actorId:'other',png:png().toString('base64'),expectedVersion:null}),req('PUT',{url:'https://attacker.example',expectedVersion:null}),req('PUT',{png:png().toString('base64'),expectedVersion:null},{'content-type':'text/plain'})]){const r=response();await h.profile(request,r);assert([400,405,415].includes(r.statusCode));}assert.equal(queries,0);
});
test('presence rejects non-UUID sessions and client-supplied member ownership',async()=>{
 let queries=0;const h=handlers({enabled:()=>true,identity:async()=>({id:'fixture'}),environment:()=> 'preview',sql:()=>async()=>{queries++;return[];}});
 for(const b of [{sessionId:'other'},{sessionId:'00000000-0000-4000-8000-000000000001',memberId:'other'}]){const r=response();await h.presence(req('PUT',b),r);assert.equal(r.statusCode,400);}assert.equal(queries,0);
});
module.exports={png,chunk,response,req};
