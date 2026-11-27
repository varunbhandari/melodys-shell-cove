const VERSION='v4';
const CACHE='shell-cove-'+VERSION;
const FILES=['./','index.html','manifest.json','fonts/baloo-2-latin-600-normal.woff2','fonts/baloo-2-latin-800-normal.woff2','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>{if(r.ok)return c.put(f,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const isPage=req=>req.mode==='navigate'||/\/(index\.html)?$/.test(new URL(req.url).pathname);
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 if(isPage(req)){
  // network first: always get the newest game when online, saved copy when offline
  e.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('index.html',copy));return res}).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
  return;
 }
 e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})));
});
