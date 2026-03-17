module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},15174,(e,t,r)=>{t.exports=e.x("better-sqlite3-a7511daadfd6ace3",()=>require("better-sqlite3-a7511daadfd6ace3"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},25366,e=>{"use strict";var t=e.i(42113),r=e.i(512),a=e.i(53409),s=e.i(51642),n=e.i(22668),i=e.i(12412),o=e.i(56397),d=e.i(46073),l=e.i(81883),u=e.i(170),p=e.i(57671),c=e.i(82947),E=e.i(57095),T=e.i(1137),R=e.i(12914),N=e.i(93695);e.i(67171);var x=e.i(2032),h=e.i(28095),m=e.i(15174),w=e.i(14747);let L=w.default.join(process.cwd(),"data","dobby.db");function f(){let e=new m.default(L);return e.pragma("journal_mode = WAL"),e}{let t,r=e.r(22734),a=w.default.join(process.cwd(),"data");r.existsSync(a)||r.mkdirSync(a,{recursive:!0}),(t=f()).exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      email TEXT,
      created_at TEXT NOT NULL,
      points INTEGER DEFAULT 1250,
      level TEXT DEFAULT '魔法学徒',
      tree_growth INTEGER DEFAULT 0
    )
  `),t.exec(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      reward INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `),t.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      subject TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `),t.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `),t.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_points (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      subject TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `),t.close()}async function g(e){try{let{username:t,password:r}=await e.json();if(!t||!r)return h.NextResponse.json({error:"用户名和密码不能为空"},{status:400});let a=f();if(a.prepare("SELECT id FROM users WHERE username = ?").get(t))return a.close(),h.NextResponse.json({error:"用户名已存在"},{status:409});let s=`user_${Date.now()}`;a.prepare(`
      INSERT INTO users (id, username, password, display_name, email, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(s,t,r,t,`${t}@dobby.local`,new Date().toISOString());let n=[{id:`task_${Date.now()}_1`,text:"完成3道奥数题",reward:50},{id:`task_${Date.now()}_2`,text:"背诵5个新单词",reward:30},{id:`task_${Date.now()}_3`,text:"查看今日课程表",reward:10}],i=a.prepare(`
      INSERT INTO daily_tasks (id, user_id, text, completed, reward)
      VALUES (?, ?, ?, ?, ?)
    `);return n.forEach(e=>{i.run(e.id,s,e.text,0,e.reward)}),a.close(),h.NextResponse.json({success:!0,user:{id:s,username:t,displayName:t,email:`${t}@dobby.local`,createdAt:new Date().toISOString(),points:1250,level:"魔法学徒",treeGrowth:0,dailyTasks:n.map(e=>({...e,completed:!1}))}})}catch(e){return console.error("Registration error:",e),h.NextResponse.json({error:e.message},{status:500})}}e.s(["POST",()=>g],6723);var v=e.i(6723);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/auth/register/route",pathname:"/api/auth/register",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/TRAE/dobby-elf/app/api/auth/register/route.ts",nextConfigOutput:"standalone",userland:v}),{workAsyncStorage:A,workUnitAsyncStorage:y,serverHooks:_}=O;function C(){return(0,a.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:y})}async function I(e,t,a){O.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let h="/api/auth/register/route";h=h.replace(/\/index$/,"")||"/";let m=await O.prepare(e,t,{srcPage:h,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,params:L,nextConfig:f,parsedUrl:g,isDraftMode:v,prerenderManifest:A,routerServerContext:y,isOnDemandRevalidate:_,revalidateOnlyGenerated:C,resolvedPathname:I,clientReferenceManifest:S,serverActionsManifest:U}=m,b=(0,o.normalizeAppPath)(h),X=!!(A.dynamicRoutes[b]||A.routes[I]),k=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,g,!1):t.end("This page could not be found"),null);if(X&&!v){let e=!!A.routes[I],t=A.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(f.experimental.adapterPath)return await k();throw new N.NoFallbackError}}let P=null;!X||O.isDev||v||(P="/index"===(P=I)?"/":P);let j=!0===O.isDev||!X,F=X&&!j;U&&S&&(0,i.setManifestsSingleton)({page:h,clientReferenceManifest:S,serverActionsManifest:U});let q=e.method||"GET",D=(0,n.getTracer)(),H=D.getActiveScopeSpan(),M={params:L,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:j,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,s)=>O.onRequestError(e,t,a,s,y)},sharedContext:{buildId:w}},K=new d.NodeNextRequest(e),$=new d.NodeNextResponse(t),Y=l.NextRequestAdapter.fromNodeNextRequest(K,(0,l.signalFromNodeResponse)(t));try{let i=async e=>O.handle(Y,M).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=D.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${q} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${q} ${h}`)}),o=!!(0,s.getRequestMeta)(e,"minimalMode"),d=async s=>{var n,d;let l=async({previousCacheEntry:r})=>{try{if(!o&&_&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(s);e.fetchMetrics=M.renderOpts.fetchMetrics;let d=M.renderOpts.pendingWaitUntil;d&&a.waitUntil&&(a.waitUntil(d),d=void 0);let l=M.renderOpts.collectedTags;if(!X)return await (0,c.sendResponse)(K,$,n,M.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,a=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:h,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:_})},!1,y),t}},u=await O.handleResponse({req:e,nextConfig:f,cacheKey:P,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:o});if(!X)return null;if((null==u||null==(n=u.value)?void 0:n.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(d=u.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",_?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let N=(0,E.fromNodeOutgoingHttpHeaders)(u.value.headers);return o&&X||N.delete(R.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||N.get("Cache-Control")||N.set("Cache-Control",(0,T.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(K,$,new Response(u.value.body,{headers:N,status:u.value.status||200})),null};H?await d(H):await D.withPropagatedContext(e.headers,()=>D.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${h}`,kind:n.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},d))}catch(t){if(t instanceof N.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:_})},!1,y),X)throw t;return await (0,c.sendResponse)(K,$,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>C,"routeModule",()=>O,"serverHooks",()=>_,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>y],25366)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__4b6d1c19._.js.map