// ========================= AES CORE =========================
if(localStorage.getItem("loggedIn") !== "true") window.location.href = "../login/login.html";
const SBOX=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22];
const INV_SBOX=[82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,95,96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125];
const RCON_T=[0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36,0x6c,0xd8,0xab,0x4d,0x9a];
 
function gmul(a,b){let p=0;for(let i=0;i<8;i++){if(b&1)p^=a;const h=a&0x80;a=(a<<1)&0xff;if(h)a^=0x1b;b>>=1;}return p;}
 
function keyExp(kb){
  const Nk=kb.length/4,Nr=Nk+6,tot=(Nr+1)*4;
  const w=[];for(let i=0;i<Nk;i++)w.push([kb[i*4],kb[i*4+1],kb[i*4+2],kb[i*4+3]]);
  for(let i=Nk;i<tot;i++){
    let t=[...w[i-1]];
    if(i%Nk===0){t=[t[1],t[2],t[3],t[0]];t=t.map(b=>SBOX[b]);t[0]^=RCON_T[i/Nk-1];}
    else if(Nk>6&&i%Nk===4)t=t.map(b=>SBOX[b]);
    w.push(w[i-Nk].map((b,j)=>b^t[j]));
  }
  return{w,Nr};
}
function getRK(w,r){const k=[];for(let c=0;c<4;c++)for(let r2=0;r2<4;r2++)k.push(w[r*4+c][r2]);return k;}
function b2s(b){const s=Array.from({length:4},()=>Array(4).fill(0));for(let r=0;r<4;r++)for(let c=0;c<4;c++)s[r][c]=b[r+4*c];return s;}
function s2b(s){const b=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)b.push(s[r][c]);return b;}
function ark(s,rk){const r=b2s(rk);return s.map((row,i)=>row.map((b,j)=>b^r[i][j]));}
function sbyt(s){return s.map(r=>r.map(b=>SBOX[b]));}
function isbyt(s){return s.map(r=>r.map(b=>INV_SBOX[b]));}
function srow(s){return s.map((r,i)=>{const a=[...r];a.push(...a.splice(0,i));return a;});}
function isrow(s){return s.map((r,i)=>{const a=[...r];a.unshift(...a.splice(4-i));return a;});}
function mcol(s){return s[0].map((_,c)=>{const a=[s[0][c],s[1][c],s[2][c],s[3][c]];return[gmul(a[0],2)^gmul(a[1],3)^a[2]^a[3],a[0]^gmul(a[1],2)^gmul(a[2],3)^a[3],a[0]^a[1]^gmul(a[2],2)^gmul(a[3],3),gmul(a[0],3)^a[1]^a[2]^gmul(a[3],2)];}).reduce((acc,col,c)=>{acc.forEach((r,i)=>r[c]=col[i]);return acc;},Array.from({length:4},()=>Array(4).fill(0)));}
function imcol(s){return s[0].map((_,c)=>{const a=[s[0][c],s[1][c],s[2][c],s[3][c]];return[gmul(a[0],14)^gmul(a[1],11)^gmul(a[2],13)^gmul(a[3],9),gmul(a[0],9)^gmul(a[1],14)^gmul(a[2],11)^gmul(a[3],13),gmul(a[0],13)^gmul(a[1],9)^gmul(a[2],14)^gmul(a[3],11),gmul(a[0],11)^gmul(a[1],13)^gmul(a[2],9)^gmul(a[3],14)];}).reduce((acc,col,c)=>{acc.forEach((r,i)=>r[c]=col[i]);return acc;},Array.from({length:4},()=>Array(4).fill(0)));}
 
function aesEncBlk(blk,w,Nr){let s=b2s(blk);s=ark(s,getRK(w,0));for(let r=1;r<=Nr;r++){s=sbyt(s);s=srow(s);if(r<Nr)s=mcol(s);s=ark(s,getRK(w,r));}return s2b(s);}
function aesDecBlk(blk,w,Nr){let s=b2s(blk);s=ark(s,getRK(w,Nr));for(let r=Nr-1;r>=0;r--){s=isrow(s);s=isbyt(s);s=ark(s,getRK(w,r));if(r>0)s=imcol(s);}return s2b(s);}
 
function pkcs7P(b){const p=16-(b.length%16);return[...b,...Array(p).fill(p)];}
function pkcs7U(b){const p=b[b.length-1];if(p<1||p>16)throw new Error('Padding không hợp lệ');for(let i=1;i<=p;i++)if(b[b.length-i]!==p)throw new Error('Padding không hợp lệ');return b.slice(0,-p);}
function xor(a,b){return a.map((v,i)=>v^b[i%b.length]);}
function h2(n){return n.toString(16).padStart(2,'0').toUpperCase();}
function hx(b){return b.map(h2).join('');}
function rb(n){return Array.from(crypto.getRandomValues(new Uint8Array(n)));}
function s2b_(s){return Array.from(new TextEncoder().encode(s));}
function b2s_(b){return new TextDecoder().decode(new Uint8Array(b));}
function parseKey(s){
  s=s.trim().replace(/\s/g,'');
  if(/^[0-9a-fA-F]{32}$/.test(s)||/^[0-9a-fA-F]{48}$/.test(s)||/^[0-9a-fA-F]{64}$/.test(s))
    return s.match(/.{2}/g).map(h=>parseInt(h,16));
  if([16,24,32].includes(s.length))return[...s].map(c=>c.charCodeAt(0));
  return null;
}
function parseHexArr(s){s=s.trim().replace(/\s/g,'');if(!/^[0-9a-fA-F]*$/.test(s))return null;return(s.match(/.{2}/g)||[]).map(h=>parseInt(h,16));}
function incCtr(c){const r=[...c];for(let i=r.length-1;i>=0;i--){if(++r[i]<=0xff)break;r[i]=0;}return r;}
 
// ========================= MODES =========================
function ecbEnc(pt,key){const{w,Nr}=keyExp(key);const p=pkcs7P(pt);const ct=[];for(let i=0;i<p.length;i+=16)ct.push(...aesEncBlk(p.slice(i,i+16),w,Nr));return ct;}
function ecbDec(ct,key){const{w,Nr}=keyExp(key);const pt=[];for(let i=0;i<ct.length;i+=16)pt.push(...aesDecBlk(ct.slice(i,i+16),w,Nr));return pkcs7U(pt);}
 
function cbcEnc(pt,key,iv){const{w,Nr}=keyExp(key);const p=pkcs7P(pt);const ct=[];let prev=iv;for(let i=0;i<p.length;i+=16){const e=aesEncBlk(xor(p.slice(i,i+16),prev),w,Nr);ct.push(...e);prev=e;}return ct;}
function cbcDec(ct,key,iv){const{w,Nr}=keyExp(key);const pt=[];let prev=iv;for(let i=0;i<ct.length;i+=16){const blk=ct.slice(i,i+16);pt.push(...xor(aesDecBlk(blk,w,Nr),prev));prev=blk;}return pkcs7U(pt);}
 
function cfbEnc(pt,key,iv){const{w,Nr}=keyExp(key);const ct=[];let fb=iv;for(let i=0;i<pt.length;i+=16){const e=aesEncBlk(fb,w,Nr);const blk=pt.slice(i,i+16);const cb=blk.map((b,j)=>b^e[j]);ct.push(...cb);fb=[...cb,...Array(16-cb.length).fill(0)].slice(0,16);}return ct;}
function cfbDec(ct,key,iv){const{w,Nr}=keyExp(key);const pt=[];let fb=iv;for(let i=0;i<ct.length;i+=16){const e=aesEncBlk(fb,w,Nr);const blk=ct.slice(i,i+16);pt.push(...blk.map((b,j)=>b^e[j]));fb=[...blk,...Array(16-blk.length).fill(0)].slice(0,16);}return pt;}
 
function ofbEnc(pt,key,iv){const{w,Nr}=keyExp(key);const ct=[];let ks=iv;for(let i=0;i<pt.length;i+=16){ks=aesEncBlk(ks,w,Nr);ct.push(...pt.slice(i,i+16).map((b,j)=>b^ks[j]));}return ct;}
function ofbDec(ct,key,iv){return ofbEnc(ct,key,iv);}
 
function ctrEnc(pt,key,nonce){const{w,Nr}=keyExp(key);const ct=[];let c=nonce;for(let i=0;i<pt.length;i+=16){const ks=aesEncBlk(c,w,Nr);ct.push(...pt.slice(i,i+16).map((b,j)=>b^ks[j]));c=incCtr(c);}return ct;}
function ctrDec(ct,key,nonce){return ctrEnc(ct,key,nonce);}
 
// GCM — GHASH in GF(2^128)
function gfMul(X,Y){
  const R=[0xe1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  let Z=Array(16).fill(0),V=[...Y];
  for(let i=0;i<128;i++){
    const xb=(X[Math.floor(i/8)]>>(7-i%8))&1;
    if(xb)Z=Z.map((b,j)=>b^V[j]);
    const lsb=V[15]&1;
    for(let j=15;j>0;j--)V[j]=(V[j]>>1)|((V[j-1]&1)<<7);
    V[0]>>=1;if(lsb)V=V.map((b,j)=>b^R[j]);
  }return Z;
}
function ghash(H,data){
  const pad=arr=>{const p=[...arr];while(p.length%16)p.push(0);return p;};
  let X=Array(16).fill(0);
  const d=pad(data);
  for(let i=0;i<d.length;i+=16)X=gfMul(X.map((b,j)=>b^d[i+j]),H);
  return X;
}
function gcmEnc(pt,key,nonce12,aad){
  const{w,Nr}=keyExp(key);
  const H=aesEncBlk(Array(16).fill(0),w,Nr);
  const J0=[...nonce12,0,0,0,1];
  const EJ0=aesEncBlk(J0,w,Nr);
  const ct=[];let c=incCtr(J0);
  for(let i=0;i<pt.length;i+=16){const ks=aesEncBlk(c,w,Nr);ct.push(...pt.slice(i,i+16).map((b,j)=>b^ks[j]));c=incCtr(c);}
  const pad=a=>{const p=[...a];while(p.length%16)p.push(0);return p;};
  const lenA=aad.length,lenC=ct.length;
  const ghIn=[...pad(aad),...pad(ct),0,0,0,0,(lenA*8>>>24)&0xff,(lenA*8>>>16)&0xff,(lenA*8>>>8)&0xff,(lenA*8)&0xff,0,0,0,0,(lenC*8>>>24)&0xff,(lenC*8>>>16)&0xff,(lenC*8>>>8)&0xff,(lenC*8)&0xff];
  const S=ghash(H,ghIn);
  const tag=EJ0.map((b,i)=>b^S[i]);
  return{ct,tag};
}
function gcmDec(ct,key,nonce12,aad,tag){
  const{w,Nr}=keyExp(key);
  const H=aesEncBlk(Array(16).fill(0),w,Nr);
  const J0=[...nonce12,0,0,0,1];
  const EJ0=aesEncBlk(J0,w,Nr);
  const pad=a=>{const p=[...a];while(p.length%16)p.push(0);return p;};
  const lenA=aad.length,lenC=ct.length;
  const ghIn=[...pad(aad),...pad(ct),0,0,0,0,(lenA*8>>>24)&0xff,(lenA*8>>>16)&0xff,(lenA*8>>>8)&0xff,(lenA*8)&0xff,0,0,0,0,(lenC*8>>>24)&0xff,(lenC*8>>>16)&0xff,(lenC*8>>>8)&0xff,(lenC*8)&0xff];
  const S=ghash(H,ghIn);
  const compTag=EJ0.map((b,i)=>b^S[i]);
  if(!tag.every((b,i)=>b===compTag[i]))throw new Error('GCM Auth Tag không hợp lệ — dữ liệu bị thay đổi hoặc khóa sai!');
  const pt=[];let c=incCtr(J0);
  for(let i=0;i<ct.length;i+=16){const ks=aesEncBlk(c,w,Nr);pt.push(...ct.slice(i,i+16).map((b,j)=>b^ks[j]));c=incCtr(c);}
  return pt;
}
 
// ========================= UI =========================
let CUR_MODE='CBC';
let LAST={ct:null,iv:null,nonce:null,tag:null,aad:null};
 
const MDESC={
  ECB:{c:'var(--red)',i:'⚠️',t:'ECB — Electronic Codebook',b:'Mỗi block 16-byte mã hóa <b>hoàn toàn độc lập</b>. P₁=P₂ ⟹ C₁=C₂. Lộ mẫu. Không IV.',w:'KHÔNG BAO GIỜ dùng ECB cho dữ liệu nhiều block.',iv:false,nonce:false,aad:false,tag:false},
  CBC:{c:'var(--amber)',i:'⚡',t:'CBC — Cipher Block Chaining',b:'XOR plaintext với ciphertext block trước (block đầu XOR IV). Mã hóa tuần tự, giải mã song song.',w:'IV ngẫu nhiên mỗi lần. Cần HMAC để ngăn Padding Oracle.',iv:true,nonce:false,aad:false,tag:false},
  CFB:{c:'var(--pink)',i:'🌊',t:'CFB — Cipher Feedback',b:'Stream cipher: mã hóa feedback (IV hoặc CT trước) rồi XOR plaintext. Không cần padding.',w:'Không có xác thực toàn vẹn. Dùng kèm HMAC.',iv:true,nonce:false,aad:false,tag:false},
  OFB:{c:'var(--cyan)',i:'🔄',t:'OFB — Output Feedback',b:'Keystream sinh độc lập với plaintext/ciphertext. Lỗi 1 bit CT → lỗi 1 bit PT, không lan sang block khác.',w:'Tái sử dụng IV với cùng key = two-time-pad attack!',iv:true,nonce:false,aad:false,tag:false},
  CTR:{c:'var(--blue)',i:'🔢',t:'CTR — Counter Mode',b:'Mã hóa bộ đếm (Nonce‖Counter) tạo keystream. Song song hoàn toàn. Random access. Không cần padding.',w:'Nonce KHÔNG được tái sử dụng với cùng khóa.',iv:false,nonce:true,aad:false,tag:false},
  GCM:{c:'var(--green)',i:'✅',t:'GCM — Galois/Counter Mode (Khuyến nghị)',b:'AEAD: CTR mode + GHASH 128-bit authentication. Phát hiện mọi thay đổi 1 bit. Dùng trong TLS 1.3, SSH.',w:'Nonce 96-bit KHÔNG được tái sử dụng — nonce reuse phá vỡ hoàn toàn bảo mật!',iv:false,nonce:true,aad:true,tag:true}
};
const FLOWS={
  ECB:'<div class="flow-box fb-plain">Pᵢ<div class="fb-note">16B block</div></div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">Cᵢ</div>',
  CBC:'<div class="flow-box fb-iv">IV/Cᵢ₋₁</div><div class="flow-arrow">⊕</div><div class="flow-box fb-plain">Pᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">Cᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-xor">IV cho Pᵢ₊₁</div>',
  CFB:'<div class="flow-box fb-iv">IV/Cᵢ₋₁</div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">⊕</div><div class="flow-box fb-plain">Pᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">Cᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-xor">Feedback</div>',
  OFB:'<div class="flow-box fb-iv">Oᵢ₋₁</div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">→</div><div class="flow-box fb-xor">Oᵢ (KS)</div><div class="flow-arrow">⊕</div><div class="flow-box fb-plain">Pᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">Cᵢ</div>',
  CTR:'<div class="flow-box fb-iv">Nonce‖Ctr</div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">⊕</div><div class="flow-box fb-plain">Pᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">Cᵢ</div><div class="flow-arrow">+</div><div class="flow-box fb-xor">Ctr++</div>',
  GCM:'<div class="flow-box fb-iv">Nonce‖Ctr</div><div class="flow-arrow">→</div><div class="flow-box fb-add">AES(K)</div><div class="flow-arrow">⊕</div><div class="flow-box fb-plain">Pᵢ</div><div class="flow-arrow">→</div><div class="flow-box fb-cipher">CT</div><div class="flow-arrow">+</div><div class="flow-box fb-sub">GHASH(AAD,CT)</div><div class="flow-arrow">→</div><div class="flow-box fb-mix">Auth Tag</div>'
};
 
function selectMode(mode,btn){
  CUR_MODE=mode;
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateModeUI();
}
function updateModeUI(){
  const m=MDESC[CUR_MODE];
  document.getElementById('mode-desc-box').innerHTML=`<div class="mode-detail" style="border-left:3px solid ${m.c}"><div class="mode-detail-title" style="color:${m.c}">${m.i} ${m.t}</div><div class="mode-detail-body">${m.b}</div><div class="info info-amber" style="margin-top:8px;font-size:11px">⚠️ ${m.w}</div></div>`;
  let p='';
  if(m.iv)p+=`<div><label class="lbl">IV (128-bit / 32 hex)</label><input type="text" id="iv-val" value="${hx(rb(16))}" placeholder="32 hex"/></div>`;
  if(m.nonce)p+=`<div><label class="lbl">Nonce (96-bit / 24 hex)</label><input type="text" id="nonce-val" value="${hx(rb(12))}" placeholder="24 hex"/></div>`;
  if(!m.iv&&!m.nonce)p+='<div style="padding:8px 0;font-size:12px;color:var(--text3)">Chế độ này không cần IV/Nonce</div>';
  document.getElementById('extra-params').innerHTML=p;
  document.getElementById('gcm-aad-row').style.display=m.aad?'block':'none';
  document.getElementById('gcm-tag-row').style.display=m.tag?'block':'none';
  document.getElementById('flow-mode-label').textContent=CUR_MODE;
  document.getElementById('flow-diagram').innerHTML=FLOWS[CUR_MODE];
}
 
function getParam(id,len){const el=document.getElementById(id);if(!el)return null;return parseHexArr(el.value);}
 
function doEncrypt(){
  try{
    const pt=s2b_(document.getElementById('pt').value);
    const key=parseKey(document.getElementById('k').value);
    if(!key)return setStatus('❌ Khóa không hợp lệ','err');
    let ct,iv=null,nonce=null,tag=null,aad=null;
    if(CUR_MODE==='ECB'){ct=ecbEnc(pt,key);}
    else if(CUR_MODE==='CBC'){iv=getParam('iv-val',16);if(!iv||iv.length!==16)return setStatus('❌ IV phải 32 hex','err');ct=cbcEnc(pt,key,iv);}
    else if(CUR_MODE==='CFB'){iv=getParam('iv-val',16);if(!iv||iv.length!==16)return setStatus('❌ IV phải 32 hex','err');ct=cfbEnc(pt,key,iv);}
    else if(CUR_MODE==='OFB'){iv=getParam('iv-val',16);if(!iv||iv.length!==16)return setStatus('❌ IV phải 32 hex','err');ct=ofbEnc(pt,key,iv);}
    else if(CUR_MODE==='CTR'){nonce=getParam('nonce-val',12);if(!nonce||nonce.length!==12)return setStatus('❌ Nonce phải 24 hex','err');const full=[...nonce,0,0,0,0];ct=ctrEnc(pt,key,full);nonce=full;}
    else if(CUR_MODE==='GCM'){
      const n=getParam('nonce-val',12);if(!n||n.length!==12)return setStatus('❌ Nonce phải 24 hex','err');
      aad=s2b_(document.getElementById('gcm-aad').value||'');
      const r=gcmEnc(pt,key,n,aad);ct=r.ct;tag=r.tag;nonce=n;
      document.getElementById('res-tag').textContent=hx(tag);
    }
    LAST={ct,iv,nonce,tag,aad};
    document.getElementById('res-ct').textContent=hx(ct);
    document.getElementById('res-pt').textContent='— (nhấn Giải mã)';
    document.getElementById('res-meta').innerHTML=
      `Mode:<b style="color:var(--text)"> ${CUR_MODE}</b> &nbsp;|&nbsp; Key:<b style="color:var(--amber)"> ${hx(key)}</b> &nbsp;|&nbsp; Blocks:<b style="color:var(--text)"> ${Math.ceil(ct.length/16)}</b>`+
      (iv?` &nbsp;|&nbsp; IV:<b style="color:var(--purple)"> ${hx(iv)}</b>`:'')+
      (nonce&&!iv?` &nbsp;|&nbsp; Nonce:<b style="color:var(--purple)"> ${hx(nonce)}</b>`:'');
    renderGrid('vis-pt',Array.from(pt),'hl');
    renderGrid('vis-ct',ct,'ct');
    setStatus('✓ Mã hóa thành công','ok');
  }catch(e){setStatus('❌ '+e.message,'err');}
}
 
function doDecrypt(){
  try{
    if(!LAST.ct)return setStatus('⚠️ Hãy mã hóa trước','warn');
    const key=parseKey(document.getElementById('k').value);
    if(!key)return setStatus('❌ Khóa không hợp lệ','err');
    let pt;
    if(CUR_MODE==='ECB')pt=ecbDec(LAST.ct,key);
    else if(CUR_MODE==='CBC')pt=cbcDec(LAST.ct,key,LAST.iv);
    else if(CUR_MODE==='CFB')pt=cfbDec(LAST.ct,key,LAST.iv);
    else if(CUR_MODE==='OFB')pt=ofbDec(LAST.ct,key,LAST.iv);
    else if(CUR_MODE==='CTR')pt=ctrDec(LAST.ct,key,LAST.nonce);
    else if(CUR_MODE==='GCM'){pt=gcmDec(LAST.ct,key,LAST.nonce,LAST.aad,LAST.tag);}
    document.getElementById('res-pt').innerHTML=`<span style="color:var(--green)">${b2s_(pt)}</span>`;
    setStatus(CUR_MODE==='GCM'?'✅ GCM Tag hợp lệ — Giải mã thành công':'✓ Giải mã thành công','ok');
  }catch(e){setStatus('❌ '+e.message,'err');}
}
 
function setStatus(m,t){document.getElementById('res-status').innerHTML=`<span class="status ${t}">${m}</span>`;}
function renderGrid(id,bytes,cls){const el=document.getElementById(id);if(!el)return;el.innerHTML=bytes.slice(0,16).map(b=>`<div class="hex-cell ${cls}">${h2(b)}</div>`).join('');}
function genKey(){const b=parseInt(document.getElementById('keylen').value)||256;document.getElementById('k').value=hx(rb(b/8));}
function genIV(){const m=MDESC[CUR_MODE];if(m.iv){const el=document.getElementById('iv-val');if(el)el.value=hx(rb(16));}if(m.nonce){const el=document.getElementById('nonce-val');if(el)el.value=hx(rb(12));}}
function loadNIST(){
  document.getElementById('k').value='603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4';
  document.getElementById('keylen').value='256';
  document.getElementById('pt').value='6bc1bee22e409f96e93d7e117393172a';
  selectMode('CBC',document.getElementById('mb-CBC'));
  setTimeout(()=>{const e=document.getElementById('iv-val');if(e)e.value='000102030405060708090a0b0c0d0e0f';},50);
}
function clearAll(){['pt','res-ct','res-pt','res-meta','res-status','vis-pt','vis-ct'].forEach(id=>{const e=document.getElementById(id);if(e){if(e.tagName==='TEXTAREA'||e.tagName==='INPUT')e.value='';else e.textContent='—';}});LAST={ct:null,iv:null,nonce:null,tag:null,aad:null};}
 
// ========================= TABS =========================
function switchTab(id){
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',['enc','modes','rounds','keyexp','sbox'][i]===id));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('t-'+id).classList.add('active');
}
 
// ========================= ROUNDS =========================
let cR=1,cS=0;
const sCls=['xored','sboxed','shifted','mixed'];
const sInf=[
  '<b>AddRoundKey:</b> XOR từng byte state với byte round key tương ứng. Phép XOR tự nghịch đảo — dùng cho cả mã hóa và giải mã.',
  '<b>SubBytes / InvSubBytes:</b> Mã hóa: S-Box[byte]. Giải mã: InvSBox[byte]. Tạo tính phi tuyến (confusion) — loại bỏ cấu trúc tuyến tính.',
  '<b>ShiftRows / InvShiftRows:</b> Mã hóa: dịch TRÁI hàng i đi i byte. Giải mã: dịch PHẢI. Khuếch tán dữ liệu giữa các cột (diffusion).',
  '<b>MixColumns / InvMixColumns:</b> Nhân cột với ma trận trong GF(2⁸). Mỗi byte đầu ra phụ thuộc cả 4 byte cột. <b style="color:var(--amber)">Bỏ qua vòng cuối.</b>'
];
function buildPills(){
  const c=document.getElementById('rnd-pills');c.innerHTML='';
  for(let i=0;i<=10;i++){const b=document.createElement('button');b.className='pill'+(i===1?' active':'');b.textContent='R'+i;b.onclick=(()=>{const r=i;return()=>{cR=r;document.querySelectorAll('#rnd-pills .pill').forEach(p=>p.classList.remove('active'));b.classList.add('active');updRound();}})();c.appendChild(b);}
}
function selectStep(s,el){cS=s;document.querySelectorAll('.step-pill').forEach(p=>p.classList.remove('active'));el.classList.add('active');updRound();}
function updRound(){
  const seed=cR*100+cS*17;
  const bytes=Array.from({length:16},(_,i)=>((seed*13+i*37+i*i*7)^(cR<<3))&0xff);
  document.getElementById('state-vis').innerHTML=bytes.map(b=>`<div class="sc ${sCls[cS]}">${h2(b)}</div>`).join('');
  document.getElementById('step-info').innerHTML=sInf[cS]+(cR===10&&cS===3?' <em style="color:var(--amber)"> — MixColumns bị bỏ qua ở vòng 10!</em>':'');
  document.getElementById('prog-bar').style.width=Math.min(((cR*4+cS+1)/44)*100,100)+'%';
}
 
// ========================= KEY EXP =========================
function doKeyExp(){
  const s=document.getElementById('kexp-in').value.trim();
  const lenSel=parseInt(document.getElementById('kexp-len').value);
  const rawKey=parseKey(s);
  const out=document.getElementById('kexp-out');
  if(!rawKey){out.innerHTML='<span style="color:var(--red)">Khóa không hợp lệ</span>';return;}
  const tLen=lenSel/8;const k=rawKey.length>=tLen?rawKey.slice(0,tLen):[...rawKey,...Array(tLen-rawKey.length).fill(0)];
  const{w,Nr}=keyExp(k);
  let html='';
  for(let rk=0;rk<=Nr;rk++){
    html+=`<div class="rk-header">Round Key ${rk}${rk===0?' (khóa gốc)':''} = W[${rk*4}..${rk*4+3}]</div>`;
    html+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:3px;align-items:center">';
    for(let c=0;c<4;c++){
      const wi=rk*4+c;const hex=w[wi].map(b=>h2(b)).join('');
      const cls=rk===0?'base':(c===0?'new':'rk');
      html+=`<span style="font-size:10px;color:var(--text3);font-family:var(--mono)">W${wi}</span><span class="kw ${cls}">${hex}</span>`;
      if(c<3)html+=`<span style="color:var(--text3)">⊕</span>`;
    }
    html+='</div>';
  }
  out.innerHTML=html;
}
 
// ========================= SBOX =========================
function buildSBTable(tid,box){
  const tbl=document.getElementById(tid);let html='<thead><tr><th></th>';
  for(let c=0;c<16;c++)html+=`<th>${c.toString(16).toUpperCase()}</th>`;
  html+='</tr></thead><tbody>';
  for(let r=0;r<16;r++){html+=`<tr><td class="row-h">${r.toString(16).toUpperCase()}</td>`;for(let c=0;c<16;c++){const idx=r*16+c;html+=`<td id="${tid}-${idx}" onclick="clickSB(${idx})">${h2(box[idx])}</td>`;}html+='</tr>';}
  html+='</tbody>';tbl.innerHTML=html;
}
function showSBoxTab(dir,btn){
  document.querySelectorAll('#t-sbox .pill').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  document.getElementById('sbox-tbl-wrap').style.display=dir==='fwd'?'block':'none';
  document.getElementById('inv-sbox-tbl-wrap').style.display=dir==='inv'?'block':'none';
  lookupSBox();
}
function lookupSBox(){
  const v=parseInt(document.getElementById('sbox-in').value.trim(),16);
  if(isNaN(v)||v<0||v>255){document.getElementById('sbox-res').textContent='??';document.getElementById('inv-sbox-res').textContent='??';return;}
  const out=SBOX[v],inv=INV_SBOX[v];
  document.getElementById('sbox-res').textContent=h2(out);
  document.getElementById('inv-sbox-res').textContent=h2(inv);
  const r=(v>>4)&0xf,c=v&0xf;
  document.getElementById('sbox-explain').innerHTML=`Byte: <b style="color:var(--blue)">${h2(v)}</b> (${v})<br>Hàng: <b style="color:var(--amber)">${r.toString(16).toUpperCase()}</b> Cột: <b style="color:var(--amber)">${c.toString(16).toUpperCase()}</b><br>SBox[${h2(v)}] = <b style="color:var(--green)">${h2(out)}</b><br>InvSBox[${h2(v)}] = <b style="color:var(--purple)">${h2(inv)}</b><br><small style="color:var(--text3)">SBox[InvSBox[${h2(v)}]] = ${h2(SBOX[inv])} ✓</small>`;
  document.querySelectorAll('[id^="sbox-tbl-"],[id^="inv-sbox-tbl-"]').forEach(td=>td.classList.remove('sel'));
  const s1=document.getElementById('sbox-tbl-'+v),s2=document.getElementById('inv-sbox-tbl-'+v);
  if(s1)s1.classList.add('sel');if(s2)s2.classList.add('sel');
}
function clickSB(idx){document.getElementById('sbox-in').value=h2(idx).toUpperCase();lookupSBox();}
 
// INIT
updateModeUI();buildPills();updRound();buildSBTable('sbox-tbl',SBOX);buildSBTable('inv-sbox-tbl',INV_SBOX);lookupSBox();doKeyExp();

function logout() {
  if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    window.location.href = '../login/login.html';
  }
}