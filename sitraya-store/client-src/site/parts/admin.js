// =====================================================================
// ADMIN PANEL
// =====================================================================
var ST = {
  received:{l:"Received", c:"#8A4B08", bg:"#FEF0C7"}, confirmed:{l:"Confirmed", c:"#1D4ED8", bg:"#DBEAFE"},
  processing:{l:"Processing", c:"#7E22CE", bg:"#F3E8FF"}, shipped:{l:"Shipped", c:"#3730A3", bg:"#E0E7FF"},
  delivered:{l:"Delivered", c:"#15803D", bg:"#DCFCE7"}, cancelled:{l:"Cancelled", c:"#B91C1C", bg:"#FEE2E2"}, returned:{l:"Returned", c:"#475569", bg:"#E2E8F0"}
};
var PS = {unpaid:{l:"Unpaid", c:"#8A4B08", bg:"#FEF0C7"}, verify:{l:"Verify payment", c:"#1D4ED8", bg:"#DBEAFE"}, paid:{l:"Paid", c:"#15803D", bg:"#DCFCE7"}, refunded:{l:"Refunded", c:"#475569", bg:"#E2E8F0"}};
var A = {page:"dashboard", range:"30", oStatus:"all", oQ:"", pQ:"", pCat:"all", pStatus:"all", sel:{}, iQ:"", iLow:false, cQ:"", lQ:"", nType:"all", draft:null, logged:false};
A.logged = (+store.get("st_admin_s", 0) || 0) > Date.now() - 12 * 36e5;
var amt = amtS;
var fdt = function(ts){ try{ return new Date(ts).toLocaleString("en-GB", {day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"Asia/Dhaka"}); }catch(e){ return new Date(ts).toLocaleString(); } };
var fday = function(ts){ try{ return new Date(ts).toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric", timeZone:"Asia/Dhaka"}); }catch(e){ return new Date(ts).toDateString(); } };
var pill = function(m, k){ var s = m[k] || {l:k, c:"#475569", bg:"#E2E8F0"}; return '<span class="pl" style="color:'+s.c+';background:'+s.bg+'"><i style="background:'+s.c+'"></i>'+esc(s.l)+'</span>'; };
var demoTag = '<span class="demo">Demo</span>';
var sum = function(arr, f){ return arr.reduce(function(a, x){ return a + (f(x) || 0); }, 0); };
var dhakaDay = function(ts){ return new Date(ts + 6 * 36e5).toISOString().slice(0, 10); };
function rangeStart(r){
  var now = Date.now(), DAY = 864e5, d = new Date(now + 6 * 36e5); d.setUTCHours(0, 0, 0, 0); var today = d.getTime() - 6 * 36e5;
  if(r === "today") return today; if(r === "7") return today - 6 * DAY; if(r === "30") return today - 29 * DAY;
  if(r === "month"){ d.setUTCDate(1); return d.getTime() - 6 * 36e5; } return 0;
}
var PAGES = {
  dashboard:{t:"Dashboard", bn:"ড্যাশবোর্ড", s:"How the shop is doing, from your own order records", ic:"chart"},
  orders:{t:"Orders", bn:"অর্ডার", s:"Confirm, pack, ship and track every order", ic:"bag"},
  products:{t:"Products", bn:"প্রোডাক্ট", s:"Add, edit and publish what you sell", ic:"layers"},
  inventory:{t:"Inventory", bn:"স্টক", s:"Stock for every size and colour", ic:"box"},
  categories:{t:"Categories", bn:"ক্যাটাগরি", s:"Names and images shown on the website", ic:"grid"},
  customers:{t:"Customers", bn:"কাস্টমার", s:"Built from your orders", ic:"users"},
  coupons:{t:"Coupons", bn:"কুপন", s:"Discount codes customers can use at checkout", ic:"tag"},
  reviews:{t:"Reviews", bn:"রিভিউ", s:"Approve what customers write", ic:"star"},
  site:{t:"Homepage & Branding", bn:"হোমপেজ ও ব্র্যান্ডিং", s:"Slider, banners, logo, name, announcement and theme", ic:"edit"},
  settings:{t:"Store Settings", bn:"স্টোর সেটিংস", s:"Contact details, payment methods, delivery and stock alerts", ic:"gear"},
  notifications:{t:"Notifications", bn:"নোটিফিকেশন", s:"New orders, stock alerts and system messages", ic:"bell"},
  meta:{t:"Meta Integration", bn:"মেটা (Facebook/Instagram)", s:"Pixel, Conversions API and product catalogue", ic:"meta"},
  users:{t:"Admin Users & Roles", bn:"অ্যাডমিন ও রোল", s:"Who can sign in and what they can change", ic:"users"},
  log:{t:"Activity Log", bn:"অ্যাক্টিভিটি লগ", s:"Every change made in the admin panel", ic:"list"}
};
var NAV = [["Shop", ["dashboard","orders","products","inventory","categories","customers","coupons","reviews"]], ["Website", ["site","settings"]], ["Marketing", ["notifications","meta"]], ["Team", ["users","log"]]];

// ---------- shell ----------
var wasAdmin = false, adminMode = location.hash === "#admin";
function goAdmin(on){ adminMode = on; if(!on && location.hash === "#admin"){ try{ history.replaceState(null, "", location.pathname + location.search); }catch(x){} } showView(true); if(!on) window.scrollTo(0, 0); }
function showView(force){
  var adm = adminMode;
  if(adm === wasAdmin && !force) return;
  wasAdmin = adm;
  document.body.classList.toggle("is-admin", adm);
  $("#admin").hidden = !adm;
  if(adm){ closeAll(true); stop(); document.documentElement.lang = "en"; $("#aLogin").hidden = A.logged; $("#aShell").hidden = !A.logged; if(A.logged) aRender(); else { $("#alMsg").hidden = true; setTimeout(function(){ $("#alPass").focus(); }, 80); } window.scrollTo(0, 0); }
  else { aCloseDrawer(); renderAll(true); play(); }
}
window.addEventListener("hashchange", function(){ if(location.hash === "#admin" && !adminMode){ adminMode = true; showView(); } });
function aBell(){
  var n = DB.notifs.filter(function(x){ return !x.read; }).length;
  var b = $("#aBellN"); if(b){ b.textContent = n; b.hidden = !n; } $("#aBell").classList.toggle("ring", !!n);
  var o = DB.orders.filter(function(x){ return x.status === "received"; }).length;
  var ob = document.querySelector('[data-ap="orders"] .nb'); if(ob){ ob.textContent = o; ob.hidden = !o; }
}
function aRender(){
  $("#aNav").innerHTML = NAV.map(function(g){
    return '<div class="ng"><span class="nh">'+esc(g[0])+'</span>' + g[1].map(function(k){ var pg = PAGES[k];
      return '<button class="ni'+(A.page === k ? ' on' : '')+'" data-ap="'+k+'"'+(A.page === k ? ' aria-current="page"' : '')+'><span class="nic">'+ic(pg.ic)+'</span><span>'+esc(pg.t)+'<small>'+esc(pg.bn)+'</small></span>'+(k === "orders" ? '<i class="nb" hidden></i>' : '')+'</button>'; }).join("") + '</div>';
  }).join("");
  var pg = PAGES[A.page];
  $("#aTitle").textContent = pg.t; $("#aSub").textContent = pg.bn + " · " + pg.s;
  var site = A.page === "site";
  $("#cz").hidden = !site; $("#aBody").hidden = site;
  if(site) renderCZ(); else { $("#aBody").innerHTML = PAGEFN[A.page](); countUp(); }
  $("#aHello").textContent = A.page === "dashboard" ? hello() : "";
  $("#aSide").classList.remove("on"); $("#aScrim").classList.remove("on");
  aBell();
  document.title = pg.t + " · " + BRAND() + " Admin";
}
function aGo(p){ A.page = p; A.sel = {}; aRender(); $("#aMain").scrollTop = 0; window.scrollTo(0, 0); }
function aSaved(msg, detail){ saveDB(); toast(msg || "Saved", detail || ""); }

// ---------- drawer ----------
var POPK = [[/^Order /, "bag", "Order details · অর্ডারের বিস্তারিত"], [/^Add product/, "plus", "New product · নতুন প্রোডাক্ট"], [/^Edit ·/, "layers", "Edit product · প্রোডাক্ট এডিট"], [/coupon/i, "tag", "Coupon · কুপন"], [/^Add admin/, "users", "Team · টিম"], [/^Invoice|^Export/, "copy", "Copy & share · কপি করুন"]];
function aOpenDrawer(title, body, foot, wide){
  var k = POPK.filter(function(x){ return x[0].test(title); })[0] || [null, "users", "Customer · কাস্টমার"];
  $("#adI").innerHTML = ic(k[1]); $("#adS").textContent = k[2];
  $("#adT").textContent = title; $("#adB").innerHTML = body; $("#adF").innerHTML = foot || "";
  var d = $("#aDrawer"), was = d.classList.contains("on");
  d.classList.toggle("wide", !!wide);
  if(!was){ d.classList.remove("on"); void d.offsetWidth; }
  d.classList.add("on"); d.setAttribute("aria-hidden", "false"); $("#aScrim").classList.add("on", "pop"); document.body.style.overflow = "hidden";
  $("#adB").scrollTop = 0; setTimeout(function(){ var x = d.querySelector(".x"); if(x) x.focus({preventScroll:true}); }, 60);
}
function aCloseDrawer(){ var d = $("#aDrawer"); if(!d) return; var was = d.classList.contains("on"); d.classList.remove("on"); d.setAttribute("aria-hidden", "true"); $("#aScrim").classList.remove("on", "pop"); if(was) document.body.style.overflow = ""; A.draft = null; }

// ---------- dashboard ----------
function pgDashboard(){
  var since = rangeStart(A.range), os = DB.orders.filter(function(o){ return o.at >= since; });
  var live = os.filter(function(o){ return o.status !== "cancelled" && o.status !== "returned"; });
  var dl = os.filter(function(o){ return o.status === "delivered"; });
  var collected = sum(os.filter(function(o){ return o.payStatus === "paid" && o.status !== "returned"; }), function(o){ return o.total; });
  var pend = os.filter(function(o){ return ["received","confirmed","processing"].indexOf(o.status) > -1; }).length;
  var ship = os.filter(function(o){ return o.status === "shipped"; }).length;
  var gross = sum(live, function(o){ return o.total; });
  var lowV = []; P.forEach(function(p){ if(p.status === "archived") return; p.variants.forEach(function(v){ if(v.stock <= DB.settings.lowStock) lowV.push({p:p, v:v}); }); });
  var R = [["today","Today"],["7","7 days"],["30","30 days"],["month","This month"],["all","All time"]];
  var kpi = function(lbl, val, sub, icn, tone){ var raw = typeof val === "number" ? val : null, isM = typeof val === "string" && val.charAt(0) === "৳"; if(isM) raw = +val.replace(/[^0-9]/g, ""); return '<div class="kpi'+(tone ? ' '+tone : '')+'" data-tilt="8"><span class="ki">'+ic(icn)+'</span><span class="kl">'+esc(lbl)+'</span><b'+(raw != null ? ' data-count="'+raw+'"'+(isM ? ' data-fmt="m"' : '') : '')+'>'+val+'</b><small>'+sub+'</small></div>'; };
  var h = '<div class="bar"><div class="chips" role="group" aria-label="Date range">' + R.map(function(x){ return '<button class="chip" data-range="'+x[0]+'" aria-pressed="'+(A.range === x[0])+'">'+x[1]+'</button>'; }).join("") + '</div><span class="hint2">'+ic("info")+'Figures come from your own orders. Demo orders are included until you clear them.</span></div>';
  h += '<div class="kpis">'
    + kpi("Orders created", os.length, live.length + " active · " + (os.length - live.length) + " cancelled/returned", "bag")
    + kpi("Gross order value", amt(gross), "Before courier; excludes cancelled & returned", "chart")
    + kpi("Collected payments", amt(collected), "Orders marked paid", "cash", "good")
    + kpi("Needs action", pend, ship + " out with courier", "bell", pend ? "warn" : "")
    + kpi("Average order", amt(live.length ? Math.round(gross / live.length) : 0), dl.length + " delivered in range", "tag")
    + kpi("Discounts given", amt(sum(live, function(o){ return o.disc; })), "Delivery charged " + amt(sum(live, function(o){ return o.del; })), "star")
    + '</div>';
  // chart: last 14 days order value
  var days = [], DAY = 864e5, base = rangeStart("today");
  for(var i = 13; i >= 0; i--){ var st = base - i * DAY; var dd = DB.orders.filter(function(o){ return o.at >= st && o.at < st + DAY && o.status !== "cancelled" && o.status !== "returned"; }); days.push({st:st, v:sum(dd, function(o){ return o.total; }), n:dd.length}); }
  var max = Math.max.apply(null, days.map(function(d){ return d.v; }).concat([1000]));
  var step = Math.pow(10, Math.floor(Math.log10(max / 4))); var nice = [1, 2, 2.5, 5, 10].map(function(m){ return m * step; }).filter(function(s){ return s * 4 >= max; })[0] || step * 10; var top = nice * 4;
  var W = 720, H = 250, pl = 54, pr = 10, pt = 14, pb = 34, cw = (W - pl - pr) / 14, bw = Math.min(30, cw * .56);
  var y = function(v){ return pt + (H - pt - pb) * (1 - v / top); };
  var svg = '<svg viewBox="0 0 '+W+' '+H+'" class="chart" role="img" aria-label="Order value per day, last 14 days">';
  for(var g = 0; g <= 4; g++){ var gv = nice * g, gy = y(gv); svg += '<line x1="'+pl+'" x2="'+(W - pr)+'" y1="'+gy+'" y2="'+gy+'" class="gl"/><text x="'+(pl - 8)+'" y="'+(gy + 4)+'" class="ax" text-anchor="end">'+(gv >= 1000 ? (gv / 1000) + "k" : gv)+'</text>'; }
  days.forEach(function(d, i){
    var x = pl + i * cw + (cw - bw) / 2, yy = y(d.v), hh = H - pb - yy, r = Math.min(4, hh);
    var lbl = new Date(d.st + 6 * 36e5).toUTCString().slice(5, 11);
    if(d.v > 0) svg += '<path class="br" style="animation-delay:'+(i * 40)+'ms" d="M'+x+','+(H - pb)+'V'+(yy + r)+'Q'+x+','+yy+' '+(x + r)+','+yy+'H'+(x + bw - r)+'Q'+(x + bw)+','+yy+' '+(x + bw)+','+(yy + r)+'V'+(H - pb)+'Z"/>';
    svg += '<rect x="'+(pl + i * cw)+'" y="'+pt+'" width="'+cw+'" height="'+(H - pt - pb)+'" class="hit" data-tip="'+esc(lbl + " · " + amt(d.v) + " · " + d.n + " order" + (d.n === 1 ? "" : "s"))+'"/>';
    if(i % 2 === 1 || i === 13) svg += '<text x="'+(x + bw / 2)+'" y="'+(H - 12)+'" class="ax" text-anchor="middle">'+lbl.trim()+'</text>';
  });
  svg += '<line x1="'+pl+'" x2="'+(W - pr)+'" y1="'+(H - pb)+'" y2="'+(H - pb)+'" class="bl"/></svg>';
  var stc = {}; os.forEach(function(o){ stc[o.status] = (stc[o.status] || 0) + 1; });
  var tp = {}; live.forEach(function(o){ o.items.forEach(function(x){ tp[x.pid] = tp[x.pid] || {q:0, v:0, en:x.en}; tp[x.pid].q += x.qty; tp[x.pid].v += x.qty * x.unit; }); });
  var tops = Object.keys(tp).map(function(k){ return {id:k, q:tp[k].q, v:tp[k].v, en:tp[k].en}; }).sort(function(a, b){ return b.q - a.q; }).slice(0, 5);
  h += '<div class="g2"><section class="card2"><div class="ch"><h3>Order value per day</h3><span>Last 14 days · excludes cancelled & returned</span></div><div class="chartw">'+svg+'</div></section>'
    + '<section class="card2"><div class="ch"><h3>Orders by status</h3><span>'+esc(R.filter(function(x){ return x[0] === A.range; })[0][1])+'</span></div><div class="sts">'
    + Object.keys(ST).map(function(k){ var n = stc[k] || 0, w = os.length ? n / os.length * 100 : 0; return '<button class="stl" data-gostatus="'+k+'">'+pill(ST, k)+'<span class="sb"><i style="width:'+w.toFixed(1)+'%;background:'+ST[k].c+'"></i></span><b>'+n+'</b></button>'; }).join("")
    + '</div></section></div>';
  h += '<div class="g3"><section class="card2"><div class="ch"><h3>Recent orders</h3><button class="lk" data-ap="orders">All orders</button></div>' + orderTable(DB.orders.slice(0, 6), true) + '</section>'
    + '<section class="card2"><div class="ch"><h3>Top products</h3><span>by pieces sold</span></div>' + (tops.length ? '<ol class="tops">' + tops.map(function(x){ var p = BY[x.id]; return '<li><span class="th" style="--tint:'+(p ? p.tint : "#eee")+'">'+(p ? '<img src="'+I(p.img)+'" alt="">' : '')+'</span><span><b>'+esc(x.en)+'</b><small>'+x.q+' pcs · '+amt(x.v)+'</small></span></li>'; }).join("") + '</ol>' : '<p class="empty2">No sales in this range yet.</p>') + '</section>'
    + '<section class="card2"><div class="ch"><h3>Low stock</h3><button class="lk" data-ap="inventory">Inventory</button></div>' + (lowV.length ? '<ul class="lows">' + lowV.slice(0, 7).map(function(x){ return '<li><span><b>'+esc(x.p.en)+'</b><small>'+esc(x.v.size)+' · <i class="sw3" style="background:'+x.v.color+'"></i> '+esc(x.v.sku)+'</small></span><span class="'+(x.v.stock ? 'lw' : 'oo')+'">'+(x.v.stock ? x.v.stock + ' left' : 'Out')+'</span></li>'; }).join("") + '</ul>' + (lowV.length > 7 ? '<p class="more2">+'+(lowV.length - 7)+' more</p>' : '') : '<p class="empty2">Every variant is above '+DB.settings.lowStock+' pieces.</p>') + '</section></div>';
  return h;
}

// ---------- orders ----------
function orderTable(list, compact){
  if(!list.length) return '<p class="empty2">No orders match.</p>';
  return '<div class="tw"><table class="tb"><thead><tr><th>Order</th><th>Date</th><th>Customer</th>'+(compact ? '' : '<th>Items</th>')+'<th class="r">Total</th>'+(compact ? '' : '<th>Payment</th>')+'<th>Status</th></tr></thead><tbody>'
    + list.map(function(o){ return '<tr class="rw" data-ao="'+o.ref+'" tabindex="0"><td><b class="mono">'+esc(o.ref)+'</b>'+(o.demo ? demoTag : '')+(o.source === "whatsapp" ? '<span class="src">WA</span>' : '')+'</td><td class="mut">'+fdt(o.at)+'</td><td><b>'+esc(o.customer.name)+'</b><small>'+esc(o.customer.phone)+' · '+esc(o.customer.district)+'</small></td>'
      + (compact ? '' : '<td>'+sum(o.items, function(x){ return x.qty; })+' pcs</td>') + '<td class="r"><b>'+amt(o.total)+'</b></td>' + (compact ? '' : '<td>'+esc(o.pay === "cod" ? "COD" : o.pay.toUpperCase())+' '+pill(PS, o.payStatus)+'</td>') + '<td>'+pill(ST, o.status)+'</td></tr>'; }).join("")
    + '</tbody></table></div>';
}
function filteredOrders(){
  var q = A.oQ.trim().toLowerCase();
  return DB.orders.filter(function(o){ return (A.oStatus === "all" || o.status === A.oStatus) && (!q || (o.ref + " " + o.customer.name + " " + o.customer.phone + " " + o.customer.district).toLowerCase().indexOf(q) > -1); });
}
function pgOrders(){
  var c = {all:DB.orders.length}; DB.orders.forEach(function(o){ c[o.status] = (c[o.status] || 0) + 1; });
  var demoN = DB.orders.filter(function(o){ return o.demo; }).length;
  return '<div class="bar"><div class="chips scrollx">' + ["all"].concat(Object.keys(ST)).map(function(k){ return '<button class="chip" data-ostatus="'+k+'" aria-pressed="'+(A.oStatus === k)+'">'+(k === "all" ? "All" : ST[k].l)+' <i>'+(c[k] || 0)+'</i></button>'; }).join("") + '</div>'
    + '<label class="srch">'+ic("search")+'<span class="sr">Search orders</span><input id="aOQ" data-aq="oQ" placeholder="Search reference, name, phone, district" value="'+esc(A.oQ)+'"></label></div>'
    + (demoN ? '<div class="note2">'+ic("info")+'<span>'+demoN+' orders marked <b>Demo</b> were added so you can try the panel. Remove them before going live.</span><button class="btn2" data-a="cleardemo">Remove demo orders</button></div>' : '')
    + '<section class="card2 flush" id="aOT">' + orderTable(filteredOrders()) + '</section>';
}
function allowedNext(o){
  var i = FLOW_S.indexOf(o.status), out = [];
  if(o.status === "cancelled" || o.status === "returned") return out;
  FLOW_S.forEach(function(s, j){ if(j > i) out.push(s); });
  if(o.status !== "delivered") out.push("cancelled"); else out.push("returned");
  return out;
}
function aOrder(ref){
  var o = DB.orders.filter(function(x){ return x.ref === ref; })[0]; if(!o) return;
  var nx = allowedNext(o), C = o.customer;
  var body = '<div class="oh">'+pill(ST, o.status)+' '+pill(PS, o.payStatus)+(o.demo ? demoTag : '')+'<span class="mut">'+fdt(o.at)+' · '+(o.source === "whatsapp" ? "WhatsApp" : "Website")+'</span></div>'
    + '<div class="g2s"><div class="box2"><h4>Customer</h4><p><b>'+esc(C.name)+'</b><br>'+esc(C.phone)+(C.wa ? '<br>WhatsApp: '+esc(C.wa) : '')+'</p><p>'+esc(C.addr)+(C.po ? '<br>Post office: '+esc(C.po) : '')+'<br>'+esc(C.area)+', '+esc(C.district)+'<br><span class="mut">'+(o.zone === "in" ? "Inside Dhaka" : "Outside Dhaka")+'</span></p>'+(C.note ? '<p class="cnote">"'+esc(C.note)+'"</p>' : '')+'</div>'
    + '<div class="box2"><h4>Payment</h4><p>'+esc(o.pay === "cod" ? "Cash on Delivery" : o.pay.toUpperCase())+(o.trx ? '<br>TrxID: <b class="mono">'+esc(o.trx)+'</b>' : '')+'</p><label class="fld">Payment status<select data-of="payStatus">'+Object.keys(PS).map(function(k){ return '<option value="'+k+'"'+(o.payStatus === k ? ' selected' : '')+'>'+PS[k].l+'</option>'; }).join("")+'</select></label></div></div>'
    + '<div class="box2"><h4>Items</h4><div class="tw"><table class="tb sm"><thead><tr><th>Product</th><th>SKU</th><th>Size</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">Line</th></tr></thead><tbody>'
    + o.items.map(function(x){ return '<tr><td>'+esc(x.en)+' <i class="sw3" style="background:'+x.color+'"></i></td><td class="mono mut">'+esc(x.sku)+'</td><td>'+esc(x.size)+'</td><td class="r">'+x.qty+'</td><td class="r">'+amt(x.unit)+'</td><td class="r">'+amt(x.unit * x.qty)+'</td></tr>'; }).join("")
    + '</tbody></table></div><div class="tots"><span>Subtotal</span><b>'+amt(o.sub)+'</b>'+(o.disc ? '<span>Discount'+(o.coupon ? ' ('+esc(o.coupon)+')' : '')+'</span><b>−'+amt(o.disc)+'</b>' : '')+'<span>Delivery</span><b>'+(o.del ? amt(o.del) : 'Free')+'</b><span class="gt">Total</span><b class="gt">'+amt(o.total)+'</b></div></div>'
    + '<div class="box2"><h4>Update status</h4>' + (nx.length ? '<div class="two"><label class="fld">New status<select id="oNext">'+nx.map(function(s){ return '<option value="'+s+'">'+ST[s].l+'</option>'; }).join("")+'</select></label><label class="fld">Note (optional)<input id="oNote" type="text" placeholder="e.g. confirmed by phone"></label></div><button class="btn b-em sm" data-a="ostatus" data-ref="'+o.ref+'">Update status</button>'
      + (o.stockOut ? '<p class="mut sm2">Stock for this order is already deducted. Cancelling or returning puts it back automatically.</p>' : (o.demo ? '<p class="mut sm2">Demo order: stock was not deducted, so cancelling does not change stock.</p>' : '')) : '<p class="mut">This order is '+ST[o.status].l.toLowerCase()+'. No further status changes.</p>') + '</div>'
    + '<div class="box2"><h4>Courier</h4><div class="two"><label class="fld">Courier<select data-of="courier">'+["","Pathao","Steadfast","RedX","Sundarban","eCourier","Own delivery"].map(function(c){ return '<option value="'+c+'"'+(o.courier === c ? ' selected' : '')+'>'+(c || "Not assigned")+'</option>'; }).join("")+'</select></label><label class="fld">Tracking number<input type="text" data-of="tracking" value="'+esc(o.tracking)+'"></label></div><p class="mut sm2">Entered by hand for now. Live courier tracking connects once you add the courier\'s API key.</p></div>'
    + '<div class="box2"><h4>Internal note</h4><label class="fld"><span class="sr">Internal note</span><textarea data-of="notes" placeholder="Only admins see this">'+esc(o.notes)+'</textarea></label></div>'
    + '<div class="box2"><h4>History</h4><ol class="hist">' + o.history.slice().reverse().map(function(h){ return '<li>'+pill(ST, h.s)+'<span>'+fdt(h.at)+' · '+esc(h.by === "customer" ? "Customer" : h.by)+(h.note ? ' · "'+esc(h.note)+'"' : '')+'</span></li>'; }).join("") + '</ol></div>';
  var foot = '<button class="btn b-out sm" data-a="invoice" data-ref="'+o.ref+'">'+ic("copy")+'Copy invoice</button><a class="btn b-wa sm" target="_blank" rel="noopener" href="https://wa.me/'+(function(){ var n = (C.wa || C.phone).replace(/\D/g, ""); return n.indexOf("0") === 0 ? "88" + n : n; })()+'?text='+encodeURIComponent("Assalamu alaikum " + C.name + ", your " + BRAND() + " order " + o.ref + " is " + ST[o.status].l.toLowerCase() + ". Total " + amt(o.total) + ".")+'">'+ic("wa")+'Message customer</a>';
  aOpenDrawer("Order " + o.ref, body, foot, true);
  $("#adB").dataset.ref = o.ref;
}
function setStatus(o, ns, note){
  var old = o.status; if(ns === old) return;
  o.status = ns; o.history.push({s:ns, at:Date.now(), by:"Owner", note:note || ""});
  if((ns === "cancelled" || ns === "returned") && o.stockOut){
    o.items.forEach(function(x){ var p = BY[x.pid], v = p && variantOf(p, x.size, x.color); if(v){ v.stock += x.qty; DB.moves.unshift({at:Date.now(), pid:p.id, sku:v.sku, d:x.qty, why:(ns === "cancelled" ? "Cancelled " : "Returned ") + o.ref}); } });
    o.stockOut = false;
  }
  if(ns === "cancelled" && DB.settings.notif.cancel) notify("cancel", "Order cancelled " + o.ref, o.customer.name + " · " + amt(o.total), o.ref);
  logA("Order status changed", o.ref + ": " + ST[old].l + " → " + ST[ns].l + (note ? ' ("' + note + '")' : ""));
}
function invoiceText(o){
  return BRAND() + " — Invoice " + o.ref + "\nDate: " + fday(o.at) + "\n\nBill to: " + o.customer.name + ", " + o.customer.phone + "\n" + o.customer.addr + (o.customer.po ? ", PO " + o.customer.po : "") + ", " + o.customer.area + ", " + o.customer.district + "\n\n"
    + o.items.map(function(x){ return x.en + " (" + x.size + ", " + x.sku + ") x" + x.qty + " @ " + amt(x.unit) + " = " + amt(x.unit * x.qty); }).join("\n")
    + "\n\nSubtotal: " + amt(o.sub) + (o.disc ? "\nDiscount: -" + amt(o.disc) : "") + "\nDelivery: " + amt(o.del) + "\nTotal: " + amt(o.total) + "\nPayment: " + (o.pay === "cod" ? "Cash on Delivery" : o.pay.toUpperCase()) + " (" + PS[o.payStatus].l + ")";
}

// ---------- products ----------
function filteredProducts(){
  var q = A.pQ.trim().toLowerCase();
  return P.filter(function(p){ return (A.pCat === "all" || p.cat === A.pCat) && (A.pStatus === "all" ? p.status !== "archived" : p.status === A.pStatus) && (!q || (p.en + " " + p.bn + " " + p.sku).toLowerCase().indexOf(q) > -1); });
}
var PST = {active:{l:"Active", c:"#15803D", bg:"#DCFCE7"}, draft:{l:"Draft", c:"#8A4B08", bg:"#FEF0C7"}, archived:{l:"Archived", c:"#475569", bg:"#E2E8F0"}};
function productTable(){
  var list = filteredProducts(), selN = Object.keys(A.sel).filter(function(k){ return A.sel[k]; }).length;
  var h = selN ? '<div class="bulk"><b>'+selN+' selected</b><button class="btn2" data-a="bulk" data-v="active">Publish</button><button class="btn2" data-a="bulk" data-v="draft">Move to draft</button><button class="btn2" data-a="bulk" data-v="archived">Archive</button><button class="btn2" data-a="export">Export CSV</button><button class="lk" data-a="clearsel">Clear</button></div>' : '';
  if(!list.length) return h + '<p class="empty2">No products match. Try another filter, or add a product.</p>';
  return h + '<div class="tw"><table class="tb"><thead><tr><th class="ck"><input type="checkbox" data-a="selall" aria-label="Select all"'+(list.every(function(p){ return A.sel[p.id]; }) ? ' checked' : '')+'></th><th>Product</th><th>Category</th><th class="r">Price</th><th class="r">Stock</th><th>Status</th><th>Shown as</th><th></th></tr></thead><tbody>'
    + list.map(function(p){ var ts = totalStock(p), lowN = p.variants.filter(function(v){ return v.stock <= DB.settings.lowStock; }).length;
      return '<tr><td class="ck"><input type="checkbox" data-sel="'+p.id+'"'+(A.sel[p.id] ? ' checked' : '')+' aria-label="Select '+esc(p.en)+'"></td>'
        + '<td><button class="pc" data-ape="'+p.id+'"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img)+'" alt=""></span><span><b>'+esc(p.en)+'</b><small>'+esc(p.bn)+' · <span class="mono">'+esc(p.sku)+'</span></small></span></button></td>'
        + '<td>'+esc((CAT[p.cat] || {}).en || p.cat)+'</td><td class="r">'+(p.sale && p.sale < p.price ? '<b>'+amt(p.sale)+'</b><s class="mut">'+amt(p.price)+'</s>' : '<b>'+amt(p.price)+'</b>')+'</td>'
        + '<td class="r"><b class="'+(ts === 0 ? 'oo' : lowN ? 'lw' : '')+'">'+ts+'</b><small>'+p.variants.length+' variants'+(lowN ? ' · '+lowN+' low' : '')+'</small></td>'
        + '<td>'+pill(PST, p.status)+'</td><td><div class="flags tflags"><label class="sw2 xs"><input type="checkbox" data-flag="isNew" data-pid="'+p.id+'"'+(p.isNew ? ' checked' : '')+'><i></i>New</label><label class="sw2 xs"><input type="checkbox" data-flag="top" data-pid="'+p.id+'"'+(p.top ? ' checked' : '')+'><i></i>Top</label></div></td>'
        + '<td><button class="mini" data-ape="'+p.id+'" aria-label="Edit '+esc(p.en)+'">'+ic("edit")+'</button></td></tr>'; }).join("")
    + '</tbody></table></div>';
}
function pgProducts(){
  return '<div class="bar"><label class="srch">'+ic("search")+'<span class="sr">Search products</span><input id="aPQ" data-aq="pQ" placeholder="Search name or SKU" value="'+esc(A.pQ)+'"></label>'
    + '<label class="fld inl">Category<select data-pf2="pCat"><option value="all">All</option>'+CATS.map(function(c){ return '<option value="'+c.id+'"'+(A.pCat === c.id ? ' selected' : '')+'>'+esc(c.en)+'</option>'; }).join("")+'</select></label>'
    + '<label class="fld inl">Status<select data-pf2="pStatus">'+[["all","Active & draft"],["active","Active"],["draft","Draft"],["archived","Archived"]].map(function(s){ return '<option value="'+s[0]+'"'+(A.pStatus === s[0] ? ' selected' : '')+'>'+s[1]+'</option>'; }).join("")+'</select></label>'
    + '<button class="btn b-em sm push" data-ape="new">'+ic("plus")+'Add product</button></div>'
    + '<section class="card2 flush" id="aPT">' + productTable() + '</section>';
}
function rebuildVariants(d){
  var old = d.variants || [], out = [], used = {};
  old.forEach(function(v){ used[v.sku] = 1; });
  d.sizes.forEach(function(s){ d.colors.forEach(function(c, j){
    var f = old.filter(function(v){ return v.size === s && v.color === c; })[0];
    if(!f){ var base = (d.sku || "SKU") + "-" + String(s).replace(/[^A-Za-z0-9]/g, "") + "-", n = j + 1; while(used[base + n]) n++; used[base + n] = 1; f = {sku:base + n, size:s, color:c, stock:0}; }
    out.push(f);
  }); });
  d.variants = out;
}
function variantRows(d){
  if(!d.variants.length) return '<p class="vempty">'+ic("info")+'Add at least one size and one colour to create variants.</p>';
  var tot = d.variants.reduce(function(a, v){ return a + Math.max(0, +v.stock || 0); }, 0);
  return '<div class="vgrid"><div class="vh"><span>Variant</span><span>SKU</span><span class="r">Stock</span></div>'
    + d.variants.map(function(v, i){ return '<div class="vr"><span class="vv"><i class="swb" style="background:'+v.color+'"></i><b>'+esc(v.size)+'</b></span>'
      + '<input class="ti mono" type="text" data-vf="sku" data-vi="'+i+'" value="'+esc(v.sku)+'" aria-label="SKU for '+esc(v.size)+'">'
      + '<span class="stp"><button type="button" data-a="vstep" data-vi="'+i+'" data-d="-1" aria-label="One less">−</button><input class="ti num" type="number" min="0" step="1" data-vf="stock" data-vi="'+i+'" value="'+v.stock+'" aria-label="Stock for '+esc(v.size)+'"><button type="button" data-a="vstep" data-vi="'+i+'" data-d="1" aria-label="One more">+</button></span></div>'; }).join("")
    + '<div class="vf"><span>'+d.variants.length+' variants</span><b>Total stock <span id="pTot">'+tot+'</span></b></div></div>';
}
function sizeColorUI(d){
  return '<div class="fld">Sizes</div><div class="chipset">' + d.sizes.map(function(s, i){ return '<span class="tg2">'+esc(s)+'<button type="button" data-a="psrm" data-i="'+i+'" aria-label="Remove size '+esc(s)+'">'+ic("x")+'</button></span>'; }).join("")
    + '<input class="tgin" id="pSizeIn" type="text" placeholder="'+(d.sizes.length ? "Add size…" : "Type a size and press Enter")+'" aria-label="Add size"></div>'
    + '<div class="presets"><span>Quick add</span>' + [["S, M, L, XL, XXL","S–XXL"],["52, 54, 56, 58","52–58"],["Free size","Free size"],["2-3Y, 4-5Y, 6-7Y","Kids"],["38, 40, 42, 44","38–44"]].map(function(x){ return '<button type="button" class="btn2" data-a="pspre" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("") + '</div>'
    + '<div class="fld">Colours</div><div class="swset">' + d.colors.map(function(c, i){ return '<span class="swc"><label class="swp" style="background:'+c+'" title="Change colour"><input type="color" data-pc="'+i+'" value="'+c+'" aria-label="Colour '+(i + 1)+'"></label>'+(d.colors.length > 1 ? '<button type="button" class="swx" data-a="pcrm" data-i="'+i+'" aria-label="Remove colour '+(i + 1)+'">'+ic("x")+'</button>' : '')+'</span>'; }).join("")
    + '<button type="button" class="swadd" data-a="pcadd" aria-label="Add colour">'+ic("plus")+'</button></div><p class="hint3">Click a circle to change its colour.</p>';
}
function colorInputs(d){ return sizeColorUI(d); }
function refreshSO(){ var d = A.draft; rebuildVariants(d); $("#pSO").innerHTML = sizeColorUI(d); $("#pVar").innerHTML = variantRows(d); }
function addSizes(txt){ var d = A.draft; String(txt).split(",").map(function(x){ return x.trim(); }).filter(Boolean).forEach(function(x){ if(d.sizes.indexOf(x) < 0) d.sizes.push(x); }); refreshSO(); var n = $("#pSizeIn"); if(n) n.focus(); }
function aProduct(id){
  var isNew = id === "new";
  var d = A.draft = isNew ? {id:"", en:"", bn:"", sku:"ST-NEW-" + (100 + P.length + 1), cat:"abaya", price:"", sale:"", cost:"", sizes:["M","L","XL"], colors:["#1B1A18"], tint:"#EFE6D6", status:"draft", isNew:1, top:0, den:"", dbn:"", img:"", variants:[]} : clone(BY[id]);
  if(isNew) rebuildVariants(d);
  var f = function(lbl, k, type, extra, ph){ var v = d[k]; return '<label class="fld">'+esc(lbl)+'<input type="'+(type || "text")+'" data-pd="'+k+'" value="'+esc(v == null ? "" : v)+'"'+(ph ? ' placeholder="'+esc(ph)+'"' : '')+(extra || "")+'></label>'; };
  var sec = function(t, icn, inner){ return '<section class="fs"><h4 class="fsh">'+ic(icn)+'<span>'+t+'</span></h4>'+inner+'</section>'; };
  var body = '<div class="err" id="pErr" hidden></div>'
    + sec("Photo", "upload", '<label class="dz"><span class="pv big" id="pPv" style="background-image:url(\''+(d.img ? I(d.img) : '')+'\');--tint:'+d.tint+'">'+(d.img ? '' : ic("upload"))+'</span><span class="dzt"><b>'+(d.img ? "Replace photo" : "Upload product photo")+'</b><small>PNG with a transparent background floats best on the website. Large photos are resized to 1000px.</small><span class="btn2">'+ic("upload")+'Choose file</span></span><input class="sr" type="file" accept="image/*" data-pimg></label>' + galBlock(d))
    + sec("Video · YouTube / Facebook", "play", '<div class="vrow2"><label class="fld" style="flex:1">Video link<input type="text" data-pd="video" value="'+esc(/^idb:/.test(d.video || "") ? "" : (d.video || ""))+'" placeholder="YouTube, Facebook or .mp4 link" inputmode="url"></label><label class="up-btn">'+ic("upload")+'Upload video<input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" data-pvid></label></div><div id="pVid">'+vidPreview(d.video)+'</div>')
    + sec("Basic details", "list", '<div class="two">' + f("Name (English) *", "en", "", "", "e.g. Classic Black Abaya") + f("নাম (বাংলা) *", "bn", "", "", "যেমন: ক্লাসিক কালো আবায়া") + '</div><div class="two">' + f("SKU *", "sku") + '<label class="fld">Category<select data-pd="cat">'+CATS.map(function(c){ return '<option value="'+c.id+'"'+(d.cat === c.id ? ' selected' : '')+'>'+esc(c.en)+'</option>'; }).join("")+'</select></label></div>')
    + sec("Price", "tag", '<div class="three">' + f("Regular price (৳) *", "price", "number", ' min="1" step="1"', "e.g. 3200") + f("Sale price (৳)", "sale", "number", ' min="0" step="1"', "Optional") + f("Cost price (৳)", "cost", "number", ' min="0" step="1"', "Admin only") + '</div>')
    + sec("Description", "edit", '<label class="fld">English<textarea data-pd="den" placeholder="Fabric, fit and details">'+esc(d.den)+'</textarea></label><label class="fld">বাংলা<textarea data-pd="dbn" placeholder="কাপড়, মাপ ও বিস্তারিত">'+esc(d.dbn)+'</textarea></label>')
    + sec("Visibility", "eye", '<label class="fld">Status<select data-pd="status">'+Object.keys(PST).map(function(k){ return '<option value="'+k+'"'+(d.status === k ? ' selected' : '')+'>'+PST[k].l+(k === "active" ? " · shown on website" : k === "draft" ? " · hidden" : " · hidden, kept for records")+'</option>'; }).join("")+'</select></label>'
      + '<div class="flags2"><label class="sw2"><input type="checkbox" data-pd="isNew"'+(d.isNew ? ' checked' : '')+'><i></i>Show in New Arrivals</label><label class="sw2"><input type="checkbox" data-pd="top"'+(d.top ? ' checked' : '')+'><i></i>Show in Top Selling</label></div>')
    + sec("Sizes & colours", "layers", '<div id="pSO">'+sizeColorUI(d)+'</div>')
    + sec("Stock per variant", "box", '<div id="pVar">'+variantRows(d)+'</div>')
    + sec("Share on Facebook", "share", shareBlock(d));
  var foot = '<span class="adf-note">'+ic("info")+'Fields marked * are required</span>' + (isNew ? '' : '<button class="btn b-out sm" data-a="parchive">'+(d.status === "archived" ? "Restore as draft" : "Archive")+'</button><button class="btn b-out sm" data-a="pview">'+ic("eye")+'View on website</button><button class="btn b-out sm pdel" data-a="pdelete">'+ic("trash")+'Delete</button>') + '<button class="btn b-em sm push" data-a="psave">'+ic("check")+(isNew ? "Create product" : "Save changes")+'</button>';
  aOpenDrawer(isNew ? "Add product" : "Edit · " + d.en, body, foot, true);
}
function saveProduct(){
  var d = A.draft, er = [];
  d.en = String(d.en).trim(); d.bn = String(d.bn).trim(); d.sku = String(d.sku).trim().toUpperCase();
  d.price = Math.round(+d.price || 0); d.sale = Math.round(+d.sale || 0); d.cost = Math.round(+d.cost || 0);
  if(!d.en) er.push("English name is required."); if(!d.bn) er.push("বাংলা নাম দিন।");
  if(!/^[A-Z0-9-]{3,30}$/.test(d.sku)) er.push("SKU must be 3–30 letters, numbers or dashes.");
  if(P.some(function(p){ return p.sku === d.sku && p.id !== d.id; })) er.push("Another product already uses this SKU.");
  if(d.price < 1) er.push("Regular price must be at least ৳1.");
  if(d.sale && d.sale >= d.price) er.push("Sale price must be lower than the regular price.");
  if(!d.sizes.length || !d.colors.length) er.push("Add at least one size and one colour.");
  var skus = {}; d.variants.forEach(function(v){ v.stock = Math.max(0, Math.floor(+v.stock || 0)); v.sku = String(v.sku).trim().toUpperCase(); if(!v.sku) er.push("Every variant needs a SKU."); if(skus[v.sku]) er.push("Variant SKU " + v.sku + " is used twice."); skus[v.sku] = 1; });
  if(er.length){ var b = $("#pErr"); b.hidden = false; b.innerHTML = ic("info") + '<ul>' + er.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("") + '</ul>'; $("#adB").scrollTop = 0; return; }
  if(!d.sale) delete d.sale;
  d.video = String(d.video || "").trim(); if(d.video && !parseVideo(d.video)){ var eb2 = $("#pErr"); eb2.hidden = false; eb2.innerHTML = ic("info") + '<ul><li>The video link must be a YouTube or Facebook video link.</li></ul>'; $("#adB").scrollTop = 0; return; }
  if(!d.img) d.img = (CAT[d.cat] || {}).img || "b1";
  var now = Date.now();
  if(!d.id){ d.id = "p" + now.toString(36); d.tint = (CAT[d.cat] || {}).tint || "#EFE6D6"; P.push(d); d.variants.forEach(function(v){ if(v.stock) DB.moves.unshift({at:now, pid:d.id, sku:v.sku, d:v.stock, why:"Opening stock"}); }); logA("Product created", d.en + " (" + d.sku + ")"); }
  else {
    var old = BY[d.id], idx = P.indexOf(old);
    d.variants.forEach(function(v){ var ov = (old.variants || []).filter(function(x){ return x.size === v.size && x.color === v.color; })[0]; var diff = v.stock - (ov ? ov.stock : 0); if(diff) DB.moves.unshift({at:now, pid:d.id, sku:v.sku, d:diff, why:"Edited in product form"}); });
    P[idx] = d; logA("Product updated", d.en + " (" + d.sku + ")");
  }
  reindex(); aCloseDrawer(); aSaved("Product saved", d.en); aRender();
}

// ---------- inventory ----------
function invRows(){
  var q = A.iQ.trim().toLowerCase(), rows = [];
  P.forEach(function(p){ if(p.status === "archived") return; p.variants.forEach(function(v, i){ if((!q || (p.en + " " + v.sku).toLowerCase().indexOf(q) > -1) && (!A.iLow || v.stock <= DB.settings.lowStock)) rows.push({p:p, v:v, i:i}); }); });
  if(!rows.length) return '<p class="empty2">Nothing matches.</p>';
  return '<div class="tw"><table class="tb"><thead><tr><th>Product</th><th>SKU</th><th>Size</th><th>Colour</th><th class="r">Stock</th><th>Adjust</th></tr></thead><tbody>'
    + rows.map(function(r){ var s = r.v.stock; return '<tr><td><b>'+esc(r.p.en)+'</b>'+(r.p.status === "draft" ? ' '+pill(PST, "draft") : '')+'</td><td class="mono mut">'+esc(r.v.sku)+'</td><td>'+esc(r.v.size)+'</td><td><i class="sw3" style="background:'+r.v.color+'"></i></td>'
      + '<td class="r"><b class="'+(s === 0 ? 'oo' : s <= DB.settings.lowStock ? 'lw' : '')+'">'+s+'</b></td><td><span class="adj"><button class="mini" data-a="inv" data-pid="'+r.p.id+'" data-vi="'+r.i+'" data-d="-1" aria-label="Remove one">−</button><input class="ti num" type="number" min="0" data-invset="'+r.p.id+'|'+r.i+'" value="'+s+'" aria-label="Set stock"><button class="mini" data-a="inv" data-pid="'+r.p.id+'" data-vi="'+r.i+'" data-d="1" aria-label="Add one">+</button></span></td></tr>'; }).join("")
    + '</tbody></table></div>';
}
function pgInventory(){
  var tv = 0, low = 0, out = 0; P.forEach(function(p){ if(p.status === "archived") return; p.variants.forEach(function(v){ tv++; if(v.stock === 0) out++; else if(v.stock <= DB.settings.lowStock) low++; }); });
  return '<div class="kpis k3"><div class="kpi"><span class="ki">'+ic("box")+'</span><span class="kl">Variants</span><b>'+tv+'</b><small>sizes × colours</small></div><div class="kpi warn"><span class="ki">'+ic("bell")+'</span><span class="kl">Low stock</span><b>'+low+'</b><small>'+DB.settings.lowStock+' pieces or fewer</small></div><div class="kpi bad"><span class="ki">'+ic("info")+'</span><span class="kl">Out of stock</span><b>'+out+'</b><small>cannot be bought</small></div></div>'
    + '<div class="bar"><label class="srch">'+ic("search")+'<span class="sr">Search stock</span><input data-aq="iQ" placeholder="Search product or SKU" value="'+esc(A.iQ)+'"></label><label class="sw2"><input type="checkbox" data-a="ilow"'+(A.iLow ? ' checked' : '')+'><i></i>Low & out of stock only</label></div>'
    + '<section class="card2 flush" id="aIT">' + invRows() + '</section>'
    + '<section class="card2"><div class="ch"><h3>Stock movements</h3><span>Latest 25 · every change is recorded</span></div>' + (DB.moves.length ? '<div class="tw"><table class="tb sm"><thead><tr><th>When</th><th>SKU</th><th class="r">Change</th><th>Reason</th></tr></thead><tbody>' + DB.moves.slice(0, 25).map(function(m){ return '<tr><td class="mut">'+fdt(m.at)+'</td><td class="mono">'+esc(m.sku)+'</td><td class="r"><b class="'+(m.d < 0 ? 'oo' : 'ok2')+'">'+(m.d > 0 ? "+" : "")+m.d+'</b></td><td>'+esc(m.why)+'</td></tr>'; }).join("") + '</tbody></table></div>' : '<p class="empty2">No movements yet. Orders, edits and adjustments will show here.</p>') + '</section>';
}
function setStock(pid, vi, val, why){
  var p = BY[pid], v = p.variants[vi]; val = Math.max(0, Math.floor(+val || 0)); var d = val - v.stock; if(!d) return;
  v.stock = val; DB.moves.unshift({at:Date.now(), pid:pid, sku:v.sku, d:d, why:why || "Manual adjustment"});
  if(val <= DB.settings.lowStock && DB.settings.notif.stock && d < 0) notify("stock", (val ? "Low stock: " : "Out of stock: ") + p.en, v.sku + " · " + val + " left", pid);
  logA("Stock adjusted", v.sku + ": " + (d > 0 ? "+" : "") + d + " → " + val);
  saveDB();
}

// ---------- categories ----------
function pgCategories(){
  return '<div class="cgrid2">' + CATS.map(function(c, i){ var n = P.filter(function(p){ return p.cat === c.id && p.status === "active"; }).length;
    return '<section class="card2 catc" data-tilt="6"><span class="th big" style="--tint:'+c.tint+'"><img src="'+I(c.img)+'" alt=""></span><div class="catf"><label class="fld">Name (English)<input type="text" data-cat-f="en" data-ci="'+i+'" value="'+esc(c.en)+'"></label><label class="fld">নাম (বাংলা)<input type="text" data-cat-f="bn" data-ci="'+i+'" value="'+esc(c.bn)+'"></label>'
      + '<label class="fld">Tile colour<input type="color" data-cat-f="tint" data-ci="'+i+'" value="'+c.tint+'"></label><p class="mut sm2">'+n+' active products · link: <span class="mono">/'+c.id+'</span></p><label class="up-btn">'+ic("upload")+'Change image<input type="file" accept="image/*" data-catimg="'+i+'"></label></div></section>'; }).join("") + '</div>';
}

// ---------- customers ----------
function customers(){
  var m = {};
  DB.orders.forEach(function(o){ var k = o.customer.phone; var c = m[k] = m[k] || {name:o.customer.name, phone:k, district:o.customer.district, n:0, spent:0, last:0, demo:true, refs:[]}; c.n++; c.refs.push(o.ref); if(o.status !== "cancelled" && o.status !== "returned") c.spent += o.total; if(o.at > c.last){ c.last = o.at; c.name = o.customer.name; } if(!o.demo) c.demo = false; });
  return Object.keys(m).map(function(k){ return m[k]; }).sort(function(a, b){ return b.last - a.last; });
}
function custTable(){
  var q = A.cQ.trim().toLowerCase(), list = customers().filter(function(c){ return !q || (c.name + " " + c.phone + " " + c.district).toLowerCase().indexOf(q) > -1; });
  if(!list.length) return '<p class="empty2">No customers yet. They appear here after their first order.</p>';
  return '<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>District</th><th class="r">Orders</th><th class="r">Spent</th><th>Last order</th></tr></thead><tbody>'
    + list.map(function(c){ return '<tr class="rw" data-acu="'+esc(c.phone)+'" tabindex="0"><td><b>'+esc(c.name)+'</b>'+(c.demo ? demoTag : '')+(c.n > 1 ? '<span class="src">Returning</span>' : '')+'<small>'+esc(c.phone)+'</small></td><td>'+esc(c.district)+'</td><td class="r">'+c.n+'</td><td class="r"><b>'+amt(c.spent)+'</b></td><td class="mut">'+fdt(c.last)+'</td></tr>'; }).join("") + '</tbody></table></div>';
}
function pgCustomers(){
  var cs = customers();
  return '<div class="kpis k3"><div class="kpi"><span class="ki">'+ic("users")+'</span><span class="kl">Customers</span><b>'+cs.length+'</b><small>unique phone numbers</small></div><div class="kpi good"><span class="ki">'+ic("heart")+'</span><span class="kl">Returning</span><b>'+cs.filter(function(c){ return c.n > 1; }).length+'</b><small>ordered more than once</small></div><div class="kpi"><span class="ki">'+ic("cash")+'</span><span class="kl">Average spend</span><b>'+amt(cs.length ? Math.round(sum(cs, function(c){ return c.spent; }) / cs.length) : 0)+'</b><small>per customer</small></div></div>'
    + '<div class="bar"><label class="srch">'+ic("search")+'<span class="sr">Search customers</span><input data-aq="cQ" placeholder="Search name, phone or district" value="'+esc(A.cQ)+'"></label></div><section class="card2 flush" id="aCT">' + custTable() + '</section>';
}

// ---------- coupons ----------
function pgCoupons(){
  return '<div class="bar"><span class="hint2">'+ic("info")+'Codes are checked again at checkout: active, not expired, under the use limit and above the minimum order.</span><button class="btn b-em sm push" data-acp="new">'+ic("plus")+'New coupon</button></div>'
    + '<section class="card2 flush">' + (DB.coupons.length ? '<div class="tw"><table class="tb"><thead><tr><th>Code</th><th>Discount</th><th class="r">Min. order</th><th class="r">Used</th><th>Expires</th><th>Active</th><th></th></tr></thead><tbody>'
    + DB.coupons.map(function(c, i){ var exp = c.expires && Date.now() > c.expires; return '<tr><td><b class="mono">'+esc(c.code)+'</b>'+(exp ? ' <span class="pl" style="color:#B91C1C;background:#FEE2E2"><i style="background:#B91C1C"></i>Expired</span>' : '')+'</td><td>'+(c.type === "percent" ? c.value + "%" : amt(c.value))+'</td><td class="r">'+amt(c.min)+'</td><td class="r">'+c.uses+(c.maxUses ? " / " + c.maxUses : "")+'</td><td class="mut">'+(c.expires ? fday(c.expires) : "Never")+'</td><td><label class="sw2 xs"><input type="checkbox" data-cpon="'+i+'"'+(c.active ? ' checked' : '')+'><i></i><span class="sr">Active</span></label></td><td><button class="mini" data-acp="'+i+'" aria-label="Edit">'+ic("edit")+'</button></td></tr>'; }).join("")
    + '</tbody></table></div>' : '<p class="empty2">No coupons yet.</p>') + '</section>';
}
function aCoupon(i){
  var isNew = i === "new", c = isNew ? {code:"", type:"percent", value:10, min:0, maxUses:100, uses:0, expires:Date.now() + 30 * 864e5, active:true} : clone(DB.coupons[+i]);
  A.draft = c; A.draft._i = isNew ? -1 : +i;
  var ex = c.expires ? new Date(c.expires + 6 * 36e5).toISOString().slice(0, 10) : "";
  var body = '<div class="err" id="cErr" hidden></div><label class="fld">Code (letters & numbers)<input type="text" data-cd="code" value="'+esc(c.code)+'" placeholder="EID200" autocapitalize="characters"></label>'
    + '<div class="two"><label class="fld">Type<select data-cd="type"><option value="percent"'+(c.type === "percent" ? ' selected' : '')+'>Percent off</option><option value="fixed"'+(c.type === "fixed" ? ' selected' : '')+'>Fixed amount (৳)</option></select></label><label class="fld">Value<input type="number" min="1" data-cd="value" value="'+c.value+'"></label></div>'
    + '<div class="two"><label class="fld">Minimum order (৳)<input type="number" min="0" data-cd="min" value="'+c.min+'"></label><label class="fld">Maximum uses (0 = no limit)<input type="number" min="0" data-cd="maxUses" value="'+c.maxUses+'"></label></div>'
    + '<div class="two"><label class="fld">Expires on (Dhaka time)<input type="date" data-cd="expires" value="'+ex+'"></label><div class="fld">Status<label class="sw2"><input type="checkbox" data-cd="active"'+(c.active ? ' checked' : '')+'><i></i>Active</label></div></div>'
    + (isNew ? '' : '<p class="mut sm2">Used '+c.uses+' times so far.</p>');
  aOpenDrawer(isNew ? "New coupon" : "Edit coupon " + c.code, body, (isNew ? '' : '<button class="btn b-out sm" data-a="cpdel">Delete</button>') + '<button class="btn b-em sm push" data-a="cpsave">Save coupon</button>');
}

// ---------- reviews ----------
function pgReviews(){
  return '<section class="card2"><div class="ch"><h3>Review settings</h3></div><label class="sw2"><input type="checkbox" data-set="reviewsApprove"'+(DB.settings.reviewsApprove ? ' checked' : '')+'><i></i>Approve each review before it appears on the website</label><label class="sw2"><input type="checkbox" data-set="notif.review"'+(DB.settings.notif.review ? ' checked' : '')+'><i></i>Notify me about new reviews</label></section>'
    + '<section class="card2"><div class="empty3">'+ic("star")+'<h3>No reviews yet</h3><p>When customers write a review on a product page, it lands here for you to approve, hide or reply to. The website never shows made-up reviews.</p></div></section>';
}

// ---------- settings ----------
function pgSettings(){
  var S = DB.settings, St = S.store, Py = S.pay, D = cfg.delivery;
  var inp = function(lbl, path, val, type, ph){ return '<label class="fld">'+esc(lbl)+'<input type="'+(type || "text")+'" data-set="'+path+'" value="'+esc(val)+'"'+(ph ? ' placeholder="'+esc(ph)+'"' : '')+'></label>'; };
  return '<div class="g2">'
    + '<section class="card2"><div class="ch"><h3>'+ic("store")+'Store contact</h3><span>Shown in the footer and used for WhatsApp orders</span></div>'
    + '<div class="two">' + inp("Phone", "store.phone", St.phone, "tel", "01XXXXXXXXX") + inp("WhatsApp number", "store.whatsapp", St.whatsapp, "tel", "01XXXXXXXXX") + '</div>'
    + inp("Email", "store.email", St.email, "email", "hello@yourshop.com") + inp("Website address (used in product links)", "store.domain", St.domain, "text", "www.sitraya.com") + '<div class="two">' + inp("Address (English)", "store.addr.en", St.addr.en) + inp("ঠিকানা (বাংলা)", "store.addr.bn", St.addr.bn) + '</div></section>'
    + '<section class="card2"><div class="ch"><h3>'+ic("share")+'Social links</h3><span>Footer icons. Leave empty to hide an icon</span></div>'
    + '<div class="two">' + inp("Facebook page", "store.social.fb", (St.social || {}).fb || "", "text", "https://facebook.com/yourpage") + inp("Instagram", "store.social.ig", (St.social || {}).ig || "", "text", "https://instagram.com/yourshop") + '</div>'
    + '<div class="two">' + inp("YouTube", "store.social.yt", (St.social || {}).yt || "", "text", "https://youtube.com/@yourshop") + inp("TikTok", "store.social.tt", (St.social || {}).tt || "", "text", "https://tiktok.com/@yourshop") + '</div>'
    + '<div class="two">' + inp("About the shop (English, footer)", "store.about.en", (St.about || {}).en || "", "text") + inp("দোকান সম্পর্কে (বাংলা, ফুটার)", "store.about.bn", (St.about || {}).bn || "", "text") + '</div></section>'
    + '<section class="card2"><div class="ch"><h3>'+ic("truck")+'Delivery charges</h3><span>The website and checkout use these exact numbers</span></div>'
    + '<div class="three"><label class="fld">Inside Dhaka (৳)<input type="number" min="0" data-setc="delivery.inside" value="'+D.inside+'"></label><label class="fld">Outside Dhaka (৳)<input type="number" min="0" data-setc="delivery.outside" value="'+D.outside+'"></label><label class="fld">Free inside Dhaka from (৳)<input type="number" min="0" data-setc="delivery.free" value="'+D.free+'"></label></div>'
    + '<p class="mut sm2">Free delivery applies when the subtotal is equal to or above this amount, inside Dhaka only.</p></section>'
    + '<section class="card2"><div class="ch"><h3>'+ic("card")+'Payment methods</h3><span>Only switch on what you can actually receive</span></div>'
    + '<label class="sw2"><input type="checkbox" data-set="pay.cod.on"'+(Py.cod.on ? ' checked' : '')+'><i></i>Cash on Delivery</label>'
    + ["bkash","nagad","rocket"].map(function(k){ return '<div class="payrow"><label class="sw2"><input type="checkbox" data-set="pay.'+k+'.on"'+(Py[k].on ? ' checked' : '')+'><i></i>'+k.charAt(0).toUpperCase() + k.slice(1)+' (send money, manual check)</label><input type="tel" data-set="pay.'+k+'.num" value="'+esc(Py[k].num)+'" placeholder="Merchant / personal number" aria-label="'+k+' number"></div>'; }).join("")
    + '<div class="payrow off"><label class="sw2"><input type="checkbox" disabled><i></i>Online gateway (SSLCommerz / bKash API)</label><span class="pl" style="color:#475569;background:#E2E8F0"><i style="background:#475569"></i>Needs merchant account</span></div>'
    + '<p class="mut sm2">bKash, Nagad and Rocket orders arrive as “Verify payment”. Match the TrxID in your app, then mark the order paid.</p></section>'
    + '<section class="card2"><div class="ch"><h3>'+ic("box")+'Stock alerts</h3></div><label class="fld">Warn me when a variant has this many or fewer<input type="number" min="0" max="50" data-set="lowStock" data-num="1" value="'+S.lowStock+'"></label>'
    + '<div class="ch" style="margin-top:14px"><h3>'+ic("info")+'Demo data</h3></div><p class="mut sm2">Start again with fresh demo products and orders. This clears your test changes in this browser.</p><button class="btn b-out sm" data-a="resetall" data-confirm="0">Reset all demo data</button></section>'
    + '</div>';
}

// ---------- notifications ----------
var NT = {order:"New orders", stock:"Stock alerts", cancel:"Cancellations", review:"Reviews", system:"System"};
function pgNotifications(){
  var S = DB.settings.notif, list = DB.notifs.filter(function(n){ return A.nType === "all" || n.type === A.nType; });
  var unread = DB.notifs.filter(function(n){ return !n.read; }).length;
  return '<div class="g2 n2"><section class="card2 flush"><div class="ch pad"><div class="chips">' + ["all"].concat(Object.keys(NT)).map(function(k){ return '<button class="chip" data-ntype="'+k+'" aria-pressed="'+(A.nType === k)+'">'+(k === "all" ? "All" : NT[k])+'</button>'; }).join("") + '</div>'
    + (unread ? '<button class="lk" data-a="readall">Mark all as read ('+unread+')</button>' : '') + '</div>'
    + (list.length ? '<ul class="nl2">' + list.slice(0, 60).map(function(n){ return '<li class="'+(n.read ? '' : 'unread')+'"><button data-an="'+n.id+'"><span class="ni2 '+n.type+'">'+ic(n.type === "order" ? "bag" : n.type === "stock" ? "box" : n.type === "cancel" ? "x" : n.type === "review" ? "star" : "info")+'</span><span><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></span><time>'+fdt(n.at)+'</time></button></li>'; }).join("") + '</ul>' : '<p class="empty2">Nothing here yet.</p>') + '</section>'
    + '<section class="card2"><div class="ch"><h3>What should notify you</h3></div>' + Object.keys(NT).filter(function(k){ return k !== "system"; }).map(function(k){ return '<label class="sw2"><input type="checkbox" data-set="notif.'+k+'"'+(S[k] ? ' checked' : '')+'><i></i>'+NT[k]+'</label>'; }).join("")
    + '<div class="ch" style="margin-top:16px"><h3>Where to send them</h3></div>'
    + '<div class="chan on"><span>'+ic("bell")+'<b>In this admin panel</b><small>Bell icon and this page</small></span><span class="pl" style="color:#15803D;background:#DCFCE7"><i style="background:#15803D"></i>Working</span></div>'
    + '<div class="chan"><span>'+ic("info")+'<b>Phone & laptop push</b><small>Needs the live HTTPS website, then you allow notifications on each device</small></span><span class="pl" style="color:#475569;background:#E2E8F0"><i style="background:#475569"></i>After launch</span></div>'
    + '<div class="chan"><span>'+ic("mail")+'<b>Email</b><small>Needs an email sending service</small></span><span class="pl" style="color:#475569;background:#E2E8F0"><i style="background:#475569"></i>Not set up</span></div>'
    + '<div class="chan"><span>'+ic("wa")+'<b>WhatsApp / SMS</b><small>Needs the WhatsApp Business Platform or an SMS provider (paid per message)</small></span><span class="pl" style="color:#475569;background:#E2E8F0"><i style="background:#475569"></i>Not set up</span></div></section></div>';
}

// ---------- Meta ----------
function pgMeta(){
  var M = DB.settings.meta, ev = M.events;
  var ok = /^\d{15,16}$/.test(M.pixel);
  return '<div class="g2"><section class="card2"><div class="ch"><h3>'+ic("meta")+'Connection</h3>'+(ok && M.pixelOn ? '<span class="pl" style="color:#8A4B08;background:#FEF0C7"><i style="background:#8A4B08"></i>Saved · waiting for live website</span>' : '<span class="pl" style="color:#475569;background:#E2E8F0"><i style="background:#475569"></i>Not connected</span>')+'</div>'
    + '<label class="fld">Pixel / Dataset ID<input type="text" inputmode="numeric" data-set="meta.pixel" value="'+esc(M.pixel)+'" placeholder="15 or 16 digits from Events Manager"></label>'
    + (M.pixel && !ok ? '<p class="bad2">A Pixel ID is 15 or 16 digits.</p>' : '')
    + '<label class="sw2"><input type="checkbox" data-set="meta.pixelOn"'+(M.pixelOn ? ' checked' : '')+'><i></i>Send browser events (Meta Pixel)</label>'
    + '<label class="fld">Conversions API access token<input type="password" data-set="meta.token" value="'+esc(M.token)+'" placeholder="Paste from Events Manager → Settings" autocomplete="off"></label>'
    + '<p class="mut sm2">'+ic("lock")+'In the real website this token is stored encrypted on the server and never sent to a browser. Here it only stays in your own browser for the demo.</p>'
    + '<label class="sw2"><input type="checkbox" data-set="meta.capiOn"'+(M.capiOn ? ' checked' : '')+'><i></i>Send server events (Conversions API) with event IDs, so Meta does not count a purchase twice</label>'
    + '<div class="two"><label class="fld">Test event code<input type="text" data-set="meta.test" value="'+esc(M.test)+'" placeholder="TEST12345"></label><div class="fld">Mode<label class="sw2"><input type="checkbox" data-set="meta.testMode"'+(M.testMode ? ' checked' : '')+'><i></i>Test mode</label></div></div></section>'
    + '<section class="card2"><div class="ch"><h3>Events to send</h3><span>Each one carries product IDs that match the catalogue</span></div>'
    + Object.keys(ev).map(function(k){ return '<label class="sw2"><input type="checkbox" data-set="meta.events.'+k+'"'+(ev[k] ? ' checked' : '')+'><i></i><span class="mono">'+k+'</span></label>'; }).join("")
    + '<div class="ch" style="margin-top:16px"><h3>Product catalogue feed</h3></div><div class="feed"><span class="mono">https://[your-domain]/feeds/meta-catalog.xml</span></div><p class="mut sm2">'+PL().length+' active products would be in the feed, with the same IDs used in the events above.</p></section>'
    + '<section class="card2 span2"><div class="ch"><h3>Set-up steps in Meta Business</h3><span>You do these once in your own Meta account</span></div><ol class="steps2">'
    + ["Create or open your Meta Business portfolio and add your Facebook Page and Instagram professional account.","In Events Manager, create a Dataset (Pixel) and copy its ID into the box above.","Generate a Conversions API access token in the same place and paste it above.","Verify your website domain in Business settings → Brand safety → Domains.","Create a Catalogue in Commerce Manager and add the feed URL above as a scheduled data source.","Use the test event code to check events arrive, then switch off test mode."].map(function(s){ return '<li>'+esc(s)+'</li>'; }).join("")
    + '</ol><p class="mut sm2">Meta shows visits, add-to-carts and purchases it can match, mostly for ads. It does not show every visitor or your order database. Your full sales numbers are on the Dashboard.</p></section></div>';
}

// ---------- users ----------
var ROLES = ["Super Admin","Administrator","Order Manager","Product Manager","Inventory Manager","Content Manager","Read-only Analyst"];
var PERM = [["Orders",[1,1,1,0,0,0,"view"]],["Products",[1,1,0,1,"view",0,"view"]],["Inventory",[1,1,"view",1,1,0,"view"]],["Homepage & branding",[1,1,0,0,0,1,0]],["Coupons",[1,1,0,1,0,0,"view"]],["Settings & payments",[1,1,0,0,0,0,0]],["Admin users",[1,0,0,0,0,0,0]],["Dashboard",[1,1,1,1,1,1,1]]];
var RMETA = {
  "Super Admin":{d:"Everything, including the team, payments and settings", ic:"shield", g:"linear-gradient(135deg,#C9A35A,#8E6C2E)"},
  "Administrator":{d:"Runs the shop day to day", ic:"store", g:"linear-gradient(135deg,#1F6B5A,#0B2E28)"},
  "Order Manager":{d:"Confirms, packs and ships orders", ic:"bag", g:"linear-gradient(135deg,#2563EB,#1E3A8A)"},
  "Product Manager":{d:"Adds products, prices and coupons", ic:"layers", g:"linear-gradient(135deg,#9333EA,#581C87)"},
  "Inventory Manager":{d:"Keeps every stock count right", ic:"box", g:"linear-gradient(135deg,#D97706,#92400E)"},
  "Content Manager":{d:"Edits homepage, banners and branding", ic:"edit", g:"linear-gradient(135deg,#DB2777,#831843)"},
  "Read-only Analyst":{d:"Sees the numbers, changes nothing", ic:"chart", g:"linear-gradient(135deg,#64748B,#334155)"}
};
function pgUsers(){
  var h = '<section class="card2"><div class="ch"><h3>'+ic("users")+'Your team</h3><button class="btn b-em sm" data-a="uadd">'+ic("plus")+'Add admin</button></div><div class="ugrid">'
    + DB.admins.map(function(u, i){ var m = RMETA[u.role] || RMETA["Read-only Analyst"];
      return '<article class="ucard'+(u.active ? '' : ' off')+'" data-tilt="7"><span class="ush" style="background:'+m.g+'"></span>'
        + '<span class="uav" style="background:'+m.g+'">'+esc(u.name.charAt(0).toUpperCase())+(i === 0 ? '<i class="crown">'+ic("star")+'</i>' : '')+'</span>'
        + '<b class="un">'+esc(u.name)+'</b><span class="ue">'+esc(u.email)+'</span>'
        + '<span class="urole" style="background:'+m.g+'">'+ic(m.ic)+esc(u.role)+'</span>'
        + '<span class="ust '+(u.active ? 'on' : '')+'"><i></i>'+(u.active ? 'Active' : 'Disabled')+'</span>'
        + (i === 0 ? '<span class="uown">Owner · cannot be changed</span>' : '<div class="uact"><label class="sr" for="ur'+i+'">Role</label><select id="ur'+i+'" data-urole="'+i+'">'+ROLES.slice(1).map(function(r){ return '<option'+(u.role === r ? ' selected' : '')+'>'+r+'</option>'; }).join("")+'</select><button class="btn2" data-a="utoggle" data-i="'+i+'">'+(u.active ? "Disable" : "Enable")+'</button></div>')
        + '</article>'; }).join("") + '</div></section>';
  h += '<section class="card2"><div class="ch"><h3>'+ic("shield")+'What each role can do</h3><span>Checked on the server in the real panel, not just hidden in the menu</span></div><div class="rgrid">'
    + ROLES.map(function(r, ri){ var m = RMETA[r], n = DB.admins.filter(function(u){ return u.role === r; }).length;
      var full = PERM.filter(function(x){ return x[1][ri] === 1; }), view = PERM.filter(function(x){ return x[1][ri] === "view"; }), none = PERM.filter(function(x){ return !x[1][ri]; });
      return '<article class="rcard" data-tilt="9" style="--rg:'+m.g+'"><div class="rtop"><span class="rico">'+ic(m.ic)+'</span><span class="rcnt">'+n+' '+(n === 1 ? 'person' : 'people')+'</span></div>'
        + '<h4>'+esc(r)+'</h4><p>'+esc(m.d)+'</p>'
        + (full.length ? '<div class="rlist"><span class="rl">Can change</span>'+full.map(function(x){ return '<span class="rp full">'+ic("check")+esc(x[0])+'</span>'; }).join("")+'</div>' : '')
        + (view.length ? '<div class="rlist"><span class="rl">Can view</span>'+view.map(function(x){ return '<span class="rp view">'+ic("eye")+esc(x[0])+'</span>'; }).join("")+'</div>' : '')
        + (none.length ? '<p class="rno">No access: '+none.map(function(x){ return esc(x[0]); }).join(", ")+'</p>' : '<p class="rno all">Full access to every area</p>')
        + '</article>'; }).join("") + '</div></section>';
  return h;
}
function pgLog(){
  var q = A.lQ.trim().toLowerCase(), list = DB.log.filter(function(l){ return !q || (l.action + " " + l.detail + " " + l.who).toLowerCase().indexOf(q) > -1; });
  return '<div class="bar"><label class="srch">'+ic("search")+'<span class="sr">Search log</span><input data-aq="lQ" placeholder="Search actions" value="'+esc(A.lQ)+'"></label><span class="hint2">'+DB.log.length+' entries · passwords and tokens are never written here</span></div>'
    + '<section class="card2 flush" id="aLT"><div class="tw"><table class="tb"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead><tbody>'
    + list.slice(0, 150).map(function(l){ return '<tr><td class="mut">'+fdt(l.at)+'</td><td><b>'+esc(l.who)+'</b></td><td>'+esc(l.action)+'</td><td class="mut">'+esc(l.detail)+'</td></tr>'; }).join("") + '</tbody></table></div></section>';
}
var PAGEFN = {dashboard:pgDashboard, orders:pgOrders, products:pgProducts, inventory:pgInventory, categories:pgCategories, customers:pgCustomers, coupons:pgCoupons, reviews:pgReviews, settings:pgSettings, notifications:pgNotifications, meta:pgMeta, users:pgUsers, log:pgLog};

// ---------- admin events ----------
function setDeep(obj, path, val){ var ks = path.split("."), o = obj; for(var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }
var sTimer;
function liveSave(label){ clearTimeout(sTimer); sTimer = setTimeout(function(){ saveDB(); logA("Settings changed", label); toast("Saved", label); }, 600); }
$("#admin").addEventListener("click", function(e){
  var b;
  if(e.target.closest('a[href="#top"]')){ e.preventDefault(); goAdmin(false); return; }
  if((b = e.target.closest("[data-ap]"))){ aGo(b.dataset.ap); return; }
  if(e.target.closest("[data-adclose]") || e.target === $("#aScrim")){ aCloseDrawer(); $("#aSide").classList.remove("on"); return; }
  if(e.target.closest("#aBurger")){ $("#aSide").classList.add("on"); $("#aScrim").classList.add("on"); return; }
  if(e.target.closest("#aBell")){ aGo("notifications"); return; }
  if(e.target.closest("#aLogout")){ A.logged = false; store.set("st_admin_s", 0); logA("Signed out", ""); saveDB(); showView(true); return; }
  if((b = e.target.closest("[data-range]"))){ A.range = b.dataset.range; aRender(); return; }
  if((b = e.target.closest("[data-gostatus]"))){ A.oStatus = b.dataset.gostatus; aGo("orders"); return; }
  if((b = e.target.closest("[data-ostatus]"))){ A.oStatus = b.dataset.ostatus; aRender(); return; }
  if((b = e.target.closest("[data-ao]"))){ aOrder(b.dataset.ao); return; }
  if((b = e.target.closest("[data-acu]"))){ var ph = b.dataset.acu, os = DB.orders.filter(function(o){ return o.customer.phone === ph; }); aOpenDrawer(os[0].customer.name, '<p class="mut">'+esc(ph)+' · '+os.length+' orders</p>' + orderTable(os, true)); return; }
  if((b = e.target.closest("[data-ape]"))){ aProduct(b.dataset.ape); return; }
  if((b = e.target.closest("[data-acp]"))){ aCoupon(b.dataset.acp); return; }
  if((b = e.target.closest("[data-ntype]"))){ A.nType = b.dataset.ntype; aRender(); return; }
  if((b = e.target.closest("[data-an]"))){ var n = DB.notifs.filter(function(x){ return x.id === b.dataset.an; })[0]; if(n){ n.read = true; saveDB(); if(n.type === "order" || n.type === "cancel"){ aGo("orders"); aOrder(n.ref); } else if(n.type === "stock"){ A.iLow = true; aGo("inventory"); } else aRender(); } return; }
  if((b = e.target.closest("[data-a]"))) aAction(b.dataset.a, b, e);
});
function aAction(a, b, e){
  var d = A.draft;
  if(a === "ostatus"){ var o = DB.orders.filter(function(x){ return x.ref === b.dataset.ref; })[0]; setStatus(o, $("#oNext").value, $("#oNote").value.trim()); saveDB(); toast("Status updated", o.ref + " → " + ST[o.status].l); aOrder(o.ref); if(A.page === "orders"){ $("#aOT").innerHTML = orderTable(filteredOrders()); } aBell(); }
  else if(a === "invoice"){ var o2 = DB.orders.filter(function(x){ return x.ref === b.dataset.ref; })[0]; var txt = invoiceText(o2); try{ navigator.clipboard.writeText(txt).then(function(){ toast("Invoice copied", "Paste it into WhatsApp, email or a document"); }, function(){ showText("Invoice " + o2.ref, txt); }); }catch(x){ showText("Invoice " + o2.ref, txt); } }
  else if(a === "cleardemo"){ if(b.dataset.confirm !== "1"){ b.dataset.confirm = "1"; b.textContent = "Click again to remove " + DB.orders.filter(function(o){ return o.demo; }).length + " demo orders"; b.classList.add("danger"); return; } DB.orders = DB.orders.filter(function(o){ return !o.demo; }); DB.notifs = DB.notifs.filter(function(n){ return n.type !== "order" || DB.orders.some(function(o){ return o.ref === n.ref; }); }); logA("Demo orders removed", ""); aSaved("Demo orders removed"); aRender(); }
  else if(a === "selall"){ var on = b.checked; filteredProducts().forEach(function(p){ A.sel[p.id] = on; }); $("#aPT").innerHTML = productTable(); }
  else if(a === "clearsel"){ A.sel = {}; $("#aPT").innerHTML = productTable(); }
  else if(a === "bulk"){ var ids = Object.keys(A.sel).filter(function(k){ return A.sel[k]; }); ids.forEach(function(id){ BY[id].status = b.dataset.v; }); logA("Bulk status change", ids.length + " products → " + PST[b.dataset.v].l); A.sel = {}; aSaved(ids.length + " products updated"); $("#aPT").innerHTML = productTable(); }
  else if(a === "export"){ var ids2 = Object.keys(A.sel).filter(function(k){ return A.sel[k]; }); var rows = [["id","sku","name_en","name_bn","category","price","sale_price","status","variant_sku","size","colour","stock"]]; ids2.forEach(function(id){ var p = BY[id]; p.variants.forEach(function(v){ rows.push([p.id, p.sku, p.en, p.bn, p.cat, p.price, p.sale || "", p.status, v.sku, v.size, v.color, v.stock]); }); }); showText("Export · " + ids2.length + " products", rows.map(function(r){ return r.map(function(c){ c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n"), "Copy this CSV and paste it into Excel or Google Sheets."); }
  else if(a === "pvidrm"){ d.video = ""; var li2 = document.querySelector('[data-pd="video"]'); if(li2) li2.value = ""; $("#pVid").innerHTML = vidPreview(""); }
  else if(a === "pcadd"){ var pal = ["#1B1A18","#0F3B33","#7A2540","#C9A35A","#8DB3C2","#E9DCC4","#5A2B3E","#3B3F45"]; d.colors.push(pal.filter(function(c){ return d.colors.indexOf(c) < 0; })[0] || "#888888"); refreshSO(); }
  else if(a === "pcrm"){ d.colors.splice(+b.dataset.i, 1); refreshSO(); }
  else if(a === "psrm"){ d.sizes.splice(+b.dataset.i, 1); refreshSO(); }
  else if(a === "pspre"){ addSizes(b.dataset.v); }
  else if(a === "vstep"){ var vv = d.variants[+b.dataset.vi]; vv.stock = Math.max(0, (Math.floor(+vv.stock) || 0) + (+b.dataset.d)); var inp = b.parentNode.querySelector("input"); inp.value = vv.stock; $("#pTot").textContent = d.variants.reduce(function(x, v){ return x + Math.max(0, +v.stock || 0); }, 0); }
  else if(a === "psave"){ saveProduct(); }
  else if(a === "pdelete"){
    if(b.dataset.sure !== "1"){ b.dataset.sure = "1"; b.innerHTML = ic("trash") + "Click again to delete"; b.classList.add("sure"); setTimeout(function(){ if(b.isConnected){ b.dataset.sure = ""; b.innerHTML = ic("trash") + "Delete"; b.classList.remove("sure"); } }, 4000); return; }
    var pd = BY[d.id], ix = P.indexOf(pd); if(ix > -1) P.splice(ix, 1); reindex();
    cart = cart.filter(function(l){ return l.id !== d.id; }); saveCart();
    logA("Product deleted", pd.en + " (" + pd.sku + ")"); saveDB(); aCloseDrawer(); aSaved("Product deleted", pd.en + " · past orders keep their details"); aRender();
  }
  else if(a === "parchive"){ var p2 = BY[d.id]; p2.status = p2.status === "archived" ? "draft" : "archived"; logA(p2.status === "archived" ? "Product archived" : "Product restored", p2.en); aCloseDrawer(); aSaved(p2.status === "archived" ? "Archived" : "Restored as draft", p2.en); aRender(); }
  else if(a === "pview"){ var id = d.id; aCloseDrawer(); goAdmin(false); setTimeout(function(){ if(BY[id] && BY[id].status === "active") openPM(id); else toast("This product is not active", "Publish it to show it on the website"); }, 120); }
  else if(a === "inv"){ var p3 = BY[b.dataset.pid], vi = +b.dataset.vi; setStock(p3.id, vi, p3.variants[vi].stock + (+b.dataset.d), "Manual adjustment"); $("#aIT").innerHTML = invRows(); }
  else if(a === "ilow"){ A.iLow = b.checked; $("#aIT").innerHTML = invRows(); }
  else if(a === "cpsave"){
    var c = A.draft, er = []; c.code = String(c.code).trim().toUpperCase(); c.value = +c.value || 0; c.min = Math.max(0, +c.min || 0); c.maxUses = Math.max(0, Math.floor(+c.maxUses || 0));
    if(!/^[A-Z0-9]{4,16}$/.test(c.code)) er.push("Code must be 4–16 letters or numbers, no spaces.");
    if(DB.coupons.some(function(x, i){ return x.code === c.code && i !== c._i; })) er.push("This code already exists.");
    if(c.value <= 0) er.push("Value must be more than 0."); if(c.type === "percent" && c.value > 90) er.push("Percent off can be at most 90%.");
    if(er.length){ var eb = $("#cErr"); eb.hidden = false; eb.innerHTML = ic("info") + '<ul>' + er.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("") + '</ul>'; return; }
    var ix = c._i; delete c._i; if(ix < 0) DB.coupons.push(c); else DB.coupons[ix] = c; logA(ix < 0 ? "Coupon created" : "Coupon updated", c.code); aCloseDrawer(); aSaved("Coupon saved", c.code); aRender();
  }
  else if(a === "cpdel"){ if(b.dataset.confirm !== "1"){ b.dataset.confirm = "1"; b.textContent = "Click again to delete"; b.classList.add("danger"); return; } var cd = DB.coupons.splice(A.draft._i, 1)[0]; logA("Coupon deleted", cd.code); aCloseDrawer(); aSaved("Coupon deleted", cd.code); aRender(); }
  else if(a === "readall"){ DB.notifs.forEach(function(n){ n.read = true; }); saveDB(); aRender(); }
  else if(a === "uadd"){ aOpenDrawer("Add admin", '<div class="err" id="uErr" hidden></div><label class="fld">Name<input type="text" id="uN"></label><label class="fld">Email<input type="email" id="uE"></label><label class="fld">Role<select id="uR">'+ROLES.slice(1).map(function(r){ return '<option>'+r+'</option>'; }).join("")+'</select></label><p class="mut sm2">In the real panel they get an email invite to set their own password. Two-step login can be required for admins.</p>', '<button class="btn b-em sm push" data-a="usave">Add admin</button>'); }
  else if(a === "usave"){ var n2 = $("#uN").value.trim(), em = $("#uE").value.trim(); var ue = []; if(!n2) ue.push("Enter a name."); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) ue.push("Enter a valid email."); if(DB.admins.some(function(u){ return u.email.toLowerCase() === em.toLowerCase(); })) ue.push("This email is already an admin."); if(ue.length){ var ub = $("#uErr"); ub.hidden = false; ub.innerHTML = ic("info") + '<ul>' + ue.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("") + '</ul>'; return; } DB.admins.push({id:"u" + Date.now(), name:n2, email:em, role:$("#uR").value, active:true}); logA("Admin added", n2 + " (" + $("#uR").value + ")"); aCloseDrawer(); aSaved("Admin added", n2); aRender(); }
  else if(a === "utoggle"){ var u = DB.admins[+b.dataset.i]; u.active = !u.active; logA(u.active ? "Admin enabled" : "Admin disabled", u.name); aSaved(u.active ? "Enabled" : "Disabled", u.name); aRender(); }
  else if(a === "resetall"){ if(b.dataset.confirm !== "1"){ b.dataset.confirm = "1"; b.textContent = "Click again to reset everything"; b.classList.add("danger"); return; } try{ localStorage.removeItem(DBKEY); localStorage.removeItem("st3_cart"); }catch(x){} initDB(); cart = []; saveCart(); logA("Demo data reset", ""); saveDB(); toast("Demo data reset", ""); aRender(); }
}
function showText(title, txt, note){ aOpenDrawer(title, (note ? '<p class="mut">'+esc(note)+'</p>' : '') + '<textarea class="bigtxt" id="bigTxt" readonly>'+esc(txt)+'</textarea>', '<button class="btn b-em sm push" data-a="copytxt">'+ic("copy")+'Copy</button>'); }
$("#admin").addEventListener("click", function(e){ if(e.target.closest('[data-a="copytxt"]')){ var ta = $("#bigTxt"); ta.select(); try{ navigator.clipboard.writeText(ta.value).then(function(){ toast("Copied", ""); }, function(){ toast("Selected — press Ctrl+C to copy", ""); }); }catch(x){ toast("Selected — press Ctrl+C to copy", ""); } } });
$("#admin").addEventListener("input", function(e){
  var el = e.target, k;
  if((k = el.dataset.aq)){ A[k] = el.value; var tgt = {oQ:["#aOT", function(){ return orderTable(filteredOrders()); }], pQ:["#aPT", productTable], iQ:["#aIT", invRows], cQ:["#aCT", custTable], lQ:null}[k]; if(tgt){ $(tgt[0]).innerHTML = tgt[1](); } else { var pos = el.selectionStart; aRender(); var ni = document.querySelector('[data-aq="lQ"]'); ni.focus(); try{ ni.setSelectionRange(pos, pos); }catch(x){} } return; }
  if((k = el.dataset.pd) && A.draft){
    if(el.type === "checkbox") A.draft[k] = el.checked ? 1 : 0;
    else if(k === "sizes"){ A.draft.sizes = el.value.split(",").map(function(s){ return s.trim(); }).filter(Boolean).filter(function(s, i, a){ return a.indexOf(s) === i; }); rebuildVariants(A.draft); $("#pVar").innerHTML = variantRows(A.draft); }
    else A.draft[k] = el.value;
    if(k === "video"){ $("#pVid").innerHTML = vidPreview(el.value); }
    if(k === "sku"){ var base = el.value.trim().toUpperCase(), saved = (A.draft.id && BY[A.draft.id]) ? BY[A.draft.id].variants.map(function(x){ return x.sku; }) : [], used = {}; A.draft.variants.forEach(function(v){ if(saved.indexOf(v.sku) > -1) used[v.sku] = 1; }); A.draft.variants.forEach(function(v){ if(saved.indexOf(v.sku) > -1) return; var b2 = base + "-" + String(v.size).replace(/[^A-Za-z0-9]/g, "") + "-", n = A.draft.colors.indexOf(v.color) + 1; while(used[b2 + n]) n++; used[b2 + n] = 1; v.sku = b2 + n; }); $("#pVar").innerHTML = variantRows(A.draft); }
    return;
  }
  if(el.dataset.pc !== undefined && A.draft){ var ci = +el.dataset.pc, oldc = A.draft.colors[ci], nc = el.value; A.draft.colors[ci] = nc; el.parentNode.style.background = nc; A.draft.variants.forEach(function(v){ if(v.color === oldc) v.color = nc; }); $("#pVar").innerHTML = variantRows(A.draft); return; }
  if((k = el.dataset.vf) && A.draft){ A.draft.variants[+el.dataset.vi][k] = el.value; if(k === "stock") $("#pTot").textContent = A.draft.variants.reduce(function(x, v){ return x + Math.max(0, +v.stock || 0); }, 0); return; }
  if((k = el.dataset.cd) && A.draft){ if(k === "active") A.draft.active = el.checked; else if(k === "expires") A.draft.expires = el.value ? new Date(el.value + "T23:59:59+06:00").getTime() : 0; else A.draft[k] = el.value; return; }
  if((k = el.dataset.of)){ var ref = $("#adB").dataset.ref, o = DB.orders.filter(function(x){ return x.ref === ref; })[0]; if(!o) return; o[k] = el.value; if(k === "payStatus"){ logA("Payment status", ref + " → " + PS[el.value].l); saveDB(); toast("Payment status saved", PS[el.value].l); if(A.page === "orders") $("#aOT").innerHTML = orderTable(filteredOrders()); } else liveSave(ref + " " + k); return; }
  if((k = el.dataset.set)){ var v = el.type === "checkbox" ? el.checked : el.dataset.num ? Math.max(0, Math.floor(+el.value || 0)) : el.value; setDeep(DB.settings, k, v); liveSave(k); if(k.indexOf("meta.pixel") === 0 || k === "meta.pixelOn"){ clearTimeout(window.__mr); window.__mr = setTimeout(function(){ if(document.activeElement && document.activeElement.dataset.set === "meta.pixel") return; aRender(); }, 900); } return; }
  if((k = el.dataset.setc)){ setDeep(cfg, k, Math.max(0, Math.floor(+el.value || 0))); liveSave(k); return; }
  if((k = el.dataset.catF)){ CATS[+el.dataset.ci][k] = el.value; liveSave("Category " + CATS[+el.dataset.ci].id); return; }
});
$("#admin").addEventListener("change", function(e){
  var el = e.target;
  if(el.dataset.sel){ A.sel[el.dataset.sel] = el.checked; $("#aPT").innerHTML = productTable(); return; }
  if(el.dataset.flag){ var p = BY[el.dataset.pid]; p[el.dataset.flag] = el.checked ? 1 : 0; logA("Product display", p.en + ": " + (el.dataset.flag === "top" ? "Top selling" : "New arrival") + (el.checked ? " on" : " off")); saveDB(); toast("Saved", p.en); return; }
  if(el.dataset.pf2){ A[el.dataset.pf2] = el.value; $("#aPT").innerHTML = productTable(); return; }
  if(el.dataset.cpon !== undefined){ var c = DB.coupons[+el.dataset.cpon]; c.active = el.checked; logA("Coupon " + (c.active ? "activated" : "paused"), c.code); aSaved(c.active ? "Coupon active" : "Coupon paused", c.code); return; }
  if(el.dataset.urole !== undefined){ var u = DB.admins[+el.dataset.urole]; u.role = el.value; logA("Role changed", u.name + " → " + u.role); aSaved("Role changed", u.name); return; }
  if(el.dataset.invset){ var pr = el.dataset.invset.split("|"); setStock(pr[0], +pr[1], el.value, "Stock count set"); return; }
  if(el.hasAttribute("data-pvid") && el.files[0] && A.draft){ var fn = el.files[0].name; saveVideoFile(el.files[0], function(ref){ if(!A.draft) return; A.draft.video = ref; var li = document.querySelector('[data-pd="video"]'); if(li) li.value = ""; $("#pVid").innerHTML = vidPreview(ref); toast("Video uploaded", fn); }); return; }
  if(el.hasAttribute("data-pimg") && el.files[0] && A.draft){ readImg(el.files[0], 1000, function(url){ A.draft.img = url; var pv = $("#pPv"); pv.style.backgroundImage = "url('" + url + "')"; pv.innerHTML = ""; }); return; }
  if(el.dataset.catimg !== undefined && el.files[0]){ var ci = +el.dataset.catimg; readImg(el.files[0], 700, function(url){ CATS[ci].img = url; logA("Category image changed", CATS[ci].en); aSaved("Image updated", CATS[ci].en); aRender(); }); return; }
  if(el.dataset.pd === "cat" && A.draft){ A.draft.cat = el.value; }
});
$("#aLoginForm").addEventListener("submit", function(e){
  e.preventDefault();
  var em = $("#alEmail").value.trim().toLowerCase(), pw = $("#alPass").value.trim(), msg = $("#alMsg"), go = $("#alGo"), card = $("#aLoginForm");
  if(go.classList.contains("busy")) return;
  var u = DB.admins.filter(function(x){ return x.email.toLowerCase() === em && x.active; })[0];
  if(!em || !pw){ msg.hidden = false; msg.textContent = "Enter your email and password."; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); return; }
  if(!u || pw !== "demo1234"){ msg.hidden = false; msg.textContent = "That email and password do not match. For the demo use owner@sitraya.com and demo1234."; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); $("#alPass").select(); return; }
  msg.hidden = true; go.classList.add("busy"); go.querySelector(".tx").textContent = "Signing in…";
  setTimeout(function(){
    A.logged = true; store.set("st_admin_s", Date.now());
    logA("Signed in", u.email, u.name); saveDB();
    go.classList.remove("busy"); go.querySelector(".tx").textContent = "Sign in"; $("#alPass").value = "";
    A.page = "dashboard"; showView(true);
  }, 650);
});
$("#aLogin").addEventListener("click", function(e){
  var t2 = e.target.closest("[data-pwtoggle]"); if(!t2) return;
  var ip = $("#alPass"), show = ip.type === "password"; ip.type = show ? "text" : "password"; t2.setAttribute("aria-label", show ? "Hide password" : "Show password"); t2.style.color = show ? "var(--em)" : ""; ip.focus();
});
$$("[data-alimg]").forEach(function(im){ im.src = I(im.dataset.alimg); });
function countUp(){
  if(reduce) return;
  $$("#aBody [data-count]").forEach(function(el){
    var end = +el.dataset.count, money2 = el.dataset.fmt === "m", t0 = performance.now(), dur = 900;
    var step = function(now){ var k = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = money2 ? amt(v) : v.toLocaleString("en-IN"); if(k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function hello(){ var h = +new Date(Date.now() + 6 * 36e5).getUTCHours(); return (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + ", " + ((DB.admins[0] || {}).name || "Owner") + " · " + new Date().toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long", timeZone:"Asia/Dhaka"}); }
document.addEventListener("keydown", function(e){
  if(e.key === "Escape" && wasAdmin) aCloseDrawer();
  if(e.target && e.target.id === "pSizeIn"){
    if(e.key === "Enter" || e.key === ","){ e.preventDefault(); if(e.target.value.trim()) addSizes(e.target.value); }
    else if(e.key === "Backspace" && !e.target.value && A.draft && A.draft.sizes.length){ A.draft.sizes.pop(); refreshSO(); var n2 = $("#pSizeIn"); if(n2) n2.focus(); }
  }
});
var tip = null;
$("#admin").addEventListener("mousemove", function(e){
  var h = e.target.closest && e.target.closest("[data-tip]");
  if(!tip) tip = $("#aTip");
  if(!h){ tip.hidden = true; return; }
  tip.textContent = h.dataset.tip; tip.hidden = false;
  var x = Math.min(window.innerWidth - tip.offsetWidth - 10, e.clientX + 14); tip.style.left = x + "px"; tip.style.top = (e.clientY - 40) + "px";
});

// ---------- 3D tilt & login scene ----------
var tiltEl = null;
function tiltReset(){ if(tiltEl){ tiltEl.style.transform = ""; tiltEl.classList.remove("tilting"); tiltEl = null; } }
document.addEventListener("mousemove", function(e){
  if(reduce || !wasAdmin) return;
  var lg = $("#aLogin");
  if(!lg.hidden){ lg.style.setProperty("--px", ((e.clientX / window.innerWidth - .5) * 2).toFixed(3)); lg.style.setProperty("--py", ((e.clientY / window.innerHeight - .5) * 2).toFixed(3)); }
  var el = e.target.closest ? e.target.closest("[data-tilt]") : null;
  if(el !== tiltEl) tiltReset();
  if(!el) return;
  tiltEl = el; el.classList.add("tilting");
  var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, m = +(el.dataset.tilt || 8);
  el.style.transform = "perspective(1000px) rotateX(" + ((.5 - y) * m).toFixed(2) + "deg) rotateY(" + ((x - .5) * m).toFixed(2) + "deg) translateY(-4px)";
  el.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
});
document.addEventListener("mouseleave", tiltReset);
(function(){ var box = $("#lgDots"); if(!box || reduce) return; var h = ""; for(var i = 0; i < 22; i++){ h += '<span style="left:'+(Math.random() * 100).toFixed(1)+'%;animation-duration:'+(9 + Math.random() * 10).toFixed(1)+'s;animation-delay:'+(-Math.random() * 16).toFixed(1)+'s;width:'+(2 + Math.random() * 4).toFixed(1)+'px;height:'+(2 + Math.random() * 4).toFixed(1)+'px"></span>'; } box.innerHTML = h; })();

// ---------- product video & share helpers ----------
function vidPreview(u){
  u = String(u || "").trim();
  if(!u) return '<p class="vhint">'+ic("info")+'Paste a link to the product video. Customers will see it under the product photos.</p>';
  var v = parseVideo(u);
  if(!v) return '<p class="vbad">'+ic("info")+'This does not look like a YouTube or Facebook video link yet.</p>';
  return '<div class="vok"><span class="pl" style="color:#15803D;background:#DCFCE7"><i style="background:#15803D"></i>'+(/^idb:/.test(u) ? 'Uploaded video ready' : v.name + ' video found')+'</span><button type="button" class="lnkbtn" data-a="pvidrm">Remove video</button></div>' + videoBlock(u, true);
}
function shareBlock(d){
  if(!d.id) return '<p class="vhint">'+ic("info")+'Create the product first. Its website link appears here, ready to post on Facebook.</p>';
  var link = productLink(d), dom = link.replace(/^https:\/\//, "").split("/")[0].toUpperCase(), price2 = d.sale && d.sale < d.price ? d.sale : d.price;
  return '<div class="shrow"><span class="shl mono">'+esc(link)+'</span><button type="button" class="btn2" data-a="copylink" data-link="'+esc(link)+'">'+ic("copy")+'Copy link</button></div>'
    + '<div class="fbprev" aria-label="How the link looks on Facebook"><span class="fbtop"><span class="fbav">'+esc(BRAND().charAt(0))+'</span><span><b>'+esc(BRAND())+'</b><small>Just now · Public</small></span></span><p class="fbtxt">'+esc(d.bn || d.en)+' 💛 '+amt(price2)+'</p>'
    + '<span class="fbcard"><span class="fbimg" style="--tint:'+(d.tint || "#EFE6D6")+'"><img src="'+I(d.img || "b1")+'" alt="">'+(parseVideo(d.video) ? '<span class="fbplay">'+ic("play")+'</span>' : '')+'</span><span class="fbmeta"><small>'+esc(dom)+'</small><b>'+esc(d.en)+' — '+amt(price2)+'</b><span>'+esc((d.den || "").slice(0, 90))+'</span></span></span></div>'
    + '<p class="vhint">'+ic("info")+'When you paste this link in a Facebook post, Facebook pulls the photo, name and price from the website by itself. The live site adds these preview tags for every product automatically. Set your website address in Store Settings.</p>';
}
$("#admin").addEventListener("click", function(e){
  var b = e.target.closest('[data-a="copylink"]'); if(!b) return;
  var l = b.dataset.link; try{ navigator.clipboard.writeText(l).then(function(){ toast("Link copied", l); }, function(){ showText("Product link", l); }); }catch(x){ showText("Product link", l); }
});
