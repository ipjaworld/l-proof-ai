// node capture.cjs <out dir> <width>x<height> <t,t,...>  Scrolls for real, then captures transition frames.
const {chromium}=require('C:/Users/tbrk7/AppData/Local/npm-cache/_npx/da7caeae9db9c589/node_modules/playwright-core');
const path=require('path'),fs=require('fs');
const [out,size,list]=process.argv.slice(2);const [width,height]=size.split('x').map(Number);
const times=list.split(',').map(Number);fs.mkdirSync(out,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--ignore-gpu-blocklist','--use-angle=d3d11','--enable-gpu-rasterization']});
  const p=await (await b.newContext({viewport:{width,height},deviceScaleFactor:1})).newPage();
  const errors=[];p.on('pageerror',e=>errors.push('page: '+e.message));p.on('console',m=>{if(['error','warning'].includes(m.type())&&!/GPU stall|GL Driver/.test(m.text()))errors.push(m.type()+': '+m.text())});
  await p.goto('http://127.0.0.1:8768/rebuild-cinematic/',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>window.__cine?.ready||window.__cine?.failed,null,{timeout:30000});
  console.log(await p.evaluate(()=>({failed:window.__cine.failed,renderer:(()=>{const g=document.querySelector('canvas')?.getContext('webgl2');const e=g?.getExtension('WEBGL_debug_renderer_info');return e&&g.getParameter(e.UNMASKED_RENDERER_WEBGL)})()})));
  await p.waitForTimeout(2200);
  for(const t of times){
    const burstMode=t>=2000,hold=t>=1000&&!burstMode;const v=burstMode?t-2000:hold?t-1000:t;
    await p.evaluate(v=>{const s=document.querySelector('#story');scrollTo({top:s.offsetTop+v*window.__cine.state().height,behavior:'instant'})},v);
    if(burstMode){for(let i=0;i<6;i++){await p.waitForTimeout(170);const st=await p.evaluate(()=>window.__cine.state());await p.screenshot({path:path.join(out,`${size}-burst-${i}-${st.impact.toFixed(2)}.jpg`),type:'jpeg',quality:82});}continue}
    if(v>15)await p.waitForTimeout(1500);
    else await p.waitForFunction(v=>{const s=window.__cine.state();return Math.abs(s.target-v)<.02&&Math.abs(s.Q-s.target)<.012},v,{timeout:60000});
    await p.waitForTimeout(hold?1800:250);
    await p.screenshot({path:path.join(out,`${size}-${String(v.toFixed(2)).padStart(5,'0')}.jpg`),type:'jpeg',quality:82,animations:'allow'});
    console.log('t',v,await p.evaluate(()=>window.__cine.state()));
  }
  console.log('ERRORS',errors.slice(0,12));await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
