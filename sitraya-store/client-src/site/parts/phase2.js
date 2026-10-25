// ================= Phase 2–6: images, sharing, brand, views, cart recovery, sections, scale =================
// Everything here reads one settings object, DB.settings.site, so the admin panel controls it all.

Object.keys({undo:1, globe:1, phone:1, image:1}).forEach(function(k){ if(ICP[k]) return; ICP[k] = ({
  undo:'<path d="M9 7H5V3"/><path d="M5.5 7.5A8 8 0 1 1 4 12"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z"/>',
  phone:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 16l-5-5-8 9"/>'
})[k]; });

var SITE_DEF = {
  brand: {title:{bn:"", en:""}, desc:{bn:"", en:""}, logoLight:"", favicon:"", appName:"", appShort:"", appIcon:"", theme:"#0D2B26", shareImg:"", lang:"bn"},
  img: {ratio:"auto", fit:"contain", bg:"#F4F1EC", webp:true},
  views: {on:true, show:false, min:10},
  search: {recent:true, popular:true},
  ui: {m:100, d:100, user:true},
  hero: {h:"m"},
  sections: {
    top: {mode:"slider", auto:true, sec:3, d:2, t:2, m:1, arrows:true, dots:true, loop:true, dir:"ltr", speed:600},
    "new": {mode:"grid", auto:true, sec:3, d:4, t:3, m:2, arrows:true, dots:false, loop:true, dir:"ltr", speed:600},
    rowA: {mode:"slider", auto:true, sec:3, d:5, t:3, m:2, arrows:true, dots:false, loop:true, dir:"ltr", speed:600},
    rowB: {mode:"slider", auto:true, sec:4, d:5, t:3, m:2, arrows:true, dots:false, loop:true, dir:"rtl", speed:600}
  },
  cart: {on:true, days:7, cool:24, max:3,
    tpl:{bn:"আসসালামু আলাইকুম {name}, {brand}-এ আপনার কার্টে {products} রাখা আছে (মোট {total})। অর্ডারটা শেষ করতে এই লিংকে চাপুন: {link}\nকোনো প্রশ্ন থাকলে এখানেই জানান।",
         en:"Hello {name}, you left {products} in your {brand} cart (total {total}). Finish your order here: {link}\nReply here if you have any question."}}
};
var SEC_LABEL = {top:"Top selling · বেস্ট সেলিং", "new":"New arrivals · নতুন", rowA:"Abaya & hijab row · আবায়া সারি", rowB:"Three piece row · থ্রি-পিস সারি"};
var SEC_EL = {top:"#big2", "new":"#newGrid", rowA:"#rowAbaya", rowB:"#rowThree"};
var ORIG_BRAND = "Sitraya";

function isObj(x){ return x && typeof x === "object" && !Array.isArray(x); }
function fillDef(t, d){ Object.keys(d).forEach(function(k){ if(t[k] === undefined || t[k] === null || (isObj(d[k]) && !isObj(t[k]))) t[k] = clone(d[k]); else if(isObj(d[k])) fillDef(t[k], d[k]); }); return t; }
function SITE(){ if(!DB || !DB.settings) return clone(SITE_DEF); if(!isObj(DB.settings.site)) DB.settings.site = {}; return fillDef(DB.settings.site, SITE_DEF); }
function clampN(v, lo, hi, def){ v = Math.round(+v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; }
function isOrigBrand(){ return (cfg && cfg.brand && cfg.brand.name || "") === ORIG_BRAND; }
function lsGet(k, d){ try{ var v = localStorage.getItem(k); return v == null ? d : v; }catch(e){ return d; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function hexOk(c){ return /^#[0-9a-fA-F]{6}$/.test(String(c || "")); }
function isPhoto(ref){ return /^(data:image\/(png|jpe?g|webp|gif)|\/m\/|https:\/\/)/.test(String(ref || "")); }
function canWebp(){ if(canWebp.v === undefined){ try{ var c = document.createElement("canvas"); c.width = c.height = 1; canWebp.v = c.toDataURL("image/webp").indexOf("data:image/webp") === 0; }catch(e){ canWebp.v = false; } } return canWebp.v; }
function imgFormat(isPng){ return SITE().img.webp && canWebp() ? "image/webp" : (isPng ? "image/png" : "image/jpeg"); }

// ================= 1. brand: one place for the shop's identity =================
function wordmark(kind){
  // the same box as the original logo (about 2.4 : 1), the name shrinks to fit
  var name = BRAND(), dark = kind !== "light", col = dark ? (hexOk(SITE().brand.theme) ? SITE().brand.theme : "#0D2B26") : "#FFFFFF";
  var fs = Math.max(22, Math.min(52, Math.floor(440 / Math.max(5, name.length)))), fit = name.length * fs * .56 > 228 ? ' textLength="228" lengthAdjust="spacingAndGlyphs"' : '';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100"><text x="120" y="'+Math.round(50 + fs * .36)+'" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="'+fs+'" font-weight="700" fill="'+col+'"'+fit+'>'+esc(name)+'</text></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function monogram(size, bg, fg){
  var ch = (BRAND().trim().charAt(0) || "S").toUpperCase();
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="'+(bg || "#0D2B26")+'"/><text x="50" y="67" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="'+(fg || "#fff")+'">'+esc(ch)+'</text></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
// the old shop's own pictures are used only while the shop is still called by that name
logoSrc = function(kind){ var LL = SITE().brand.logoLight; if(kind === "light" && LL) return I(LL); if(cfg.brand.logo) return I(cfg.brand.logo); if(isOrigBrand()) return IMG["logo-" + kind] || wordmark(kind); return wordmark(kind); };
var _I0 = I;
I = function(k){ if(k === "cover" && !isOrigBrand()) return brandCover(); return _I0(k); };
function isProd(){ return typeof api === "function"; }
function brandCover(){
  var B = SITE().brand, th = hexOk(B.theme) ? B.theme : "#0D2B26";
  if(B.shareImg) return I(B.shareImg);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="673" viewBox="0 0 1600 673"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+th+'"/><stop offset="1" stop-color="#111"/></linearGradient></defs><rect width="1600" height="673" fill="url(#g)"/><text x="800" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="700" letter-spacing="8" fill="#fff">'+esc(BRAND())+'</text></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function brandTitle(){ var B = SITE().brand, tt = (B.title && B.title[L]) || ""; return tt ? tt.replace(/\{brand\}/g, BRAND()) : BRAND() + (L === "bn" ? " — প্রিমিয়াম মডেস্ট ফ্যাশন" : " — Premium Modest Fashion"); }
function brandDesc(){ var B = SITE().brand, d = (B.desc && B.desc[L]) || ""; return d.replace(/\{brand\}/g, BRAND()); }
function setHead(sel, make){ var el = document.head.querySelector(sel); if(!el){ el = make(); document.head.appendChild(el); } return el; }
var manifestUrl = "";
function brandApply(){
  var B = SITE().brand, th = hexOk(B.theme) ? B.theme : "#0D2B26";
  if(!document.body.classList.contains("is-admin")) document.title = brandTitle();
  var d = brandDesc(); setHead('meta[name="description"]', function(){ var m = document.createElement("meta"); m.name = "description"; return m; }).content = d;
  setHead('meta[name="theme-color"]', function(){ var m = document.createElement("meta"); m.name = "theme-color"; return m; }).content = th;
  var fav = B.favicon ? I(B.favicon) : (isOrigBrand() && IMG["logo-gold"] ? IMG["logo-gold"] : monogram(64, th));
  setHead('link[rel="icon"]', function(){ var l = document.createElement("link"); l.rel = "icon"; return l; }).href = fav;
  setHead('link[rel="apple-touch-icon"]', function(){ var l = document.createElement("link"); l.rel = "apple-touch-icon"; return l; }).href = B.appIcon ? I(B.appIcon) : fav;
  setHead('meta[name="apple-mobile-web-app-title"]', function(){ var m = document.createElement("meta"); m.name = "apple-mobile-web-app-title"; return m; }).content = (B.appShort || B.appName || BRAND()).slice(0, 30);
  // installable app name and icon come from the same settings (the live server builds this file the same way)
  if(!isProd()) try{
    var icon = B.appIcon ? I(B.appIcon) : monogram(512, th);
    var man = {name:(B.appName || BRAND() + " Admin").slice(0, 45), short_name:(B.appShort || BRAND()).slice(0, 12), start_url:location.href.split("#")[0] + "#admin", display:"standalone", background_color:th, theme_color:th,
      icons:[{src:icon, sizes:"512x512", type:/^data:image\/svg/.test(icon) ? "image/svg+xml" : "image/png", purpose:"any"}]};
    if(manifestUrl) URL.revokeObjectURL(manifestUrl);
    manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(man)], {type:"application/manifest+json"}));
    setHead('link[rel="manifest"]', function(){ var l = document.createElement("link"); l.rel = "manifest"; return l; }).href = manifestUrl;
  }catch(e){}
  document.documentElement.style.setProperty("--brand-theme", th);
}
var _applyStatic0 = applyStatic;
applyStatic = function(){ _applyStatic0.apply(this, arguments); try{ brandApply(); uiScaleApply(); imgVarsApply(); }catch(e){ if(window.console) console.warn(e); } };
// first visit: the shop's chosen default language
(function(){ var chosen = null; try{ chosen = localStorage.getItem("st3_lang"); }catch(e){} if(!chosen && DB && DB.settings && DB.settings.site && DB.settings.site.brand && (DB.settings.site.brand.lang === "en" || DB.settings.site.brand.lang === "bn")) L = DB.settings.site.brand.lang; })();

// ================= 2. product images: same shape everywhere, never cut, focus point =================
var RATIOS = [["auto","Theme default (slightly tall)"],["1/1","Square 1:1"],["4/5","Portrait 4:5"],["3/4","Portrait 3:4"],["2/3","Tall 2:3"]];
function imgVarsApply(){
  var S = SITE().img, b = document.body.style;
  var ar = /^\d\/\d$/.test(S.ratio) ? S.ratio : ""; if(ar) b.setProperty("--card-ar", ar); else b.removeProperty("--card-ar"); document.body.classList.toggle("card-ar", !!ar);
  b.setProperty("--photo-bg", hexOk(S.bg) ? S.bg : "#F4F1EC");
  document.body.classList.toggle("img-fill", S.fit === "cover");
}
function fitOf(p){ var f = p && p.fit; return f === "cover" || f === "contain" ? f : SITE().img.fit; }
function posOf(p){ return p && /^\d{1,3}% \d{1,3}%$/.test(p.fpos || "") ? p.fpos : "50% 50%"; }
var _card0 = card;
card = function(p, i){
  var h = _card0(p, i), photo = isPhoto(p.img);
  return h.replace('<article class="card rv-me" style="', '<article class="card rv-me'+(photo ? ' has-photo fit-' + fitOf(p) : '')+'" style="--fpos:'+posOf(p)+';');
};

// a picture to tap on: choose which part must always stay in view
function focusBlock(d){
  var S = SITE().img, src = d.img ? I(d.img) : "";
  if(!src) return '<p class="vhint">'+ic("info")+'Upload a photo first. Then tap on it to choose the part that must always show.</p>';
  return '<div class="fpk"><div class="fpk-stage" id="fpkStage" style="aspect-ratio:'+(/^\d\/\d$/.test(S.ratio) ? S.ratio : "1/1.08")+';--fpos:'+posOf(d)+'"><img src="'+src+'" alt="" class="'+(fitOf(d) === "cover" ? "cover" : "")+'"><span class="fpk-dot" style="left:'+posOf(d).split(" ")[0]+';top:'+posOf(d).split(" ")[1]+'"></span></div>'
    + '<div class="fpk-side"><p class="mut sm2">'+ic("info")+'This is how the photo sits in a product card. Tap the most important part (face, neckline, embroidery). It stays in view on every screen.</p>'
    + '<label class="fld">Display · দেখানো<select data-pd="fit"><option value=""'+(!d.fit ? ' selected' : '')+'>Shop default ('+(S.fit === "cover" ? "fill" : "whole photo")+')</option><option value="contain"'+(d.fit === "contain" ? ' selected' : '')+'>Whole photo, no crop · পুরো ছবি</option><option value="cover"'+(d.fit === "cover" ? ' selected' : '')+'>Fill the card · কার্ড ভরাট</option></select></label>'
    + '<button type="button" class="btn2" data-fpreset="50% 50%">Reset to centre</button></div></div>';
}
function refreshFocus(){ var host = $("#fpkHost"); if(host && A.draft) host.innerHTML = focusBlock(A.draft); }
$("#admin").addEventListener("click", function(e){
  var st = e.target.closest("#fpkStage"); if(st && A.draft){ var r = st.getBoundingClientRect(); var x = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100), y = Math.round(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) * 100); A.draft.fpos = x + "% " + y + "%"; refreshFocus(); return; }
  var pr = e.target.closest("[data-fpreset]"); if(pr && A.draft){ A.draft.fpos = pr.dataset.fpreset; refreshFocus(); }
});
$("#admin").addEventListener("change", function(e){ if(e.target.matches('select[data-pd="fit"]') && A.draft){ A.draft.fit = e.target.value; refreshFocus(); } });

// ================= 3. Facebook share picture: 1200 × 630, the whole product, nothing cut =================
function keepImage(dataUrl, cb){
  if(!dataUrl || !isProd()){ cb(dataUrl); return; }
  api("POST", "/api/admin/media", {data:dataUrl}).then(function(r){ cb(r.url); }, function(e){ toast("Share picture not saved", errText(e)); cb(""); });
}
function makeShare(src, cb0){
  var cb = function(url){ keepImage(url, cb0); };
  if(!src){ cb(""); return; }
  var im = new Image(); im.crossOrigin = "anonymous";
  im.onload = function(){
    try{
      var W = 1200, H = 630, c = document.createElement("canvas"), x = c.getContext("2d"); c.width = W; c.height = H;
      var bg = hexOk(SITE().img.bg) ? SITE().img.bg : "#F4F1EC";
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      // soft, blurred copy of the photo fills the empty sides
      var s0 = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      if("filter" in x){ x.save(); x.filter = "blur(28px) brightness(1.05) saturate(.9)"; x.globalAlpha = .55; x.drawImage(im, (W - im.naturalWidth * s0) / 2, (H - im.naturalHeight * s0) / 2, im.naturalWidth * s0, im.naturalHeight * s0); x.restore(); }
      // the full product, contained with a little margin
      var pad = 24, s = Math.min((W - pad * 2) / im.naturalWidth, (H - pad * 2) / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
      x.shadowColor = "rgba(0,0,0,.18)"; x.shadowBlur = 24; x.shadowOffsetY = 8;
      x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      cb(c.toDataURL("image/jpeg", .86));
    }catch(err){ cb(""); }
  };
  im.onerror = function(){ cb(""); };
  im.src = src;
}
var _saveProduct0 = saveProduct;
saveProduct = function(){
  var d = A.draft;
  if(d && d.img && d._shareFrom !== d.img){
    var from = d.img;
    makeShare(I(from), function(url){ if(url){ d.shareImg = url; d._shareFrom = from; } _saveProduct0(); });
    return;
  }
  _saveProduct0();
};
var _shareBlock0 = shareBlock;
shareBlock = function(d){
  var h = _shareBlock0(d);
  if(!d.id) return h;
  var share = d.shareImg ? I(d.shareImg) : "";
  if(share) h = h.replace(/<span class="fbimg"[^>]*>[\s\S]*?<\/span><span class="fbmeta">/, '<span class="fbimg wide"><img src="'+share+'" alt=""></span><span class="fbmeta">');
  var dbg = "https://developers.facebook.com/tools/debug/?q=" + encodeURIComponent(productLink(d));
  h += '<div class="shx">' + (share ? '<span class="okline">'+ic("check")+'Share picture ready · 1200 × 630, whole product visible</span>' : '<span class="mut sm2">'+ic("info")+'A share picture is made automatically when you save the product.</span>')
    + '<a class="btn2" href="'+esc(dbg)+'" target="_blank" rel="noopener">'+ic("fb")+'Refresh on Facebook (Sharing Debugger)</a></div>'
    + ((d.gallery || []).length ? '<p class="vhint">'+ic("info")+'A Facebook link shows one picture. All '+(1 + d.gallery.length)+' photos go to your Meta catalogue, so Shop and carousel ads show them all.</p>' : '');
  return h;
};
function bulkShare(btn){
  var list = P.filter(function(p){ return p.img && (!p.shareImg || p._shareFrom !== p.img); }), done = 0;
  if(!list.length){ toast("All share pictures are ready", P.length + " products"); return; }
  btn.disabled = true;
  (function next(){
    if(!list.length){ btn.disabled = false; aSaved("Share pictures made", done + " products"); logA("Share pictures made", done + " products"); if(A.page === "site2") aRender(); return; }
    var p = list.shift(), from = p.img; btn.textContent = "Making… " + (done + 1);
    makeShare(I(from), function(url){ if(url){ p.shareImg = url; p._shareFrom = from; done++; } setTimeout(next, 30); });
  })();
}

// ================= 4. product page: whole photo, structured data, views =================
var _openPM0 = openPM;
openPM = function(id){
  var p = BY[id]; if(p){ try{ countView(p); }catch(e){} }
  _openPM0.apply(this, arguments);
  if(!p) return;
  try{
    var old = document.getElementById("pLD"); if(old) old.remove();
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "pLD";
    s.textContent = JSON.stringify({"@context":"https://schema.org", "@type":"Product", name:p.en, sku:p.sku, description:(p.den || p.en).slice(0, 300), brand:{"@type":"Brand", name:BRAND()},
      offers:{"@type":"Offer", priceCurrency:"BDT", price:String(price(p)), availability:totalStock(p) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}});
    document.head.appendChild(s);
  }catch(e){}
  var st = $("#mstage"); if(st){ st.style.setProperty("--fpos", posOf(p)); }
};
var _renderPMInfo0 = renderPMInfo;
renderPMInfo = function(){
  _renderPMInfo0.apply(this, arguments);
  var p = BY[pm.id], box = $("#pmInfo"); if(!p || !box) return;
  var n = viewsOf(p.id).t, V = SITE().views, ov = p.views || "";
  var show = V.on && (ov === "show" || (ov !== "hide" && V.show && n >= V.min));
  var old = box.querySelector(".pviews"); if(old) old.remove();
  if(show){ var pr = box.querySelector(".prc, .mprice, .price") || box.querySelector("h2"); var el = document.createElement("p"); el.className = "pviews"; el.innerHTML = ic("eye") + esc(L === "bn" ? num(n) + " বার দেখা হয়েছে" : num(n) + " views"); if(pr && pr.parentNode) pr.parentNode.insertBefore(el, pr.nextSibling); else box.prepend(el); }
};

// ================= 5. view counter: one count per person per 30 minutes, bots left out =================
var BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|preview|headless|lighthouse|pingdom/i;
function viewsOf(id){ var v = (DB.views || {})[id]; return v ? {t:v.t || 0, u:v.u || 0} : {t:0, u:0}; }
var vSave;
function countView(p){
  if(!SITE().views.on || document.body.classList.contains("is-admin")) return;
  if(BOT.test(navigator.userAgent || "")) return;
  var now = Date.now(), k = "st_v_" + p.id, last = 0;
  try{ last = +sessionStorage.getItem(k) || 0; }catch(e){}
  if(now - last < 30 * 60 * 1000) return;
  try{ sessionStorage.setItem(k, String(now)); }catch(e){}
  if(!DB.views) DB.views = {};
  var v = DB.views[p.id] || (DB.views[p.id] = {t:0, u:0, d:{}});
  v.t++; var day = new Date(now + 6 * 3600 * 1000).toISOString().slice(0, 10); v.d = v.d || {}; v.d[day] = (v.d[day] || 0) + 1;
  var days = Object.keys(v.d).sort(); while(days.length > 60) delete v.d[days.shift()];
  if(lsGet("st_vu_" + p.id, "") !== "1"){ v.u++; lsSet("st_vu_" + p.id, "1"); }
  if(isProd()){ api("POST", "/api/view", {pid:p.id, vid:sid()}).catch(function(){}); return; }
  clearTimeout(vSave); vSave = setTimeout(saveDB, 1500);
}

// ================= 6. abandoned carts: only when the customer typed a phone number =================
function sid(){ var s = lsGet("st_sid", ""); if(!/^[a-z0-9]{12,}$/.test(s)){ s = Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet("st_sid", s); } return s; }
function cartLines(){ return cart.filter(function(l){ return BY[l.id]; }).map(function(l){ var p = BY[l.id]; return {id:l.id, size:l.size, color:l.color, qty:l.qty, price:price(p)}; }); }
function cartValue(lines){ return lines.reduce(function(a, l){ return a + l.price * l.qty; }, 0); }
var cTimer;
function trackCart(){
  if(!SITE().cart.on || document.body.classList.contains("is-admin")) return;
  clearTimeout(cTimer); cTimer = setTimeout(function(){
    if(isProd()){
      var ph0 = normPhone(form && form.phone); if(/^01[3-9]\d{8}$/.test(ph0)) lsSet("st_cphone", ph0); else ph0 = lsGet("st_cphone", "");
      api("POST", "/api/cart", {sid:sid(), items:cart.filter(function(l){ return BY[l.id]; }).map(function(l){ return {pid:l.id, size:String(l.size), color:l.color, qty:l.qty}; }),
        phone:/^01[3-9]\d{8}$/.test(ph0) ? ph0 : "", name:String(form.name || "").trim().slice(0, 60), wa:normPhone(form.wa) || "", district:String(form.district || "").trim().slice(0, 40), lang:L}).catch(function(){});
      return;
    }
    if(!DB.carts) DB.carts = [];
    var lines = cartLines(), ph = normPhone(form && form.phone), now = Date.now();
    if(/^01[3-9]\d{8}$/.test(ph)) lsSet("st_cphone", ph); else ph = lsGet("st_cphone", "");
    var known = /^01[3-9]\d{8}$/.test(ph);
    var rec = DB.carts.filter(function(c){ return c.status === "pending" && ((known && c.phone === ph) || (!c.phone && c.sid === sid())); })[0];
    if(!lines.length){ if(rec && !rec.phone){ DB.carts.splice(DB.carts.indexOf(rec), 1); saveDB(); } return; }
    if(!rec){ rec = {id:"c" + now.toString(36) + Math.random().toString(36).slice(2, 6), sid:sid(), created:now, status:"pending", reminders:[], optout:false}; DB.carts.unshift(rec); }
    // a phone typed on this device joins the anonymous cart to the customer
    var anon = known && DB.carts.filter(function(c){ return c !== rec && !c.phone && c.sid === sid() && c.status === "pending"; })[0]; if(anon) DB.carts.splice(DB.carts.indexOf(anon), 1);
    rec.items = lines; rec.value = cartValue(lines); rec.updated = now; rec.lang = L;
    if(known){ rec.phone = ph; var nm3 = String(form.name || "").trim().slice(0, 60); if(nm3) rec.name = nm3; var wa3 = normPhone(form.wa); if(wa3) rec.wa = wa3; var ds3 = String(form.district || "").trim().slice(0, 40); if(ds3) rec.district = ds3; }
    if(DB.carts.length > 500) DB.carts.length = 500;
    saveDB();
  }, 1200);
}
var _saveCart0 = saveCart;
saveCart = function(){ _saveCart0.apply(this, arguments); trackCart(); };
document.addEventListener("input", function(e){ if(e.target.closest && e.target.closest("#bagBody") && /^(phone|name|wa|district)$/.test(e.target.dataset.f || "")) trackCart(); });
// an order placed with the same phone turns the cart into "Converted"
var _placeOrder0 = placeOrder;
placeOrder = function(){
  var before = (DB.orders || []).length, ph = normPhone(form && form.phone);
  var r = _placeOrder0.apply(this, arguments);
  var check = function(){ var o = DB.orders && DB.orders[0]; if(!o || DB.orders.length === before) return false; markConverted(normPhone(o.customer && o.customer.phone) || ph, o.ref); return true; };
  if(!check()){ setTimeout(check, 1500); setTimeout(check, 5000); }
  return r;
};
function markConverted(ph, ref){
  try{ localStorage.removeItem("st_cphone"); }catch(e){}
  var ch = false;
  (DB.carts || []).forEach(function(c){ if(c.status !== "converted" && ((ph && c.phone === ph) || (!c.phone && c.sid === sid()))){ c.status = "converted"; c.order = ref; c.updated = Date.now(); ch = true; } });
  if(ch) saveDB();
}
function cartStatus(c){ if(c.status === "pending" || c.status === "reminded"){ if(Date.now() - (c.updated || c.created) > SITE().cart.days * 864e5) return "expired"; } return c.status; }
function expireCarts(){ var ch = false; (DB.carts || []).forEach(function(c){ var s = cartStatus(c); if(s !== c.status){ c.status = s; ch = true; } }); if(ch && !isProd()) saveDB(); }
// a link in the reminder opens the same cart again
(function(){
  var m = /[?&]cart=([a-z0-9]{6,40})/.exec(location.search); if(!m) return;
  setTimeout(function(){
    var put = function(items){ var ok = (items || []).filter(function(l){ return BY[l.id]; }); if(ok.length){ cart.length = 0; ok.forEach(function(l){ cart.push({id:l.id, size:l.size, color:l.color, qty:l.qty}); }); _saveCart0(); openCart(); } };
    if(isProd()){ api("GET", "/api/cart/" + m[1]).then(function(r){ put(r.items); }, function(){ toast(L === "bn" ? "এই কার্টটি আর পাওয়া যাচ্ছে না" : "This cart is no longer available", ""); }); return; }
    var c = (DB.carts || []).filter(function(x){ return x.id === m[1]; })[0]; if(!c || !c.items) return;
    put(c.items);
  }, 600);
})();
// a short note under the phone field: the customer knows the number may be used for order messages
(function(){ var bb = $("#bagBody"); if(!bb || !window.MutationObserver) return;
  new MutationObserver(function(){ var lab = document.querySelector('#bagBody label[for="co_phone"]'); if(lab && !lab.querySelector(".consent") && SITE().cart.on){ var n = document.createElement("small"); n.className = "consent"; n.textContent = L === "bn" ? "এই নম্বরে শুধু অর্ডার সংক্রান্ত বার্তা পাঠানো হতে পারে।" : "We may message this number only about your order."; lab.appendChild(n); } }).observe(bb, {childList:true}); })();
// Meta: payment method chosen
document.addEventListener("change", function(e){ if(e.target.name === "pay" && e.target.closest("#bagBody") && typeof fbTrack === "function"){ var s = totals(); fbTrack("AddPaymentInfo", {value:s.tot, currency:"BDT", payment_type:e.target.value}); } });

// ================= 7. product sections: grid or auto-scrolling slider =================
var CARS = {};
function carSetup(key){
  var sel = SEC_EL[key], el = sel && $(sel); if(!el) return;
  var S = SITE().sections[key], old = CARS[key];
  if(old) old.destroy();
  var ctl = el.nextElementSibling && el.nextElementSibling.classList.contains("pcar-ctl") ? el.nextElementSibling : null;
  if(S.mode !== "slider"){ el.classList.remove("pcar"); if(ctl) ctl.remove(); delete CARS[key]; return; }
  el.classList.add("pcar");
  el.style.setProperty("--pc-d", clampN(S.d, 1, 6, 4)); el.style.setProperty("--pc-t", clampN(S.t, 1, 4, 3)); el.style.setProperty("--pc-m", clampN(S.m, 1, 3, 2));
  if(!ctl){ ctl = document.createElement("div"); ctl.className = "pcar-ctl"; el.parentNode.insertBefore(ctl, el.nextSibling); }
  var kids = function(){ return Array.prototype.filter.call(el.children, function(x){ return x.nodeType === 1 && x.offsetParent !== null; }); };
  var timer = 0, paused = false, idle = 0, visible = true, anim = 0, io2 = null, mo = null;
  var stepW = function(){ var k = kids(), w; if(k.length < 2) w = el.clientWidth; else w = Math.abs(k[1].getBoundingClientRect().left - k[0].getBoundingClientRect().left) || k[0].offsetWidth; return w > 0 ? w : 1; };
  var perView = function(){ return Math.max(1, Math.round(el.clientWidth / stepW())); };
  var pages = function(){ var n = Math.ceil(kids().length / perView()); return isFinite(n) ? Math.max(1, Math.min(50, n)) : 1; };
  var page = function(){ var max = el.scrollWidth - el.clientWidth; if(max <= 0) return 0; return Math.round(Math.abs(el.scrollLeft) / max * (pages() - 1)); };
  function go(x){
    cancelAnimationFrame(anim);
    var from = el.scrollLeft, dist = x - from, dur = reduce ? 0 : clampN(S.speed, 150, 2000, 600), t0 = performance.now();
    if(!dur){ el.scrollLeft = x; return; }
    el.style.scrollSnapType = "none";
    (function step(now){ var k = Math.min(1, (now - t0) / dur), e2 = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.scrollLeft = from + dist * e2; if(k < 1) anim = requestAnimationFrame(step); else { el.style.scrollSnapType = ""; paint(); } })(t0);
  }
  function move(dir){
    var max = el.scrollWidth - el.clientWidth; if(max <= 2) return;
    var x = el.scrollLeft + dir * stepW();
    if(x > max + 2){ if(!S.loop){ stop(); return; } x = 0; } else if(x > max) x = max;
    if(x < -2){ if(!S.loop) return; x = max; } else if(x < 0) x = 0;
    go(x);
  }
  function fits(){ return el.scrollWidth - el.clientWidth <= 2; }
  function paint(){
    if(!el.clientWidth || !el.offsetParent) return;
    ctl.hidden = (!S.arrows && !S.dots) || fits();
    if(S.dots){ var n = pages(), pg = page(), dots = ctl.querySelector(".pc-dots"); if(dots && dots.childElementCount !== n) dots.innerHTML = Array.apply(null, Array(n)).map(function(_, i){ return '<button type="button" aria-label="'+(i + 1)+'"></button>'; }).join(""); if(dots) Array.prototype.forEach.call(dots.children, function(b, i){ b.setAttribute("aria-current", String(i === pg)); }); }
  }
  function tick(){ if(paused || !visible || document.hidden || Date.now() < idle || fits()) return; move(S.dir === "rtl" ? -1 : 1); }
  function start(){ stop(); if(S.auto && !reduce) timer = setInterval(tick, clampN(S.sec, 2, 30, 3) * 1000); }
  function stop(){ clearInterval(timer); timer = 0; }
  function hold(){ idle = Date.now() + 6000; }
  ctl.innerHTML = (S.arrows ? '<button type="button" class="pc-arr" data-pc="-1" aria-label="Previous">'+ic("chevL")+'</button>' : '') + (S.dots ? '<span class="pc-dots"></span>' : '<span class="pc-sp"></span>') + (S.arrows ? '<button type="button" class="pc-arr" data-pc="1" aria-label="Next">'+ic("chevR")+'</button>' : '');
  ctl.hidden = !S.arrows && !S.dots;
  var onCtl = function(e){ var b = e.target.closest("[data-pc]"); if(b){ hold(); move(+b.dataset.pc); return; } var d = e.target.closest(".pc-dots button"); if(d){ hold(); var i = Array.prototype.indexOf.call(d.parentNode.children, d); go(Math.min(el.scrollWidth - el.clientWidth, i * perView() * stepW())); } };
  var onEnter = function(){ paused = true; }, onLeave = function(){ paused = false; }, onTouch = function(){ hold(); }, onScroll = function(){ clearTimeout(onScroll.t); onScroll.t = setTimeout(paint, 120); };
  ctl.addEventListener("click", onCtl);
  el.addEventListener("pointerenter", function(e){ if(e.pointerType === "mouse") onEnter(); });
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("touchstart", onTouch, {passive:true}); el.addEventListener("wheel", onTouch, {passive:true});
  el.addEventListener("focusin", onEnter); el.addEventListener("focusout", onLeave);
  el.addEventListener("scroll", onScroll, {passive:true});
  if("IntersectionObserver" in window){ io2 = new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }); io2.observe(el); }
  if(window.MutationObserver){ mo = new MutationObserver(function(){ el.scrollLeft = 0; paint(); }); mo.observe(el, {childList:true}); }
  var onResize = function(){ clearTimeout(onResize.t); onResize.t = setTimeout(paint, 200); }; window.addEventListener("resize", onResize);
  paint(); start();
  CARS[key] = {destroy:function(){ stop(); cancelAnimationFrame(anim); ctl.removeEventListener("click", onCtl); el.removeEventListener("pointerleave", onLeave); el.removeEventListener("touchstart", onTouch); el.removeEventListener("wheel", onTouch); el.removeEventListener("focusin", onEnter); el.removeEventListener("focusout", onLeave); el.removeEventListener("scroll", onScroll); if(io2) io2.disconnect(); if(mo) mo.disconnect(); window.removeEventListener("resize", onResize); }, move:move};
}
function carsAll(){ Object.keys(SEC_EL).forEach(function(k){ try{ carSetup(k); }catch(e){ if(window.console) console.warn("slider", k, e); } }); }
document.addEventListener("visibilitychange", function(){ /* timers skip ticks while the tab is hidden */ });

// ================= 8. display scale =================
function uiScaleApply(){
  var U = SITE().ui, phone = window.matchMedia("(max-width:760px)").matches;
  var base = clampN(phone ? U.m : U.d, 85, 120, 100), user = U.user ? clampN(lsGet("st_tz", "100"), 90, 115, 100) : 100;
  var z = Math.round(base * user / 100) / 100;
  if(phone){ var zmax = Math.max(1, Math.min(1.2, window.innerWidth / 348)); if(z > zmax) z = Math.floor(zmax * 100) / 100; }
  document.documentElement.style.setProperty("--uiz", String(z));
  document.body.classList.toggle("ui-z", z !== 1);
  $$(".tz button").forEach(function(b){ b.setAttribute("aria-pressed", String(+b.dataset.tz === user)); });
  $$(".tz").forEach(function(x){ x.hidden = !U.user; });
}
window.addEventListener("resize", function(){ clearTimeout(uiScaleApply.t); uiScaleApply.t = setTimeout(uiScaleApply, 200); });
// customer text size: A− A A+ in the menu and footer
(function(){
  var html = '<div class="tz" role="group" aria-label="Text size"><span>'+'Aa'+'</span><button type="button" data-tz="90" aria-label="Smaller text">A−</button><button type="button" data-tz="100" aria-label="Normal text">A</button><button type="button" data-tz="112" aria-label="Larger text">A+</button></div>';
  var foot = document.querySelector("footer .fbot, footer .copy, #fCopy"); if(foot && foot.parentNode){ var w = document.createElement("div"); w.innerHTML = html; foot.parentNode.insertBefore(w.firstChild, foot); }
  document.addEventListener("click", function(e){ var b = e.target.closest("[data-tz]"); if(!b) return; lsSet("st_tz", b.dataset.tz); uiScaleApply(); });
})();

// ================= 9. admin: Website Settings page (every new setting in one place) =================
PAGES.site2 = {t:"Website Settings", bn:"ওয়েবসাইট সেটিংস", s:"Brand, display, images, product sections, search, views and sharing", ic:"globe"};
PAGES.carts = {t:"Cart Recovery", bn:"কার্ট রিকভারি", s:"Carts left without ordering, and WhatsApp reminders", ic:"bag"};
PAGEFN.site2 = pgSite2; PAGEFN.carts = pgCarts;
NAV.forEach(function(g){ if(g[0] === "Website" && g[1].indexOf("site2") < 0) g[1].splice(1, 0, "site2"); if(g[0] === "Marketing" && g[1].indexOf("carts") < 0) g[1].unshift("carts"); });
if(DB && DB.settings && DB.settings.meta && DB.settings.meta.events && DB.settings.meta.events.AddPaymentInfo === undefined) DB.settings.meta.events.AddPaymentInfo = true;

var S2TABS = [["brand","Brand"],["display","Display & images"],["sections","Product sections"],["search","Search & views"],["share","Sharing & SEO"]];
var s2tab = "brand";
function xin(lbl, path, val, type, extra, ph){ return '<label class="fld">'+esc(lbl)+'<input type="'+(type || "text")+'" data-x="'+path+'" value="'+esc(val == null ? "" : val)+'"'+(extra || "")+(ph ? ' placeholder="'+esc(ph)+'"' : '')+'></label>'; }
function xsw(lbl, path, on){ return '<label class="sw2"><input type="checkbox" data-x="'+path+'"'+(on ? ' checked' : '')+'><i></i>'+esc(lbl)+'</label>'; }
function xsel(lbl, path, val, opts){ return '<label class="fld">'+esc(lbl)+'<select data-x="'+path+'">'+opts.map(function(o){ return '<option value="'+esc(o[0])+'"'+(String(val) === String(o[0]) ? ' selected' : '')+'>'+esc(o[1])+'</option>'; }).join("")+'</select></label>'; }
function ximg(lbl, path, val, hint){ return '<div class="fld">'+esc(lbl)+(hint ? ' <span style="font-weight:500">'+esc(hint)+'</span>' : '')+'</div><div class="imgrow"><span class="pv contain" style="background-image:url(\''+(val ? I(val) : '')+'\')"></span><label class="up-btn">'+ic("upload")+'Upload<input type="file" accept="image/*" data-ximg="'+path+'"></label>'+(val ? '<button class="lnkbtn" data-xclear="'+path+'">Remove</button>' : '')+'</div>'; }
function xreset(sec){ return '<button class="btn2 xreset" data-xreset="'+sec+'">'+ic("undo")+'Reset to default</button>'; }
function pgSite2(){
  var X = SITE(), B = X.brand;
  var h = '<div class="cztabs s2tabs" role="tablist">' + S2TABS.map(function(t2){ return '<button role="tab" aria-selected="'+(s2tab === t2[0])+'" data-s2tab="'+t2[0]+'">'+esc(t2[1])+'</button>'; }).join("") + '</div><div class="g2">';
  if(s2tab === "brand"){
    h += '<section class="card2"><div class="ch"><h3>'+ic("store")+'Name & logo</h3><span>Header, footer, invoices, admin, notifications</span></div>'
      + '<label class="fld">Shop name · দোকানের নাম<input type="text" data-xc="brand.name" value="'+esc(cfg.brand.name)+'" maxlength="40"></label>'
      + ximg("Logo", "@logo", cfg.brand.logo, "(PNG with a clear background works best)")
      + ximg("Light logo for dark backgrounds (optional)", "brand.logoLight", B.logoLight, "(admin menu, dark footer)")
      + '<p class="mut sm2">'+ic("info")+'No logo? The shop name is shown as a neat text logo. The old shop’s logo and pictures are never used under a new name.</p>'
      + xin("Theme colour", "brand.theme", B.theme, "color") + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("globe")+'Browser tab & Google</h3><span>Use {brand} to insert the shop name</span></div>'
      + '<div class="two">' + xin("Tab title (বাংলা)", "brand.title.bn", B.title.bn, "text", ' maxlength="70"', "{brand} — প্রিমিয়াম মডেস্ট ফ্যাশন") + xin("Tab title (English)", "brand.title.en", B.title.en, "text", ' maxlength="70"', "{brand} — Premium Modest Fashion") + '</div>'
      + '<div class="two">' + xin("Description (বাংলা)", "brand.desc.bn", B.desc.bn, "text", ' maxlength="160"') + xin("Description (English)", "brand.desc.en", B.desc.en, "text", ' maxlength="160"') + '</div>'
      + xsel("Language for first-time visitors", "brand.lang", B.lang, [["bn","বাংলা"],["en","English"]]) + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("phone")+'Phone app & icons</h3><span>Name and icon when someone adds the shop or admin to the home screen</span></div>'
      + '<div class="two">' + xin("App name", "brand.appName", B.appName, "text", ' maxlength="45"', BRAND() + " Admin") + xin("Short name (under the icon)", "brand.appShort", B.appShort, "text", ' maxlength="12"', BRAND().slice(0, 12)) + '</div>'
      + ximg("App icon", "brand.appIcon", B.appIcon, "(square, 512 × 512)") + ximg("Browser tab icon (favicon)", "brand.favicon", B.favicon, "(square)")
      + '<div class="appprev"><span class="api"><img src="'+(B.appIcon ? I(B.appIcon) : monogram(96, hexOk(B.theme) ? B.theme : "#0D2B26"))+'" alt=""></span><small>'+esc((B.appShort || BRAND()).slice(0, 12))+'</small></div>'
      + '<p class="mut sm2">'+ic("info")+'After changing the name or icon, remove the old home-screen icon and add it again. Phones keep the old one until then.</p></section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("check")+'Brand check</h3><span>Places still showing the old shop name or logo</span></div><div id="brandCheck">'+brandCheckHTML()+'</div>' + xreset("brand") + '</section>';
  } else if(s2tab === "display"){
    var I2 = X.img, U = X.ui;
    h += '<section class="card2"><div class="ch"><h3>'+ic("image")+'Product photos</h3><span>Same shape in every card, nothing important cut off</span></div>'
      + xsel("Card shape", "img.ratio", I2.ratio, RATIOS) + xsel("Default display", "img.fit", I2.fit, [["contain","Whole photo, no crop (recommended)"],["cover","Fill the card (uses each photo’s focus point)"]])
      + xin("Background behind photos", "img.bg", I2.bg, "color") + xsw("Save uploads as WebP (smaller, same quality)", "img.webp", I2.webp)
      + '<p class="mut sm2">'+ic("info")+'Each product can override this and set its own focus point in the product form.</p>' + xreset("img") + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("layers")+'Display scale</h3><span>Makes everything a little smaller or larger, on top of the phone’s own zoom</span></div>'
      + '<div class="two">' + xin("Phones (%)", "ui.m", U.m, "number", ' min="85" max="120" step="5" data-num="1"') + xin("Computers (%)", "ui.d", U.d, "number", ' min="85" max="120" step="5" data-num="1"') + '</div>'
      + xsw("Let customers choose text size (A− A A+ in the footer)", "ui.user", U.user) + '<p class="mut sm2">'+ic("info")+'85–120%. Browsers cannot change a phone’s real screen DPI; this scales the website’s own layout.</p>' + xreset("ui") + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("image")+'Homepage slider</h3><span>Phone banner, crop and focus are set per slide in Homepage & Branding</span></div>'
      + xsel("Slider height on computers", "hero.h", X.hero.h, [["s","Small"],["m","Medium"],["l","Large"]]) + '<button class="btn2" data-ap="site">'+ic("edit")+'Open slider editor</button>' + xreset("hero") + '</section>';
  } else if(s2tab === "sections"){
    h += Object.keys(SEC_EL).map(function(k){ var S = X.sections[k], p = "sections." + k + ".";
      return '<section class="card2"><div class="ch"><h3>'+ic("grid")+esc(SEC_LABEL[k])+'</h3><span>'+(S.mode === "slider" ? (S.auto ? "Slider · moves every " + S.sec + " s" : "Slider · moves only by hand") : "Grid")+'</span></div>'
        + '<div class="two">' + xsel("Layout", p + "mode", S.mode, [["grid","Grid"],["slider","Slider"]]) + xin("Move every (seconds)", p + "sec", S.sec, "number", ' min="2" max="30" data-num="1"') + '</div>'
        + '<div class="three">' + xin("Per row · computer", p + "d", S.d, "number", ' min="1" max="6" data-num="1"') + xin("Tablet", p + "t", S.t, "number", ' min="1" max="4" data-num="1"') + xin("Phone", p + "m", S.m, "number", ' min="1" max="3" data-num="1"') + '</div>'
        + '<div class="two">' + xsel("Direction", p + "dir", S.dir, [["ltr","Left to right →"],["rtl","Right to left ←"]]) + xin("Animation speed (ms)", p + "speed", S.speed, "number", ' min="150" max="2000" step="50" data-num="1"') + '</div>'
        + '<div class="flags2">' + xsw("Auto-scroll", p + "auto", S.auto) + xsw("Arrows", p + "arrows", S.arrows) + xsw("Dots", p + "dots", S.dots) + xsw("Loop back to start", p + "loop", S.loop) + '</div>'
        + xreset("sections." + k) + '</section>'; }).join("")
      + '<section class="card2 span2"><p class="mut sm2">'+ic("info")+'Auto-scroll pauses while a customer touches, scrolls or points at the row, and stays off for people who ask their phone for less motion.</p></section>';
  } else if(s2tab === "search"){
    var V = X.views;
    h += '<section class="card2"><div class="ch"><h3>'+ic("eye")+'Product view counter</h3><span>Counts each person once per 30 minutes; bots are left out</span></div>'
      + xsw("Count product views", "views.on", V.on) + xsw("Show the count to customers on the product page", "views.show", V.show)
      + xin("Show only from this many views", "views.min", V.min, "number", ' min="0" max="100000" data-num="1"')
      + '<p class="mut sm2">'+ic("info")+'Each product can also be set to always show or always hide its count, in the product form.</p>' + xreset("views") + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("eye")+'Most viewed</h3><span>Total views · different visitors</span></div>' + topViewed(8) + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("search")+'Search</h3><span>What a customer sees before typing</span></div>'
      + xsw("Recent searches on this phone", "search.recent", X.search.recent) + xsw("Popular categories and products", "search.popular", X.search.popular)
      + '<p class="mut sm2">'+ic("info")+'On phones the first tap opens these suggestions; the keyboard opens when the customer taps the search box.</p>' + xreset("search") + '</section>';
  } else {
    var withS = P.filter(function(p){ return p.shareImg && p._shareFrom === p.img; }).length;
    h += '<section class="card2"><div class="ch"><h3>'+ic("fb")+'Facebook share pictures</h3><span>'+withS+' of '+P.length+' products ready</span></div>'
      + '<p class="mut sm2">Every product gets a 1200 × 630 picture with the whole product visible, so Facebook and WhatsApp never cut it. New products get one when saved.</p>'
      + '<button class="btn b-em sm" data-a="bulkshare">'+ic("image")+'Make missing share pictures</button>'
      + ximg("Default share picture (homepage and category links)", "brand.shareImg", X.brand.shareImg, "(1200 × 630)") + '</section>'
      + '<section class="card2"><div class="ch"><h3>'+ic("globe")+'Google</h3><span>Added automatically</span></div><ul class="chk2">'
      + ['Product name, price, stock and brand as structured data on every product page','Page title and description from the Brand tab','One canonical address per product page','Product photos load only when they come into view; the first banner loads first'].map(function(x){ return '<li>'+ic("check")+esc(x)+'</li>'; }).join("") + '</ul></section>';
  }
  return h + '</div>';
}
function topViewed(n){
  var rows = P.map(function(p){ return [p, viewsOf(p.id)]; }).filter(function(r){ return r[1].t; }).sort(function(a, b){ return b[1].t - a[1].t; }).slice(0, n);
  if(!rows.length) return '<p class="empty2">No views yet. Views are counted when customers open products.</p>';
  return '<ol class="tops">' + rows.map(function(r){ return '<li><span class="th" style="--tint:'+r[0].tint+'"><img src="'+I(r[0].img)+'" alt=""></span><span><b>'+esc(r[0].en)+'</b><small>'+r[1].u+' visitors</small></span><b>'+r[1].t+'</b></li>'; }).join("") + '</ol>';
}
function brandCheckHTML(){
  var name = BRAND(), issues = [];
  if(name !== ORIG_BRAND){
    var txt = Array.prototype.filter.call(document.body.children, function(x){ return x.id !== "admin" && x.tagName !== "SCRIPT"; }).map(function(x){ return x.textContent || ""; }).join(" ");
    if(/Sitraya|SITRAYA|সিত্রায়া|سيترايا/.test(txt.replace(/owner@sitraya\.com/gi, ""))) issues.push("The old name still appears in some text you wrote (pages, slides or products). Search for it in Homepage & Branding and Website Pages.");
    if(cfg.slides.some(function(s){ return s.on && s.img === "cover"; })) issues.push("The first slide uses the default cover. It now shows a plain banner with your name; upload your own banner.");
  }
  if(!cfg.brand.logo) issues.push("No logo uploaded — the shop name is shown as a text logo.");
  return issues.length ? '<ul class="chk2 warn">' + issues.map(function(x){ return '<li>'+ic("info")+esc(x)+'</li>'; }).join("") + '</ul>' : '<p class="okline">'+ic("check")+'Everything uses “'+esc(name)+'”.</p>';
}
function xget(path){ return path.split(".").reduce(function(o, k){ return o == null ? undefined : o[k]; }, SITE()); }
function xvalid(path, v, el){
  if(el.type === "checkbox") return !!v;
  if(el.dataset.num){ var lo = +el.min, hi = +el.max, n = Math.round(+v); if(!isFinite(n) || n < lo || n > hi){ return {err:"Use a number from " + lo + " to " + hi + "."}; } return n; }
  if(el.type === "color") return hexOk(v) ? v : {err:"Choose a colour."};
  if(el.tagName === "SELECT") return Array.prototype.some.call(el.options, function(o){ return o.value === v; }) ? v : {err:"Choose an option."};
  return String(v).slice(0, +el.maxLength > 0 ? +el.maxLength : 300);
}
function xmsg(el, err){ var f = el.closest(".fld, .sw2"); if(!f) return; var m = f.querySelector(".xerr"); if(err){ if(!m){ m = document.createElement("em"); m.className = "xerr"; f.appendChild(m); } m.textContent = err; el.setAttribute("aria-invalid", "true"); } else { if(m) m.remove(); el.removeAttribute("aria-invalid"); } }
var x2Timer;
function xapply(label, full){ clearTimeout(x2Timer); x2Timer = setTimeout(function(){ saveDB(); logA("Website settings changed", label); toast("Saved", label); if(full) renderAll(true); else { applyStatic(); carsAll(); } var bc = $("#brandCheck"); if(bc) bc.innerHTML = brandCheckHTML(); }, 500); }
$("#admin").addEventListener("input", function(e){
  var el = e.target, k;
  if((k = el.dataset.x)){ if(el.dataset.num && e.type === "input" && el.value === "") return; var v = xvalid(k, el.type === "checkbox" ? el.checked : el.value, el); if(v && v.err){ xmsg(el, v.err); return; } xmsg(el, ""); setDeep(SITE(), k, v); xapply(k); return; }
  if((k = el.dataset.xc)){ var nm2 = String(el.value).trim().slice(0, 40); if(!nm2){ xmsg(el, "The shop needs a name."); return; } xmsg(el, ""); setDeep(cfg, k, nm2); saveCfg(); xapply("Shop name", true); }
});
$("#admin").addEventListener("change", function(e){
  var el = e.target, k = el.dataset.ximg; if(!k || !el.files || !el.files[0]) return;
  readImg(el.files[0], k === "brand.shareImg" ? 1200 : 1024, function(url){ if(k === "@logo"){ cfg.brand.logo = url; saveCfg(); } else setDeep(SITE(), k, url); saveDB(); applyStatic(); aRender(); toast("Image saved", ""); });
});
$("#admin").addEventListener("click", function(e){
  var b;
  if((b = e.target.closest("[data-s2tab]"))){ s2tab = b.dataset.s2tab; aRender(); return; }
  if((b = e.target.closest("[data-xclear]"))){ var k = b.dataset.xclear; if(k === "@logo"){ cfg.brand.logo = ""; saveCfg(); } else setDeep(SITE(), k, ""); saveDB(); applyStatic(); aRender(); return; }
  if((b = e.target.closest("[data-xreset]"))){ var sec = b.dataset.xreset, def = sec.split(".").reduce(function(o, k){ return o[k]; }, SITE_DEF);
    if(!confirm("Put “" + sec + "” back to its default settings? Other settings stay as they are.")) return;
    setDeep(SITE(), sec, clone(def)); saveDB(); logA("Settings reset to default", sec); applyStatic(); carsAll(); aRender(); toast("Back to default", sec); return; }
  if((b = e.target.closest('[data-a="bulkshare"]'))){ bulkShare(b); return; }
});

// ---------- product form: focus point, share picture, view count ----------
var _aProduct0 = aProduct;
aProduct = function(id){
  _aProduct0.apply(this, arguments);
  var d = A.draft, body = $("#adB"); if(!d || !body) return;
  var first = body.querySelector("section.fs"); if(!first) return;
  var sec = document.createElement("section"); sec.className = "fs";
  sec.innerHTML = '<h4 class="fsh">'+ic("image")+'<span>Photo display · ছবি কিভাবে দেখাবে</span></h4><div id="fpkHost">'+focusBlock(d)+'</div>';
  first.parentNode.insertBefore(sec, first.nextSibling);
  var vis = Array.prototype.filter.call(body.querySelectorAll("section.fs"), function(s){ return /Visibility/.test(s.textContent); })[0];
  if(vis){ var w = document.createElement("div"); var v = viewsOf(d.id);
    w.innerHTML = '<label class="fld">View count on the product page<select data-pd="views"><option value=""'+(!d.views ? ' selected' : '')+'>Shop setting</option><option value="show"'+(d.views === "show" ? ' selected' : '')+'>Always show</option><option value="hide"'+(d.views === "hide" ? ' selected' : '')+'>Never show</option></select></label>'+(d.id ? '<p class="mut sm2">'+ic("eye")+v.t+' views · '+v.u+' visitors</p>' : '');
    vis.appendChild(w); }
  var pv = $("#pPv"); if(pv && window.MutationObserver) new MutationObserver(function(){ refreshFocus(); }).observe(pv, {attributes:true, attributeFilter:["style"]});
};

// ---------- products list and dashboard: views ----------
(function(){ var body = $("#aBody"); if(!body || !window.MutationObserver) return;
  new MutationObserver(function(){
    if(A.page === "products") $$("#aPT tr").forEach(function(tr){ var b = tr.querySelector(".pc[data-ape]"); if(!b || b.querySelector(".vw")) return; var v = viewsOf(b.dataset.ape); var sm = b.querySelector("small"); if(sm) sm.insertAdjacentHTML("beforeend", ' · <span class="vw">'+ic("eye")+v.t+'</span>'); });
    if(A.page === "dashboard" && !body.querySelector("#dashViews")){ var g = body.querySelector(".g3") || body.lastElementChild; if(g){ var s = document.createElement("section"); s.className = "card2"; s.id = "dashViews"; s.innerHTML = '<div class="ch"><h3>Most viewed</h3><button class="lk" data-ap="site2">Settings</button></div>' + topViewed(5); g.appendChild(s); } }
  }).observe(body, {childList:true}); })();

// ================= 10. admin: Cart Recovery =================
var cFilter = "pending";
var CST = {pending:["Pending","#8A4B08","#FEF0C7"], reminded:["Reminded","#1D4ED8","#DBEAFE"], converted:["Converted","#166534","#DCFCE7"], expired:["Expired","#475569","#E2E8F0"]};
function cpill(s){ var c = CST[s] || CST.pending; return '<span class="pl" style="color:'+c[1]+';background:'+c[2]+'"><i style="background:'+c[1]+'"></i>'+c[0]+'</span>'; }
function cartLink(c){ var dom = (DB.settings.store.domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, ""); return (dom ? "https://" + dom : location.href.split("?")[0].split("#")[0]) + "?cart=" + c.id; }
function cartMsg(c){
  var T2 = SITE().cart.tpl, lang = c.lang === "en" ? "en" : "bn", tpl = String(T2[lang] || "").trim() || SITE_DEF.cart.tpl[lang], names = (c.items || []).map(function(l){ var p = BY[l.id]; return p ? (lang === "bn" ? p.bn : p.en) + (l.qty > 1 ? " ×" + l.qty : "") : ""; }).filter(Boolean);
  return tpl.replace(/\{name\}/g, c.name || (lang === "bn" ? "" : "there")).replace(/\{brand\}/g, BRAND()).replace(/\{products\}/g, names.join(", ")).replace(/\{total\}/g, "৳" + Number(c.value || 0).toLocaleString("en-IN")).replace(/\{link\}/g, cartLink(c)).replace(/\s+,/g, ",").replace(/ {2,}/g, " ");
}
function canRemind(c){
  var C = SITE().cart, last = c.reminders && c.reminders.length ? c.reminders[c.reminders.length - 1] : 0, st = cartStatus(c);
  if(!c.phone) return "No phone number";
  if(c.optout) return "Customer asked not to be messaged";
  if(st === "converted") return "Already ordered";
  if(st === "expired") return "Older than " + C.days + " days";
  if((c.reminders || []).length >= C.max) return "Reached " + C.max + " reminders";
  if(last && Date.now() - last < C.cool * 3600e3) return "Wait until " + fdt(last + C.cool * 3600e3);
  return "";
}
var cLoad = 0, cAnon = null;
function cartsFromServer(){ if(!isProd() || Date.now() - cLoad < 15000) return; cLoad = Date.now();
  api("GET", "/api/admin/carts").then(function(r){ DB.carts = r.carts || []; cAnon = r.anon || null; if(A.page === "carts") aRender(); }, function(e){ toast("Could not load carts", errText(e)); }); }
function pgCarts(){
  if(isProd()){ if(!DB.carts){ cartsFromServer(); return '<p class="empty2">Loading carts…</p>'; } cartsFromServer(); }
  expireCarts();
  var list = DB.carts || [], C = SITE().cart, cnt = {pending:0, reminded:0, converted:0, expired:0}, val = {pending:0, reminded:0, converted:0, expired:0}, anon = 0, anonV = 0;
  var withPhone = {}; list.forEach(function(c){ if(c.phone && c.sid) withPhone[c.sid] = 1; });
  list.forEach(function(c){ var s = cartStatus(c); if(!c.phone){ if(s === "pending" && !withPhone[c.sid]){ anon++; anonV += c.value || 0; } return; } cnt[s]++; val[s] += c.value || 0; });
  if(cAnon){ anon = cAnon.n; anonV = cAnon.v; }
  var tile = function(k, lbl, n, v){ return '<button class="stat2'+(cFilter === k ? ' on' : '')+'" data-cf="'+k+'"><span>'+esc(lbl)+'</span><b>'+n+'</b><small>'+amt(v)+'</small></button>'; };
  var shown = list.filter(function(c){ return c.phone && cartStatus(c) === cFilter; });
  return '<div class="stats2">' + tile("pending", "Waiting", cnt.pending, val.pending) + tile("reminded", "Reminded", cnt.reminded, val.reminded) + tile("converted", "Ordered after", cnt.converted, val.converted) + tile("expired", "Expired", cnt.expired, val.expired) + '</div>'
    + '<p class="mut sm2">'+ic("info")+'A cart is saved only after the customer types a phone number at checkout.'+(anon ? ' '+anon+' more cart'+(anon > 1 ? 's' : '')+' ('+amt(anonV)+') were left by visitors who gave no contact, so they cannot be reminded.' : '')+'</p>'
    + '<section class="card2 flush">' + (shown.length ? '<div class="clist">' + shown.map(cartRow).join("") + '</div>' : '<p class="empty2">No carts here.</p>') + '</section>'
    + '<section class="card2"><div class="ch"><h3>'+ic("wa")+'Reminder settings</h3><span>Use {name}, {products}, {total}, {link}, {brand}</span></div>'
    + xsw("Save carts left at checkout", "cart.on", C.on)
    + '<div class="three">' + xin("Expire after (days)", "cart.days", C.days, "number", ' min="1" max="60" data-num="1"') + xin("Wait between reminders (hours)", "cart.cool", C.cool, "number", ' min="1" max="720" data-num="1"') + xin("Most reminders per cart", "cart.max", C.max, "number", ' min="1" max="5" data-num="1"') + '</div>'
    + '<label class="fld">Message (বাংলা)<textarea data-x="cart.tpl.bn" rows="3" maxlength="600">'+esc(C.tpl.bn || SITE_DEF.cart.tpl.bn)+'</textarea></label><label class="fld">Message (English)<textarea data-x="cart.tpl.en" rows="3" maxlength="600">'+esc(C.tpl.en || SITE_DEF.cart.tpl.en)+'</textarea></label>'
    + '<p class="mut sm2">'+ic("info")+'The button opens WhatsApp with this message ready; you press Send yourself. Sending by itself needs the paid WhatsApp Business Platform, which is not connected.</p>' + xreset("cart") + '</section>';
}
function cartRow(c){
  var why = canRemind(c), last = c.reminders && c.reminders.length ? c.reminders[c.reminders.length - 1] : 0, wa = (c.wa || c.phone || "").replace(/^0/, "880");
  return '<div class="crow" data-cid="'+c.id+'"><div class="cwho"><b>'+esc(c.name || "No name")+'</b><span class="mono">'+esc(c.phone)+'</span>'+(c.district ? '<small>'+esc(c.district)+'</small>' : '')+'</div>'
    + '<div class="citems">' + (c.items || []).map(function(l){ var p = BY[l.id]; return p ? '<span class="ci" title="'+esc(p.en)+'"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img)+'" alt=""></span><small>'+esc(p.en)+' · '+esc(l.size)+' ×'+l.qty+'</small></span>' : ''; }).join("") + '</div>'
    + '<div class="cval"><b>'+amt(c.value)+'</b><small>'+fdt(c.updated || c.created)+'</small>'+cpill(cartStatus(c))+(c.reminders && c.reminders.length ? '<small>'+c.reminders.length+' reminder'+(c.reminders.length > 1 ? 's' : '')+' · last '+fdt(last)+'</small>' : '')+(c.order ? '<small>Order '+esc(c.order)+'</small>' : '')+'</div>'
    + '<div class="cact">' + (why ? '<span class="mut sm2">'+esc(why)+'</span>' : '<a class="btn b-wa sm" target="_blank" rel="noopener" data-crem="'+c.id+'" href="https://wa.me/'+esc(wa)+'?text='+encodeURIComponent(cartMsg(c))+'">'+ic("wa")+'WhatsApp reminder</a>')
    + '<div class="cconf" hidden><span>Did you press Send in WhatsApp?</span><button class="btn2" data-csent="'+c.id+'">Yes, mark reminded</button><button class="lk" data-cnot>Not sent</button></div>'
    + '<label class="sw2 xs"><input type="checkbox" data-copt="'+c.id+'"'+(c.optout ? ' checked' : '')+'><i></i>Do not message</label></div></div>';
}
$("#admin").addEventListener("click", function(e){
  var b;
  if((b = e.target.closest("[data-cf]"))){ cFilter = b.dataset.cf; aRender(); return; }
  if((b = e.target.closest("[data-crem]"))){ var row = b.closest(".crow"), cf = row && row.querySelector(".cconf"); if(cf) setTimeout(function(){ cf.hidden = false; }, 400); return; }
  if((b = e.target.closest("[data-csent]"))){ var c = (DB.carts || []).filter(function(x){ return x.id === b.dataset.csent; })[0]; if(!c) return; if(canRemind(c)){ toast("Not marked", canRemind(c)); return; }
    if(isProd()){ b.disabled = true; api("POST", "/api/admin/carts/" + c.id + "/reminded", {}).then(function(r){ Object.assign(c, r.cart); toast("Marked as reminded", c.phone); aRender(); }, function(err){ b.disabled = false; toast("Not marked", errText(err)); }); return; }
    c.reminders = (c.reminders || []).concat(Date.now()); c.status = "reminded"; logA("Cart reminder sent", (c.name || "") + " " + c.phone); aSaved("Marked as reminded", c.phone); aRender(); return; }
  if((b = e.target.closest("[data-cnot]"))){ var cc = b.closest(".cconf"); if(cc) cc.hidden = true; return; }
});
$("#admin").addEventListener("change", function(e){ var k = e.target.dataset.copt; if(!k) return; var c = (DB.carts || []).filter(function(x){ return x.id === k; })[0]; if(!c) return;
  if(isProd()){ var want = e.target.checked; api("PATCH", "/api/admin/carts/" + c.id, {optout:want}).then(function(r){ Object.assign(c, r.cart); toast(want ? "Will not be messaged" : "Messages allowed", c.phone); aRender(); }, function(err){ toast("Not saved", errText(err)); aRender(); }); return; }
  c.optout = e.target.checked; logA(c.optout ? "Customer opted out of messages" : "Customer messages allowed", c.phone); aSaved(c.optout ? "Will not be messaged" : "Messages allowed", c.phone); aRender(); });

// ================= 11. start =================
var _renderAll0 = renderAll;
renderAll = function(){ _renderAll0.apply(this, arguments); try{ carsAll(); heroApply(); }catch(e){ if(window.console) console.warn(e); } };
function heroApply(){ var h = SITE().hero.h; document.body.dataset.hero = /^(s|m|l)$/.test(h) ? h : "m"; }
