const encoder = new TextEncoder();
const loginRates = new Map();

// Response headers, credential checks, signed sessions, and data access helpers.
function headers(extra = {}) {
  return { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", ...extra };
}
function reply(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: headers({ "Content-Type": "application/json; charset=utf-8", ...extra }) });
}
function equal(a, b) {
  a=String(a); b=String(b); let diff=a.length^b.length;
  for(let i=0;i<Math.max(a.length,b.length);i++) diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return diff===0;
}
function configured(env) {
  return typeof env.ADMIN_USERNAME==="string" && env.ADMIN_USERNAME.length>=3 && env.ADMIN_USERNAME.length<=64 && typeof env.ADMIN_PASSWORD==="string" && env.ADMIN_PASSWORD.length>=6 && env.ADMIN_PASSWORD.length<=256;
}
function allowLogin(ip) {
  const now=Date.now(), recent=(loginRates.get(ip)||[]).filter(t=>now-t<15*60e3);
  if(recent.length>=10){loginRates.set(ip,recent);return false}
  recent.push(now); loginRates.set(ip,recent);
  if(loginRates.size>5000) loginRates.delete(loginRates.keys().next().value);
  return true;
}
async function digest(value) {
  const b=await crypto.subtle.digest("SHA-256",encoder.encode(value));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function sign(exp,env) {
  const raw=await crypto.subtle.digest("SHA-256",encoder.encode(`merkoo-admin-session-v1:${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD}`));
  const key=await crypto.subtle.importKey("raw",raw,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("HMAC",key,encoder.encode(`merkoo-admin-v1:${env.ADMIN_USERNAME}:${exp}`));
  return [...new Uint8Array(sig)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function authenticated(req,env) {
  if(!configured(env)) return false;
  const value=(req.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("merkoo_admin="))?.slice(13);
  if(!value) return false;
  const [exp,sig,extra]=value.split("."), now=Math.floor(Date.now()/1000), time=Number(exp);
  if(extra||!/^\d+$/.test(exp||"")||!Number.isSafeInteger(time)||time<=now||time>now+3600||! /^[a-f0-9]{64}$/.test(sig||"")) return false;
  return equal(await sign(exp,env),sig);
}
async function readJson(req) {
  const len=Number(req.headers.get("content-length")||0);
  if(!req.body||len>2048) return null;
  try { const text=await req.text(); if(text.length>2048)return null; const v=JSON.parse(text); return v&&typeof v==="object"&&!Array.isArray(v)?v:null; } catch { return null; }
}
async function doFetch(env,name,path,body={}) {
  const id=env.BOARD_DO.idFromName(name);
  return env.BOARD_DO.get(id).fetch(`https://do.internal${path}`,{method:"POST",body:JSON.stringify(body)});
}
// Admin page markup and browser-side dashboard behavior.
function html(nonce,logged) {
  const base=`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>مدیریت Merkoo</title><style>
  :root{color-scheme:dark;--bg:#090d13;--panel:#111923;--tile:#0b1119;--line:#283544;--text:#f5f7fa;--muted:#9aa8b8;--accent:#43d39a;--danger:#ff8d8d}*{box-sizing:border-box}body{margin:0;min-height:100dvh;padding:24px;background:radial-gradient(ellipse at 50% 0,#182733,var(--bg) 62%);color:var(--text);font:15px system-ui,-apple-system,"Segoe UI",sans-serif}.wrap{max-width:1050px;margin:auto}.panel{padding:22px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:0 20px 70px #0005;margin-bottom:16px}.login{width:min(100%,440px);margin:12vh auto}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.metric{min-height:112px;padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--tile);display:flex;flex-direction:column;justify-content:space-between;gap:14px}.metric span,.muted{color:var(--muted)}.metric strong{font-size:1.55rem;font-variant-numeric:tabular-nums}.wide{grid-column:span 3}.header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}h1{font-size:1.4rem;margin:0}h2{font-size:1.05rem;margin:0 0 14px}p{line-height:1.8}.btn{border:1px solid var(--line);border-radius:11px;padding:11px 16px;background:#17222e;color:var(--text);font:inherit;cursor:pointer}.primary{width:100%;background:var(--accent);color:#07120d;font-weight:800}label{display:grid;gap:8px;margin:14px 0;color:var(--muted)}input{height:48px;border:1px solid var(--line);border-radius:12px;background:#0b1119;color:var(--text);padding:0 12px;font:inherit;direction:ltr;text-align:left}.err{color:#ff9999;min-height:1.5em}.note{color:var(--muted);font-size:.86rem;margin-top:16px}.toolbar{display:flex;gap:10px;margin-bottom:12px}.toolbar input{flex:1;direction:rtl;text-align:right}.user-list{display:grid;gap:8px}.user-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;text-align:right;width:100%;padding:13px;border:1px solid var(--line);border-radius:13px;background:var(--tile);color:var(--text);font:inherit;cursor:pointer}.user-row:hover{border-color:var(--accent)}.user-name{font-weight:800}.user-meta{color:var(--muted);font-size:.82rem;margin-top:4px;overflow-wrap:anywhere}.badge{align-self:center;color:var(--accent);white-space:nowrap}.detail{margin-top:16px;padding:16px;border:1px solid var(--line);border-radius:16px;background:#0d141d}.detail-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.data-section{margin-top:18px}.data-section h3{font-size:.95rem;margin:0 0 9px}.data-card{padding:11px;margin:7px 0;background:#111923;border:1px solid var(--line);border-radius:11px}.data-line{color:var(--muted);font-size:.83rem;margin-top:5px;overflow-wrap:anywhere}.data-title{font-weight:700;overflow-wrap:anywhere}.status{color:var(--muted);font-size:.85rem;margin:12px 0}.hidden{display:none!important}.danger{color:var(--danger)}@media(max-width:620px){body{padding:14px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.metric{min-height:100px;padding:13px}.metric strong{font-size:1.3rem}.wide{grid-column:span 2}.panel{padding:14px}.toolbar{flex-direction:column}.user-row{grid-template-columns:1fr}.badge{justify-self:start}}</style></head><body>`;
  if(!logged) return `${base}<main class="panel login"><h1>ورود به پنل مدیریت</h1><p class="muted">برای دیدن آمار Merkoo وارد شو.</p><form id="login"><label>نام کاربری<input name="username" autocomplete="username" required minlength="3" maxlength="64"></label><label>رمز عبور<input name="password" type="password" autocomplete="current-password" required minlength="6" maxlength="256"></label><button class="btn primary">ورود امن</button><p class="err" id="error"></p></form><p class="note">نشست ورود پس از یک ساعت منقضی می‌شود.</p></main><script nonce="${nonce}">document.querySelector('#login').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('button'),m=document.querySelector('#error');b.disabled=true;m.textContent='';try{const r=await fetch('/api/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:f.elements.username.value,password:f.elements.password.value})});if(!r.ok){m.textContent=r.status===429?'تعداد تلاش زیاد است؛ ۱۵ دقیقه دیگر امتحان کن.':r.status===503?'Secrets ورود را روی Worker پنل تنظیم کن.':'نام کاربری یا رمز اشتباه است.';b.disabled=false;return}location.replace('/admin')}catch{m.textContent='ارتباط برقرار نشد.';b.disabled=false}};</script></body></html>`;
  return `${base}<main class="wrap"><header class="header"><div><h1>مدیریت Merkoo</h1><p class="muted">بازدیدها، کاربران و فعالیت‌های ثبت‌شده</p></div><button class="btn" id="logout">خروج امن</button></header><section class="panel"><div class="grid"><div class="metric"><span>کل بازشدن‌ها</span><strong id="visits">—</strong></div><div class="metric"><span>بازدیدکننده یکتا</span><strong id="unique">—</strong></div><div class="metric"><span>کاربران شناسایی‌شده</span><strong id="members">—</strong></div><div class="metric wide"><span>آخرین بازدید</span><strong id="last">—</strong></div></div><p class="status" id="status">در حال دریافت آمار…</p></section><section class="panel"><h2>کاربران و فعالیت‌ها</h2><div class="toolbar"><input id="search" type="search" placeholder="جستجو با نام، نام کاربری یا شناسه تلگرام"><button class="btn" id="searchBtn">جستجو</button></div><div class="status" id="usersStatus">در حال بارگذاری کاربران…</div><div class="user-list" id="userList"></div><button class="btn hidden" id="more">نمایش کاربران بیشتر</button><section class="detail hidden" id="detail"></section></section><p class="note">بازدید تفکیکی و شناسهٔ تلگرام از زمان فعال‌شدن این نسخه ثبت می‌شود. بعضی رخدادهای قدیمی فقط در تاریخچهٔ فعلی فهرست‌ها مانده‌اند.</p></main><script nonce="${nonce}">
  const fmt=new Intl.NumberFormat('fa-IR'), dateFmt=new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'});fetch('/api/data',{cache:'no-store'}).then(async r=>{if(r.status===401){location.replace('/admin');return null}if(!r.ok)throw Error();return r.json()}).then(d=>{if(!d)return;document.getElementById('visits').textContent=fmt.format(d.opens_total||0);document.getElementById('unique').textContent=fmt.format(d.unique_visitors||0);document.getElementById('members').textContent=fmt.format(d.users_total||0);document.getElementById('last').textContent=d.last_visit_at?dateFmt.format(new Date(d.last_visit_at)):'هنوز بازدیدی ثبت نشده';document.getElementById('status').textContent='آمار کل مینی‌اپ'}).catch(()=>document.getElementById('status').textContent='گرفتن آمار ناموفق بود.');document.getElementById('logout').onclick=async()=>{await fetch('/api/logout',{method:'POST'});location.replace('/admin')};
  const list=document.getElementById('userList'), more=document.getElementById('more'), state=document.getElementById('usersStatus'), search=document.getElementById('search');let offset=0,total=0,busy=false,query='';function addText(parent,tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text||'';parent.append(e);return e}function renderUsers(rows,append){if(!append)list.replaceChildren();for(const u of rows){const b=document.createElement('button');b.type='button';b.className='user-row';const left=document.createElement('span');addText(left,'span','user-name',u.name||'بدون نام');addText(left,'span','user-meta',(u.username?'@'+u.username+' · ':'')+'ID: '+u.id);b.append(left);addText(b,'span','badge',fmt.format(u.visits||0)+' بازدید');b.onclick=()=>showUser(u.id);list.append(b)}}async function loadUsers(reset=false){if(busy)return;if(reset){offset=0;query=search.value.trim();list.replaceChildren()}busy=true;state.textContent='در حال دریافت کاربران…';try{const r=await fetch('/api/users?offset='+offset+'&limit=50&q='+encodeURIComponent(query),{cache:'no-store'});if(r.status===401){location.replace('/admin');return}if(!r.ok)throw Error();const d=await r.json();total=d.total||0;renderUsers(d.users||[],offset>0);offset+=d.users.length;state.textContent=fmt.format(total)+' کاربر';more.classList.toggle('hidden',offset>=total||!d.users.length)}catch{state.textContent='فهرست کاربران بارگذاری نشد.'}finally{busy=false}}async function showUser(id){const box=document.getElementById('detail');box.classList.remove('hidden');box.textContent='در حال دریافت اطلاعات کاربر…';box.scrollIntoView({behavior:'smooth',block:'start'});try{const r=await fetch('/api/user?id='+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json(),u=d.user;box.replaceChildren();const head=document.createElement('div');head.className='detail-head';const info=document.createElement('div');addText(info,'h2','',u.name||'بدون نام');addText(info,'div','data-line','شناسه تلگرام: '+u.id+(u.username?' · @'+u.username:''));addText(info,'div','data-line','بازدید: '+fmt.format(u.visits||0)+' · اولین بازدید: '+(u.first_visit_at?dateFmt.format(new Date(u.first_visit_at)):'—')+' · آخرین بازدید: '+(u.last_visit_at?dateFmt.format(new Date(u.last_visit_at)):'—'));head.append(info);const close=document.createElement('button');close.className='btn';close.textContent='بستن';close.onclick=()=>box.classList.add('hidden');head.append(close);box.append(head);for(const board of d.boards||[]){const section=document.createElement('section');section.className='data-section';addText(section,'h3','', 'فهرست '+board.id+' · '+(board.categories||[]).join('، '));const st=board.settings||{},ba=board.analytics||{};addText(section,'div','data-line','تنظیمات: '+(st.language||'—')+' · '+(st.currency||'—')+' · بانک قیمت '+(st.use_catalog?'روشن':'خاموش')+' · نمایش واحد '+(st.show_unit_badge?'روشن':'خاموش')+' · اجازه ویرایش همکار '+(st.partner_can_edit?'روشن':'خاموش')+' · دکمه‌های گفتگو '+(st.show_chat_buttons?'روشن':'خاموش'));addText(section,'div','data-line','بازدیدهای این فهرست: '+fmt.format(ba.opens_total||0)+' · بازدیدکننده یکتا: '+fmt.format(ba.unique_visitors||0)+(ba.last_visit_at?' · آخرین بازدید: '+dateFmt.format(new Date(ba.last_visit_at)):''));const items=[...(board.items||[]).map(x=>({kind:'محصول',x})),...(board.tasks||[]).map(x=>({kind:'کار',x}))];if(items.length){for(const item of items){const card=document.createElement('div');card.className='data-card';addText(card,'div','data-title',item.kind+': '+(item.x.title||''));addText(card,'div','data-line','تعداد: '+(item.x.count??'—')+' '+(item.x.unit||'')+' · مقدار: '+(item.x.qty||'—')+' · قیمت: '+fmt.format(item.x.price||0)+' · '+(item.x.done?'انجام‌شده':'باز'));section.append(card)}}else addText(section,'div','data-line','محصول یا کاری ثبت نشده');if(board.catalog&&board.catalog.length){addText(section,'h3','','بانک قیمت');for(const c of board.catalog)addText(section,'div','data-line',(c.title||'')+' · '+fmt.format(c.price||0)+' '+(c.unit||'')+' · '+(c.category||''))}if(board.partners&&board.partners.length){addText(section,'h3','','همکاران');for(const p of board.partners)addText(section,'div','data-line',(p.name||'بدون نام')+' · ID: '+p.id+' · '+(p.can_edit?'ویرایشگر':'فقط مشاهده'))}if(board.blocked_ids&&board.blocked_ids.length)addText(section,'div','data-line','شناسه‌های مسدود: '+board.blocked_ids.join('، '));box.append(section)}const events=document.createElement('section');events.className='data-section';addText(events,'h3','','رخدادها و حذف‌ها ('+fmt.format((d.events||[]).length)+')');if(d.events&&d.events.length){for(const ev of d.events){const card=document.createElement('div');card.className='data-card';const labels={added:'افزود',edited:'ویرایش',deleted:'حذف',bought:'خرید',unbought:'لغو خرید',audit:'مدیریتی'};addText(card,'div','data-title',(labels[ev.type]||ev.type)+' · '+(ev.title||'بدون عنوان'));addText(card,'div','data-line',(ev.ts?dateFmt.format(new Date(ev.ts)):'')+(ev.board_id?' · فهرست '+ev.board_id:'')+(ev.action?' · '+ev.action:'')+(ev.listType?' · '+(ev.listType==='tasks'?'کارها':'خرید'):'')+(ev.category?' · '+ev.category:''));if(ev.qty)addText(card,'div','data-line','مقدار: '+ev.qty);if(ev.count!==undefined)addText(card,'div','data-line','تعداد: '+fmt.format(ev.count||0)+' '+(ev.unit||'')+(ev.price?' · قیمت: '+fmt.format(ev.price):''));if(ev.details){if(ev.action==='wipe_all'){addText(card,'div','data-line','حذف شد: '+fmt.format(ev.details.itemCount||0)+' محصول و '+fmt.format(ev.details.taskCount||0)+' کار');const removed=[...(ev.details.items||[]),...(ev.details.tasks||[])];if(removed.length)addText(card,'div','data-line',removed.join('، '))}else if(ev.action==='clear_history')addText(card,'div','data-line','رخدادهای قبلی پاک‌شده: '+fmt.format(ev.details.eventCount||0));else if(ev.details.targetId)addText(card,'div','data-line','شناسه همکار: '+ev.details.targetId+(ev.details.targetName?' · '+ev.details.targetName:''))}if(ev.legacy)addText(card,'div','data-line','این رخداد قدیمی است و شناسهٔ ثبت‌کننده در آن ذخیره نشده بود.');events.append(card)}}else addText(events,'div','data-line','برای این کاربر رخدادی در تاریخچهٔ موجود پیدا نشد.');box.append(events)}catch{box.textContent='گرفتن اطلاعات این کاربر ناموفق بود.'}}document.getElementById('searchBtn').onclick=()=>loadUsers(true);search.onkeydown=e=>{if(e.key==='Enter')loadUsers(true)};more.onclick=()=>loadUsers(false);loadUsers(true);
  </script></body></html>`;
}

// Admin-only HTTP routes. Keep data routes behind the signed-session checks.
export default { async fetch(request,env) {
  const url=new URL(request.url), origin=String(env.ADMIN_ORIGIN||"").replace(/\/$/,"");
  if(!origin||url.origin!==origin)return new Response("Not found",{status:404,headers:headers()});
  if(url.pathname==="/admin"&&request.method==="GET"){
    const nonce=crypto.randomUUID().replaceAll("-","");
    return new Response(html(nonce,await authenticated(request,env)),{headers:headers({"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":`default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`})});
  }
  if(url.pathname==="/api/login"&&request.method==="POST"){
    if(request.headers.get("Origin")!==origin)return reply({error:"forbidden"},403);
    if(!configured(env))return reply({error:"not_configured"},503);
    if(!(request.headers.get("Content-Type")||"").toLowerCase().startsWith("application/json"))return reply({error:"invalid"},415);
    const data=await readJson(request);if(!data)return reply({error:"invalid"},400);
    const ip=request.headers.get("CF-Connecting-IP")||"unknown";
    if(!allowLogin(ip))return reply({error:"rate_limited"},429);
    const ipHash=await digest(`merkoo-admin-ip:${ip}:${env.ADMIN_PASSWORD}`);
    try { const attempt=await doFetch(env,"app_analytics","/do/admin-auth-attempt",{ipHash}); if(!attempt.ok||!(await attempt.json()).allowed)return reply({error:"rate_limited"},429); } catch { return reply({error:"rate_limited"},429); }
    if(!equal(await digest(String(data.username||"")),await digest(env.ADMIN_USERNAME))||!equal(await digest(String(data.password||"")),await digest(env.ADMIN_PASSWORD)))return reply({error:"invalid_credentials"},401);
    const exp=String(Math.floor(Date.now()/1000)+3600),signature=await sign(exp,env);
    return reply({ok:true},200,{"Set-Cookie":`merkoo_admin=${exp}.${signature}; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Strict`});
  }
  if(url.pathname==="/api/logout"&&request.method==="POST"){
    if(request.headers.get("Origin")!==origin)return reply({error:"forbidden"},403);
    if(!(await authenticated(request,env)))return reply({error:"unauthorized"},401);
    return new Response(null,{status:204,headers:headers({"Set-Cookie":"merkoo_admin=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict"})});
  }
  if(url.pathname==="/api/data"&&request.method==="GET"){
    if(!(await authenticated(request,env)))return reply({error:"unauthorized"},401);
    try{
      const ar=await doFetch(env,"app_analytics","/do/analytics-get",{limit:1,offset:0});
      if(!ar.ok)return reply({error:"data_unavailable"},503);
      const analytics=(await ar.json()).data||{};
      return reply({opens_total:Number(analytics.opens_total)||0,unique_visitors:Number(analytics.unique_visitors)||0,last_visit_at:Number(analytics.last_visit_at)||0,users_total:Number(analytics.users_total)||0});
    }catch{return reply({error:"data_unavailable"},503)}
  }
  if(url.pathname==="/api/users"&&request.method==="GET"){
    if(!(await authenticated(request,env)))return reply({error:"unauthorized"},401);
    const offset=Math.max(0,Math.min(5000,Number.parseInt(url.searchParams.get("offset")||"0",10)||0));
    const limit=Math.max(1,Math.min(100,Number.parseInt(url.searchParams.get("limit")||"50",10)||50));
    const q=String(url.searchParams.get("q")||"").slice(0,80);
    try{
      const res=await doFetch(env,"app_analytics","/do/analytics-get",{offset,limit,q});
      if(!res.ok)return reply({error:"data_unavailable"},503);
      const data=(await res.json()).data||{};
      return reply({users:Array.isArray(data.users)?data.users:[],total:Number(data.users_total)||0,offset,limit});
    }catch{return reply({error:"data_unavailable"},503)}
  }
  if(url.pathname==="/api/user"&&request.method==="GET"){
    if(!(await authenticated(request,env)))return reply({error:"unauthorized"},401);
    const userId=String(url.searchParams.get("id")||"");
    if(!/^\d{1,16}$/.test(userId))return reply({error:"invalid_user"},400);
    try{
      const profileRes=await doFetch(env,"app_analytics","/do/analytics-user-get",{userId});
      if(!profileRes.ok)return reply({error:"data_unavailable"},503);
      const user=(await profileRes.json()).data;
      if(!user)return reply({error:"not_found"},404);
      const boardIds=Array.isArray(user.board_ids)?[...new Set(user.board_ids.map(String).filter(id=>/^-?\d{1,16}$/.test(id)))].slice(0,100):[];
      const results=await Promise.all(boardIds.map(async boardId=>{
        try{
          const res=await doFetch(env,`board_${boardId}`,"/do/get");if(!res.ok)return null;
          const board=(await res.json()).data;if(!board)return null;
          const events=(Array.isArray(board.history)?board.history:[]).filter(ev=>String(ev.userId||"")===userId||(!ev.userId&&(String(ev.user||"")===String(user.name||"")||String(ev.user||"")===String(user.first_name||"")))).map(ev=>({...ev,board_id:boardId,legacy:!ev.userId}));
          return {id:boardId,categories:Array.isArray(board.categories)?board.categories:[],settings:{language:board.lang,currency:board.currency,use_catalog:Boolean(board.use_catalog),show_unit_badge:Boolean(board.show_unit_badge),sort:board.cat_sort,partner_can_edit:Boolean(board.partner_can_edit)},analytics:{opens_total:Number(board.analytics&&board.analytics.opens_total)||0,unique_visitors:Array.isArray(board.analytics&&board.analytics.unique_visitors)?board.analytics.unique_visitors.length:0,last_visit_at:Number(board.analytics&&board.analytics.last_visit_at)||0},items:(Array.isArray(board.items)?board.items:[]).map(x=>({title:x.title,qty:x.qty,count:x.count,unit:x.unit,price:x.price,category:x.category,done:Boolean(x.done)})),tasks:(Array.isArray(board.tasks)?board.tasks:[]).map(x=>({title:x.title,qty:x.qty,done:Boolean(x.done)})),catalog:(Array.isArray(board.catalog)?board.catalog:[]).map(x=>({title:x.title,price:x.price,unit:x.unit,category:x.category})),partners:Object.entries(board.active_partners||{}).map(([id,p])=>({id,name:p&&p.name||"",can_edit:Boolean(p&&p.can_edit)})),blocked_ids:Array.isArray(board.blocked_partners)?board.blocked_partners:[],events};
        }catch{return null}
      }));
      const boards=results.filter(Boolean),events=boards.flatMap(b=>b.events).sort((a,b)=>Number(b.ts||0)-Number(a.ts||0)).slice(0,1000);
      const audits=Array.isArray(user.audit_events)?user.audit_events:[];
      return reply({user,boards:boards.map(({events,...board})=>board),events:[...events,...audits].sort((a,b)=>Number(b.ts||0)-Number(a.ts||0)).slice(0,1000)});
    }catch{return reply({error:"data_unavailable"},503)}
  }
  return new Response("Not found",{status:404,headers:headers()});
} };

