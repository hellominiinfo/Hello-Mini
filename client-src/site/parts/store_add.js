// ================= data store, stock, checkout & tracking =================
Object.assign(T.bn, {
 oos:"স্টক শেষ", only_left:"মাত্র {x}টি বাকি", instock:"স্টকে আছে", place:"অর্ডার কনফার্ম করুন", back_bag:"ব্যাগে ফিরে যান", co_title:"ডেলিভারির তথ্য",
 f_name:"আপনার নাম", f_phone:"মোবাইল নম্বর", f_wa:"WhatsApp নম্বর (ভিন্ন হলে)", f_district:"জেলা", f_area:"এলাকা / থানা", f_po:"পোস্ট অফিস (ঐচ্ছিক)", f_addr:"পূর্ণ ঠিকানা", f_note:"অর্ডার নোট (ঐচ্ছিক)",
 e_req:"এটি পূরণ করুন", e_phone:"সঠিক মোবাইল নম্বর দিন, যেমন 01712345678", e_trx:"ট্রানজেকশন আইডি দিন",
 coupon:"কুপন কোড", apply:"প্রয়োগ করুন", cp_ok:"কুপন যুক্ত হয়েছে, সাশ্রয় {x}", cp_bad:"এই কুপন কোডটি সঠিক নয়", cp_off:"এই কুপনটি এখন বন্ধ আছে", cp_exp:"কুপনের মেয়াদ শেষ", cp_used:"কুপনের ব্যবহারসীমা শেষ", cp_min:"কমপক্ষে {x} অর্ডারে প্রযোজ্য", cp_remove:"সরান",
 discount:"ডিসকাউন্ট", payment:"পেমেন্ট পদ্ধতি", pay_cod:"ক্যাশ অন ডেলিভারি", pay_cod_d:"পণ্য হাতে পেয়ে টাকা দিন", pay_m_d:"{x} নম্বরে Send Money করে ট্রানজেকশন আইডি দিন", trx:"ট্রানজেকশন আইডি (TrxID)",
 recheck:"অর্ডার দেওয়ার মুহূর্তে দাম ও স্টক আবার যাচাই করা হবে।", stock_changed:"{x} এর স্টক বদলে গেছে, কার্ট আবার দেখুন", your_items:"আপনার পণ্য",
 done_h:"অর্ডার সম্পন্ন হয়েছে!", done_p:"আপনার অর্ডার আমাদের কাছে পৌঁছেছে। নিচের রেফারেন্স আর আপনার মোবাইল নম্বর দিয়ে যেকোনো সময় অর্ডার ট্র্যাক করতে পারবেন।",
 ref:"অর্ডার রেফারেন্স", copy:"কপি", copied:"কপি হয়েছে", send_wa:"WhatsApp-এ পাঠান", wa_note:"WhatsApp-এ পাঠানো ঐচ্ছিক। আপনার অর্ডার ইতিমধ্যে সেভ হয়ে গেছে।", cont:"শপিং চালিয়ে যান", admin_login:"অ্যাডমিন লগইন", trk_btn:"অর্ডার ট্র্যাক করুন",
 trk_h:"অর্ডার ট্র্যাক করুন", trk_p:"অর্ডার রেফারেন্স আর যে মোবাইল নম্বর দিয়ে অর্ডার করেছেন সেটি দিন।", trk_ref:"অর্ডার রেফারেন্স", trk_nf:"এই রেফারেন্স ও নম্বরে কোনো অর্ডার পাওয়া যায়নি। আবার দেখে লিখুন।",
 s_received:"অর্ডার গৃহীত", s_confirmed:"কনফার্মড", s_processing:"প্যাকিং চলছে", s_shipped:"কুরিয়ারে পাঠানো হয়েছে", s_delivered:"ডেলিভারি সম্পন্ন", s_cancelled:"অর্ডার বাতিল", s_returned:"পণ্য ফেরত",
 courier:"কুরিয়ার", tracking_no:"ট্র্যাকিং নম্বর", pay_status:"পেমেন্ট", ps_unpaid:"বাকি", ps_paid:"পরিশোধিত", ps_verify:"যাচাই চলছে", ps_refunded:"ফেরত দেওয়া হয়েছে", admin_btn:"অ্যাডমিন"
});
Object.assign(T.en, {
 oos:"Out of stock", only_left:"Only {x} left", instock:"In stock", place:"Place Order", back_bag:"Back to bag", co_title:"Delivery details",
 f_name:"Your name", f_phone:"Mobile number", f_wa:"WhatsApp number (if different)", f_district:"District", f_area:"Area / Thana", f_po:"Post office (optional)", f_addr:"Full address", f_note:"Order note (optional)",
 e_req:"Please fill this in", e_phone:"Enter a valid mobile number, like 01712345678", e_trx:"Enter the transaction ID",
 coupon:"Coupon code", apply:"Apply", cp_ok:"Coupon applied, you save {x}", cp_bad:"This coupon code is not valid", cp_off:"This coupon is turned off", cp_exp:"This coupon has expired", cp_used:"This coupon has reached its limit", cp_min:"Needs an order of at least {x}", cp_remove:"Remove",
 discount:"Discount", payment:"Payment method", pay_cod:"Cash on Delivery", pay_cod_d:"Pay when the parcel arrives", pay_m_d:"Send money to {x} and enter the transaction ID", trx:"Transaction ID (TrxID)",
 recheck:"Prices and stock are checked again when you place the order.", stock_changed:"Stock for {x} has changed, please check your bag", your_items:"Your items",
 done_h:"Order placed!", done_p:"We have received your order. Use the reference below and your mobile number to track it any time.",
 ref:"Order reference", copy:"Copy", copied:"Copied", send_wa:"Send on WhatsApp", wa_note:"Sending on WhatsApp is optional. Your order is already saved.", cont:"Continue shopping", admin_login:"Admin login", trk_btn:"Track order",
 trk_h:"Track your order", trk_p:"Enter your order reference and the mobile number you ordered with.", trk_ref:"Order reference", trk_nf:"No order matches that reference and number. Please check and try again.",
 s_received:"Order received", s_confirmed:"Confirmed", s_processing:"Being packed", s_shipped:"Handed to courier", s_delivered:"Delivered", s_cancelled:"Cancelled", s_returned:"Returned",
 courier:"Courier", tracking_no:"Tracking number", pay_status:"Payment", ps_unpaid:"Unpaid", ps_paid:"Paid", ps_verify:"Being verified", ps_refunded:"Refunded", admin_btn:"Admin"
});
Object.assign(ICP, {
  box:'<path class="d" d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  tag:'<path class="d" d="M3 12V4h8l9 9-8 8z"/><path d="M3 12V4h8l9 9-8 8z"/><circle class="g" cx="7.5" cy="8.5" r="1.5"/>',
  star:'<path class="d" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  gear:'<circle class="d" cx="12" cy="12" r="7"/><circle class="g" cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  bell:'<path class="d" d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path class="g" d="M10 20.5a2 2 0 0 0 4 0"/>',
  meta:'<path d="M3 15c0-4 2-8 4.5-8 3.5 0 5.5 10 9 10 2 0 3.5-2 3.5-5s-1.5-5-3.5-5c-3.5 0-5.5 10-9 10C5 17 3 16.5 3 15z"/>',
  users:'<circle class="d" cx="9" cy="8.5" r="3.5"/><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><path class="g" d="M16 5.2a3.3 3.3 0 0 1 0 6.6M18 15.3c1.7.6 2.9 2.1 3.5 4.7"/>',
  list:'<rect class="d" x="4" y="3.5" width="16" height="17" rx="2.5"/><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/>',
  logout:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  eye:'<path class="d" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle class="g" cx="12" cy="12" r="3"/>',
  copy:'<rect class="d" x="8" y="8" width="12" height="12" rx="2.5"/><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  card:'<rect class="d" x="3" y="5.5" width="18" height="13" rx="2.5"/><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path class="g" d="M3 10h18M7 15h4"/>',
  store:'<path class="d" d="M4 10h16v10H4z"/><path d="M4 10v10h16V10M3 10l2-6h14l2 6zM9.5 20v-5h5v5"/>',
  chart:'<path d="M4 20V4M4 20h16"/><rect class="d" x="7" y="11" width="3" height="6" rx="1"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect class="d" x="12" y="7" width="3" height="10" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><path class="g" d="M17 14v3"/>',
  lock:'<rect class="d" x="5" y="10.5" width="14" height="10" rx="2.5"/><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle class="gf" cx="12" cy="15.5" r="1.5"/>',
  info:'<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle class="gf" cx="12" cy="8" r="1.2"/>'
});
function PL(){ return P.filter(function(p){ return p.status === "active"; }); }
function reindex(){ BY = {}; P.forEach(function(p){ BY[p.id] = p; }); CAT = {}; CATS.forEach(function(c){ CAT[c.id] = c; }); }
function variantOf(p, size, color){ return (p.variants || []).filter(function(v){ return v.size === size && v.color === color; })[0]; }
function stockOf(p, size, color){ var v = variantOf(p, size, color); return v ? Math.max(0, +v.stock || 0) : 0; }
function totalStock(p){ return (p.variants || []).reduce(function(a, v){ return a + Math.max(0, +v.stock || 0); }, 0); }
function inCart(id, size, color){ return cart.filter(function(l){ return l.id === id && l.size === size && l.color === color; }).reduce(function(a, l){ return a + l.qty; }, 0); }
function firstAvail(p, color){ return (p.variants || []).filter(function(v){ return (!color || v.color === color) && v.stock > inCart(p.id, v.size, v.color); })[0]; }
function saveDB(){ saveCfg(); }
function waBase(){ var n = String((DB.settings.store || {}).whatsapp || "").replace(/\D/g, ""); if(n.indexOf("0") === 0) n = "88" + n; return "https://wa.me/" + n; }
function applySettings(){
  document.documentElement.dataset.btn = cfg.btn || "ghorer";
  var S = DB.settings.store || {};
  if(S.phone) $$('[data-t="phone"]').forEach(function(el){ el.textContent = S.phone; });
  if(S.email) $$('[data-t="email"]').forEach(function(el){ el.textContent = S.email; });
  if(tx(S.addr)) $$('[data-t="addr"]').forEach(function(el){ el.textContent = tx(S.addr); });
}
function rng(seed){ return function(){ seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
function makeVariants(p, r){
  var vs = [];
  p.sizes.forEach(function(s){ p.colors.forEach(function(c, j){
    var st = 2 + Math.floor(r() * 11); var x = r(); if(x < .1) st = 0; else if(x < .2) st = 2;
    vs.push({sku:p.sku + "-" + String(s).replace(/[^A-Za-z0-9]/g, "") + "-" + (j + 1), size:s, color:c, stock:st});
  }); });
  return vs;
}
function newRef(){
  var A2 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r;
  do { r = "ST-"; for(var i = 0; i < 6; i++) r += A2[Math.floor(Math.random() * A2.length)]; } while(DB && DB.orders && DB.orders.some(function(o){ return o.ref === r; }));
  return r;
}
function seedDB(){
  var r = rng(20261015), now = Date.now(), DAY = 864e5;
  var prods = clone(DEFAULT_P).map(function(p, i){
    p.sku = "ST-" + p.cat.slice(0, 2).toUpperCase() + "-" + (101 + i); p.status = "active"; p.img = p.id;
    p.cost = Math.round((p.sale || p.price) * .55 / 10) * 10; p.variants = makeVariants(p, r); return p;
  });
  var db = {v:4, cfg:clone(DEF), products:prods, categories:clone(DEFAULT_CATS), orders:[], moves:[], notifs:[], log:[], reviews:[],
    coupons:[
      {code:"WELCOME10", type:"percent", value:10, min:1500, maxUses:200, uses:0, expires:now + 60 * DAY, active:true},
      {code:"EID200", type:"fixed", value:200, min:3000, maxUses:100, uses:0, expires:now + 30 * DAY, active:true}
    ],
    admins:[{id:"u1", name:"Owner", email:"owner@sitraya.com", role:"Super Admin", active:true}, {id:"u2", name:"Order Desk", email:"orders@sitraya.com", role:"Order Manager", active:true}],
    settings:{store:{phone:"", whatsapp:"", email:"", addr:{bn:"", en:""}}, pay:{cod:{on:true}, bkash:{on:false, num:""}, nagad:{on:false, num:""}, rocket:{on:false, num:""}},
      lowStock:3, reviewsApprove:true, notif:{order:true, stock:true, cancel:true, review:true},
      meta:{pixel:"", token:"", test:"", pixelOn:false, capiOn:false, testMode:true, events:{PageView:true, ViewContent:true, Search:true, AddToCart:true, InitiateCheckout:true, AddPaymentInfo:false, Purchase:true}}}};
  var NAMES = ["Nusrat Jahan","Farhana Akter","Sadia Islam","Tahmina Begum","Rumana Haque","Ayesha Siddika","Mehjabin Rahman","Sharmin Sultana","Lamia Chowdhury","Fatema Khatun","Tasnim Ahmed","Jannatul Ferdous","Rafiq Hasan","Mahmudul Karim"];
  var DIST = ["Dhaka","Dhaka","Dhaka","Gazipur","Narayanganj","Chattogram","Sylhet","Rajshahi","Khulna","Cumilla","Mymensingh","Barishal"];
  var AREAS = {Dhaka:["Mirpur","Dhanmondi","Uttara","Mohammadpur","Badda","Bashundhara"], other:["Sadar","Town Hall","College Road","Station Road"]};
  for(var i = 0; i < 26; i++){
    var age = Math.pow(r(), 1.3) * 21 * DAY, at = now - age, d = age / DAY;
    var n = 1 + Math.floor(r() * 2.3), items = [];
    for(var k = 0; k < n; k++){
      var p = prods[Math.floor(r() * prods.length)], v = p.variants[Math.floor(r() * p.variants.length)];
      items.push({pid:p.id, en:p.en, bn:p.bn, sku:v.sku, size:v.size, color:v.color, qty:r() < .8 ? 1 : 2, unit:price(p)});
    }
    var sub = items.reduce(function(a, x){ return a + x.unit * x.qty; }, 0);
    var dist = DIST[Math.floor(r() * DIST.length)], zone = dist === "Dhaka" ? "in" : "out";
    var del = zone === "in" ? (sub >= 2000 ? 0 : 80) : 150;
    var disc = (r() < .18 && sub >= 1500) ? Math.round(sub * .1) : 0;
    var x = r(), st;
    if(d > 7) st = x < .74 ? "delivered" : x < .86 ? "cancelled" : x < .93 ? "returned" : "shipped";
    else if(d > 3) st = x < .4 ? "shipped" : x < .7 ? "delivered" : x < .9 ? "processing" : "cancelled";
    else st = x < .45 ? "received" : x < .75 ? "confirmed" : "processing";
    var hist = [{s:"received", at:at, by:"customer"}], tt = at;
    if(st === "cancelled") hist.push({s:"cancelled", at:at + 3 * 36e5, by:"Owner", note:"Customer asked to cancel"});
    else { var upto = st === "returned" ? 4 : FLOW_S.indexOf(st); for(var j = 1; j <= upto; j++){ tt += (4 + r() * 20) * 36e5; if(tt > now) tt = now - 6e4 * (upto - j + 1); hist.push({s:FLOW_S[j], at:tt, by:"Owner"}); } if(st === "returned") hist.push({s:"returned", at:Math.min(now, tt + 2 * DAY), by:"Owner", note:"Size did not fit"}); }
    var nm2 = NAMES[Math.floor(r() * NAMES.length)], ph = "017000000" + String(10 + Math.floor(r() * 80));
    var pay = r() < .85 ? "cod" : "bkash";
    db.orders.push({id:"", ref:"", at:at, demo:true, source:r() < .2 ? "whatsapp" : "web",
      customer:{name:nm2, phone:ph, wa:"", district:dist, area:(AREAS[dist] || AREAS.other)[Math.floor(r() * 4)], addr:"House " + (1 + Math.floor(r() * 90)) + ", Road " + (1 + Math.floor(r() * 20)), note:""},
      zone:zone, items:items, sub:sub, disc:disc, coupon:disc ? "WELCOME10" : "", del:del, total:sub - disc + del, pay:pay, trx:pay === "bkash" ? "DEMO" + Math.floor(r() * 1e6) : "",
      payStatus:st === "delivered" ? "paid" : st === "returned" ? "refunded" : (pay === "bkash" && st !== "cancelled" ? "paid" : "unpaid"),
      status:st, history:hist, courier:(st === "shipped" || st === "delivered" || st === "returned") ? ["Pathao","Steadfast","RedX"][Math.floor(r() * 3)] : "", tracking:"", notes:"", stockOut:false});
    if(disc) db.coupons[0].uses++;
  }
  DB = db;
  db.orders.forEach(function(o){ o.ref = o.id = newRef(); });
  db.orders.sort(function(a, b){ return b.at - a.at; });
  db.orders.filter(function(o){ return o.status === "received"; }).slice(0, 4).forEach(function(o){ db.notifs.push({id:"n" + o.ref, type:"order", title:"New order " + o.ref, body:o.customer.name + " · " + amtS(o.total), at:o.at, read:false, ref:o.ref}); });
  prods.forEach(function(p){ p.variants.forEach(function(v){ if(v.stock <= db.settings.lowStock) db.notifs.push({id:"s" + v.sku, type:"stock", title:(v.stock ? "Low stock: " : "Out of stock: ") + p.en, body:v.sku + " · " + v.stock + " left", at:now - 36e5, read:true, ref:p.id}); }); });
  db.notifs.sort(function(a, b){ return b.at - a.at; });
  db.log.push({at:now, who:"System", action:"Demo data created", detail:prods.length + " products, " + db.orders.length + " demo orders"});
  return db;
}
function amtS(n){ return "৳" + Number(n || 0).toLocaleString("en-IN"); }
function initDB(){
  var d = store.get(DBKEY, null);
  DB = d && d.v === 4 ? d : seedDB();
  cfg = DB.cfg; P = DB.products; CATS = DB.categories; reindex();
  if(!d) store.set(DBKEY, DB);
}
function notify(type, title, body, ref){
  DB.notifs.unshift({id:"n" + Date.now() + Math.random().toString(36).slice(2, 6), type:type, title:title, body:body || "", at:Date.now(), read:false, ref:ref || ""});
  if(DB.notifs.length > 150) DB.notifs.length = 150;
  if(typeof aBell === "function") aBell();
}
function logA(action, detail, who){ DB.log.unshift({at:Date.now(), who:who || "Owner", action:action, detail:detail || ""}); if(DB.log.length > 400) DB.log.length = 400; }

// ----- coupons -----
var coupon = "", cpMsg = "", cpOk = false;
function findCoupon(code){ code = String(code || "").trim().toUpperCase(); return DB.coupons.filter(function(c){ return c.code === code; })[0]; }
function couponCheck(code, sub){
  var c = findCoupon(code);
  if(!c) return {ok:false, msg:t("cp_bad")};
  if(!c.active) return {ok:false, msg:t("cp_off")};
  if(c.expires && Date.now() > c.expires) return {ok:false, msg:t("cp_exp")};
  if(c.maxUses && c.uses >= c.maxUses) return {ok:false, msg:t("cp_used")};
  if(sub < (c.min || 0)) return {ok:false, msg:fill(t("cp_min"), money(c.min))};
  return {ok:true, c:c, disc:c.type === "percent" ? Math.round(sub * c.value / 100) : Math.min(c.value, sub)};
}
function couponDisc(sub){ if(!coupon) return 0; var r = couponCheck(coupon, sub); return r.ok ? r.disc : 0; }
function paintSums(s){
  $("#sub").textContent = money(s.sub);
  $("#discRow").hidden = !s.disc; $("#disc").textContent = "−" + money(s.disc);
  $("#del").innerHTML = s.free ? '<span class="free">'+esc(t("free"))+'</span>' : money(s.del);
  $("#tot").textContent = money(s.tot);
}

// ----- checkout -----
var bagView = "cart", placing = false, lastOrder = null, coErr = {};
var form = {name:"", phone:"", wa:"", district:"", area:"", po:"", addr:"", note:"", pay:"cod", trx:""};
var DISTRICTS = ["Dhaka","Gazipur","Narayanganj","Narsingdi","Manikganj","Munshiganj","Tangail","Chattogram","Cox's Bazar","Cumilla","Feni","Noakhali","Brahmanbaria","Sylhet","Moulvibazar","Habiganj","Rajshahi","Bogura","Pabna","Khulna","Jashore","Kushtia","Barishal","Patuakhali","Rangpur","Dinajpur","Mymensingh","Jamalpur","Netrokona","Faridpur"];
function payMethods(){ var S = DB.settings.pay; return ["cod","bkash","nagad","rocket"].filter(function(k){ return S[k] && S[k].on; }); }
function openCheckout(){ if(!cart.length) return; bagView = "checkout"; if(payMethods().indexOf(form.pay) < 0) form.pay = payMethods()[0] || "cod"; renderCart(); $("#bagBody").scrollTop = 0; }
function normPhone(v){ v = String(v || "").replace(/[\s-]/g, ""); if(v.indexOf("+88") === 0) v = v.slice(3); if(v.indexOf("88") === 0 && v.length === 13) v = v.slice(2); return v; }
function validateCo(){
  coErr = {};
  ["name","district","area","addr"].forEach(function(k){ if(!String(form[k]).trim()) coErr[k] = t("e_req"); });
  if(!/^01[3-9]\d{8}$/.test(normPhone(form.phone))) coErr.phone = t("e_phone");
  if(form.wa && !/^01[3-9]\d{8}$/.test(normPhone(form.wa))) coErr.wa = t("e_phone");
  if(form.pay !== "cod" && !String(form.trx).trim()) coErr.trx = t("e_trx");
  return !Object.keys(coErr).length;
}
function coField(k, type, area, list){
  var lbl = t("f_" + k) + (k === "wa" || k === "note" || k === "po" ? "" : " *");
  var inp = area ? '<textarea id="co_'+k+'" data-f="'+k+'" rows="2">'+esc(form[k])+'</textarea>'
    : '<input id="co_'+k+'" data-f="'+k+'" type="'+(type || "text")+'" value="'+esc(form[k])+'"'+(list ? ' list="'+list+'"' : '')+(k === "phone" || k === "wa" ? ' inputmode="tel" autocomplete="tel"' : k === "name" ? ' autocomplete="name"' : '')+'>';
  return '<label class="cf'+(coErr[k] ? ' bad' : '')+'" for="co_'+k+'"><span>'+esc(lbl)+'</span>'+inp+'<em data-e="'+k+'">'+esc(coErr[k] || "")+'</em></label>';
}
function renderCheckout(){
  var s = totals();
  $("#freebar").hidden = true; $("#bagWa").hidden = true;
  if(bagView === "done"){
    var o = lastOrder;
    $("#bagFoot").hidden = true;
    $("#bagBody").innerHTML = '<div class="done"><span class="okc">'+ic("check")+'</span><h3>'+esc(t("done_h"))+'</h3><p>'+esc(t("done_p"))+'</p>'
      + '<div class="refbox"><span>'+esc(t("ref"))+'</span><b id="refTxt">'+esc(o.ref)+'</b><button class="btn b-out" data-copyref>'+ic("copy")+esc(t("copy"))+'</button></div>'
      + '<div class="dsum"><div class="sum"><span>'+esc(t("total"))+'</span><b>'+money(o.total)+'</b></div><div class="sum"><span>'+esc(t("payment"))+'</span><span>'+esc(t("pay_" + (o.pay === "cod" ? "cod" : "cod")) && (o.pay === "cod" ? t("pay_cod") : o.pay.toUpperCase()))+'</span></div></div>'
      + '<div class="dact"><button class="btn b-em" data-trkopen="'+esc(o.ref)+'">'+ic("route")+esc(t("trk_btn"))+'</button>'
      + '<a class="btn b-wa" target="_blank" rel="noopener" href="'+waBase()+'?text='+encodeURIComponent(orderText(o))+'">'+ic("wa")+esc(t("send_wa"))+'</a>'
      + '<button class="btn b-out" data-close data-cat="all">'+esc(t("cont"))+'</button></div><p class="muted">'+esc(t("wa_note"))+'</p></div>';
    return;
  }
  $("#bagFoot").hidden = false;
  $("#checkout span").textContent = t("place");
  var pm2 = payMethods(), S = DB.settings.pay;
  var cr = coupon ? couponCheck(coupon, s.sub) : null;
  $("#bagBody").innerHTML = '<div class="co"><button class="co-back" data-coback>'+ic("chevL")+esc(t("back_bag"))+'</button>'
    + '<h3 class="co-h">'+esc(t("co_title"))+'</h3>'
    + '<div class="cgrid">' + coField("name") + coField("phone", "tel") + coField("wa", "tel") + coField("district", "text", false, "dlist") + coField("area") + coField("po") + '</div>'
    + coField("addr", "text", true) + coField("note", "text", true)
    + '<datalist id="dlist">' + DISTRICTS.map(function(d){ return '<option value="'+esc(d)+'"></option>'; }).join("") + '</datalist>'
    + '<div class="cpn"><label class="sr" for="cpIn">'+esc(t("coupon"))+'</label><input id="cpIn" placeholder="'+esc(t("coupon"))+'" value="'+esc(coupon)+'" autocapitalize="characters">'
    + (coupon && cr && cr.ok ? '<button class="btn b-out" data-cprm>'+esc(t("cp_remove"))+'</button>' : '<button class="btn b-em" data-cpap>'+esc(t("apply"))+'</button>') + '</div>'
    + (coupon ? '<p class="cpmsg '+(cr && cr.ok ? 'ok' : 'bad')+'">'+esc(cr && cr.ok ? fill(t("cp_ok"), money(cr.disc)) : (cr ? cr.msg : ""))+'</p>' : '')
    + '<h4 class="co-h4">'+esc(t("payment"))+'</h4><div class="pays2">'
    + pm2.map(function(k){ var on = form.pay === k; return '<label class="pay'+(on ? ' on' : '')+'"><input type="radio" name="pay" value="'+k+'"'+(on ? ' checked' : '')+' data-f="pay"><span class="pm-i">'+(k === "cod" ? ic("cash") : ic("card"))+'</span><span><b>'+esc(k === "cod" ? t("pay_cod") : ({bkash:"bKash", nagad:"Nagad", rocket:"Rocket"})[k] || k)+'</b><small>'+esc(k === "cod" ? t("pay_cod_d") : fill(t("pay_m_d"), S[k].num || "[number]"))+'</small></span></label>'; }).join("")
    + '</div>' + (form.pay !== "cod" ? coField("trx") : '')
    + '<h4 class="co-h4">'+esc(t("your_items"))+'</h4><div class="mini-items">' + cart.map(function(l){ var p = BY[l.id]; return '<div><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span><span>'+esc(nm(p))+'<small>'+esc(l.size)+' × '+num(l.qty)+'</small></span><b>'+money(price(p) * l.qty)+'</b></div>'; }).join("") + '</div>'
    + '<p class="muted">'+ic("lock")+esc(t("recheck"))+'</p></div>';
  paintSums(s);
}
$("#bagBody").addEventListener("input", function(e){
  var k = e.target.dataset.f; if(!k) return;
  form[k] = e.target.value;
  if(k === "district"){ var dz = /^dhaka$/i.test(form.district.trim()) ? "in" : form.district.trim() ? "out" : zone; if(dz !== zone){ zone = dz; $("#zIn").setAttribute("aria-pressed", String(zone === "in")); $("#zOut").setAttribute("aria-pressed", String(zone === "out")); paintSums(totals()); } }
  if(coErr[k]){ delete coErr[k]; var lb = e.target.closest(".cf"); if(lb){ lb.classList.remove("bad"); lb.querySelector("em").textContent = ""; } }
});
$("#bagBody").addEventListener("change", function(e){ if(e.target.name === "pay"){ form.pay = e.target.value; renderCart(); } });
function orderText(o){
  var lines = o.items.map(function(x, i){ return (i + 1) + ". " + x[L] + " (" + x.size + ") x" + x.qty + " = " + money(x.unit * x.qty); });
  return (L === "bn" ? "আসসালামু আলাইকুম, আমার অর্ডার:\n" : "Hello, my order:\n") + t("ref") + ": " + o.ref + "\n" + lines.join("\n") + "\n" + t("total") + ": " + money(o.total) + "\n" + o.customer.name + ", " + o.customer.phone + "\n" + o.customer.addr + ", " + o.customer.area + ", " + o.customer.district;
}
function placeOrder(){
  if(placing) return;
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
}
$("#bagBody").addEventListener("click", function(e){
  if(e.target.closest("[data-coback]")){ bagView = "cart"; renderCart(); return; }
  if(e.target.closest("[data-cpap]")){ coupon = ($("#cpIn").value || "").trim().toUpperCase(); renderCart(); return; }
  if(e.target.closest("[data-cprm]")){ coupon = ""; renderCart(); return; }
  if(e.target.closest("[data-copyref]")){ var r = lastOrder ? lastOrder.ref : ""; try{ navigator.clipboard.writeText(r).then(function(){ toast(t("copied"), r); }, function(){ selText($("#refTxt")); }); }catch(x){ selText($("#refTxt")); } return; }
  var tk = e.target.closest("[data-trkopen]"); if(tk){ openTrack(tk.dataset.trkopen, lastOrder ? lastOrder.customer.phone : ""); }
});
function selText(el){ try{ var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }catch(x){} }

// ----- order tracking -----
function openTrack(ref, phone){
  $("#trkRef").value = ref || ""; $("#trkPh").value = phone || ""; $("#trkRes").innerHTML = "";
  openPanel($("#trk")); if(ref && phone) runTrack();
}
function runTrack(){
  var ref = $("#trkRef").value.trim().toUpperCase(), ph = normPhone($("#trkPh").value);
  var o = DB.orders.filter(function(x){ return x.ref === ref && x.customer.phone === ph; })[0];
  if(!o){ $("#trkRes").innerHTML = '<p class="tk-nf">'+ic("info")+esc(t("trk_nf"))+'</p>'; return; }
  var at = {}; o.history.forEach(function(h){ at[h.s] = h.at; });
  var steps = FLOW_S.slice(); if(o.status === "cancelled") steps = ["received","cancelled"]; if(o.status === "returned") steps = FLOW_S.concat(["returned"]);
  var curI = steps.indexOf(o.status);
  var dt = function(ts){ try{ return digits(new Date(ts).toLocaleString(L === "bn" ? "bn-BD" : "en-GB", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Dhaka"})); }catch(x){ return ""; } };
  $("#trkRes").innerHTML = '<div class="tk-card"><div class="tk-top"><b>'+esc(o.ref)+'</b><span>'+money(o.total)+' · '+esc(t("pay_status"))+': '+esc(t("ps_" + o.payStatus))+'</span></div><ol class="tl">'
    + steps.map(function(s, i){ var done = i <= curI, bad = s === "cancelled" || s === "returned"; return '<li class="'+(done ? 'done' : '')+(i === curI ? ' cur' : '')+(bad ? ' bad' : '')+'"><i></i><span><b>'+esc(t("s_" + s))+'</b>'+(at[s] ? '<small>'+esc(dt(at[s]))+'</small>' : '')+'</span></li>'; }).join("")
    + '</ol>' + (o.courier ? '<p class="tk-c">'+ic("truck")+esc(t("courier"))+': <b>'+esc(o.courier)+'</b>'+(o.tracking ? ' · '+esc(t("tracking_no"))+': <b>'+esc(o.tracking)+'</b>' : '')+'</p>' : '') + '</div>';
}
$("#trkForm").addEventListener("submit", function(e){ e.preventDefault(); runTrack(); });

// ----- product video (YouTube / Facebook) -----
Object.assign(T.bn, {pvideo:"প্রোডাক্ট ভিডিও", watch_on:"{x}-এ ভিডিও দেখুন", tap_play:"ভিডিও চালাতে চাপুন"});
Object.assign(T.en, {pvideo:"Product video", watch_on:"Watch on {x}", tap_play:"Tap to play the video"});
Object.assign(ICP, {
  play:'<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path class="gf" d="M10 8.3l6 3.7-6 3.7z"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path class="g" d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  share:'<circle class="d" cx="18" cy="5.5" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle class="g" cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>'
});
// uploaded videos live in IndexedDB (too big for normal browser storage)
var VC = {}, IDB = null;
function idb(cb){ if(IDB) return cb(IDB); try{ var r = indexedDB.open("sitraya_media", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("v"); }; r.onsuccess = function(){ IDB = r.result; cb(IDB); }; r.onerror = function(){ cb(null); }; }catch(e){ cb(null); } }
function saveVideoFile(f, cb){
  if(!/^video\//.test(f.type)){ toast("Please choose a video file", "MP4 or WebM works best"); return; }
  if(f.size > 150 * 1048576){ toast("This video is larger than 150 MB", "Please upload a shorter or compressed video"); return; }
  var key = "v" + Date.now().toString(36);
  try{ VC[key] = URL.createObjectURL(f); }catch(e){}
  idb(function(db){ if(!db){ toast("Video will show until you close this page", "This browser does not allow saving videos"); cb("idb:" + key); return; }
    try{ var tx = db.transaction("v", "readwrite"); tx.objectStore("v").put(f, key); tx.oncomplete = function(){ cb("idb:" + key); }; tx.onerror = function(){ toast("Video will show until you close this page", "Not enough browser storage to keep it"); cb("idb:" + key); }; }catch(e){ cb("idb:" + key); } });
}
function loadVideos(done){ idb(function(db){ if(!db) return done(0); try{ var st = db.transaction("v").objectStore("v"), n = 0, cur = st.openCursor(); cur.onsuccess = function(){ var c = cur.result; if(c){ if(!VC[c.key]){ try{ VC[c.key] = URL.createObjectURL(c.value); n++; }catch(e){} } c.continue(); } else done(n); }; cur.onerror = function(){ done(0); }; }catch(e){ done(0); } }); }
function isVideoFile(u){ return /^idb:/.test(u) || /^data:video\//.test(u) || /^https?:\/\/[^\s]+\.(mp4|webm|mov|m4v)(\?[^\s]*)?$/i.test(u); }
function parseVideo(u){
  u = String(u || "").trim(); if(!u) return null;
  if(isVideoFile(u)) return {type:"file", name:"Video", src:/^idb:/.test(u) ? (VC[u.slice(4)] || "") : u, watch:/^idb:/.test(u) ? "" : u};
  if(!/^https?:\/\//i.test(u)) u = "https://" + u;
  var m = u.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if(m) return {type:"yt", name:"YouTube", id:m[1], watch:"https://www.youtube.com/watch?v=" + m[1], embed:"https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&modestbranding=1"};
  if(/^https?:\/\/(?:www\.|m\.|web\.)?(?:facebook\.com\/(?:.+\/videos\/|watch\/?\?v=|reel\/|share\/v\/|share\/r\/)|fb\.watch\/)/i.test(u))
    return {type:"fb", name:"Facebook", watch:u, embed:"https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(u) + "&show_text=false&autoplay=1"};
  return null;
}
var CAN_EMBED = (function(){ try{ return window.self === window.top && /^https?:$/.test(location.protocol); }catch(e){ return false; } })();
function videoBlock(u, admin){
  var v = parseVideo(u); if(!v) return "";
  if(v.type === "file") return v.src ? '<div class="vbox"><video src="'+esc(v.src)+'" controls playsinline preload="metadata"></video></div>' : '<div class="vbox"><span class="vface"><span class="vcap">Loading video…</span></span></div>';
  var badge = v.type === "yt" ? '<span class="vplat yt"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF0033"/><path d="M10 9l5 3-5 3z" fill="#fff"/></svg>YouTube</span>' : '<span class="vplat fb"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1877F2"/><path d="M13.2 19v-6h2l.3-2.4h-2.3V9.2c0-.7.2-1.2 1.2-1.2h1.2V5.9c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.7h-2V13h2v6z" fill="#fff"/></svg>Facebook</span>';
  var face = '<span class="vface"><span class="vrings"><i></i><i></i></span><span class="vplay">'+ic("play")+'</span>' + badge + '<span class="vcap">' + esc(CAN_EMBED ? t("tap_play") : fill(t("watch_on"), v.name)) + '</span></span>';
  if(CAN_EMBED) return '<div class="vbox" data-embed="'+esc(v.embed)+'"><button type="button" class="vbtn" data-vplay aria-label="'+esc(t("tap_play"))+'">'+face+'</button></div><a class="vlink" href="'+esc(v.watch)+'" target="_blank" rel="noopener">'+ic("link")+esc(fill(t("watch_on"), v.name))+'</a>';
  return '<div class="vbox"><a class="vbtn" href="'+esc(v.watch)+'" target="_blank" rel="noopener">'+face+'</a></div>' + (admin ? '<p class="vnote">'+ic("info")+'In this preview the video opens on '+v.name+'. On the live website it plays right here, inside the product page.</p>' : '');
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-vplay]"); if(!b) return;
  var box = b.closest(".vbox"); if(!box || !box.dataset.embed) return;
  box.innerHTML = '<iframe src="'+esc(box.dataset.embed)+'" title="Product video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
});
function slugify(s){ return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product"; }
function productLink(p){ var d = String((DB.settings.store || {}).domain || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, ""); return "https://" + (d || "[your-domain]") + "/product/" + slugify(p.en); }
(function(){ var h = location.hash; if(/^#p-[A-Za-z0-9_-]+$/.test(h)){ var id = h.slice(3); setTimeout(function(){ if(BY[id] && BY[id].status === "active") openPM(id); }, 400); } })();

function openVideo(u){
  var lb = $("#vlb");
  if(!lb){ lb = document.createElement("div"); lb.id = "vlb"; lb.className = "vlb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", t("pvideo")); document.body.appendChild(lb);
    lb.addEventListener("click", function(e){ if(e.target === lb || e.target.closest(".vx")) closeVideo(); }); }
  lb.innerHTML = '<div class="vin"><button type="button" class="vx" aria-label="'+esc(t("close"))+'">'+ic("x")+'</button>' + videoBlock(u) + '</div>';
  void lb.offsetWidth; lb.classList.add("on");
  var vd = lb.querySelector("video"); if(vd){ try{ vd.play(); }catch(e){} }
  var pb = lb.querySelector("[data-vplay]"); if(pb) pb.focus(); else lb.querySelector(".vx").focus();
}
function closeVideo(){ var lb = $("#vlb"); if(!lb) return; lb.classList.remove("on"); setTimeout(function(){ if(!lb.classList.contains("on")) lb.innerHTML = ""; }, 300); }
document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-vpop]"); if(!b) return; e.preventDefault(); e.stopPropagation(); openVideo(b.dataset.vpop); }, true);
document.addEventListener("keydown", function(e){ var b = e.target.closest && e.target.closest("[data-vpop]"); if(b && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); e.stopPropagation(); openVideo(b.dataset.vpop); } if(e.key === "Escape") closeVideo(); }, true);

// ----- premium navigation bar with mega menu -----
Object.assign(T.bn, {nav_new:"নতুন এসেছে", nav_all:"সব দেখুন", hot:"হট", call_us:"কল করুন", items_n:"{x}টি ডিজাইন"});
Object.assign(T.en, {nav_new:"New in", nav_all:"View all", hot:"HOT", call_us:"Call us", items_n:"{x} designs"});
function renderNav(){
  var w = document.querySelector(".navbar .wrap"); if(!w) return;
  var h = '<a class="nl offer'+(tab === "sale" ? ' on' : '')+'" href="#new" data-cat="sale"><span class="ofi">'+ic("fire")+'</span><span>'+esc(t("offer"))+'</span><b class="hot">'+esc(t("hot"))+'</b></a><span class="nsep" aria-hidden="true"></span>';
  h += CATS.map(function(c){
    var ps = PL().filter(function(p){ return p.cat === c.id; });
    return '<div class="nitem"><a class="nl'+(tab === c.id ? ' on' : '')+'" href="#new" data-cat="'+c.id+'" aria-haspopup="true"><span class="nth" style="--tint:'+c.tint+'"><img src="'+I(c.img)+'" alt=""></span><span class="nlt">'+esc(t("c_" + c.id))+'</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>'
      + '<div class="mega" role="region" aria-label="'+esc(c[L])+'"><div class="mg-in">'
      + '<div class="mg-hd"><span class="mg-big" style="--tint:'+c.tint+'"><span class="floaty" style="--d:6s"><img src="'+I(c.img)+'" alt=""></span></span><div><span class="mg-k">'+esc(c[L === "bn" ? "en" : "bn"])+'</span><b>'+esc(c[L])+'</b><small>'+esc(fill(t("items_n"), num(ps.length)))+(ps.length ? ' · '+esc(fill(t("from_s"), money(minOf(c.id)))) : '')+'</small><a class="btn b-gold mg-cta" href="#new" data-cat="'+c.id+'">'+esc(t("nav_all"))+' '+ic("arrow")+'</a></div></div>'
      + '<div class="mg-ps">' + (ps.length ? ps.slice(0, 4).map(function(p){ var o = off(p); return '<button class="mg-p" data-qv="'+p.id+'"><span class="mg-pi" style="--tint:'+p.tint+'">'+(o ? '<i class="mg-off">-'+num(o)+'%</i>' : '')+'<img src="'+I(p.img || p.id)+'" alt=""></span><span class="mg-pn">'+esc(nm(p))+'</span><span class="mg-pp">'+money(price(p))+(o ? ' <s>'+money(p.price)+'</s>' : '')+'</span></button>'; }).join("") : '<p class="mg-empty">'+esc(t("empty_cat"))+'</p>') + '</div>'
      + '</div></div></div>';
  }).join("");
  var ph = (DB.settings.store || {}).phone;
  h += '<div class="right"><a href="#track">'+ic("route")+'<span>'+esc(t("track"))+'</span></a>'+(ph ? '<span class="nph">'+ic("call")+'<span>'+esc(ph)+'</span></span>' : '')+'</div>';
  w.innerHTML = h;
}
function setTab(id){ tab = id; renderTabs(); renderGrids(); renderNav(); }

// ----- announcement bar: one message at a time, sliding -----
var tkTimer = null, tkI = 0;
function renderTicker(){
  var list = cfg.ticker.filter(function(x){ return tx(x); }), icons = ["truck","cash","star","wa","tag","shield"];
  var bar = $("#ticker"); if(!bar) return;
  bar.className = "track tk";
  bar.innerHTML = '<button type="button" class="tk-a" data-tk="-1" aria-label="'+esc(t("prev"))+'">'+ic("chevL")+'</button><div class="tk-v" aria-live="polite">'
    + list.map(function(x, i){ return '<span class="tk-i'+(i === 0 ? ' on' : '')+'"><span class="tk-ic">'+ic(icons[i % icons.length])+'</span><span>'+esc(tx(x))+'</span></span>'; }).join("")
    + '</div><button type="button" class="tk-a" data-tk="1" aria-label="'+esc(t("next"))+'">'+ic("chevR")+'</button>';
  tkI = 0; clearInterval(tkTimer);
  if(list.length > 1 && !reduce) tkTimer = setInterval(function(){ tkGo(1); }, 4000);
}
function tkGo(d){
  var it = document.querySelectorAll("#ticker .tk-i"); if(it.length < 2) return;
  var cur2 = it[tkI]; tkI = (tkI + d + it.length) % it.length;
  cur2.classList.remove("on"); cur2.classList.add(d > 0 ? "out" : "outb");
  var nx = it[tkI]; nx.classList.remove("out", "outb"); nx.classList.add(d > 0 ? "inb" : "in"); void nx.offsetWidth; nx.classList.remove("inb", "in"); nx.classList.add("on");
  setTimeout(function(){ cur2.classList.remove("out", "outb"); }, 650);
}
document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-tk]"); if(!b) return; tkGo(+b.dataset.tk); clearInterval(tkTimer); if(!reduce) tkTimer = setInterval(function(){ tkGo(1); }, 4000); });
