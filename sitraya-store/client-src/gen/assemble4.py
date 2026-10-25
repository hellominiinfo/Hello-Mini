import re, os, json, base64, sys
B = sys.argv[1]
S = os.path.join(B, "site")
src = open(os.path.join(S, "sitriya3.src.html")).read()

def rep(a, b, count=1, s=None):
    global src
    n = src.count(a)
    assert n == count, (n, a[:90])
    src = src.replace(a, b)

# ---------- HTML ----------
rep('<button class="czbtn" id="openCz"><i data-ic="edit"></i><span data-t="customize"></span></button>',
    '<a class="czbtn" href="#admin"><i data-ic="lock"></i><span data-t="admin_btn"></span></a>')
m = re.search(r'<aside class="cz" id="cz".*?</aside>\n', src, re.S); assert m
src = src[:m.start()] + src[m.end():]
rep('<div class="sum"><span data-t="subtotal"></span><span id="sub"></span></div>',
    '<div class="sum"><span data-t="subtotal"></span><span id="sub"></span></div>\n    <div class="sum" id="discRow" hidden><span data-t="discount"></span><span id="disc" style="color:var(--mint);font-weight:700"></span></div>')
rep('<div class="toast" id="toast" role="status">',
    '<div class="modal tk" id="trk" role="dialog" aria-modal="true" aria-labelledby="trkH" aria-hidden="true"><div class="tkin"><button class="x" data-close data-ta="close"><i data-ic="x"></i></button><h2 id="trkH" data-t="trk_h"></h2><p data-t="trk_p"></p><form class="tkf" id="trkForm" novalidate><label class="cf" for="trkRef"><span data-t="trk_ref"></span><input id="trkRef" autocapitalize="characters" placeholder="ST-XXXXXX"></label><label class="cf" for="trkPh"><span data-t="f_phone"></span><input id="trkPh" type="tel" inputmode="tel" placeholder="01XXXXXXXXX"></label><button class="btn b-em" type="submit"><span data-t="trk_btn"></span></button></form><div id="trkRes" aria-live="polite"></div></div></div>\n\n<div class="toast" id="toast" role="status">')
rep('\n<script>\n(function(){', '\n' + open(os.path.join(S, "parts/admin.html")).read() + '\n<script>\n(function(){')
rep('</style>', open(os.path.join(S, "parts/admin.css")).read() + '\n' + open(os.path.join(S, "parts/phase1.css")).read() + '\n' + open(os.path.join(S, "parts/phase2.css")).read() + '\n</style>')

# ---------- JS ----------
assert src.count("P.filter(") == 9, src.count("P.filter(")
src = src.replace("P.filter(", "PL().filter(")
rep('var P = [\n  {id:"n1"', 'var DEFAULT_P = [\n  {id:"n1"')
rep('var BY = {}; P.forEach(function(p){ BY[p.id] = p; });', 'var DB, P, BY = {}, cfg, DBKEY = "st4_db", FLOW_S = ["received","confirmed","processing","shipped","delivered"];')
rep('var CATS = [\n', 'var DEFAULT_CATS = [\n')
rep('var CAT = {}; CATS.forEach(function(c){ CAT[c.id] = c; });', 'var CATS, CAT = {};')
rep('var minOf = function(cat){ return Math.min.apply(null, PL().filter(function(p){ return p.cat === cat; }).map(price)); };',
    'var minOf = function(cat){ var m = Math.min.apply(null, PL().filter(function(p){ return p.cat === cat; }).map(price)); return isFinite(m) ? m : 0; };')
rep('var cfg = (function(){ var c = store.get("st3_cfg", null); return c && c.v === DEF.v ? c : clone(DEF); })();', 'initDB();')
rep('function saveCfg(){ if(!store.set("st3_cfg", cfg)) toast(', 'function saveCfg(){ if(!store.set(DBKEY, DB)) toast(')
rep('var cart = store.get("st3_cart", []).filter(function(l){ return BY[l.id]; });', 'var cart = store.get("st3_cart", []).filter(function(l){ return BY[l.id] && BY[l.id].status === "active"; });')
rep("(CAT[s.link] ? '<span class=\"from\">'", "(CAT[s.link] && minOf(s.link) ? '<span class=\"from\">'")
rep("(CAT[c.link] ? '<span class=\"pr\">'", "(CAT[c.link] && minOf(c.link) ? '<span class=\"pr\">'")
rep('''function add(id, size, qty, color){
  var p = BY[id]; size = size || p.sizes[0]; color = color || p.colors[0];
  var l = cart.filter(function(x){ return x.id === id && x.size === size && x.color === color; })[0];
  if(l) l.qty = Math.min(10, l.qty + qty); else cart.push({id:id, size:size, color:color, qty:qty});
  saveCart();
}''', '''function add(id, size, qty, color){
  var p = BY[id]; if(!p) return false;
  if(!size){ var v = firstAvail(p); if(!v){ toast(t("oos"), nm(p), id); return false; } size = v.size; color = v.color; }
  color = color || p.colors[0];
  var left = stockOf(p, size, color) - inCart(id, size, color);
  if(left < qty){ toast(left > 0 ? fill(t("only_left"), num(left)) : t("oos"), nm(p), id); return false; }
  var l = cart.filter(function(x){ return x.id === id && x.size === size && x.color === color; })[0];
  if(l) l.qty += qty; else cart.push({id:id, size:size, color:color, qty:qty});
  saveCart(); return {size:size, color:color};
}''')
rep('return {sub:sub, del:del, free:free, tot:sub + del, n:', 'var disc = couponDisc(sub);\n  return {sub:sub, disc:disc, del:del, free:free, tot:sub - disc + del, n:')
rep('''  $("#sub").textContent = money(s.sub);
  $("#del").innerHTML = s.free ? '<span class="free">'+esc(t("free"))+'</span>' : money(s.del);
  $("#tot").textContent = money(s.tot);''', '  paintSums(s);')
rep('function renderCart(){\n  var s = totals(), D = cfg.delivery;',
    'function renderCart(){\n  if(bagView !== "cart"){ renderCheckout(); return; }\n  $("#bagWa").hidden = false; $("#checkout span").textContent = t("checkout");\n  var s = totals(), D = cfg.delivery;')
rep('else if(b.dataset.inc !== undefined){ var l = cart[+b.dataset.inc]; l.qty = Math.min(10, l.qty + 1); }',
    'else if(b.dataset.inc !== undefined){ var l = cart[+b.dataset.inc]; if(l.qty < stockOf(BY[l.id], l.size, l.color)) l.qty++; else toast(fill(t("only_left"), num(l.qty)), nm(BY[l.id]), l.id); }')
rep('$("#checkout").addEventListener("click", function(){ toast(t("checkout_soon"), "Demo"); });',
    '$("#checkout").addEventListener("click", function(){ if(bagView === "cart") openCheckout(); else placeOrder(); });')
rep('var PANELS = ["#menu", "#cart", "#pm", "#search", "#cz"];', 'var PANELS = ["#menu", "#cart", "#pm", "#search", "#trk"];')
rep('function openCart(){ renderCart(); openPanel($("#cart")); }', 'function openCart(){ if(bagView === "done") bagView = "cart"; renderCart(); openPanel($("#cart")); }')
rep('pm = {id:id, size:p.sizes[0], color:p.colors[0], qty:1, bg:0};',
    'var fv = firstAvail(p) || (p.variants || [])[0] || {size:p.sizes[0], color:p.colors[0]}; pm = {id:id, size:fv.size, color:fv.color, qty:1, bg:0};')
rep('var p = BY[pm.id], o = off(p);', 'var p = BY[pm.id], o = off(p), left = stockOf(p, pm.size, pm.color) - inCart(p.id, pm.size, pm.color), dis = left < 1;')
rep("""return '<button class="size" data-size="'+esc(s)+'" aria-pressed="'+(s === pm.size)+'">'+esc(s)+'</button>';""",
    """var z = stockOf(p, s, pm.color) < 1; return '<button class="size" data-size="'+esc(s)+'" aria-pressed="'+(s === pm.size)+'"'+(z ? ' disabled title="'+esc(t("oos"))+'"' : '')+'>'+esc(s)+'</button>';""")
rep("""<span class="stock"><i></i>'+esc(t("instock"))+'</span></div>'""",
    """<span class="stock'+(dis ? ' out' : left <= 3 ? ' low' : '')+'"><i></i>'+esc(dis ? t("oos") : left <= 3 ? fill(t("only_left"), num(left)) : t("instock"))+'</span></div>'""")
rep("""'<div class="mbtns"><button class="btn b-gold" id="pmAdd">'""", """'<div class="mbtns"><button class="btn b-gold" id="pmAdd"'+(dis ? ' disabled' : '')+'>'""")
rep("""<button class="btn b-ink" id="pmBuy">'""", """<button class="btn b-ink" id="pmBuy"'+(dis ? ' disabled' : '')+'>'""")
rep("""href="https://wa.me/?text='+encodeURIComponent((L === "bn" ? "আসসালামু আলাইকুম, আমি অর্ডার করতে চাই""",
    """href="'+waBase()+'?text='+encodeURIComponent((L === "bn" ? "আসসালামু আলাইকুম, আমি অর্ডার করতে চাই""")
rep('if((b = e.target.closest("[data-color]"))){ pm.color = b.dataset.color; renderPMInfo(); }',
    'if((b = e.target.closest("[data-color]"))){ pm.color = b.dataset.color; if(stockOf(BY[pm.id], pm.size, pm.color) < 1){ var fa = firstAvail(BY[pm.id], pm.color); if(fa) pm.size = fa.size; } pm.qty = 1; renderPMInfo(); }')
rep('pm.size = b.dataset.size; renderPMInfo();', 'pm.size = b.dataset.size; pm.qty = 1; renderPMInfo();')
rep('pm.qty = Math.min(10, pm.qty + 1);', 'pm.qty = Math.min(Math.max(1, stockOf(BY[pm.id], pm.size, pm.color) - inCart(pm.id, pm.size, pm.color)), pm.qty + 1);')
rep('else if(e.target.closest("#pmAdd")){ add(pm.id, pm.size, pm.qty, pm.color); closeAll(true); fly($("#mstage"), pm.id); toast(nm(BY[pm.id]), t("size") + " " + pm.size + " · " + t("added"), pm.id, true); }',
    'else if(e.target.closest("#pmAdd")){ if(add(pm.id, pm.size, pm.qty, pm.color)){ closeAll(true); fly($("#mstage"), pm.id); toast(nm(BY[pm.id]), t("size") + " " + pm.size + " · " + t("added"), pm.id, true); } }')
rep('else if(e.target.closest("#pmBuy")){ add(pm.id, pm.size, pm.qty, pm.color); openCart(); }',
    'else if(e.target.closest("#pmBuy")){ if(add(pm.id, pm.size, pm.qty, pm.color)) openCart(); }')
rep('document.addEventListener("click", function(e){\n  var el = e.target.closest("[data-lang]");',
    'document.addEventListener("click", function(e){\n  if(e.target.closest("#admin")) return;\n  var tkl = e.target.closest(\'a[href="#track"]\'); if(tkl){ e.preventDefault(); openTrack(); return; }\n  var adl = e.target.closest(\'a[href="#admin"]\'); if(adl){ e.preventDefault(); goAdmin(true); return; }\n  var el = e.target.closest("[data-lang]");')
rep('if(tg.dataset.add){ var p = BY[tg.dataset.add]; add(p.id, null, 1); var src = tg.closest(".card,.bigc"); fly(src ? src.querySelector("img") : tg, p.id); toast(nm(p), t("size") + " " + p.sizes[0] + " · " + t("added"), p.id, true); return; }',
    'if(tg.dataset.add){ var p = BY[tg.dataset.add], rr = add(p.id, null, 1); if(rr){ var src = tg.closest(".card,.bigc"); fly(src ? src.querySelector("img") : tg, p.id); toast(nm(p), t("size") + " " + rr.size + " · " + t("added"), p.id, true); } return; }')
rep('if(tg.dataset.buy){ add(tg.dataset.buy, null, 1); openCart(); return; }', 'if(tg.dataset.buy){ if(add(tg.dataset.buy, null, 1)) openCart(); return; }')
rep("""+ '<button class="btn b-em add" data-add="'+p.id+'">'+ic("bag")+esc(t("add"))+'</button></div></article>';""",
    """+ (totalStock(p) ? '<button class="btn b-em add" data-add="'+p.id+'">'+ic("bag")+esc(t("add"))+'</button>' : '<button class="btn add" disabled>'+esc(t("oos"))+'</button>') + '</div></article>';""")
n = src.count("I(p.id)"); assert n >= 6, n
src = src.replace("I(p.id)", "I(p.img || p.id)")
rep("""th.innerHTML = '<img src="'+I(thumbKey)+'" alt="">';""", """th.innerHTML = '<img src="'+I(BY[thumbKey].img || thumbKey)+'" alt="">';""")
rep('img.src = I(key);', 'img.src = I((BY[key] || {}).img || key);')
rep('"https://wa.me/?text="', 'waBase() + "?text="', 2)
rep('$("#tickerBar").hidden = !cfg.tickerOn;', '$("#tickerBar").hidden = !cfg.tickerOn; applySettings();')
rep('$("#openCz").addEventListener("click", function(){ renderCZ(); openPanel($("#cz")); });\n', '')
rep('cfg = clone(DEF); saveCfg(); renderAll(); renderCZ();', 'cfg = DB.cfg = clone(DEF); logA("Website content reset", ""); saveCfg(); renderAll(); renderCZ();')
rep('  saveCfg(); renderSlides(true); renderPromos(); renderTicker(); applyStatic(); renderCZ();\n});',
    '  logA("Website content changed", a); saveCfg(); renderSlides(true); renderPromos(); renderTicker(); applyStatic(); renderCZ();\n});')
rep('function renderAll(keepSlide){\n  applyStatic();', 'function renderAll(keepSlide){\n  P = DB.products; CATS = DB.categories; cfg = DB.cfg; reindex();\n  applyStatic();')
rep('// ================= boot =================',
    open(os.path.join(S, "parts/store_add.js")).read() + "\n" + open(os.path.join(S, "parts/admin.js")).read() + "\n" + open(os.path.join(S, "parts/polish.js")).read() + "\n" + open(os.path.join(S, "parts/phase1.js")).read() + "\n" + open(os.path.join(S, "parts/phase2.js")).read() + "\n// ================= boot =================")
rep('paintIcons();\nrenderAll();\n', 'paintIcons();\nrenderAll();\nif(location.hash === "#admin") showView();\nloadVideos(function(n){ if(n){ renderAll(true); if(wasAdmin && A.logged) aRender(); } });\n')
src = src.replace("<title>Sitraya Homepage</title>", "<title>Sitraya Store</title>")
open(os.path.join(S, "sitriya4.src.html"), "w").write(src)

m2 = {}
for f in os.listdir(os.path.join(B, "cut")):
    m2[f[:-4]] = "data:image/svg+xml;base64," + base64.b64encode(open(os.path.join(B, "cut", f), "rb").read()).decode()
for f, mt in [("cover.jpg", "image/jpeg"), ("logo-dark.png", "image/png"), ("logo-light.png", "image/png"), ("logo-gold.png", "image/png")]:
    m2[f.rsplit(".", 1)[0]] = "data:%s;base64," % mt + base64.b64encode(open(os.path.join(B, "brand", f), "rb").read()).decode()
h = src.replace("__IMG_MAP__", json.dumps(m2))
if not h.lstrip().lower().startswith("<!doctype"): h = "<!doctype html>\n" + h
open(os.path.join(S, "sitriya.html"), "w").write(h)
print(len(h) // 1024, "KB")
