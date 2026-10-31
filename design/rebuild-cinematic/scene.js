import * as T from '../rebuild-scroll/vendor/three.module.js';

window.__mountFilm=function mountFilm(root){
const events=new AbortController(),listen={signal:events.signal},A='/film/assets/',FONT='"Pretendard Variable", Pretendard, sans-serif';
let disposed=false,sizeWatch=null;
root.classList.add('film-on');
const story=root.querySelector('#story'),stage=root.querySelector('#stage'),sticky=root.querySelector('.sticky');
const film=JSON.parse(story.dataset.film);
const copies=[...root.querySelectorAll('.copy')].map(el=>({el,from:+el.dataset.from,to:+el.dataset.to}));
const dots=[...root.querySelectorAll('[data-go]')],rail=root.querySelector('.rail'),cue=root.querySelector('.cue'),delivery=root.querySelector('.delivery'),skipFilm=root.querySelector('.skip-film');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=T.MathUtils.lerp;
const ease=v=>{v=clamp(v);return v*v*v*(v*(v*6-15)+10)};
const range=(x,a,b)=>ease((x-a)/(b-a));
const SCREENS=15,STOPS=[0,5.9,9,11.75,14.5],HIT=11.55;
const PAPER=[3,4.24],INK=[.72,1.66],BG='#05070c',RED='#a53a2e';
const mobile=matchMedia('(max-width:760px)').matches;
const forced=new URLSearchParams(location.search).get('q');
const weak=forced==='low'||(forced!=='high'&&((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4));
const quality={tier:weak?'low':mobile?'mid':'high',sheets:weak?2400:mobile?4200:13000,dpr:weak?1:Math.min(devicePixelRatio,1.5),samples:weak?0:mobile?2:4,dof:weak||mobile?0:1,shadow:weak||mobile?1024:2048,steps:0};

let reduced=media.matches,width=1280,height=720,aspect=1.7,target=0,Q=0,time=0,stormTime=0,wind=0,previous=performance.now(),frameId=0,running=false;
let impact=-1,marksKey='',slow=0,frames=0;
let renderer,scene,camera,composer,storm,paper,paperMat,overlayMat,stampInk,strips=[],card,cardMat,stamp,key,fill,cone,scan,scanGlow,dust,burst,slab,marksCanvas,marksTexture;
const shared={uTime:{value:0},uFlutter:{value:1},uRipple:{value:new T.Vector4(0,0,0,0)}};
const curve={},rig={look:new T.Vector3(),pos:new T.Vector3(),up:new T.Vector3()};

const label=(c,text,x,y,size,color='#26302c',weight=500)=>{c.fillStyle=color;c.font=`${weight} ${size}px ${FONT}`;c.fillText(text,x,y)};
const rule=(c,x,y,w,color='#cbc9be',h=4)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
const bars=(c,x,y,w,h,color,seed)=>{c.fillStyle=color;let cx=x,i=seed;while(cx<x+w){const n=(Math.sin(i*12.9898)*43758.5453)%1,len=Math.abs(n)*w*.11+w*.035;c.fillRect(cx,y,Math.min(len,x+w-cx),h);cx+=len+h*.72;i++}};
function canvasTexture(canvas){const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
function canvas2d(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function grainy(c,w,h){for(let i=0;i<w*h/60;i++){c.fillStyle=i%2?'#5b4b380d':'#ffffff26';c.fillRect((i*79.17)%w,(i*101.31)%h,1.5,1.5)}}

// ---- Paper material: shared bend, flutter and stamp shock in the vertex stage. ----
const PAPER_GLSL=`
uniform float uTime,uFlutter,uCurl,uSeed;uniform vec4 uRipple;uniform vec2 uShift;
float paperH(vec2 q){
  vec2 p=q+uShift;
  float h=(sin(p.x*1.25+uTime*2.2+uSeed)*.2+sin(p.y*.9-uTime*1.6+p.x*.7)*.26+sin(p.x*2.6-p.y*1.8+uTime*3.1)*.05)*uFlutter;
  h+=(pow(abs(p.x)/1.5,5.)*.05+pow(abs(p.y)/2.12,6.)*.04)*(1.-uCurl);
  float d=length(p-uRipple.xy);h+=uRipple.z*exp(-d*.9)*sin(d*6.5-uRipple.w);
  h+=uCurl*(q.x+1.3)*(q.x+1.3)*.16;
  return h;
}`;
function paperMaterial(options={},extra={}){
  const m=new T.MeshStandardMaterial({side:T.DoubleSide,roughness:.88,envMapIntensity:.12,...options});
  m.userData.u={uCurl:{value:0},uSeed:{value:extra.seed||0},uStrike:{value:0},uWrite:{value:0},tReveal:{value:extra.reveal||null},uShift:{value:new T.Vector2(...(extra.shift||[0,0]))}};
  m.onBeforeCompile=s=>{
    Object.assign(s.uniforms,shared,m.userData.u);
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+PAPER_GLSL)
      .replace('#include <beginnormal_vertex>','float E=.03,H0=paperH(position.xz);vec3 objectNormal=normalize(vec3(H0-paperH(position.xz+vec2(E,0.)),E,H0-paperH(position.xz+vec2(0.,E))));')
      .replace('#include <begin_vertex>','vec3 transformed=position;transformed.y+=H0;');
    if(extra.write){
      const BLANK='vec3(.863,.847,.791)',page=extra.write==='page';
      s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
        uniform float uStrike,uWrite;${page?'uniform sampler2D tReveal;':''}float gWrite=1.;`)
        .replace('#include <map_fragment>',`#include <map_fragment>
        float rv=${page?'texture2D(tReveal,vMapUv).r':'1.'};float d=${page?'uWrite*1.02+.01-rv':'uWrite*1.06-vMapUv.x'};
        gWrite=smoothstep(0.,${page?'.004':'.01'},d);
        float wet=(1.-smoothstep(0.,${page?'.03':'.16'},d))*gWrite*(1.-dot(diffuseColor.rgb,vec3(.33)))*smoothstep(0.,.012,rv);
        diffuseColor.rgb=mix(max(diffuseColor.rgb,${BLANK}),diffuseColor.rgb,gWrite);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.46,.04,.022),wet);
        ${page?'':`float band=smoothstep(.17,.11,abs(vMapUv.y-.5+sin(vMapUv.x*19.)*.03))*step(vMapUv.x,uStrike);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.42,.035,.022),band);`}`)
        .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        totalEmissiveRadiance=mix(max(totalEmissiveRadiance,${BLANK}*emissive),totalEmissiveRadiance,gWrite);`);
    }
  };
  m.customProgramCacheKey=()=>'paper-'+(extra.write||'plain');
  return m;
}
function paperGeometry(w,h,a=30,b=42){const g=new T.PlaneGeometry(w,h,a,b);g.rotateX(-Math.PI/2);return g}
function loadTexture(path,repeat=1,srgb=false){
  const t=new T.TextureLoader().load(path,()=>{running&&frame()});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=renderer.capabilities.getMaxAnisotropy();if(srgb)t.colorSpace=T.SRGBColorSpace;return t;
}

// ---- Issue 12 page. The body is unreadable grey; only the real title and excerpt are set. ----
const PAGE_ROWS=[
  [film.issue,1778,204,46,'#9c9a8f',400],
  [film.titleLines[0],160,470,150,'#161c20',700],[film.titleLines[1],160,650,150,'#161c20',700],
  [film.date+'    /    AI BRIEFING',164,760,44,'#7a7e74',500],
  ['확인한 사실',164,930,46,RED,650],
  [film.excerptLines[0],164,1030,70,'#232b28',590],[film.excerptLines[1],164,1130,70,'#232b28',590],[film.excerptLines[2],164,1230,70,'#232b28',590],
  [film.proof,164,1312,40,'#737d6f',500],
];
const RULES=[[164,258,'#c6c7bc'],[164,830,'#bfc4b9']];
const ROWS_END=.76;
function paintPage(c){
  c.fillStyle='#efede6';c.fillRect(0,0,2048,2896);grainy(c,2048,2896);
  label(c,'L–PROOF',164,204,62,'#2b302c',720);
  for(const [x,y,color] of RULES)rule(c,x,y,1720,color);
  for(const [text,x,y,size,color,weight] of PAGE_ROWS)label(c,text,x,y,size,color,weight);
}
// Each pixel holds when that ink appears: 0 is printed stationery, higher values are written later.
function paintReveal(c,measure){
  const k=.25,total=PAGE_ROWS.reduce((n,[text])=>n+text.length,0)+6;let used=0;
  c.fillStyle='#000';c.fillRect(0,0,512,724);
  const span=(x,y,w,h,weight)=>{
    const a=used/total*ROWS_END;used+=weight;const b=used/total*ROWS_END;
    const g=c.createLinearGradient(x*k,0,(x+w)*k,0);const tone=v=>{const n=Math.round(v*255);return`rgb(${n},${n},${n})`};
    g.addColorStop(0,tone(a));g.addColorStop(1,tone(b));c.fillStyle=g;c.fillRect((x-8)*k,y*k,(w+24)*k,h*k);
  };
  span(164,248,1720,20,3);
  PAGE_ROWS.forEach(([text,x,y,size,,weight],i)=>{
    measure.font=`${weight} ${size}px ${FONT}`;
    span(x,y-size*1.02,measure.measureText(text).width,size*1.36,text.length);
    if(i===3)span(164,820,1720,24,3);
  });
}
function buildPaper(){
  const page=canvas2d(2048,2896);paintPage(page.getContext('2d'));
  const pageTexture=canvasTexture(page);curve.page=page;curve.pageTexture=pageTexture;
  curve.reveal=canvas2d(512,724);paintReveal(curve.reveal.getContext('2d'),page.getContext('2d'));
  curve.revealTexture=new T.CanvasTexture(curve.reveal);curve.revealTexture.generateMipmaps=false;curve.revealTexture.minFilter=T.LinearFilter;
  const normal=loadTexture(A+'paper-normal.jpg',2.4),rough=loadTexture(A+'paper-rough.jpg',2.4);
  paper=new T.Group();scene.add(paper);
  paperMat=paperMaterial({map:pageTexture,emissiveMap:pageTexture,emissive:'#ffffff',emissiveIntensity:1,normalMap:normal,normalScale:new T.Vector2(.5,.5),roughnessMap:rough,roughness:1},{write:'page',reveal:curve.revealTexture});
  curve.sheet=new T.Mesh(paperGeometry(...PAPER,40,56),paperMat);paper.add(curve.sheet);
  const contactCanvas=canvas2d(256,356),cc=contactCanvas.getContext('2d');cc.filter='blur(13px)';cc.fillStyle='#000';cc.fillRect(26,26,204,304);
  curve.contact=new T.Mesh(new T.PlaneGeometry(3.6,4.98),new T.MeshBasicMaterial({map:new T.CanvasTexture(contactCanvas),transparent:true,depthWrite:false,opacity:0}));curve.contact.rotation.x=-Math.PI/2;curve.contact.position.y=.004;scene.add(curve.contact);
  // Thirteen rows cut from the page as loose strips.
  const rows=13;
  for(let i=0;i<rows;i++){
    const canvas=canvas2d(1024,72),c=canvas.getContext('2d');c.fillStyle='#efede6';c.fillRect(0,0,1024,72);grainy(c,1024,72);bars(c,34,25,940-(i%4)*60,20,'#858982',i*7+3);
    const y=1400+i*104,z=(y/2896-.5)*PAPER[1];
    const stripMap=canvasTexture(canvas),m=paperMaterial({map:stripMap,emissiveMap:stripMap,emissive:'#ffffff',emissiveIntensity:1,normalMap:normal,normalScale:new T.Vector2(.5,.5)},{write:'strip',shift:[0,z]});
    const mesh=new T.Mesh(paperGeometry(2.64,.1,14,2),m);mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.position.set(0,.006,z);paper.add(mesh);strips.push({mesh,m,z,dir:i%3===1?-1:1,seed:(i*.37)%1});
  }
  // The interpretation card: heavier, darker stock.
  const cardCanvas=canvas2d(1024,340);paintCard(cardCanvas.getContext('2d'));
  cardMat=paperMaterial({map:canvasTexture(cardCanvas),roughness:.72,envMapIntensity:.3},{seed:3});
  card=new T.Mesh(paperGeometry(2.72,.9,14,8),cardMat);card.castShadow=true;card.receiveShadow=true;scene.add(card);
  // Red proof marks and the stamp impression share the sheet's deformation.
  marksCanvas=canvas2d(1024,1448);marksTexture=canvasTexture(marksCanvas);
  overlayMat=paperMaterial({map:marksTexture,transparent:true,depthWrite:false,roughness:.5});
  const marks=new T.Mesh(paperGeometry(...PAPER,40,56),overlayMat);marks.position.y=.012;marks.renderOrder=2;paper.add(marks);
  const ink=canvas2d(1520,1000);paintInk(ink.getContext('2d'));
  const inkTexture=canvasTexture(ink);curve.inkCanvas=ink;curve.inkTexture=inkTexture;
  const inkMat=paperMaterial({map:inkTexture,transparent:true,depthWrite:false,roughness:.42,opacity:0},{shift:INK});
  stampInk=new T.Mesh(paperGeometry(1.2,.78,16,10),inkMat);stampInk.material.userData.ink=true;stampInk.position.set(INK[0],.016,INK[1]);stampInk.rotation.y=.1;stampInk.renderOrder=3;paper.add(stampInk);
  return page;
}
function paintCard(c){c.fillStyle='#1b2a26';c.fillRect(0,0,1024,340);label(c,'L-PROOF의 해석',60,74,28,'#e0b198',620);label(c,film.takeLines[0],58,172,58,'#f3eee3',640);label(c,film.takeLines[1],58,256,50,'#f3eee3',640)}
function paintInk(k){
  k.setTransform(2,0,0,2,0,0);k.clearRect(0,0,760,500);k.globalAlpha=1;k.globalCompositeOperation='source-over';k.strokeStyle=RED;k.fillStyle=RED;k.lineWidth=15;k.strokeRect(20,20,720,460);k.lineWidth=5;k.strokeRect(38,38,684,424);
  k.textAlign='center';k.font=`700 150px ${FONT}`;k.fillText('발행 승인',380,272);k.font=`600 42px ${FONT}`;k.fillText('L-PROOF  ·  '+film.date,380,372);
  k.globalCompositeOperation='destination-out';
  const hash=n=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v)};
  for(let i=0;i<26000;i++){const n=hash(i+.4);k.globalAlpha=.06+hash(i+.3)*.42;k.beginPath();k.arc(hash(i+.1)*760,hash(i+.2)*500,.18+n*n*n*n*1.5,0,6.3);k.fill()}
  k.globalAlpha=1;k.globalCompositeOperation='source-over';
}
function repaintFonts(){
  paintPage(curve.page.getContext('2d'));curve.pageTexture.needsUpdate=true;
  paintReveal(curve.reveal.getContext('2d'),curve.page.getContext('2d'));curve.revealTexture.needsUpdate=true;
  paintCard(card.material.map.image.getContext('2d'));card.material.map.needsUpdate=true;
  paintInk(curve.inkCanvas.getContext('2d'));curve.inkTexture.needsUpdate=true;
  marksKey='';
}
// Hand-drawn proof marks: drawn as strokes so they grow rather than appear.
function wobble(points,amount,seed){return points.map((p,i)=>[p[0]+Math.sin(i*1.7+seed)*amount,p[1]+Math.cos(i*2.3+seed)*amount])}
function ellipse(cx,cy,rx,ry,n=46){return Array.from({length:n},(_,i)=>{const a=-2.4+i/(n-1)*6.9;return[cx+Math.cos(a)*rx*(1+i*.002),cy+Math.sin(a)*ry*(1+i*.003)]})}
function stroke(c,points,progress,width){
  const n=Math.floor(points.length*clamp(progress));if(n<2)return null;
  c.lineWidth=width;c.lineCap=c.lineJoin='round';c.beginPath();c.moveTo(...points[0]);
  for(let i=1;i<n;i++)c.lineTo(...points[i]);c.stroke();return points[n-1];
}
function arrowPath(){
  const pts=[];
  const seg=(a,b,c,n)=>{for(let i=0;i<n;i++){const u=i/n,v=1-u;pts.push([v*v*a[0]+2*u*v*b[0]+u*u*c[0],v*v*a[1]+2*u*v*b[1]+u*u*c[1]])}};
  seg([672,628],[978,640],[986,760],22);seg([986,760],[996,1000],[986,1020],16);seg([986,1020],[978,1078],[880,1086],14);
  return wobble(pts,1.4,2);
}
function paintMarks(t){
  const s=[range(t,9.35,9.72),range(t,9.68,10),range(t,9.95,10.6),range(t,10.55,10.74)];
  const key=s.map(v=>Math.round(v*90)).join();if(key===marksKey)return;marksKey=key;
  const c=marksCanvas.getContext('2d');c.clearRect(0,0,1024,1448);c.strokeStyle=RED;c.fillStyle=RED;
  stroke(c,wobble(ellipse(372,612,300,50),3,1),s[0],9);
  stroke(c,arrowPath(),s[1],8);if(s[1]>=1)stroke(c,[[910,1062],[874,1086],[912,1110]],1,8);
  c.save();c.font=`800 76px ${FONT}`;const text=film.correction,w=c.measureText(text).width;c.beginPath();c.rect(100,1030,w*s[2]+6,112);c.clip();c.translate(104,1112);c.rotate(-.012);c.fillText(text,0,0);c.restore();
  if(s[2]>0&&s[2]<1)c.fillRect(104+w*s[2],1044,5,78);
  stroke(c,wobble(Array.from({length:24},(_,i)=>[104+i/23*w,1138+Math.sin(i*.7)*4]),1,4),s[3],8);
  marksTexture.needsUpdate=true;
}

// ---- The storm: instanced sheets with their whole motion in the vertex shader. ----
function buildStorm(){
  const atlas=canvas2d(2048,1448),c=atlas.getContext('2d');
  for(let i=0;i<8;i++){
    const x=(i%4)*512,y=(i>>2)*724;c.save();c.translate(x,y);c.beginPath();c.rect(0,0,512,724);c.clip();
    c.fillStyle=['#e7e5dc','#dcdbd2','#efece3','#d6d5cc'][i%4];c.fillRect(0,0,512,724);
    bars(c,42,52,250,18,'#55584f',i+1);rule(c,42,88,428,'#a9a99e',3);
    let y0=128;if(i%4===0){c.fillStyle='#5e6660';c.fillRect(42,y0,428,120);y0+=152}else if(i%3===1){bars(c,42,y0,400,40,'#23282a',i+9);bars(c,42,y0+58,300,40,'#23282a',i+13);y0+=136}
    if(i===2||i===5){c.fillStyle=RED;c.fillRect(42,y0,120,24);y0+=52}
    for(;y0<684;y0+=33)bars(c,42,y0,428-((y0*7)%90),10,'#878a82',y0+i);
    c.restore();
  }
  const texture=new T.CanvasTexture(atlas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
  const base=new T.PlaneGeometry(1.02,1.44,4,4),g=new T.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.uv=base.attributes.uv;
  const seeds=new Float32Array(quality.sheets*4),extra=new Float32Array(quality.sheets*2);
  for(let i=0;i<quality.sheets;i++){seeds.set([Math.random(),Math.random(),Math.random(),Math.random()],i*4);extra.set([Math.floor(Math.random()*8),Math.random()],i*2)}
  g.setAttribute('aSeed',new T.InstancedBufferAttribute(seeds,4));g.setAttribute('aExtra',new T.InstancedBufferAttribute(extra,2));g.instanceCount=quality.sheets;
  storm=new T.Mesh(g,new T.ShaderMaterial({side:T.DoubleSide,uniforms:{tAtlas:{value:texture},uTime:{value:0},uThin:{value:0},uEye:{value:new T.Vector3()},uFog:{value:.0185},uBg:{value:new T.Color(BG)}},
    vertexShader:`
    attribute vec4 aSeed;attribute vec2 aExtra;uniform float uTime,uThin;uniform vec3 uEye;
    varying vec2 vUv;varying vec3 vN,vWorld;varying float vLit;
    mat3 rot(vec3 a,float t){float s=sin(t),c=cos(t),o=1.-c;return mat3(o*a.x*a.x+c,o*a.x*a.y+a.z*s,o*a.z*a.x-a.y*s,o*a.x*a.y-a.z*s,o*a.y*a.y+c,o*a.y*a.z+a.x*s,o*a.z*a.x+a.y*s,o*a.y*a.z-a.x*s,o*a.z*a.z+c);}
    void main(){
      const float H=92.,TOP=98.;
      float speed=4.2+aSeed.y*3.6,y=TOP-mod(aSeed.x*H+uTime*speed,H);
      float R=(1.8+15.*pow(aSeed.z/.93,1.5))*mix(1.08,.74,clamp((TOP-y)/H,0.,1.));if(aSeed.z>.93)R=19.+(aSeed.z-.93)/.07*34.;
      float th=aSeed.y*6.2831+uTime*(.16+aSeed.w*.14)+y*.045;
      vec3 center=vec3(cos(th)*R,y,sin(th)*R);
      float cut=aExtra.y*.88;float k=clamp((uThin-cut)/.12,0.,1.);
      center.y-=k*k*70.;center.xz*=1.+k*.5;
      vec3 axis=normalize(vec3(sin(aSeed.w*9.),cos(aSeed.x*7.),sin(aSeed.z*11.)+.3));
      mat3 R3=rot(axis,uTime*(.7+aSeed.z*1.6)+aSeed.w*6.28);
      vec3 p=position;p.z+=sin(p.y*1.5+uTime*2.6+aSeed.x*6.)*.17+cos(p.x*1.8+uTime*2.)*.09;
      float near=smoothstep(.6,2.4,distance(center,uEye));
      float scale=near*(1.-smoothstep(.72,1.,k))*(.82+aSeed.w*.42)*smoothstep(.4,3.,center.y);
      vec3 world=center+R3*(p*scale);
      vUv=(uv+vec2(mod(aExtra.x,4.),floor(aExtra.x/4.)))/vec2(4.,2.);vUv.y=1.-((1.-uv.y)+floor(aExtra.x/4.))/2.;
      vN=R3*vec3(0.,0.,1.);vWorld=world;
      float r=length(world.xz);vLit=exp(-r*r/54.)*(.55+.45*smoothstep(44.,84.,world.y)+.3*sin(world.y*.16));
      gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
    }`,
    fragmentShader:`
    uniform sampler2D tAtlas;uniform vec3 uEye,uBg;uniform float uFog;
    varying vec2 vUv;varying vec3 vN,vWorld;varying float vLit;
    void main(){
      vec3 c=texture2D(tAtlas,vUv).rgb;vec3 V=normalize(uEye-vWorld),N=normalize(vN);if(dot(N,V)<0.)N=-N;
      vec3 L=normalize(vec3(.12,1.,.18));float d=abs(dot(N,L));float h=pow(max(dot(N,normalize(L+V)),0.),18.);
      vec3 warm=vec3(1.,.86,.66);
      vec3 lit=c*(vec3(.012,.017,.032)+warm*vLit*(1.25+2.*d)+vec3(.1,.13,.2)*(1.-vLit)*(.7+d))+warm*vLit*h*1.1;
      float dist=length(uEye-vWorld);float f=exp(-dist*dist*uFog*uFog);
      gl_FragColor=vec4(mix(uBg*.2,lit,f),1.);
    }`}));
  storm.frustumCulled=false;scene.add(storm);
}

// ---- Stamp: Blender mesh, walnut baked to texture. ----
async function buildStamp(){
  stamp=new T.Group();scene.add(stamp);stamp.scale.setScalar(.66);stamp.visible=false;
  const [head,bin]=await Promise.all([fetch(A+'stamp.json').then(r=>r.json()),fetch(A+'stamp.bin').then(r=>r.arrayBuffer())]);
  const materials={
    wood:new T.MeshStandardMaterial({map:loadTexture(A+'wood-color.jpg',1,true),roughnessMap:loadTexture(A+'wood-rough.jpg'),roughness:1.5,envMapIntensity:.55}),
    collar:new T.MeshStandardMaterial({color:'#b08a4c',metalness:1,roughness:.28,envMapIntensity:1.5}),
    rubber:new T.MeshStandardMaterial({color:'#5a120c',roughness:.62}),
  };
  materials.wood.color.setRGB(1.9,1.72,1.6);materials.wood.map.flipY=materials.wood.roughnessMap.flipY=false;
  for(const [name,[offset,count]] of Object.entries(head)){
    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.BufferAttribute(new Float32Array(bin,offset,count*3),3));
    g.setAttribute('normal',new T.BufferAttribute(new Float32Array(bin,offset+count*12,count*3),3));
    g.setAttribute('uv',new T.BufferAttribute(new Float32Array(bin,offset+count*24,count*2),2));
    const m=new T.Mesh(g,materials[name]);m.castShadow=m.receiveShadow=true;stamp.add(m);
  }
}

// ---- Light, room, air. ----
function buildRoom(){
  scene=new T.Scene();scene.background=new T.Color(BG);scene.fog=new T.FogExp2(BG,.03);
  camera=new T.PerspectiveCamera(34,1,.05,240);
  scene.add(new T.HemisphereLight('#3a4c74','#07080c',.3));
  key=new T.SpotLight('#ffdcb0',2.1,0,Math.atan(4.3/18),1,0);key.position.set(.9,18,-2.6);key.target.position.set(.2,0,.2);key.castShadow=true;key.shadow.mapSize.set(quality.shadow,quality.shadow);key.shadow.radius=5;key.shadow.bias=-.00018;key.shadow.normalBias=.012;key.shadow.camera.near=8;key.shadow.camera.far=24;scene.add(key,key.target);
  fill=new T.DirectionalLight('#a8c0e6',.1);fill.position.set(-5,2.6,7);scene.add(fill);
  const env=new T.Scene();env.background=new T.Color('#0b0d12');
  for(const [x,y,z,w,h,v,color] of [[-5,5,3,4,7,5,'#ffe2c0'],[6,2,0,1.2,7,3.5,'#a9c7ee'],[0,9,0,8,5,3,'#ffffff']]){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(v)}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)}
  const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.03).texture;pmrem.dispose();
  slab=new T.Mesh(new T.PlaneGeometry(120,120),new T.MeshStandardMaterial({color:'#262a33',map:loadTexture(A+'slab-color.jpg',14,true),normalMap:loadTexture(A+'slab-normal.jpg',14),normalScale:new T.Vector2(.34,.34),roughnessMap:loadTexture(A+'slab-rough.jpg',14),roughness:1,envMapIntensity:.3}));slab.rotation.x=-Math.PI/2;slab.receiveShadow=true;scene.add(slab);
  cone=new T.Mesh(new T.CylinderGeometry(1.2,12,110,48,1,true),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{uAlpha:{value:1}},
    vertexShader:'varying vec3 vN,vV;varying float vY;void main(){vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);vY=uv.y;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform float uAlpha;varying vec3 vN,vV;varying float vY;void main(){float f=pow(abs(dot(normalize(vN),normalize(vV))),3.2);gl_FragColor=vec4(vec3(1.,.8,.56)*f*.3*uAlpha*smoothstep(0.,.12,vY),1.);}'}));
  cone.position.set(0,58,0);scene.add(cone);
  scan=new T.Mesh(new T.PlaneGeometry(3.5,.016),new T.MeshBasicMaterial({color:new T.Color(1.2,3.4,4.6),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));scan.rotation.x=-Math.PI/2;scene.add(scan);
  const glow=canvas2d(8,256),g=glow.getContext('2d'),grad=g.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#000');grad.addColorStop(.5,'#fff');grad.addColorStop(1,'#000');g.fillStyle=grad;g.fillRect(0,0,8,256);
  scanGlow=new T.Mesh(new T.PlaneGeometry(3.6,1.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(glow),color:new T.Color(.16,.5,.72),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));scanGlow.rotation.x=-Math.PI/2;scene.add(scanGlow);
  const count=mobile?500:1100,p=new Float32Array(count*3),s=new Float32Array(count);for(let i=0;i<count;i++){p.set([(Math.random()-.5)*11,Math.random()*9,(Math.random()-.5)*11],i*3);s[i]=Math.random()}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(p,3));dg.setAttribute('aS',new T.BufferAttribute(s,1));
  dust=new T.Points(dg,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime:shared.uTime,uAlpha:{value:0},uScale:{value:1}},
    vertexShader:'attribute float aS;uniform float uTime,uScale;varying float vA;void main(){vec3 q=position;q.y=mod(q.y+uTime*(.05+aS*.08),9.);q.x+=sin(uTime*.2+aS*30.)*.3;q.z+=cos(uTime*.17+aS*20.)*.3;vec4 v=modelViewMatrix*vec4(q,1.);float r=length(q.xz);vA=exp(-r*r/16.)*(.35+.65*sin(uTime*.8+aS*40.)*sin(uTime*.8+aS*40.));gl_PointSize=uScale*(1.+aS*2.6)/-v.z*5.;gl_Position=projectionMatrix*v;}',
    fragmentShader:'uniform float uAlpha;varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.87,.68)*smoothstep(.5,.05,d)*vA*uAlpha*.55,1.);}'}));
  dust.frustumCulled=false;scene.add(dust);
  const bc=mobile?260:560,bp=new Float32Array(bc*3),bv=new Float32Array(bc*4);for(let i=0;i<bc;i++){const a=Math.random()*6.283,edge=Math.random();bp.set([Math.cos(a)*.8,0,Math.sin(a)*.55],i*3);bv.set([Math.cos(a)*(.8+edge*2.6),.08+Math.random()*Math.random()*1.1,Math.sin(a)*(.8+edge*2.6),Math.random()],i*4)}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(bp,3));bg.setAttribute('aV',new T.BufferAttribute(bv,4));
  burst=new T.Points(bg,new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uAge:{value:-1},uScale:{value:1}},
    vertexShader:'attribute vec4 aV;uniform float uAge,uScale;varying float vA;void main(){float t=max(uAge,0.),o=1.-exp(-t*3.4);vec3 q=position+aV.xyz*vec3(o,o,o)*.86;q.y=max(.02,q.y-t*t*.5);vec4 v=modelViewMatrix*vec4(q,1.);vA=uAge<0.?0.:(1.-smoothstep(.1,.85+aV.w*.6,t))*(.2+aV.w*.5);gl_PointSize=uScale*(.8+aV.w*1.9)/-v.z*5.;gl_Position=projectionMatrix*v;}',
    fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(.86,.78,.66),smoothstep(.5,.1,d)*vA);}'}));
  burst.position.set(INK[0],.05,INK[1]);burst.frustumCulled=false;scene.add(burst);
}

// ---- Post: bloom, depth of field, grain. ----
const FULL='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function pass(fragment,uniforms){return new T.ShaderMaterial({vertexShader:FULL,fragmentShader:fragment,uniforms,depthTest:false,depthWrite:false})}
function buildPost(){
  const type=T.HalfFloatType,rt=(w,h,o={})=>new T.WebGLRenderTarget(w,h,{type,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false,...o});
  const depth=new T.DepthTexture(4,4,T.UnsignedIntType);
  composer={main:rt(4,4,{samples:quality.samples,depthBuffer:true,depthTexture:depth}),a:rt(4,4),b:rt(4,4),c:rt(4,4),d:rt(4,4),depth};
  const quad=new T.Mesh(new T.PlaneGeometry(2,2));quad.frustumCulled=false;
  composer.scene=new T.Scene();composer.scene.add(quad);composer.quad=quad;composer.cam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  composer.bright=pass('uniform sampler2D t;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(1.9,3.4,l),1.);}',{t:{value:null}});
  composer.blur=pass('uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*.316;c+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}',{t:{value:null},d:{value:new T.Vector2()}});
  composer.final=pass(`
  uniform sampler2D tC,tA,tB,tD;uniform vec2 px;uniform float uTime,uFocus,uAperture,uNear,uFar,uExposure,uChroma;varying vec2 vUv;
  float linear(float z){return uNear*uFar/(uFar-z*(uFar-uNear));}
  vec3 aces(vec3 x){x*=.6;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 uv=vUv,c0=uv-.5;
    float z=linear(texture2D(tD,uv).r),coc=clamp(abs(z-uFocus)/max(z,.1)*uAperture,0.,1.);
    vec3 col=vec3(texture2D(tC,uv+c0*uChroma).r,texture2D(tC,uv).g,texture2D(tC,uv-c0*uChroma).b);
    if(coc>.02){vec3 sum=col;float wt=1.;for(int i=1;i<20;i++){float f=float(i),r=sqrt(f/20.)*coc*15.,a=f*2.39996;vec2 o=vec2(cos(a),sin(a))*r*px;sum+=texture2D(tC,uv+o).rgb;wt+=1.;}col=sum/wt;}
    col+=texture2D(tA,uv).rgb*.62+texture2D(tB,uv).rgb*.7;
    col=aces(col*uExposure);
    col=pow(col,vec3(1./2.2));
    float v=smoothstep(.95,.3,length(c0*vec2(1.,.82)));col*=mix(.42,1.,v);
    col+=(hash(uv*vec2(913.,717.)+fract(uTime)*91.)-.5)*.034;
    gl_FragColor=vec4(col,1.);
  }`,{tC:{value:composer.main.texture},tA:{value:composer.b.texture},tB:{value:composer.d.texture},tD:{value:depth},px:{value:new T.Vector2()},uTime:shared.uTime,uFocus:{value:30},uAperture:{value:0},uNear:{value:.05},uFar:{value:240},uExposure:{value:1},uChroma:{value:.0015}});
}
function runPass(material,to){composer.quad.material=material;renderer.setRenderTarget(to);renderer.render(composer.scene,composer.cam)}
function composite(){
  renderer.setRenderTarget(composer.main);renderer.render(scene,camera);
  const {bright,blur,final}=composer;
  bright.uniforms.t.value=composer.main.texture;runPass(bright,composer.a);
  const w=composer.a.width,h=composer.a.height;
  for(const [src,mid,dst,k] of [[composer.a,composer.c,composer.b,1],[composer.b,composer.c,composer.d,3]]){
    blur.uniforms.t.value=src.texture;blur.uniforms.d.value.set(k/w,0);runPass(blur,mid);
    blur.uniforms.t.value=mid.texture;blur.uniforms.d.value.set(0,k/h);runPass(blur,dst);
  }
  runPass(final,null);
}

// ---- Camera path. Times are in screens of scroll. ----
const KEYS=[
  [-1,[3,64,58],[-13,62,0],34],
  [0,[3,64,58],[-13,62,0],34],
  [1,[2,62,48],[-10,60,0],34],
  [2.1,[12,48,24],[0,38,-2],36],
  [3,[-4.5,26,12],[0,13,0],40],
  [3.85,[-.7,11.5,3.3],[0,1.5,0],36],
  [4.6,[.1,8.6,.3],[0,.1,-.04],31],
  [5.35,[.06,7.7,.2],[0,0,-.04],31],
  [5.8,[-1.25,5.7,3.3],[-.8,0,-.42],31],
  [7,[-1.7,5,3.5],[-.85,0,-.05],31],
  [7.7,[1,5.3,3.7],[-.8,0,.05],31],
  [8.6,[.8,4.2,4.9],[-.65,0,-.1],33],
  [9.1,[-.1,1.6,4.8],[-1.3,0,-.7],36],
  [9.95,[-.6,2.15,4.1],[-1.15,0,.3],36],
  [10.7,[-.8,2.6,3.95],[-.35,0,1.05],35],
  [11.2,[-2.1,1.2,4.8],[.6,.98,1.66],40],
  [11.75,[-2.2,1.05,4.85],[.6,.86,1.66],40],
  [12.5,[.3,3.1,3.8],[.28,0,1.32],32],
  [13.1,[.7,5.2,1.76],[INK[0],0,INK[1]-.01],32],
  [13.75,[INK[0],.9,INK[1]+.01],[INK[0],0,INK[1]],32],
  [14.2,[INK[0],.13,INK[1]+.002],[INK[0],0,INK[1]],32],
  [15,[INK[0],.1,INK[1]+.002],[INK[0],0,INK[1]],32],
];
function buildCurves(){
  const portrait=aspect<.9;
  const shape=k=>{
    const pos=new T.Vector3(...k[1]),look=new T.Vector3(...k[2]);
    if(portrait){
      if(k[0]<=2.1){look.x=mix(0,look.x,clamp((k[0]-1)/1.1));pos.x*=.6;}
      if(k[0]>=5.6&&k[0]<=10.7){look.x*=.12;pos.x*=.5;look.z+=.72}
      if(k[0]>=11.2&&k[0]<=11.75)look.y+=.42;
      if(k[0]<=14){const f=(1+(1.05/aspect-1)*.42)*(k[0]>=9.95&&k[0]<=10.7?1.5:1);pos.sub(look).multiplyScalar(f).add(look)}
    }
    return{pos,look};
  };
  const pts=KEYS.map(shape);
  curve.pos=new T.CatmullRomCurve3(pts.map(p=>p.pos),false,'centripetal');
  curve.look=new T.CatmullRomCurve3(pts.map(p=>p.look),false,'centripetal');
}
function keyAt(t){
  let i=0;while(i<KEYS.length-2&&t>=KEYS[i+1][0])i++;
  const a=KEYS[i],b=KEYS[i+1],u=clamp((t-a[0])/(b[0]-a[0]));
  return{u:(i+u)/(KEYS.length-1),fov:mix(a[3],b[3],u)};
}
function placeCamera(t,shake){
  const {u,fov}=keyAt(t);curve.pos.getPoint(u,rig.pos);curve.look.getPoint(u,rig.look);
  if(t<4.3){const s=1-range(t,2.6,4.3);rig.pos.x+=Math.sin(time*.23)*.5*s;rig.pos.y+=Math.sin(time*.31)*.3*s}
  if(shake>0){rig.pos.x+=Math.sin(time*77)*.05*shake;rig.pos.y+=Math.sin(time*93)*.11*shake;rig.look.y+=Math.cos(time*71)*.05*shake}
  camera.position.copy(rig.pos);
  const dir=rig.look.clone().sub(rig.pos).normalize();
  rig.up.set(0,1,0).lerp(new T.Vector3(0,0,-1),T.MathUtils.smoothstep(-dir.y,.6,.97)).normalize();
  camera.up.copy(rig.up);camera.lookAt(rig.look);
  if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}
}

// ---- One frame of the whole film. ----
function placePaper(t){
  const fall=clamp((t-.7)/3.95),drop=1-Math.pow(1-fall,2.15),y=mix(58,.02,drop);
  const land=range(t,3.9,4.68),spin=(1-land),clear=2.7*Math.min(1,spin*1.6);
  const r=mix(2.6,0,range(t,1.5,4.4));
  const front=1-range(t,.7,2.7);paper.position.set(Math.cos(time*.31+y*.05)*r-front*1.5,y+clear+(1-range(t,.7,1.4))*Math.sin(time*.8)*.2+front*1.5,Math.sin(time*.31+y*.05)*r+front*24);
  paper.rotation.set((Math.sin(time*.9+y*.12)*.3+mix(.42,.95,front))*spin,Math.sin(time*.45+y*.05)*.34*spin,Math.sin(time*.7+y*.17)*.22*spin);
  curve.contact.material.opacity=range(t,4.2,4.72)*.92;curve.sheet.castShadow=t<4.68;curve.sheet.receiveShadow=t>=4.68;shared.uFlutter.value=1-land;paperMat.emissiveIntensity=(1-range(t,3.3,4.3))*1.25;strips.forEach(s=>s.m.emissiveIntensity=paperMat.emissiveIntensity);
}
function placeStrips(t){
  const written=clamp((t-3.95)/1.35);paperMat.userData.u.uWrite.value=written;
  strips.forEach((s,i)=>{
    const strike=range(t,6.0+i*.05,6.26+i*.05),peel=clamp((t-(6.42+s.seed*.42))/.82);
    s.mesh.receiveShadow=t>=4.68;const from=ROWS_END+i*.0165;s.m.userData.u.uWrite.value=clamp((written-from)/.03);s.m.userData.u.uStrike.value=strike;s.m.userData.u.uCurl.value=Math.min(1,peel*2.2);
    s.mesh.visible=peel<1;const e=peel*peel;
    s.mesh.position.set(s.dir*e*7.5,.006+e*3.1+peel*.3,s.z-e*(1.4+s.seed*2.4));
    s.mesh.rotation.set(-e*1.1,s.dir*e*.9,s.dir*e*.6);
  });
}
function placeCard(t){
  const a=range(t,7.1,7.75),land=1-a;
  card.visible=t>7.05;card.position.set(mix(5.8,0,a),mix(1.1,.024,a)+Math.sin(a*Math.PI)*.12,.41+land*.3);
  card.rotation.set(0,land*-.34,land*.14);cardMat.userData.u.uCurl.value=land*.25;
}
function placeStamp(t,dt){
  stamp.visible=t>9.9&&t<12.9;
  const hover=range(t,10.1,11.3),base=mix(9.5,1.05,hover);
  if(target>=HIT&&impact<0&&t>=HIT-.08)impact=0;
  if(target<HIT-.2)impact=-1;
  let y=base,x=INK[0],z=INK[1],press=0;
  if(impact>=0){
    impact+=dt;
    const down=clamp(impact/.11),up=Math.max(range(impact,.95,1.95),range(t,11.9,12.3));
    press=down*down*down;y=mix(1.05,.027,press)+up*up*8;x+=up*up*-2.2;
  }else y+=Math.sin(time*2.1)*.012*hover;
  stamp.position.set(x,y,z);stamp.rotation.set(0,.1,0);
  const hit=impact>=.11?impact-.11:-1;
  burst.material.uniforms.uAge.value=hit;
  shared.uRipple.value.set(INK[0],INK[1],hit>=0?.075*Math.exp(-hit*5):0,hit>=0?hit*30:0);
  stampInk.material.opacity=hit>=0?1:0;
  composer&&(composer.final.uniforms.uExposure.value=1+(hit>=0?1.1*Math.exp(-hit*9):0));
  return hit>=0?Math.exp(-hit*6.5):0;
}
function frame(dt=0){
  const t=Q;
  shared.uTime.value=time;
  storm.material.uniforms.uTime.value=stormTime;storm.material.uniforms.uThin.value=range(t,1.1,4.15);
  storm.material.uniforms.uEye.value.copy(camera.position);
  storm.visible=t<5;
  placePaper(t);placeStrips(t);placeCard(t);
  const shake=placeStamp(t,dt);placeCamera(t,shake);
  paintMarks(t);
  // Review goes cool: the only stretch without the warm key at full strength.
  const cool=range(t,8.45,9)*(1-range(t,10.3,10.95));
  key.color.set('#ffdcb0').lerp(new T.Color('#9fc4ef'),cool*.8);key.intensity=mix(mix(0,2.1,range(t,2.4,3.5)),.95,cool);
  fill.intensity=.16+cool*.26+range(t,10.7,11.2)*(1-range(t,12.4,13))*1.05;
  const sweep=range(t,8.7,9.45),beam=range(t,8.55,8.8)*(1-range(t,9.4,9.65));
  const sz=mix(-2.3,2.3,sweep);
  scan.position.set(0,.11,sz);scan.material.opacity=beam;scan.visible=beam>.01;scanGlow.position.set(0,.05,sz);scanGlow.material.opacity=beam*.95;scanGlow.visible=beam>.01;
  cone.material.uniforms.uAlpha.value=(1-range(t,3.6,5))*.95+.06;cone.visible=t<13;
  dust.material.uniforms.uAlpha.value=range(t,3.8,5)*(1-range(t,13,13.7));
  slab.visible=t>2.4;
  const fade=range(t,13.92,14.3);delivery.style.opacity=String(fade);delivery.classList.toggle('live',fade>.9);delivery.inert=fade<=.9;
  if(composer){
    const f=composer.final.uniforms,focus=t<4.4?camera.position.distanceTo(paper.position):camera.position.distanceTo(rig.look);
    f.uFocus.value=focus;f.uAperture.value=quality.dof?(t<4.4?.3:mix(.05,.16,range(t,8.6,9.2))):0;
    if(t>13.2)f.uAperture.value=0;
  }
  updateCopy(t);composite();
}
function updateCopy(t){
  copies.forEach(({el,from,to})=>{
    const a=Math.min(range(t,from,from+.28),1-range(t,to-.28,to)),o=from<0?1-range(t,to-.42,to):a;
    el.style.opacity=String(o);el.style.transform=`translateY(${(1-o)*18}px)`;el.inert=o<.02;
  });
  const stop=STOPS.reduce((b,s,i)=>t+1.2>=s?i:b,0);
  dots.forEach((d,i)=>i===stop?d.setAttribute('aria-current','step'):d.removeAttribute('aria-current'));
  rail.classList.toggle('visible',t>.9||reduced);cue.style.opacity=String(1-range(t,0,.3));
  root.classList.toggle('film-light',t>14);
  rail.inert=!(t>.9||reduced);skipFilm.inert=t>14.2;skipFilm.style.opacity=String(range(t,.3,.9)*(1-range(t,13.7,14.2)));
}
function readScroll(){if(reduced||!height)return;target=clamp(Math.max(0,-story.getBoundingClientRect().top)/height,0,SCREENS)}
function resize(){
  const nextWidth=stage.clientWidth,nextHeight=sticky.clientHeight;
  if(!nextWidth||!nextHeight)return;
  if(renderer&&nextWidth===width&&(nextHeight===height||mobile&&Math.abs(nextHeight-height)<130))return;
  layout();
}
function layout(){
  if(!stage.clientWidth||!sticky.clientHeight)return;
  width=stage.clientWidth;height=sticky.clientHeight;aspect=width/height;
  story.style.height=reduced?`${height}px`:`${(SCREENS+1)*height}px`;
  if(renderer){
    const dpr=quality.dpr;renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);
    camera.aspect=aspect;camera.updateProjectionMatrix();
    const w=Math.round(width*dpr),h=Math.round(height*dpr);composer.main.setSize(w,h);
    for(const [rt,f] of [[composer.a,3],[composer.b,3],[composer.c,3],[composer.d,3]])rt.setSize(Math.ceil(w/f),Math.ceil(h/f));
    composer.final.uniforms.px.value.set(1/w,1/h);
    const s=h/720;dust.material.uniforms.uScale.value=burst.material.uniforms.uScale.value=s*(mobile?2.2:2.6);
    buildCurves();
  }
  readScroll();
}
function tick(now){
  frameId=requestAnimationFrame(tick);
  const dt=Math.min(.05,(now-previous)/1000);const real=now-previous;previous=now;
  if(disposed||document.hidden||(Q>=SCREENS-.02&&target>=SCREENS&&story.getBoundingClientRect().bottom<0))return;
  time+=reduced?0:dt;
  const before=Q;Q=reduced?target:Q+(target-Q)*(1-Math.exp(-3.8*dt));if(Math.abs(Q-target)<.0006)Q=target;
  wind+=(clamp((Q-before)/Math.max(dt,.004)*2.4,-1.4,7)-wind)*(1-Math.exp(-5*dt));stormTime+=reduced?0:dt*(1+wind);
  frame(dt);
  frames++;slow+=real>30?1:0;
  if(frames===90){if(slow>60&&quality.steps<3)stepDown();frames=slow=0}
}
function stepDown(){
  quality.steps++;quality.dof=0;quality.dpr=Math.max(.8,quality.dpr-.25);
  storm.geometry.instanceCount=Math.ceil(storm.geometry.instanceCount*.6);
  layout();
}
function go(i){if(reduced){target=Q=STOPS[i];impact=i>=3?2:-1;frame(0)}else window.scrollTo({top:story.offsetTop+STOPS[i]*height,behavior:'instant'})}
dots.forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.go)),listen));
function syncMotion(){root.classList.toggle('film-simple',reduced);const b=root.querySelector('#motion');b.textContent=reduced?'▷':'Ⅱ';b.setAttribute('aria-pressed',String(reduced));b.setAttribute('aria-label',reduced?'스크롤 연출 켜기':'움직임 줄이기')}
root.querySelector('#motion').addEventListener('click',()=>{reduced=!reduced;syncMotion();layout();scrollTo({top:0,behavior:'instant'});if(reduced){target=Q=0;frame(0)}},listen);
media.addEventListener('change',()=>{reduced=media.matches;syncMotion();layout()},listen);
addEventListener('scroll',readScroll,{passive:true,...listen});addEventListener('resize',resize,listen);
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');reveals.unobserve(e.target)}}),{threshold:.22,rootMargin:'0px 0px -6% 0px'});
root.classList.add('film-reveal');root.querySelectorAll('.reveal').forEach(el=>reveals.observe(el));
root.addEventListener('focusin',event=>event.target.closest('.reveal')?.classList.add('in'),listen);
const glyphs=()=>document.fonts.load(`700 100px ${FONT}`,[...PAGE_ROWS.map(r=>r[0]),film.correction,...film.takeLines,'L-PROOF 발행 승인 L–PROOF'].join(''));
glyphs().then(()=>{if(disposed)return;const mark=canvas2d(1520,1000);paintInk(mark.getContext('2d'));mark.toBlob(b=>{if(!disposed&&b)root.style.setProperty('--stamp-mark',`url(${URL.createObjectURL(b)})`)})});

const hasSize=()=>new Promise(resolve=>{
  if(sticky.clientHeight&&stage.clientWidth)return resolve();
  const watch=new ResizeObserver(()=>{if(sticky.clientHeight&&stage.clientWidth){watch.disconnect();resolve()}});watch.observe(sticky);events.signal.addEventListener('abort',()=>watch.disconnect());
});
async function start(){
  syncMotion();await hasSize();if(disposed)return;
  renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=T.LinearSRGBColorSpace;renderer.toneMapping=T.NoToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;stage.appendChild(renderer.domElement);
  buildRoom();buildPaper();buildStorm();buildPost();await buildStamp();if(disposed)return;
  layout();sizeWatch=new ResizeObserver(resize);sizeWatch.observe(sticky);readScroll();Q=target;running=true;frame(0);stage.classList.add('on');frameId=requestAnimationFrame(tick);
  await glyphs();await document.fonts.ready;if(disposed)return;repaintFonts();
  window.__cine={state:()=>({Q,target,height,impact,time,wind,quality:{...quality},sheets:storm.geometry.instanceCount}),ready:true};
}
start().catch(error=>{
  // WebGL or a texture failed: fall back to the plain page, which is complete without the film.
  console.warn('film unavailable',error);renderer=null;root.classList.remove('film-on');story.style.height='';window.__cine={failed:String(error)};
});
return ()=>{
  disposed=true;events.abort();cancelAnimationFrame(frameId);reveals.disconnect();sizeWatch?.disconnect();
  if(renderer){renderer.dispose();renderer.forceContextLoss()}
  stage.replaceChildren();stage.classList.remove('on');story.style.height='';delete window.__cine;
  root.classList.remove('film-on','film-simple','film-light','film-reveal');
};
};
