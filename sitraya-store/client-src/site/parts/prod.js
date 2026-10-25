// =====================================================================
// PRODUCTION LAYER — connects the approved design to the real server.
// Everything above this line is the demo UI; these definitions replace
// the demo's browser-only storage with secure server calls.
// =====================================================================
var BOOT = (function(){ try{ return JSON.parse(document.getElementById("boot").textContent); }catch(e){ return null; } })() || {};
var ROUTE = BOOT.route || {kind:"home"};

Object.assign(T.bn, {news_ok:"ধন্যবাদ! নতুন কিছু এলেই আপনাকে জানাব।", net_err:"ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।", srv_err:"সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।", placing:"অর্ডার পাঠানো হচ্ছে…", pay_off:"এই পেমেন্ট পদ্ধতি এখন চালু নেই", rate_limited:"অনেকবার চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।", cp_checking:"কুপন যাচাই হচ্ছে…"});
Object.assign(T.bn, {f_trx:"ট্রানজেকশন আইডি (TrxID)", signin_soon:"কাস্টমার অ্যাকাউন্ট শীঘ্রই আসছে", cp_min2:"এই কুপনের জন্য অর্ডার আরও বড় হতে হবে"});
Object.assign(T.en, {f_trx:"Transaction ID (TrxID)", signin_soon:"Customer accounts are coming soon", cp_min2:"Your order is below this coupon's minimum"});
Object.assign(T.en, {news_ok:"Thank you! We'll let you know when something new arrives.", net_err:"No internet connection. Please try again.", srv_err:"The server had a problem. Please try again in a moment.", placing:"Sending your order…", pay_off:"This payment method is not available right now", rate_limited:"Too many attempts. Please try again in a few minutes.", cp_checking:"Checking coupon…"});

// ---------- images: built-in pictures, uploaded files (/m/…) and https links ----------
I = function(k){ if(!k) return ""; k = String(k); if(/^(data:|blob:|https:|\/)/.test(k)) return k;
  // the first shop's cover photo is never shown under another shop name
  if(k === "cover" && typeof isOrigBrand === "function" && !isOrigBrand()) return brandCover();
  return IMG[k] || ""; };

// ---------- server helper ----------
function api(method, path, body){
  var opt = {method:method, credentials:"same-origin", headers:{"x-sitraya":"1"}};
  if(body !== undefined){ opt.headers["content-type"] = "application/json"; opt.body = JSON.stringify(body); }
  return fetch(path, opt).then(function(r){
    return r.json().catch(function(){ return {}; }).then(function(j){
      if(!r.ok){ var e = new Error(j.error || ("Error " + r.status)); e.code = j.code || ""; e.status = r.status; throw e; }
      return j;
    });
  }, function(){ var e = new Error(t("net_err")); e.code = "net"; e.status = 0; throw e; });
}
function errText(e){ if(!e) return t("srv_err"); if(e.code === "net") return t("net_err"); if(e.code && T[L][e.code]) return t(e.code); return e.message || t("srv_err"); }

// ---------- data: comes from the server, not from browser storage ----------
function initDB(){
  if(typeof BOOT === "undefined" || !BOOT){ try{ BOOT = JSON.parse(document.getElementById("boot").textContent); }catch(e){ BOOT = {}; } }
  DB = {v:4, cfg:BOOT.cfg || clone(DEF), products:BOOT.products || [], categories:BOOT.categories || [], orders:[], moves:[], notifs:[], log:[], reviews:[], coupons:[], admins:[], views:BOOT.views || {},
    settings:Object.assign({store:{phone:"", whatsapp:"", email:"", addr:{bn:"", en:""}}, pay:{cod:{on:true}}, lowStock:3, notif:{order:true, stock:true, cancel:true, review:true}, meta:{pixel:"", pixelOn:false, events:{}}}, BOOT.settings || {})};
  ["bkash","nagad","rocket"].forEach(function(k){ DB.settings.pay[k] = DB.settings.pay[k] || {on:false, num:""}; });
  cfg = DB.cfg; P = DB.products; CATS = DB.categories; reindex();
}
initDB();
cart = (store.get("st3_cart", []) || []).filter(function(l){ return BY[l.id] && BY[l.id].status === "active"; });
function reloadDB(){ return false; }
function saveCfg(){ if(adminMode && A.logged) scheduleSync(); return true; }
function saveDB(){ saveCfg(); }
function loadVideos(done){ done(0); }
function saveVideoFile(){ toast("Paste a YouTube or Facebook link instead", "Video files are not uploaded to keep the website fast"); }
function productLink(p){ var d = String((DB.settings.store || {}).domain || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, ""); return (d ? "https://" + d : location.origin) + "/p/" + encodeURIComponent(p.id); }
function refreshBoot(){ return api("GET", "/api/boot").then(function(b){ BOOT.products = b.products; BOOT.categories = b.categories; BOOT.cfg = b.cfg; BOOT.settings = b.settings; if(!adminMode){ initDB(); renderAll(true); } }).catch(function(){}); }

// ---------- images are resized in the browser, then uploaded ----------
function readImg(file, maxW, cb){
  if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){ toast("Please choose an image file", "PNG / JPG / WebP"); return; }
  var r = new FileReader();
  r.onload = function(){ var im = new Image(); im.onload = function(){
    var s = Math.min(1, maxW / im.width), c = document.createElement("canvas");
    c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    var fmt = typeof imgFormat === "function" ? imgFormat(file.type === "image/png") : (file.type === "image/png" ? "image/png" : "image/jpeg");
    var data = c.toDataURL(fmt, fmt === "image/png" ? undefined : .86);
    toast("Uploading…", file.name);
    api("POST", "/api/admin/media", {data:data}).then(function(res){ cb(res.url); toast("Image uploaded", file.name); }, function(e){ toast("Upload failed", errText(e)); });
  }; im.onerror = function(){ toast("That image could not be read", "Try another file"); }; im.src = r.result; };
  r.readAsDataURL(file);
}

// ---------- checkout: the server decides prices, delivery and stock ----------
function readCookie(n){ var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; }
function placeOrder(){
  if(placing) return;
  zoneFromForm();
  if(clampCart()){ bagView = "cart"; renderCart(); return; }
  if(!validateCo()){ renderCart(); var f = $("#bagBody .cf.bad input, #bagBody .cf.bad textarea"); if(f) f.focus(); return; }
  if(coupon){ var cc = couponCheck(coupon, totals().sub); if(!cc || !cc.ok){ coupon = ""; DB.coupons = []; renderCart(); if(cc && cc.msg) toast(cc.msg, ""); return; } }
  placing = true; var btn = $("#checkout"); btn.disabled = true; var lbl = btn.querySelector("span"), old = lbl ? lbl.textContent : ""; if(lbl) lbl.textContent = t("placing");
  var body = {items:cart.map(function(l){ return {pid:l.id, size:String(l.size), color:l.color, qty:l.qty}; }),
    customer:{name:form.name.trim(), phone:form.phone, wa:form.wa, district:form.district.trim(), area:form.area.trim(), po:String(form.po || "").trim(), addr:form.addr.trim(), note:form.note.trim()},
    pay:form.pay, trx:form.pay === "cod" ? "" : form.trx.trim(), coupon:coupon || "", lang:L, fbp:readCookie("_fbp"), fbc:readCookie("_fbc"), sid:(typeof sid === "function" ? sid() : "")};
  api("POST", "/api/orders", body).then(function(res){
    var o = res.order;
    o.customer.wa = form.wa; o.history = [{s:"received", at:o.at}];
    o.items.forEach(function(x){ var p = BY[x.pid], v = p && variantOf(p, x.size, x.color); if(v) v.stock = Math.max(0, v.stock - x.qty); });
    cart = []; coupon = ""; form.trx = ""; form.note = ""; saveCart();
    try{ localStorage.removeItem("st_cphone"); }catch(x){}
    lastOrder = o; bagView = "done"; placing = false; btn.disabled = false; if(lbl) lbl.textContent = old;
    renderCart(); renderGrids(); renderTop(); doneExtras(o);
    fbTrack("Purchase", {value:o.total, currency:"BDT", content_type:"product", content_ids:o.items.map(function(x){ return x.pid; }), num_items:o.items.reduce(function(a, x){ return a + x.qty; }, 0)}, o.ref);
  }, function(e){
    placing = false; btn.disabled = false; if(lbl) lbl.textContent = old;
    if(e.code === "stock_changed"){ refreshBoot().then(function(){ initDB(); renderAll(true); clampCart(); bagView = "cart"; renderCart(); }); toast(t("stock_fix"), e.message); return; }
    if(e.code === "e_phone"){ coErr.phone = t("e_phone"); renderCart(); return; }
    if(e.code === "e_trx"){ coErr.trx = t("e_trx"); renderCart(); return; }
    if(/^cp_/.test(e.code)){ coupon = ""; DB.coupons = []; renderCart(); toast(t(e.code === "cp_min" ? "cp_min2" : e.code), ""); return; }
    toast(errText(e), "");
  });
}
// coupons are looked up on the server, then shown in the bag
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-cpap]"); if(!b || adminMode) return;
  e.preventDefault(); e.stopImmediatePropagation();
  var code = ($("#cpIn").value || "").trim().toUpperCase(); if(!code) return;
  if(!/^[A-Z0-9]{1,16}$/.test(code)){ coupon = code; DB.coupons = []; renderCart(); return; }
  b.disabled = true;
  api("GET", "/api/coupons/" + encodeURIComponent(code)).then(function(r){ DB.coupons = [Object.assign({active:true, expires:0, maxUses:0, uses:0}, r.coupon)]; coupon = code; renderCart(); }, function(err){ DB.coupons = []; coupon = code; renderCart(); if(err.code !== "cp_bad") toast(errText(err), ""); });
}, true);

// ---------- order tracking ----------
function runTrack(){
  var ref = $("#trkRef").value.trim().toUpperCase(), ph = $("#trkPh").value;
  if(!ref || !normPhone(ph)){ $("#trkRes").innerHTML = '<p class="tk-nf">'+ic("info")+esc(t("trk_nf"))+'</p>'; return; }
  $("#trkRes").innerHTML = '<p class="tk-nf" style="background:#F5F3EF;color:#555">…</p>';
  api("POST", "/api/track", {ref:ref, phone:ph}).then(function(r){
    var o = r.order, at = {}; o.history.forEach(function(h){ at[h.s] = h.at; });
    var steps = FLOW_S.slice(); if(o.status === "cancelled") steps = ["received","cancelled"]; if(o.status === "returned") steps = FLOW_S.concat(["returned"]);
    var curI = steps.indexOf(o.status);
    var dt = function(ts){ try{ return digits(new Date(ts).toLocaleString(L === "bn" ? "bn-BD" : "en-GB", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Dhaka"})); }catch(x){ return ""; } };
    $("#trkRes").innerHTML = '<div class="tk-card"><div class="tk-top"><b>'+esc(o.ref)+'</b><span>'+money(o.total)+' · '+esc(t("pay_status"))+': '+esc(t("ps_" + o.payStatus))+'</span></div><ol class="tl">'
      + steps.map(function(s, i){ var done = i <= curI, bad = s === "cancelled" || s === "returned"; return '<li class="'+(done ? 'done' : '')+(i === curI ? ' cur' : '')+(bad ? ' bad' : '')+'"><i></i><span><b>'+esc(t("s_" + s))+'</b>'+(at[s] ? '<small>'+esc(dt(at[s]))+'</small>' : '')+'</span></li>'; }).join("")
      + '</ol>' + (o.courier ? '<p class="tk-c">'+ic("truck")+esc(t("courier"))+': <b>'+esc(o.courier)+'</b>'+(o.tracking ? ' · '+esc(t("tracking_no"))+': <b>'+esc(o.tracking)+'</b>' : '')+'</p>' : '') + '</div>';
  }, function(e){ $("#trkRes").innerHTML = '<p class="tk-nf">'+ic("info")+esc(e.status === 404 ? t("trk_nf") : errText(e))+'</p>'; });
}

// ---------- newsletter ----------
$("#nlForm").addEventListener("submit", function(e){
  e.preventDefault(); e.stopImmediatePropagation();
  var v = $("#nlEmail").value.trim(), m = $("#nlMsg");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ m.style.color = "#B42318"; m.textContent = t("news_bad"); return; }
  api("POST", "/api/subscribe", {email:v, lang:L}).then(function(){ m.style.color = ""; m.textContent = t("news_ok"); $("#nlEmail").value = ""; }, function(err){ m.style.color = "#B42318"; m.textContent = errText(err); });
}, true);

// ---------- Meta Pixel (only when switched on in Admin → Meta) ----------
var fbOn = false;
function fbInit(){
  var m = (DB.settings || {}).meta || {};
  if(adminMode || !m.pixelOn || !/^\d{15,16}$/.test(m.pixel || "")) return;
  var n = window.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
  if(!window._fbq) window._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  var s = document.createElement("script"); s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(s);
  window.fbq("init", m.pixel); fbOn = true;
  fbTrack("PageView");
}
function fbTrack(name, data, eventID){
  if(!fbOn || !window.fbq) return;
  var ev = ((DB.settings || {}).meta || {}).events || {};
  if(ev[name] === false) return;
  if(name === "PageView") return window.fbq("track", "PageView");
  window.fbq("track", name, data || {}, eventID ? {eventID:eventID} : undefined);
}
(function(){
  var pmEl = $("#pm"), seen = "";
  if(window.MutationObserver) new MutationObserver(function(){ if(pmEl.classList.contains("on") && pm.id && pm.id !== seen){ seen = pm.id; var p = BY[pm.id]; if(p) fbTrack("ViewContent", {content_ids:[p.id], content_type:"product", value:price(p), currency:"BDT"}); } if(!pmEl.classList.contains("on")) seen = ""; }).observe(pmEl, {attributes:true, attributeFilter:["class"]});
  document.addEventListener("click", function(e){
    if(adminMode) return;
    var b = e.target.closest("#pmAdd,#pmBuy"); if(b && pm.id && BY[pm.id]){ var p = BY[pm.id]; fbTrack("AddToCart", {content_ids:[p.id], content_type:"product", value:price(p) * (pm.qty || 1), currency:"BDT"}); }
    if(e.target.closest("#checkout") && bagView === "cart" && cart.length){ var s = totals(); fbTrack("InitiateCheckout", {value:s.tot, currency:"BDT", num_items:s.n}); }
  }, true);
  var st; $("#q").addEventListener("input", function(){ clearTimeout(st); var q = $("#q").value.trim(); if(q.length > 1) st = setTimeout(function(){ fbTrack("Search", {search_string:q}); }, 1500); });
})();

// =====================================================================
// ADMIN (the panel at /admin)
// =====================================================================
adminMode = ROUTE.kind === "admin";
A.logged = false;
function goAdmin(on){ location.href = on ? "/admin" : "/"; }
var AREA = {site2:"settings", carts:"orders", dashboard:"dashboard", orders:"orders", products:"products", inventory:"inventory", categories:"products", customers:"orders", coupons:"coupons", reviews:"products", site:"site", settings:"settings", pages:"site", notifications:"dashboard", meta:"settings", users:"users", log:"log"};
var PERMS2 = {orders:[["Super Admin","Administrator","Order Manager"],["Read-only Analyst"]], products:[["Super Admin","Administrator","Product Manager"],["Inventory Manager","Read-only Analyst"]], inventory:[["Super Admin","Administrator","Product Manager","Inventory Manager"],["Order Manager","Read-only Analyst"]], site:[["Super Admin","Administrator","Content Manager"],[]], coupons:[["Super Admin","Administrator","Product Manager"],["Read-only Analyst"]], settings:[["Super Admin","Administrator"],[]], users:[["Super Admin"],[]], log:[["Super Admin","Administrator"],[]], dashboard:[["Super Admin","Administrator","Order Manager","Product Manager","Inventory Manager","Content Manager","Read-only Analyst"],[]]};
function canDo(area, edit){ var r = DB.me ? DB.me.role : ""; var p = PERMS2[area]; return !!p && (p[0].indexOf(r) > -1 || (!edit && p[1].indexOf(r) > -1)); }
var NAV0 = NAV.map(function(g){ return [g[0], g[1].filter(function(k){ return k !== "reviews"; })]; });
POPK.unshift([/^Change password/, "lock", "Your account · আপনার অ্যাকাউন্ট"], [/temporary password/i, "lock", "Team · টিম"], [/^Invoice/, "copy", "Copy & share · কপি করুন"]);
function liveSave(label){ clearTimeout(sTimer); sTimer = setTimeout(function(){ saveDB(); }, 600); }
function applyRoleNav(){
  NAV.length = 0;
  NAV0.forEach(function(g){ var items = g[1].filter(function(k){ return canDo(AREA[k] || "dashboard", false); }); if(items.length) NAV.push([g[0], items]); });
  if(!canDo(AREA[A.page] || "dashboard", false)) A.page = "dashboard";
  ["orders","products","inventory","site","coupons","settings","users"].forEach(function(ar){ document.body.classList.toggle("no-edit-" + ar, !canDo(ar, true)); });
}

// ---- load everything the panel needs ----
var SNAP = null;
function sigP(p){ return JSON.stringify(p); }
function sigO(o){ return JSON.stringify([o.payStatus, o.courier, o.tracking, o.notes]); }
function cpBody(c){ return {code:c.code, type:c.type, value:+c.value, min:+c.min || 0, maxUses:+c.maxUses || 0, expires:+c.expires || 0, active:!!c.active}; }
function sigS(s){ var c = clone(s); if(c.meta) delete c.meta.token; delete c.telegramToken; delete c.hasMetaToken; delete c.hasTelegramToken; return JSON.stringify(c); }
function takeSnap(){
  SNAP = {cfg:JSON.stringify(DB.cfg), categories:JSON.stringify(DB.categories), settings:sigS(DB.settings), products:{}, orders:{}, coupons:{}, admins:{}, read:{}};
  DB.products.forEach(function(p){ SNAP.products[p.id] = sigP(p); });
  DB.orders.forEach(function(o){ SNAP.orders[o.ref] = sigO(o); });
  DB.coupons.forEach(function(c){ c._code = c.code; SNAP.coupons[c.code] = JSON.stringify(cpBody(c)); });
  DB.admins.forEach(function(u){ SNAP.admins[u.id] = JSON.stringify([u.role, u.active]); });
  DB.notifs.forEach(function(n){ if(n.read) SNAP.read[n.id] = 1; });
}
var lastPoll = 0;
function loadAdminData(){
  return api("GET", "/api/admin/data").then(function(d){
    DB = d; DB.settings.meta.token = ""; DB.settings.telegramToken = ""; DB.versions = d.versions || {};
    cfg = DB.cfg; P = DB.products; CATS = DB.categories; reindex(); pagesCfg();
    DB.coupons.forEach(function(c){ c._code = c.code; });
    takeSnap(); lastPoll = Date.now();
    A.logged = true; applyRoleNav();
  });
}

// ---- send changes to the server (called after every edit) ----
var syncTimer = null, syncChain = Promise.resolve(), syncBusy = 0;
function scheduleSync(){ clearTimeout(syncTimer); syncTimer = setTimeout(function(){ syncChain = syncChain.then(runSync, runSync); }, 700); }
function failSync(e){
  toast("Not saved", errText(e).replace(/^[a-z0-9.]+: /i, ""));
  if(e && e.status === 401){ setTimeout(function(){ location.reload(); }, 1500); return Promise.resolve(); }
  if(e && (e.status === 400 || e.code === "must_change")) return Promise.resolve();
  return loadAdminData().then(function(){ aRender(); }, function(){});
}
function applyProduct(sp, oldId){
  var i = -1; P.forEach(function(p, j){ if(p.id === (oldId || sp.id)) i = j; });
  if(i > -1) P[i] = sp; else P.push(sp);
  reindex(); SNAP.products[sp.id] = sigP(sp); if(oldId && oldId !== sp.id) delete SNAP.products[oldId];
}
function runSync(){
  if(!SNAP || !A.logged) return Promise.resolve();
  var jobs = [];
  // homepage content & pages
  var cs = JSON.stringify(DB.cfg);
  if(cs !== SNAP.cfg) jobs.push(function(){ return api("PUT", "/api/admin/cfg", {cfg:DB.cfg, version:DB.versions.cfg}).then(function(r){ DB.versions.cfg = r.version; if(JSON.stringify(r.cfg.delivery) !== JSON.stringify(DB.cfg.delivery)){ DB.cfg.delivery = r.cfg.delivery; toast("Delivery charges not changed", "Only the owner or an Administrator can change them"); if(A.page === "site") renderCZ(); } SNAP.cfg = JSON.stringify(DB.cfg); }); });
  var cats = JSON.stringify(DB.categories);
  if(cats !== SNAP.categories) jobs.push(function(){ return api("PUT", "/api/admin/categories", {categories:DB.categories, version:DB.versions.categories}).then(function(r){ DB.versions.categories = r.version; SNAP.categories = cats; }); });
  // settings (+ keys that are stored encrypted and never shown again)
  var ss = sigS(DB.settings), mt = (DB.settings.meta || {}).token || "", tt = DB.settings.telegramToken || "";
  if(ss !== SNAP.settings || mt || tt) jobs.push(function(){
    var s = clone(DB.settings); delete s.hasMetaToken; delete s.hasTelegramToken; delete s.telegramToken; if(s.meta) delete s.meta.token;
    return api("PUT", "/api/admin/settings", {settings:s, version:DB.versions.settings, secrets:{metaToken:mt || undefined, telegramToken:tt || undefined}}).then(function(r){
      DB.versions.settings = r.version;
      DB.settings.hasMetaToken = r.settings.hasMetaToken; DB.settings.hasTelegramToken = r.settings.hasTelegramToken;
      if(mt){ DB.settings.meta.token = ""; } if(tt){ DB.settings.telegramToken = ""; }
      SNAP.settings = sigS(DB.settings); if(mt || tt){ toast("Key saved securely", "It is stored encrypted and will not be shown again"); if(A.page === "meta" || A.page === "notifications") aRender(); }
    });
  });
  // products
  var seen = {};
  P.slice().forEach(function(p){
    seen[p.id] = 1;
    var prev = SNAP.products[p.id], now = sigP(p);
    if(!prev){ jobs.push(function(){ var body = clone(p); delete body.id; return api("POST", "/api/admin/products", {product:body}).then(function(r){ applyProduct(r.product, p.id); }); }); return; }
    if(prev === now) return;
    var old = JSON.parse(prev), flagsOnly = true;
    Object.keys(p).concat(Object.keys(old)).forEach(function(k){ if(k !== "status" && k !== "isNew" && k !== "top" && JSON.stringify(p[k]) !== JSON.stringify(old[k])) flagsOnly = false; });
    if(flagsOnly) jobs.push(function(){ return api("PATCH", "/api/admin/products/" + encodeURIComponent(p.id), {status:p.status, isNew:p.isNew, top:p.top}).then(function(r){ applyProduct(r.product); }); });
    else jobs.push(function(){ var base = {}; (old.variants || []).forEach(function(v){ base[v.sku] = v.stock; }); return api("PUT", "/api/admin/products/" + encodeURIComponent(p.id), {product:p, baseline:base, version:old._v}).then(function(r){ applyProduct(r.product); }); });
  });
  Object.keys(SNAP.products).forEach(function(id){ if(!seen[id]) jobs.push(function(){ return api("DELETE", "/api/admin/products/" + encodeURIComponent(id)).then(function(){ delete SNAP.products[id]; }, function(e){ if(e.status === 404){ delete SNAP.products[id]; return; } throw e; }); }); });
  // order details (status changes go through their own call)
  DB.orders.forEach(function(o){ var s = sigO(o); if(SNAP.orders[o.ref] !== undefined && SNAP.orders[o.ref] !== s) jobs.push(function(){ return api("PATCH", "/api/admin/orders/" + o.ref, {payStatus:o.payStatus, courier:o.courier || "", tracking:o.tracking || "", notes:o.notes || ""}).then(function(){ SNAP.orders[o.ref] = s; }); }); });
  // coupons
  var codes = {};
  DB.coupons.forEach(function(c){
    if(c._code) codes[c._code] = 1;
    var body = cpBody(c);
    var js = JSON.stringify(body);
    if(!c._code || SNAP.coupons[c._code] !== js) jobs.push(function(){ return api("PUT", "/api/admin/coupons/" + encodeURIComponent(c._code || c.code), {coupon:body}).then(function(r){ if(c._code) delete SNAP.coupons[c._code]; c._code = r.coupon.code; c.uses = r.coupon.uses; SNAP.coupons[c._code] = js; }); });
  });
  Object.keys(SNAP.coupons).forEach(function(code){ if(!codes[code] && !DB.coupons.some(function(c){ return c._code === code; })) jobs.push(function(){ return api("DELETE", "/api/admin/coupons/" + encodeURIComponent(code)).then(function(){ delete SNAP.coupons[code]; }); }); });
  // team
  DB.admins.forEach(function(u){
    var s = JSON.stringify([u.role, u.active]);
    if(SNAP.admins[u.id] === undefined) jobs.push(function(){ return api("POST", "/api/admin/users", {name:u.name, email:u.email, role:u.role}).then(function(r){ u.id = r.user.id; SNAP.admins[u.id] = JSON.stringify([u.role, u.active]); showText("Temporary password for " + u.name, r.tempPassword, "Give this password to " + u.name + " privately (not in a group). They sign in at " + location.origin + "/admin and must choose their own password straight away. It is shown only once."); }); });
    else if(SNAP.admins[u.id] !== s){ var was = JSON.parse(SNAP.admins[u.id]); jobs.push(function(){ return api("PATCH", "/api/admin/users/" + encodeURIComponent(u.id), {role:u.role !== was[0] ? u.role : undefined, active:u.active !== was[1] ? u.active : undefined}).then(function(){ SNAP.admins[u.id] = s; }); }); }
  });
  // notifications marked as read
  var ids = DB.notifs.filter(function(n){ return n.read && !SNAP.read[n.id] && /^\d+$/.test(String(n.id)); }).map(function(n){ return String(n.id); });
  if(ids.length) jobs.push(function(){ return api("POST", "/api/admin/notifs/read", {ids:ids}).then(function(){ ids.forEach(function(i){ SNAP.read[i] = 1; }); }); });

  if(!jobs.length) return Promise.resolve();
  syncBusy++; document.body.classList.add("a-saving");
  var chain = Promise.resolve();
  jobs.forEach(function(j){ chain = chain.then(j); });
  return chain.then(function(){ if(A.page === "products" && $("#aPT")) $("#aPT").innerHTML = productTable(); }, failSync).then(function(){ if(--syncBusy <= 0){ syncBusy = 0; document.body.classList.remove("a-saving"); } });
}

// ---- actions that must happen on the server right away ----
function setStatus(o, ns, note){
  api("POST", "/api/admin/orders/" + o.ref + "/status", {status:ns, note:note || ""}).then(function(r){
    var i = DB.orders.indexOf(o); var no = r.order; if(i > -1) DB.orders[i] = no; SNAP.orders[no.ref] = sigO(no);
    r.products.forEach(function(p){ applyProduct(p); });
    toast("Status updated", no.ref + " → " + ST[no.status].l);
    if($("#adB").dataset.ref === no.ref && $("#aDrawer").classList.contains("on")) aOrder(no.ref);
    if(A.page === "orders" && $("#aOT")) $("#aOT").innerHTML = orderTable(filteredOrders()); else if(A.page === "dashboard") aRender();
    aBell();
  }, function(e){ toast("Status not changed", errText(e)); });
}
function setStock(pid, vi, val, why){
  var p = BY[pid], v = p && p.variants[vi]; if(!v) return;
  val = Math.max(0, Math.floor(+val || 0)); if(val === v.stock) return;
  var oldStock = v.stock; v.stock = val;
  var isSet = why === "Stock count set";
  var redraw = function(){ setTimeout(function(){ var t2 = $("#aIT"); if(A.page !== "inventory" || !t2) return; var ae = document.activeElement; if(ae && t2.contains(ae) && ae.matches("input")) return; try{ t2.innerHTML = invRows(); }catch(x){} }, 0); };
  api("POST", "/api/admin/stock", isSet ? {sku:v.sku, set:val, why:why} : {sku:v.sku, delta:val - oldStock, why:why || "Manual adjustment"}).then(function(r){
    applyProduct(r.product); DB.moves.unshift({at:Date.now(), pid:pid, sku:r.sku, d:r.stock - oldStock, why:why || "Manual adjustment"});
    if(r.stock !== val) toast("Stock updated", r.sku + " → " + r.stock + " (orders came in meanwhile)");
    redraw();
  }, function(e){ v.stock = oldStock; toast("Stock not changed", errText(e)); redraw(); });
}
// "Remove demo orders" and "Reset all demo data" do not exist in the real shop
var _pgSettings = pgSettings;
PAGEFN.settings = function(){
  return _pgSettings().replace(/<div class="ch" style="margin-top:14px"><h3>[\s\S]*?Reset all demo data<\/button>/, '<p class="mut sm2" style="margin-top:14px">'+ic("lock")+'Changes are saved on the server and apply to every device straight away.</p>');
};
var _pgMeta = pgMeta;
PAGEFN.meta = function(){
  var M = DB.settings.meta, ok = /^\d{15,16}$/.test(M.pixel);
  return _pgMeta()
    .replace(/<span class="pl" style="color:#8A4B08;background:#FEF0C7"><i style="background:#8A4B08"><\/i>Saved · waiting for live website<\/span>/, '<span class="pl" style="color:#15803D;background:#DCFCE7"><i style="background:#15803D"></i>Connected</span>')
    .replace(/placeholder="Paste from Events Manager → Settings"/, 'placeholder="'+(DB.settings.hasMetaToken ? "Saved ✓ — paste a new token to replace it" : "Paste from Events Manager → Settings")+'"')
    .replace(/In the real website this token is stored encrypted[^<]*/, "The token is stored encrypted on the server and is never shown again or sent to any browser.")
    .replace(/https:\/\/\[your-domain\]\/feeds\/meta-catalog\.xml/, esc(location.origin + "/feeds/meta-catalog.xml"))
    .replace(/active products would be in the feed/, "active products are in the feed");
};
var _pgUsers = pgUsers;
PAGEFN.users = function(){
  var h = _pgUsers().replace(/<button class="btn2" data-a="utoggle" data-i="(\d+)">/g, '<button class="btn2" data-ureset="$1">Reset password</button><button class="btn2" data-a="utoggle" data-i="$1">');
  return h.replace(/<p class="mut sm2">In the real panel they get an email invite[^<]*<\/p>/, "");
};
// a "Change my password" card for everyone, at the top of the dashboard and team pages
function pwCard(){ return '<section class="card2 pwc"><div class="ch"><h3>'+ic("lock")+'Your account</h3><span>'+esc(DB.me.name)+' · '+esc(DB.me.email)+' · '+esc(DB.me.role)+'</span></div><button class="btn b-out sm" data-pwchange>'+ic("lock")+'Change my password</button></section>'; }
var _pgUsers2 = PAGEFN.users;
PAGEFN.users = function(){ return pwCard() + _pgUsers2(); };
function pwDrawer(forced){
  A.forcePw = !!forced; $("#aDrawer").classList.toggle("forced", !!forced);
  aOpenDrawer("Change password", (forced ? '<p class="note2">'+ic("info")+'<span>Welcome! Please choose your own password before you continue.</span></p>' : '') + '<div class="err" id="pwErr" hidden></div><label class="fld">Current password<input type="password" id="pwCur" autocomplete="current-password"></label><label class="fld">New password (10+ characters)<input type="password" id="pwNew" autocomplete="new-password"></label><label class="fld">New password again<input type="password" id="pwNew2" autocomplete="new-password"></label>', '<button class="btn b-em sm push" data-pwsave>'+ic("check")+'Save new password</button>');
}
document.addEventListener("click", function(e){
  var b;
  if(e.target.closest("[data-pwchange]")){ pwDrawer(false); return; }
  if(e.target.closest("[data-pwsave]")){
    var cur = $("#pwCur").value, n1 = $("#pwNew").value, n2 = $("#pwNew2").value, er = $("#pwErr");
    var bad = n1.length < 10 ? "The new password must be at least 10 characters." : n1 !== n2 ? "The two new passwords are not the same." : "";
    if(bad){ er.hidden = false; er.textContent = bad; return; }
    api("POST", "/api/admin/password", {current:cur, next:n1}).then(function(){ DB.me.mustChange = false; A.forcePw = false; $("#aDrawer").classList.remove("forced"); aCloseDrawer(); toast("Password changed", "Other devices were signed out"); }, function(err){ er.hidden = false; er.textContent = errText(err); });
    return;
  }
  if((b = e.target.closest("[data-ureset]"))){
    var u = DB.admins[+b.dataset.ureset]; if(!u) return;
    if(b.dataset.sure !== "1"){ b.dataset.sure = "1"; b.textContent = "Click again to reset"; return; }
    api("PATCH", "/api/admin/users/" + encodeURIComponent(u.id), {resetPassword:true}).then(function(r){ showText("New temporary password for " + u.name, r.tempPassword, "Give it to " + u.name + " privately. They must choose their own password after signing in. Shown only once."); }, function(err){ toast("Not reset", errText(err)); });
  }
});
// while a first-time password change is pending, the popup cannot be closed
document.addEventListener("click", function(e){ if(A.forcePw && (e.target.closest("[data-adclose]") || e.target === $("#aScrim"))){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
document.addEventListener("keydown", function(e){ if(A.forcePw && e.key === "Escape"){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
// order status: wait for the server, then show the result (no early toast)
document.addEventListener("click", function(e){ var b = e.target.closest('[data-a="ostatus"]'); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); var o = DB.orders.filter(function(x){ return x.ref === b.dataset.ref; })[0]; if(o) setStatus(o, $("#oNext").value, $("#oNote").value.trim()); }, true);
// invoice: always show the text (copying silently fails on some phones)
document.addEventListener("click", function(e){ var b = e.target.closest('[data-a="invoice"]'); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); var o = DB.orders.filter(function(x){ return x.ref === b.dataset.ref; })[0]; if(!o) return; var txt = invoiceText(o); showText("Invoice " + o.ref, txt, "Copy this and paste it into WhatsApp, email or a document."); try{ navigator.clipboard.writeText(txt).then(function(){ toast("Invoice copied", ""); }, function(){}); }catch(x){} }, true);
// "Call to order" dials the shop's phone
document.addEventListener("click", function(e){ if(!e.target.closest("#pmCall")) return; e.preventDefault(); e.stopImmediatePropagation(); var ph = String((DB.settings.store || {}).phone || "").replace(/[^\d+]/g, ""); if(ph) location.href = "tel:" + ph; }, true);
// "View on website" opens the real product page
document.addEventListener("click", function(e){ var b = e.target.closest('[data-a="pview"]'); if(b && A.draft && A.draft.id){ e.preventDefault(); e.stopImmediatePropagation(); location.href = "/p/" + encodeURIComponent(A.draft.id); } }, true);

// ---- notifications page: this device + Telegram ----
function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
function isStandalone(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
function pushSupported(){ return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; }
var pushState = "unknown";
function b64ToU8(s){ var p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")), a = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function swReg(){ return navigator.serviceWorker.register("/sw.js", {scope:"/admin"}).then(function(){ return navigator.serviceWorker.ready; }); }
function checkPush(){
  if(!pushSupported()){ pushState = isIOS() && !isStandalone() ? "ios-install" : "unsupported"; return Promise.resolve(); }
  if(Notification.permission === "denied"){ pushState = "denied"; return Promise.resolve(); }
  return swReg().then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(sub){
    if(sub && Notification.permission === "granted"){ pushState = "on"; var j = sub.toJSON(); return api("POST", "/api/admin/push/subscribe", {endpoint:j.endpoint, keys:j.keys}).catch(function(){}); }
    pushState = "off";
  }).catch(function(){ pushState = "off"; });
}
function pushEnable(){
  if(!pushSupported()) return;
  Notification.requestPermission().then(function(perm){
    if(perm !== "granted"){ pushState = perm === "denied" ? "denied" : "off"; aRender(); throw new Error("Permission was not given"); }
    return swReg();
  }).then(function(reg){
    return reg.pushManager.getSubscription().then(function(old){ return old || reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToU8(DB.push.publicKey)}); });
  }).then(function(sub){ var j = sub.toJSON(); return api("POST", "/api/admin/push/subscribe", {endpoint:j.endpoint, keys:j.keys}); })
    .then(function(){ pushState = "on"; toast("Notifications are on", "New orders will now appear on this device"); aRender(); return api("POST", "/api/admin/push/test", {}); })
    .catch(function(e){ if(e && e.message) toast("Could not turn on", e.message); });
}
function pushDisable(){
  swReg().then(function(reg){ return reg.pushManager.getSubscription(); }).then(function(sub){ if(!sub) return; var ep = sub.endpoint; return sub.unsubscribe().then(function(){ return api("POST", "/api/admin/push/unsubscribe", {endpoint:ep}); }); }).then(function(){ pushState = "off"; toast("Turned off on this device", ""); aRender(); });
}
var _pgNotifs = pgNotifications;
PAGEFN.notifications = function(){
  var html = _pgNotifs(), S = DB.settings;
  var dev = pushState === "on" ? '<div class="chan on"><span>'+ic("bell")+'<b>This phone / laptop</b><small>New orders pop up in the notification bar</small></span><span class="pl" style="color:#15803D;background:#DCFCE7"><i style="background:#15803D"></i>On</span></div><div class="chbtns"><button class="btn b-out sm" data-pushtest>Send a test</button><button class="btn2" data-pushoff>Turn off here</button></div>'
    : pushState === "ios-install" ? '<div class="chan"><span>'+ic("info")+'<b>iPhone: one step first</b><small>Open this page in Safari → Share → “Add to Home Screen”. Open the app from your home screen, sign in, and turn notifications on here.</small></span></div>'
    : pushState === "denied" ? '<div class="chan"><span>'+ic("info")+'<b>Notifications are blocked</b><small>Allow notifications for this site in your browser settings, then reload this page.</small></span></div>'
    : pushState === "unsupported" ? '<div class="chan"><span>'+ic("info")+'<b>This browser cannot receive notifications</b><small>Use Chrome on Android or a computer, or Safari on iPhone (installed to the home screen).</small></span></div>'
    : '<div class="chan"><span>'+ic("bell")+'<b>This phone / laptop</b><small>Get a notification-bar alert for every new order, even when the panel is closed</small></span><button class="btn b-em sm" data-pushon>'+ic("bell")+'Turn on</button></div>';
  var canSet = canDo("settings", true);
  var tg = '<div class="chan tgc"><span>'+ic("wa")+'<b>Telegram (backup)</b><small>Every order also arrives as a Telegram message. Create a bot with @BotFather, send /start to it, then paste the bot token and your chat ID.</small></span></div>'
    + (canSet ? '<div class="two"><label class="fld">Bot token<input type="password" data-tgtoken autocomplete="off" placeholder="'+(S.hasTelegramToken ? "Saved ✓ — paste to replace" : "123456789:AA…")+'"></label><label class="fld">Chat ID<input type="text" data-set="notif.telegramChat" value="'+esc(S.notif.telegramChat || "")+'" placeholder="e.g. 123456789"></label></div><div class="chbtns"><button class="btn b-out sm" data-tgtest>Send a test message</button></div>' : '<p class="mut sm2">Ask the owner or an Administrator to set this up.</p>');
  return html
    .replace(/<div class="chan"><span><svg[\s\S]*?Phone &amp; laptop push[\s\S]*?<\/span><\/div>|<div class="chan"><span>[^]*?Phone & laptop push[^]*?After launch<\/span><\/div>/, dev)
    .replace(/(<div class="chan"><span>(?:(?!<div class="chan">)[\s\S])*?WhatsApp \/ SMS[\s\S]*?<\/span><\/div>)/, tg + "$1");
};
document.addEventListener("click", function(e){
  if(e.target.closest("[data-pushon]")){ pushEnable(); return; }
  if(e.target.closest("[data-pushoff]")){ pushDisable(); return; }
  if(e.target.closest("[data-pushtest]")){ api("POST", "/api/admin/push/test", {}).then(function(r){ toast(r.sent ? "Test sent" : "No device received it", r.sent ? "Check your notification bar" : "Turn notifications on first"); }, function(err){ toast("Test failed", errText(err)); }); return; }
  if(e.target.closest("[data-tgtest]")){ var tok = (document.querySelector("[data-tgtoken]") || {}).value || ""; var go = function(){ api("POST", "/api/admin/telegram/test", {}).then(function(){ toast("Telegram message sent", "Check your Telegram"); }, function(err){ toast("Telegram test failed", errText(err)); }); }; if(tok){ DB.settings.telegramToken = tok; runSync().then(go); } else go(); }
});
document.addEventListener("change", function(e){ var el = e.target; if(el.hasAttribute && el.hasAttribute("data-tgtoken") && el.value.trim()){ DB.settings.telegramToken = el.value.trim(); el.value = ""; scheduleSync(); } });

// ---- live updates: new orders appear without reloading ----
var pollTimer = null;
function poll(){
  if(!A.logged || document.hidden) return;
  api("GET", "/api/admin/poll?since=" + lastPoll).then(function(r){
    lastPoll = r.now - 2000;
    var fresh = 0;
    r.orders.forEach(function(o){ var i = -1; DB.orders.forEach(function(x, j){ if(x.ref === o.ref) i = j; }); if(i > -1){ if(SNAP.orders[o.ref] === sigO(DB.orders[i])){ DB.orders[i] = o; SNAP.orders[o.ref] = sigO(o); } } else { DB.orders.unshift(o); SNAP.orders[o.ref] = sigO(o); fresh++; } });
    r.notifs.forEach(function(n){ if(!DB.notifs.some(function(x){ return String(x.id) === String(n.id); })) DB.notifs.unshift(n); });
    var stockMoved = false;
    (r.stock || []).forEach(function(s){ var p = BY[s[0]]; if(!p) return; var v = p.variants.filter(function(x){ return x.sku === s[1]; })[0]; if(!v || v.stock === s[2]) return; var clean = SNAP.products[p.id] === sigP(p); v.stock = s[2]; if(clean) SNAP.products[p.id] = sigP(p); else { var o2 = JSON.parse(SNAP.products[p.id]); (o2.variants || []).forEach(function(x){ if(x.sku === s[1]) x.stock = s[2]; }); SNAP.products[p.id] = JSON.stringify(o2); } stockMoved = true; });
    if(stockMoved && A.page === "inventory" && $("#aIT")){ var ae = document.activeElement; if(!(ae && $("#aIT").contains(ae))) $("#aIT").innerHTML = invRows(); }
    if(fresh){ var o = r.orders[0]; toast("New order " + o.ref, o.customer.name + " · " + amt(o.total)); if(!$("#aDrawer").classList.contains("on") && (A.page === "orders" || A.page === "dashboard")) aRender(); }
    aBell();
  }).catch(function(e){ if(e.status === 401) location.reload(); });
}
document.addEventListener("visibilitychange", function(){ if(!document.hidden) poll(); });

// ---- sign in / out ----
(function(){
  var f = $("#aLoginForm"), nf = f.cloneNode(true); f.parentNode.replaceChild(nf, f);
  nf.addEventListener("submit", function(e){
    e.preventDefault();
    var em = $("#alEmail").value.trim(), pw = $("#alPass").value, msg = $("#alMsg"), go = $("#alGo"), card = nf;
    if(go.classList.contains("busy")) return;
    var shake = function(text){ msg.hidden = false; msg.textContent = text; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); };
    if(!em || !pw){ shake("Enter your email and password."); return; }
    msg.hidden = true; go.classList.add("busy"); go.querySelector(".tx").textContent = "Signing in…";
    api("POST", "/api/admin/login", {email:em, password:pw}).then(function(){ return loadAdminData(); }).then(function(){
      go.classList.remove("busy"); go.querySelector(".tx").textContent = "Sign in"; $("#alPass").value = "";
      A.page = "dashboard"; afterLogin();
    }, function(err){ go.classList.remove("busy"); go.querySelector(".tx").textContent = "Sign in"; shake(errText(err)); $("#alPass").select(); });
  });
  nf.addEventListener("input", function(){ $("#alMsg").hidden = true; });
})();
document.addEventListener("click", function(e){
  if(e.target.closest("#aLogout")){ e.preventDefault(); e.stopImmediatePropagation(); api("POST", "/api/admin/logout", {}).finally(function(){ location.href = "/admin"; }); }
}, true);
function afterLogin(){
  showView(true);
  checkPush().then(function(){ if(A.page === "notifications") aRender(); });
  clearInterval(pollTimer); pollTimer = setInterval(poll, 25000);
  var m = /^#order=(ST-[A-Z0-9]{6})$/.exec(location.hash);
  if(m && canDo("orders", false)){ aGo("orders"); aOrder(m[1]); try{ history.replaceState(null, "", "/admin"); }catch(x){} }
  if(DB.me && DB.me.mustChange) setTimeout(function(){ pwDrawer(true); }, 300);
}
function bnNum(n){ return Number(n || 0).toLocaleString("en-IN").replace(/[0-9]/g, function(d){ return "০১২৩৪৫৬৭৮৯"[d]; }); }
function liveText(){
  var free = (cfg.delivery || {}).free || 2000;
  T.bn.d1s = T.bn.tr1s = "ঢাকায় ৳" + bnNum(free) + "+ অর্ডারে"; T.en.d1s = T.en.tr1s = "Inside Dhaka above ৳" + Number(free).toLocaleString("en-IN");
  CATS.forEach(function(c){ T.bn["c_" + c.id] = c.bn; T.en["c_" + c.id] = c.en; });
  var S = DB.settings || {}, pay = S.pay || {};
  document.documentElement.classList.toggle("no-phone", !String((S.store || {}).phone || "").replace(/\D/g, ""));
  [["bk","bkash"],["ng","nagad"],["rk","rocket"]].forEach(function(x){ $$(".pays ." + x[0]).forEach(function(el){ el.hidden = !(pay[x[1]] && pay[x[1]].on); }); });
}
function prodBoot(){
  paintIcons();
  liveText();
  var title0 = document.title;
  renderAll();
  if(ROUTE.kind === "product" || ROUTE.kind === "category") document.title = title0;
  fbInit();
  if(ROUTE.kind === "product" && ROUTE.id && BY[ROUTE.id] && BY[ROUTE.id].status === "active") setTimeout(function(){ openPM(ROUTE.id); }, 350);
  if(ROUTE.kind === "category" && ROUTE.id && CAT[ROUTE.id]) setTimeout(function(){ setTab(ROUTE.id); var s = $("#new"); if(s) s.scrollIntoView({behavior:"smooth"}); }, 350);
  if(adminMode){
    showView(true);
    api("GET", "/api/admin/me").then(function(){ return loadAdminData(); }).then(function(){ afterLogin(); }, function(){ /* not signed in: the login form is showing */ });
  }
}
