// ================= polish layer (review fixes) =================
// Later function declarations replace earlier ones with the same name.
Object.assign(T.bn, {stock_fix:"স্টক বদলেছে — ব্যাগ আপডেট করা হয়েছে", eta_in:"ঢাকায় ১–২ দিনে ডেলিভারি", eta_out:"ঢাকার বাইরে ২–৪ দিনে ডেলিভারি", help_l:"সাহায্য ও যোগাযোগ"});
Object.assign(T.en, {stock_fix:"Stock changed — your bag was updated", eta_in:"Delivery in 1–2 days inside Dhaka", eta_out:"Delivery in 2–4 days outside Dhaka", help_l:"Help & contact"});
var BN_DIG = "০১২৩৪৫৬৭৮৯";
function enDigits(v){ return String(v || "").replace(/[০-৯]/g, function(d){ return BN_DIG.indexOf(d); }); }
function normPhone(v){ v = enDigits(v).replace(/[\s\-().]/g, ""); if(v.indexOf("+88") === 0) v = v.slice(3); if(v.indexOf("88") === 0 && v.length === 13) v = v.slice(2); return v; }
function isDhaka(d){ return /^\s*(dhaka|ঢাকা)\s*$/i.test(String(d || "")); }
function zoneFromForm(){ if(bagView === "checkout" && String(form.district).trim()){ var z = isDhaka(form.district) ? "in" : "out"; if(z !== zone){ zone = z; $("#zIn").setAttribute("aria-pressed", String(zone === "in")); $("#zOut").setAttribute("aria-pressed", String(zone === "out")); } return true; } return false; }
$("#bagBody").addEventListener("input", function(e){ if(e.target.dataset.f === "district"){ zoneFromForm(); paintSums(totals()); } });
["#zIn", "#zOut"].forEach(function(s){ $(s).addEventListener("click", function(){ if(zoneFromForm()) renderCart(); }); });
if(DISTRICTS.indexOf("ঢাকা") < 0) DISTRICTS.push("Bandarban","Bhola","Chandpur","Chapainawabganj","Chuadanga","Gaibandha","Gopalganj","Joypurhat","Jhalokati","Jhenaidah","Khagrachhari","Kishoreganj","Kurigram","Lakshmipur","Lalmonirhat","Madaripur","Magura","Meherpur","Naogaon","Narail","Natore","Nilphamari","Panchagarh","Pirojpur","Rajbari","Rangamati","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Thakurgaon","Barguna","Bagerhat","ঢাকা");

// keep the in-memory data in step with other tabs (admin edits, other orders)
function reloadDB(){
  var d = store.get(DBKEY, null); if(!d || d.v !== 4) return false;
  DB = d; cfg = DB.cfg; P = DB.products; CATS = DB.categories; reindex(); return true;
}
window.addEventListener("storage", function(e){
  if(e.key !== DBKEY) return;
  if(reloadDB()){ try{ if(typeof adminMode !== "undefined" && adminMode){ if(typeof aRender === "function") aRender(); } else renderAll(true); }catch(x){} }
});

// remove / shrink bag lines that no longer have stock
function clampCart(){
  var changed = false;
  cart = cart.filter(function(l){
    var p = BY[l.id]; if(!p || p.status !== "active"){ changed = true; return false; }
    var left = stockOf(p, l.size, l.color);
    if(left < 1){ changed = true; return false; }
    if(l.qty > left){ l.qty = left; changed = true; }
    return true;
  });
  if(changed){ saveCart(); toast(t("stock_fix"), ""); }
  return changed;
}
function openCart(){ clampCart(); if(bagView === "done") bagView = "cart"; renderCart(); openPanel($("#cart")); }

function placeOrder(){
  if(placing) return;
  reloadDB(); zoneFromForm();
  if(clampCart()){ bagView = "cart"; renderCart(); return; }
  if(!validateCo()){ renderCart(); var f = $("#bagBody .cf.bad input, #bagBody .cf.bad textarea"); if(f) f.focus(); return; }
  placing = true; $("#checkout").disabled = true;
  var lines = [], problem = "";
  cart.forEach(function(l){
    var p = BY[l.id];
    if(!p || p.status !== "active"){ problem = fill(t("stock_changed"), p ? nm(p) : "?"); return; }
    if(stockOf(p, l.size, l.color) < l.qty){ problem = fill(t("stock_changed"), nm(p)); return; }
    var v = variantOf(p, l.size, l.color);
    lines.push({pid:p.id, en:p.en, bn:p.bn, sku:v.sku, size:l.size, color:l.color, qty:l.qty, unit:price(p)});
  });
  if(problem){ placing = false; $("#checkout").disabled = false; toast(problem, ""); bagView = "cart"; renderCart(); return; }
  var s = totals(), cr = coupon ? couponCheck(coupon, s.sub) : null, now = Date.now();
  if(coupon && !(cr && cr.ok)){ coupon = ""; s = totals(); }
  var o = {id:"", ref:newRef(), at:now, demo:false, source:"web",
    customer:{name:form.name.trim(), phone:normPhone(form.phone), wa:normPhone(form.wa), district:form.district.trim(), area:form.area.trim(), po:String(form.po || "").trim(), addr:form.addr.trim(), note:form.note.trim()},
    zone:zone, items:lines, sub:s.sub, disc:s.disc, coupon:cr && cr.ok ? cr.c.code : "", del:s.del, total:s.tot,
    pay:form.pay, trx:form.pay === "cod" ? "" : form.trx.trim(), payStatus:form.pay === "cod" ? "unpaid" : "verify",
    status:"received", history:[{s:"received", at:now, by:"customer"}], courier:"", tracking:"", notes:"", stockOut:true};
  o.id = o.ref;
  lines.forEach(function(x){
    var p = BY[x.pid], v = variantOf(p, x.size, x.color);
    v.stock -= x.qty;
    DB.moves.unshift({at:now, pid:p.id, sku:v.sku, d:-x.qty, why:"Order " + o.ref});
    if(v.stock <= DB.settings.lowStock && DB.settings.notif.stock) notify("stock", (v.stock ? "Low stock: " : "Out of stock: ") + p.en, v.sku + " · " + v.stock + " left", p.id);
  });
  if(cr && cr.ok) cr.c.uses++;
  DB.orders.unshift(o);
  if(DB.settings.notif.order) notify("order", "New order " + o.ref, o.customer.name + " · " + amtS(o.total) + " · " + o.customer.district, o.ref);
  saveDB();
  cart = []; coupon = ""; form.trx = ""; form.note = ""; saveCart();
  lastOrder = o; bagView = "done"; placing = false; $("#checkout").disabled = false;
  renderCart(); renderGrids(); renderTop();
  doneExtras(o);
}
function payLabel(k){ return k === "cod" ? t("pay_cod") : ({bkash:"bKash", nagad:"Nagad", rocket:"Rocket"})[k] || k; }
function doneExtras(o){
  $("#bagN").textContent = num(0);
  var ds = $("#bagBody .dsum"); if(!ds) return;
  var pv = ds.querySelectorAll(".sum")[1]; if(pv) pv.lastElementChild.textContent = payLabel(o.pay);
  var items = '<div class="d-items">' + o.items.map(function(x){ var p = BY[x.pid] || {}; return '<div><span class="th"><img src="'+I(p.img || x.pid)+'" alt=""></span><span>'+esc(x[L])+'<small>'+esc(t("size"))+' '+esc(x.size)+' · <i class="sw" style="background:'+esc(x.color)+'"></i> · × '+num(x.qty)+'</small></span><b>'+money(x.unit * x.qty)+'</b></div>'; }).join("") + '</div>'
    + '<div class="d-addr">'+ic("pin")+'<span><b>'+esc(o.customer.name)+' · '+esc(o.customer.phone)+'</b>'+esc(o.customer.addr + (o.customer.po ? ", " + o.customer.po : "") + ", " + o.customer.area + ", " + o.customer.district)+'<small>'+esc(t(o.zone === "in" ? "eta_in" : "eta_out"))+'</small></span></div>';
  ds.insertAdjacentHTML("beforebegin", items);
}

// products with a real choice of size or colour open the quick view instead of guessing
function needsPick(p){ return p && ((p.sizes || []).length > 1 || (p.colors || []).length > 1); }
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-add],[data-buy],[data-addq]"); if(!b || b.closest("#admin")) return;
  var id = b.dataset.add || b.dataset.buy || b.dataset.addq, p = BY[id];
  if(!needsPick(p)) return;
  e.preventDefault(); e.stopPropagation();
  if(b.dataset.addq) closeAll(true);
  openPM(id);
}, true);

// singular/plural for the floating cart
function saveCart(){
  store.set("st3_cart", cart);
  var s = totals();
  $("#cartCount").textContent = num(s.n); $("#tbCount").textContent = num(s.n);
  $("#mcN").textContent = num(s.n) + " " + (L === "en" && s.n === 1 ? "Item" : t("items")); $("#mcT").textContent = money(s.sub);
}

// "All" shows every product, new ones first, two full rows
function listFor(id){
  var A2 = PL();
  if(id === "all") return A2.filter(function(p){ return p.isNew; }).concat(A2.filter(function(p){ return !p.isNew; })).slice(0, 10);
  if(id === "sale") return A2.filter(function(p){ return off(p); });
  return A2.filter(function(p){ return p.cat === id; });
}

// search: Bangla/English spellings and synonyms
var SYN = [["burka","borka","burqa","burkha","borkha","বোরকা","বুরকা","abaya","আবায়া"],["three piece","3 piece","3piece","threepiece","থ্রি পিস","থ্রি-পিস","৩ পিস","salwar","সালোয়ার"],["hijab","হিজাব","khimar","খিমার","niqab","নিকাব"],["kurti","কুর্তি","kurta","কুর্তা","tunic"],["panjabi","punjabi","পাঞ্জাবি","men","পুরুষ"],["kids","kid","baby","শিশু","বাচ্চা","girls"],["saree","sari","শাড়ি","শাড়ী"]];
function qTerms(q){ var out = [q]; SYN.forEach(function(g){ if(g.some(function(w){ return q.indexOf(w) > -1 || w.indexOf(q) === 0 && q.length > 2; })) out = out.concat(g); }); return out; }
function runSearch(){
  var q = enDigits($("#q").value).trim().toLowerCase(), terms = q ? qTerms(q) : [];
  var res = PL().filter(function(p){
    if(!q) return true;
    var hay = (p.en + " " + p.bn + " " + (CAT[p.cat] ? CAT[p.cat].en + " " + CAT[p.cat].bn : "") + " " + (p.sku || "")).toLowerCase();
    return terms.some(function(w){ return hay.indexOf(w) > -1; });
  });
  $("#sres").innerHTML = res.length ? res.map(function(p, i){
    return '<button data-qv="'+p.id+'" style="animation-delay:'+(i*30)+'ms"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span><span><b>'+esc(nm(p))+'</b><span style="color:var(--muted);font-size:14px;display:block">'+esc(alt(p))+'</span><small>'+money(price(p))+'</small></span></button>';
  }).join("") : '<p style="color:var(--muted);font-size:17px">'+esc(fill(t("noresult"), q))+'</p>';
}
$("#openSearch2").addEventListener("click", function(){ if(typeof touchUI === "function" && touchUI()) return; setTimeout(function(){ var q = $("#q"); if(q) q.focus({preventScroll:true}); }, 120); });

// wishlist opens a real list
function wishMsg(){
  var ids = Object.keys(wish).filter(function(id){ return BY[id]; });
  openPanel($("#search")); $("#q").value = "";
  $("#sres").innerHTML = '<h3 class="wl-h">'+ic("heart")+esc(t("wishlist"))+' <small>'+num(ids.length)+'</small></h3>' + (ids.length ? ids.map(function(id){ var p = BY[id];
    return '<button data-qv="'+p.id+'"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span><span><b>'+esc(nm(p))+'</b><span style="color:var(--muted);font-size:14px;display:block">'+esc(alt(p))+'</span><small>'+money(price(p))+'</small></span></button>'; }).join("") : '<p style="color:var(--muted);font-size:16px">'+esc(t("wish_empty"))+'</p>');
}

// mobile menu: one label per row plus useful links
function renderMenu(){
  var rows = [{id:"all", lb:t("newin"), img:"n2"}, {id:"sale", lb:L === "bn" ? "অফার জোন" : "Offer Zone", img:"b5"}].concat(CATS.map(function(c){ return {id:c.id, lb:c[L], img:c.img}; }));
  var S = DB.settings.store || {};
  $("#mnav").innerHTML = rows.map(function(c){ return '<a href="#new" data-cat="'+c.id+'"><span class="th"><img src="'+I(c.img)+'" alt=""></span><span class="ml">'+esc(c.lb)+'</span>'+ic("chevR")+'</a>'; }).join("")
    + '<div class="mlinks"><a href="#track" data-mtrack>'+ic("route")+esc(t("track"))+'</a><button type="button" data-mwish>'+ic("heart")+esc(t("wishlist"))+'</button>'
    + (S.phone ? '<a href="tel:'+esc(S.phone)+'">'+ic("call")+esc(S.phone)+'</a>' : '') + '<a href="#help" data-close>'+ic("info")+esc(t("help_l"))+'</a></div>';
}
$("#mnav").addEventListener("click", function(e){
  if(e.target.closest("[data-mtrack]")){ e.preventDefault(); closeAll(true); if(typeof openTrack === "function") openTrack(); return; }
  if(e.target.closest("[data-mwish]")){ wishMsg(); }
});

// close the mega menu after a choice
(function(){
  var nb = document.querySelector(".navbar");
  if(!nb) return;
  nb.addEventListener("click", function(e){ if(e.target.closest("a")){ nb.classList.add("nohover"); } });
  nb.addEventListener("mouseleave", function(){ nb.classList.remove("nohover"); });
})();

// settings that drive visibility (WhatsApp number, contact lines)
function applySettings(){
  document.documentElement.dataset.btn = cfg.btn || "ghorer";
  var S = DB.settings.store || {};
  var hasWa = !!String(S.whatsapp || "").replace(/\D/g, "");
  document.documentElement.classList.toggle("no-wa", !hasWa);
  if(S.phone) $$('[data-t="phone"]').forEach(function(el){ el.textContent = S.phone; });
  if(S.email) $$('[data-t="email"]').forEach(function(el){ el.textContent = S.email; });
  if(tx(S.addr)) $$('[data-t="addr"]').forEach(function(el){ el.textContent = tx(S.addr); });
  [["phone", S.phone], ["email", S.email], ["addr", tx(S.addr)]].forEach(function(x){ $$('.ftr [data-t="'+x[0]+'"]').forEach(function(el){ var li = el.closest("li"); if(li) li.hidden = !x[1]; }); });
  var fw = $("#fabWa"); if(fw && hasWa) fw.href = waBase();
  var so = S.social || {}, any = false;
  [["Facebook","fb"],["Instagram","ig"],["YouTube","yt"],["TikTok","tt"]].forEach(function(x){ var a = document.querySelector('.soc a[aria-label="'+x[0]+'"]'); if(!a) return; var u = String(so[x[1]] || "").trim(); a.hidden = !u; if(u){ any = true; a.href = /^https?:/i.test(u) ? u : "https://" + u; a.target = "_blank"; a.rel = "noopener"; } });
  var sc = document.querySelector(".ftr .soc"); if(sc) sc.hidden = !any;
  var ab = tx(S.about || {}); if(ab) $("#fAbout").textContent = ab;
  if(typeof PAGE_KEYS !== "undefined") wirePages();
}

// order tracking deep link
if(location.hash === "#track" && typeof openTrack === "function") setTimeout(function(){ openTrack(); }, 300);
// mobile: a close button that stays at the top of the product sheet
(function(){ var m = $("#pm"); if(m && !m.querySelector(".pmx")) m.insertAdjacentHTML("afterbegin", '<button class="x pmx" data-close aria-label="Close">'+ic("x")+'</button>'); })();

// admin helpers
function setDeep(obj, path, val){ var ks = path.split("."), o = obj; for(var i = 0; i < ks.length - 1; i++){ if(o[ks[i]] == null || typeof o[ks[i]] !== "object") o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = val; }
var SIZE_ORDER = ["XXS","XS","S","M","L","XL","XXL","2XL","3XL","4XL","5XL","Free","Free Size"];
function sizeRank(x){ var i = SIZE_ORDER.indexOf(String(x).toUpperCase() === "FREE SIZE" ? "Free Size" : String(x).toUpperCase()); if(i > -1) return i; var n = parseFloat(x); return isNaN(n) ? 100 : 20 + n; }
function addSizes(txt){ var d = A.draft; String(txt).split(",").map(function(x){ return x.trim(); }).filter(Boolean).forEach(function(x){ if(d.sizes.indexOf(x) < 0) d.sizes.push(x); }); d.sizes.sort(function(a, b){ return sizeRank(a) - sizeRank(b); }); refreshSO(); var n = $("#pSizeIn"); if(n) n.focus(); }
(function(){ var f = $("#aLoginForm"); if(f) f.addEventListener("input", function(){ var m = $("#alMsg"); if(m) m.hidden = true; }); })();

// ================= product photo gallery =================
var GAL_MAX = 6;
function galBlock(d){
  var g = d.gallery || [];
  return '<div class="galx"><div class="galx-h"><b>More photos</b><small>Back, side, close-up, model photos · up to '+GAL_MAX+' · shown as thumbnails on the product page</small></div><div class="galx-row" id="pGal">'
    + g.map(function(u, i){ return '<span class="galx-i" style="background-image:url(\''+u+'\')"><button type="button" class="galx-x" data-pgrm="'+i+'" aria-label="Remove photo">'+ic("x")+'</button></span>'; }).join("")
    + (g.length < GAL_MAX ? '<label class="galx-add">'+ic("plus")+'<span>Add photos</span><input class="sr" type="file" accept="image/*" multiple data-pgal></label>' : '') + '</div></div>';
}
function galRefresh(){ var w = $("#pGal"); if(w && A.draft) w.parentNode.outerHTML = galBlock(A.draft); }
document.addEventListener("change", function(e){
  var el = e.target; if(!el.hasAttribute || !el.hasAttribute("data-pgal") || !A.draft) return;
  var files = [].slice.call(el.files || []), d = A.draft; d.gallery = d.gallery || [];
  files = files.slice(0, GAL_MAX - d.gallery.length);
  var left = files.length; if(!left) return;
  files.forEach(function(f){ readImg(f, 900, function(url){ d.gallery.push(url); if(--left === 0) galRefresh(); }); });
});
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-pgrm]"); if(b && A.draft){ e.preventDefault(); A.draft.gallery.splice(+b.dataset.pgrm, 1); galRefresh(); return; }
  var g = e.target.closest("#pmThumbs [data-gi]"); if(g){ var p = BY[pm.id], list = [p.img || p.id].concat(p.gallery || []); $("#pmImg").src = I(list[+g.dataset.gi]); $("#mstage").classList.toggle("photo", +g.dataset.gi > 0); $$("#pmThumbs button").forEach(function(x){ x.setAttribute("aria-pressed", String(x === g)); }); }
});

// ================= footer pages (editable from admin) =================
var PAGE_KEYS = {l_about:"about", l_contact:"contact", l_terms:"terms", l_privacy:"privacy", l_how:"howto", l_pay:"payment", l_ship:"shipping", l_faq:"faq", l_return:"returns", l_exchange:"exchange", l_refund:"refund", l_size:"size"};
var DEF_PAGES = {
  about:{bn:"{brand} বাংলাদেশের নারী, পুরুষ ও শিশুদের জন্য প্রিমিয়াম মডেস্ট ফ্যাশন ব্র্যান্ড। বোরকা, আবায়া, হিজাব, থ্রি-পিস, কুর্তি আর উৎসবের পোশাক — সবকিছু আমরা যত্ন করে বাছাই করি, যাতে আরাম আর শালীনতা দুটোই থাকে।\n\n## আমাদের প্রতিশ্রুতি\n- ভালো কাপড় আর পরিষ্কার সেলাই\n- ছবিতে যা দেখবেন, হাতে তা-ই পাবেন\n- সারা বাংলাদেশে ক্যাশ অন ডেলিভারি\n- অর্ডারের পর সাহায্য — ফোন বা হোয়াটসঅ্যাপে", en:"{brand} is a premium modest-fashion brand for women, men and kids in Bangladesh. Burqa, abaya, hijab, three piece, kurti and festive wear — every piece is chosen with care so it feels comfortable and modest.\n\n## Our promise\n- Good fabric and clean stitching\n- What you see in the photo is what you get\n- Cash on delivery all over Bangladesh\n- Help after you order — by phone or WhatsApp"},
  contact:{bn:"যেকোনো প্রশ্ন, অর্ডার বা সাইজ নিয়ে সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন।\n\n- ফোন: {phone}\n- ইমেইল: {email}\n- ঠিকানা: {addr}\n\nপ্রতিদিন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত আমরা উত্তর দিই।", en:"Contact us for any question about orders, sizes or delivery.\n\n- Phone: {phone}\n- Email: {email}\n- Address: {addr}\n\nWe reply every day from 10 am to 8 pm."},
  terms:{bn:"এই ওয়েবসাইট থেকে অর্ডার করলে আপনি নিচের শর্তগুলোতে রাজি হচ্ছেন।\n\n- পণ্যের দাম ও স্টক যেকোনো সময় পরিবর্তন হতে পারে।\n- অর্ডার কনফার্ম করার জন্য আমরা ফোন করতে পারি।\n- ভুল ঠিকানা বা ফোন নম্বরের কারণে ডেলিভারি দেরি হলে তার দায় আমাদের নয়।\n- রিটার্ন ও রিফান্ড আমাদের রিটার্ন পলিসি অনুযায়ী হবে।", en:"By ordering from this website you agree to these terms.\n\n- Prices and stock can change at any time.\n- We may call you to confirm your order.\n- Delays caused by a wrong address or phone number are not our responsibility.\n- Returns and refunds follow our Return Policy."},
  privacy:{bn:"আপনার নাম, ফোন নম্বর আর ঠিকানা আমরা শুধু অর্ডার ডেলিভারি আর যোগাযোগের জন্য ব্যবহার করি।\n\n- আপনার তথ্য আমরা কারো কাছে বিক্রি করি না।\n- ডেলিভারির জন্য শুধু কুরিয়ার কোম্পানিকে প্রয়োজনীয় তথ্য দেওয়া হয়।\n- আপনি চাইলে আমাদের জানিয়ে আপনার তথ্য মুছে ফেলতে পারেন।", en:"We use your name, phone number and address only to deliver your order and contact you about it.\n\n- We never sell your information.\n- Only the courier gets the details needed for delivery.\n- You can ask us to delete your information at any time."},
  howto:{bn:"## কীভাবে অর্ডার করবেন\n- পছন্দের পণ্যে চাপ দিন, সাইজ আর রং বেছে নিন।\n- “কার্টে যোগ করুন” বা “এখনই কিনুন” চাপুন।\n- ব্যাগ থেকে “চেকআউট” চাপুন, নাম, ফোন আর ঠিকানা দিন।\n- পেমেন্ট পদ্ধতি বেছে নিয়ে “অর্ডার কনফার্ম করুন” চাপুন।\n- অর্ডার নম্বর সেভ রাখুন — এটা দিয়ে অর্ডার ট্র্যাক করতে পারবেন।\n\nহোয়াটসঅ্যাপেও অর্ডার করতে পারেন।", en:"## How to order\n- Tap the product you like and choose size and colour.\n- Press “Add to cart” or “Buy now”.\n- Open your bag, press “Checkout” and enter your name, phone and address.\n- Choose a payment method and press “Place order”.\n- Keep your order reference — you can track the order with it.\n\nYou can also order on WhatsApp."},
  payment:{bn:"- ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে টাকা দিন।\n- বিকাশ / নগদ / রকেট: সেন্ড মানি করে TrxID দিন, আমরা মিলিয়ে কনফার্ম করব।\n\nঢাকার বাইরে কিছু অর্ডারে ডেলিভারি চার্জ আগে নেওয়া হতে পারে — অর্ডার কনফার্মের সময় জানানো হবে।", en:"- Cash on delivery: pay when you receive the parcel.\n- bKash / Nagad / Rocket: send money and enter the TrxID; we check it and confirm.\n\nFor some orders outside Dhaka we may ask for the delivery charge in advance — we will tell you when we confirm."},
  shipping:{bn:"- ঢাকার ভেতরে ডেলিভারি চার্জ ৳{inside}, সময় ১–২ দিন।\n- ঢাকার বাইরে ডেলিভারি চার্জ ৳{outside}, সময় ২–৪ দিন।\n- ঢাকার ভেতরে ৳{free} বা তার বেশি অর্ডারে ডেলিভারি ফ্রি।\n\nঈদ বা বড় অফারের সময় ডেলিভারিতে ১–২ দিন বেশি লাগতে পারে।", en:"- Inside Dhaka: ৳{inside}, 1–2 days.\n- Outside Dhaka: ৳{outside}, 2–4 days.\n- Free delivery inside Dhaka on orders of ৳{free} or more.\n\nDuring Eid and big sales delivery can take 1–2 extra days."},
  faq:{bn:"## ডেলিভারি কতদিনে পাব?\nঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৪ দিন।\n\n## পণ্য হাতে নিয়ে দেখে টাকা দেওয়া যাবে?\nহ্যাঁ, ক্যাশ অন ডেলিভারিতে ডেলিভারিম্যানের সামনে দেখে নিতে পারবেন।\n\n## সাইজ না মিললে কী করব?\n৩ দিনের মধ্যে জানালে সাইজ বদলে দিই। বিস্তারিত এক্সচেঞ্জ পেজে।\n\n## অর্ডার কীভাবে ট্র্যাক করব?\n“অর্ডার ট্র্যাক” এ অর্ডার নম্বর আর ফোন নম্বর দিন।", en:"## How long does delivery take?\n1–2 days inside Dhaka, 2–4 days outside.\n\n## Can I check the product before paying?\nYes — with cash on delivery you can check it in front of the delivery person.\n\n## What if the size doesn't fit?\nTell us within 3 days and we will exchange it. See the Exchange page.\n\n## How do I track my order?\nOpen “Track order” and enter your order reference and phone number."},
  returns:{bn:"- পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে রিটার্নের অনুরোধ করতে হবে।\n- পণ্য অব্যবহৃত, ধোয়া হয়নি এবং ট্যাগসহ থাকতে হবে।\n- ভুল বা ত্রুটিপূর্ণ পণ্য পেলে রিটার্ন খরচ আমরা দেব।\n- অফারের পণ্য ও কাস্টম মাপের পণ্য রিটার্ন হয় না।", en:"- Ask for a return within 3 days of receiving the parcel.\n- The item must be unused, unwashed and with its tags.\n- If you received a wrong or faulty item, we pay the return cost.\n- Sale items and custom-size items cannot be returned."},
  exchange:{bn:"- সাইজ বা রং বদলাতে চাইলে ৩ দিনের মধ্যে জানান।\n- পণ্য অব্যবহৃত ও ট্যাগসহ থাকতে হবে।\n- এক্সচেঞ্জের ডেলিভারি চার্জ গ্রাহককে দিতে হবে, তবে আমাদের ভুলে হলে আমরা দেব।", en:"- To change size or colour, tell us within 3 days.\n- The item must be unused and with its tags.\n- You pay the delivery charge for the exchange, unless the mistake was ours."},
  refund:{bn:"- রিটার্ন করা পণ্য আমাদের কাছে পৌঁছানোর পর ৩–৫ কর্মদিবসে রিফান্ড দেওয়া হয়।\n- রিফান্ড বিকাশ/নগদে বা যে পদ্ধতিতে টাকা দিয়েছিলেন সেভাবে পাঠানো হয়।\n- ডেলিভারি চার্জ রিফান্ড হয় না, যদি না ভুল আমাদের হয়।", en:"- Refunds are sent within 3–5 working days after the returned item reaches us.\n- We refund by bKash/Nagad or the way you paid.\n- Delivery charges are not refunded unless the mistake was ours."},
  size:{bn:"## বোরকা ও আবায়া (লম্বা)\n- ৫২ — উচ্চতা ৪'১০\"–৫'০\"\n- ৫৪ — উচ্চতা ৫'১\"–৫'২\"\n- ৫৬ — উচ্চতা ৫'৩\"–৫'৫\"\n- ৫৮ — উচ্চতা ৫'৬\"–৫'৮\"\n\n## থ্রি-পিস ও কুর্তি (বুকের মাপ)\n- M — ৩৮ ইঞ্চি\n- L — ৪০ ইঞ্চি\n- XL — ৪২ ইঞ্চি\n- XXL — ৪৪ ইঞ্চি\n\nপণ্যভেদে মাপ সামান্য আলাদা হতে পারে। নিশ্চিত না হলে আমাদের মেসেজ দিন।", en:"## Burqa & abaya (length)\n- 52 — height 4'10\"–5'0\"\n- 54 — height 5'1\"–5'2\"\n- 56 — height 5'3\"–5'5\"\n- 58 — height 5'6\"–5'8\"\n\n## Three piece & kurti (chest)\n- M — 38 in\n- L — 40 in\n- XL — 42 in\n- XXL — 44 in\n\nSizes can vary a little by product. Message us if you are not sure."}
};
function pagesCfg(){ cfg.pages = cfg.pages || {}; Object.keys(DEF_PAGES).forEach(function(k){ if(!cfg.pages[k]) cfg.pages[k] = {on:true, body:{bn:DEF_PAGES[k].bn, en:DEF_PAGES[k].en}}; }); return cfg.pages; }
function pageTitle(k){ var tk = Object.keys(PAGE_KEYS).filter(function(x){ return PAGE_KEYS[x] === k; })[0]; return t(tk); }
function fillVars(s){
  var S = DB.settings.store || {}, D = cfg.delivery || {}, dash = L === "bn" ? "শীঘ্রই যোগ হবে" : "coming soon";
  return String(s || "").replace(/\{brand\}/g, BRAND()).replace(/\{phone\}/g, S.phone || dash).replace(/\{email\}/g, S.email || dash).replace(/\{addr\}/g, tx(S.addr) || dash)
    .replace(/\{inside\}/g, num(D.inside)).replace(/\{outside\}/g, num(D.outside)).replace(/\{free\}/g, num(D.free));
}
function pageHTML(txt){
  var out = [], list = null;
  fillVars(txt).split(/\n/).forEach(function(line){
    var l = line.trim();
    if(/^- /.test(l)){ if(!list){ list = []; } list.push('<li>'+esc(l.slice(2))+'</li>'); return; }
    if(list){ out.push('<ul>'+list.join("")+'</ul>'); list = null; }
    if(!l) return;
    if(/^## /.test(l)) out.push('<h3>'+esc(l.slice(3))+'</h3>'); else out.push('<p>'+esc(l)+'</p>');
  });
  if(list) out.push('<ul>'+list.join("")+'</ul>');
  return out.join("");
}
(function(){
  document.body.insertAdjacentHTML("beforeend", '<aside class="drawer pgv" id="pgv" aria-hidden="true" role="dialog" aria-labelledby="pgT"><div class="dhd"><h2 id="pgT"></h2><button class="x" data-close aria-label="Close">'+ic("x")+'</button></div><div class="dbd pgb" id="pgB"></div></aside>');
  PANELS.push("#pgv");
})();
function openPage(k){
  var pg = pagesCfg()[k]; if(!pg) return;
  $("#pgT").textContent = pageTitle(k);
  $("#pgB").innerHTML = '<article class="pgtxt">' + pageHTML(tx(pg.body)) + '</article><div class="pgfoot">'+ic("info")+'<span>'+esc(L === "bn" ? "আরও প্রশ্ন থাকলে আমাদের জানান — আমরা সাহায্য করব।" : "More questions? Contact us — we're happy to help.")+'</span></div>';
  openPanel($("#pgv"));
}
function wirePages(){
  var pgs = pagesCfg();
  $$('.ftr a[data-t^="l_"]').forEach(function(a){ var k = PAGE_KEYS[a.dataset.t]; if(!k) return; a.dataset.page = k; a.setAttribute("href", "#" + k); var li = a.closest("li"); if(li) li.hidden = pgs[k] && pgs[k].on === false; });
}
document.addEventListener("click", function(e){ var a = e.target.closest("[data-page]"); if(a && !a.closest("#admin")){ e.preventDefault(); e.stopPropagation(); openPage(a.dataset.page); } }, true);
wirePages();

// ----- admin: Website pages -----
PAGES.pages = {t:"Website Pages", bn:"ওয়েবসাইট পেজ", s:"About, policies, FAQ and size guide shown from the footer", ic:"list"};
NAV.forEach(function(g){ if(g[0] === "Website" && g[1].indexOf("pages") < 0) g[1].push("pages"); });
PAGEFN.pages = function(){
  var pgs = pagesCfg();
  return '<section class="card2"><div class="ch"><h3>'+ic("list")+'Footer pages</h3><span>Customers open these from the website footer. Write in both languages.</span></div>'
    + '<p class="mut sm2">Formatting: start a line with <b>## </b> for a heading and <b>- </b> for a bullet. You can use {phone}, {email}, {addr}, {brand}, {inside}, {outside} and {free} — they fill in from Store Settings automatically.</p>'
    + '<div class="pglist">' + Object.keys(DEF_PAGES).map(function(k){ var pg = pgs[k], words = String(pg.body.en || "").split(/\s+/).filter(Boolean).length;
      return '<div class="pgrow"><span class="pgic">'+ic("list")+'</span><span class="pgn"><b>'+esc(T.en[Object.keys(PAGE_KEYS).filter(function(x){ return PAGE_KEYS[x] === k; })[0]])+'</b><small>'+esc(T.bn[Object.keys(PAGE_KEYS).filter(function(x){ return PAGE_KEYS[x] === k; })[0]])+' · '+words+' words</small></span>'
        + '<label class="sw2" title="Show in footer"><input type="checkbox" data-pgon="'+k+'"'+(pg.on !== false ? ' checked' : '')+'><i></i><span class="hide-sm">'+(pg.on !== false ? 'Shown' : 'Hidden')+'</span></label>'
        + '<button class="btn b-out sm" data-pgedit="'+k+'">'+ic("edit")+'Edit</button></div>'; }).join("") + '</div></section>';
};
POPK.unshift([/^Page · /, "list", "Website page · ওয়েবসাইট পেজ"]);
function aPageEdit(k){
  var pg = pagesCfg()[k], tk = Object.keys(PAGE_KEYS).filter(function(x){ return PAGE_KEYS[x] === k; })[0];
  var body = '<div class="fs"><div class="two">'
    + '<label class="fld">English text<textarea rows="16" data-pgf="en">'+esc(pg.body.en || "")+'</textarea></label>'
    + '<label class="fld">বাংলা লেখা<textarea rows="16" data-pgf="bn">'+esc(pg.body.bn || "")+'</textarea></label></div>'
    + '<p class="mut sm2">## heading · - bullet · {phone} {email} {addr} {brand} {inside} {outside} {free}</p></div>';
  var foot = '<button class="btn b-out sm" data-pgreset="'+k+'">Reset to default</button><button class="btn b-out sm" data-pgprev="'+k+'">'+ic("eye")+'Preview on website</button><button class="btn b-em sm push" data-pgsave="'+k+'">'+ic("check")+'Save page</button>';
  aOpenDrawer("Page · " + T.en[tk], body, foot, true);
}
function pgCollect(k){ var pg = pagesCfg()[k]; $$('#aDrawer [data-pgf]').forEach(function(el){ pg.body[el.dataset.pgf] = el.value; }); return pg; }
document.addEventListener("click", function(e){
  var b;
  if((b = e.target.closest("[data-pgedit]"))){ aPageEdit(b.dataset.pgedit); return; }
  if((b = e.target.closest("[data-pgsave]"))){ pgCollect(b.dataset.pgsave); logA("Page updated", b.dataset.pgsave); aCloseDrawer(); aSaved("Page saved", "Live on the website"); aRender(); return; }
  if((b = e.target.closest("[data-pgreset]"))){ var k = b.dataset.pgreset; $$('#aDrawer [data-pgf]').forEach(function(el){ el.value = DEF_PAGES[k][el.dataset.pgf]; }); return; }
  if((b = e.target.closest("[data-pgprev]"))){ var k2 = b.dataset.pgprev; pgCollect(k2); saveDB(); aCloseDrawer(); goAdmin(false); setTimeout(function(){ openPage(k2); }, 150); }
});
document.addEventListener("change", function(e){ var el = e.target; if(el.dataset && el.dataset.pgon){ pagesCfg()[el.dataset.pgon].on = el.checked; saveDB(); logA(el.checked ? "Page shown" : "Page hidden", el.dataset.pgon); var sp = el.parentNode.querySelector("span"); if(sp) sp.textContent = el.checked ? "Shown" : "Hidden"; toast("Saved", el.checked ? "Shown in footer" : "Hidden from footer"); } });

(function(){ var th = $("#pmThumbs"); if(th && window.MutationObserver) new MutationObserver(function(){ $("#mstage").classList.remove("photo"); }).observe(th, {childList:true}); })();

// ----- phones: keep inputs visible above the keyboard on every device -----
(function(){
  var vv = window.visualViewport, root = document.documentElement;
  function setVH(){ var h = vv ? vv.height : window.innerHeight; root.style.setProperty("--vvh", Math.round(h) + "px"); }
  setVH(); if(vv){ vv.addEventListener("resize", setVH); } window.addEventListener("resize", setVH);
  document.addEventListener("focusin", function(e){
    var el = e.target; if(!el.matches || !el.matches("input:not([type=checkbox]):not([type=radio]):not([type=file]),textarea,select")) return;
    if(window.innerWidth > 860) return;
    var box = el.closest(".drawer,.modal,.a-drawer,.menu,.search,#bagBody,.adb,.dbd");
    setTimeout(function(){ try{ el.scrollIntoView({block:"center", behavior:"smooth"}); }catch(x){ el.scrollIntoView(); } }, box ? 320 : 120);
  });
})();
// blurred backdrop for photo slides on small screens
(function(){ var box = $("#slides"); if(!box || !window.MutationObserver) return;
  function paint(){ $$("#slides .sl.pic").forEach(function(s){ var im = s.querySelector("img.full"); if(im && im.src) s.style.setProperty("--pimg", 'url("' + im.src + '")'); }); }
  new MutationObserver(paint).observe(box, {childList:true}); paint(); })();
