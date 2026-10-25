// ================= Phase 1: phones first =================
function touchUI(){ try{ return window.matchMedia("(hover: none) and (pointer: coarse)").matches; }catch(e){ return false; } }

// ----- 1. checkout: know when the phone keyboard is open, label every field for autofill -----
(function(){
  var root = document.documentElement, vv = window.visualViewport, full = window.innerHeight;
  function typing(){ var a = document.activeElement; return !!(a && a.closest && a.closest("#cart") && a.matches("input:not([type=checkbox]):not([type=radio]),textarea,select")); }
  function sync(){
    if(window.innerWidth > 860){ root.classList.remove("kb"); return; }
    var h = vv ? vv.height : window.innerHeight;
    if(h > full) full = h;
    root.classList.toggle("kb", typing() && h < full * 0.8);
  }
  if(vv) vv.addEventListener("resize", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", function(){ full = 0; setTimeout(sync, 400); });
  document.addEventListener("focusin", function(){ setTimeout(sync, 60); setTimeout(sync, 450); });
  document.addEventListener("focusout", function(){ setTimeout(sync, 120); });
  var AC = {co_name:["name","text","next"], co_phone:["tel","tel","next"], co_wa:["tel","tel","next"], co_district:["address-level2","text","next"], co_area:["address-level3","text","next"], co_po:["off","text","next"], co_addr:["street-address","text","enter"], co_note:["off","text","enter"]};
  function label(){ Object.keys(AC).forEach(function(id){ var el = document.getElementById(id); if(!el) return; var a = AC[id];
    el.setAttribute("autocomplete", a[0]); if(a[1] === "tel"){ el.setAttribute("inputmode", "tel"); el.type = "tel"; } el.setAttribute("enterkeyhint", a[2]); }); }
  var bb = $("#bagBody"); if(bb && window.MutationObserver) new MutationObserver(label).observe(bb, {childList:true, subtree:true});
  // "Next" on the keyboard moves to the next empty field instead of submitting
  document.addEventListener("keydown", function(e){
    if(e.key !== "Enter" || !e.target.closest || !e.target.closest("#bagBody") || e.target.tagName === "TEXTAREA") return;
    var list = $$("#bagBody .cf input:not([type=radio]):not([type=checkbox]), #bagBody .cf textarea").filter(function(x){ return x.offsetParent; });
    var i = list.indexOf(e.target); if(i < 0) return;
    e.preventDefault(); var nx = list[i + 1]; if(nx) nx.focus(); else e.target.blur();
  });
})();

// ----- 2. product page: icon-only WhatsApp and call buttons keep a readable name -----
(function(){
  var info = $("#pmInfo"); if(!info || !window.MutationObserver) return;
  new MutationObserver(function(){
    $$("#pm .mbtns .b-wa, #pm .mbtns #pmCall").forEach(function(b){ var name = b.textContent.trim(); if(name){ b.setAttribute("aria-label", name); b.title = name; } });
  }).observe(info, {childList:true});
})();

// ----- 3. slider: phones show the whole banner at its own shape -----
var SPOS = {top:"50% 0%", upper:"50% 25%", center:"50% 50%", lower:"50% 75%", bottom:"50% 100%", left:"0% 50%", right:"100% 50%"};
(function(){
  var box = $("#slides"); if(!box) return;
  function measure(){
    $$("#slides .sl.pic img.full").forEach(function(im){
      function set(){ if(im.naturalWidth && im.naturalHeight){ var s = im.closest(".sl"); if(s) s.style.setProperty("--ar", im.naturalWidth + "/" + im.naturalHeight); } }
      if(im.complete) set(); else im.addEventListener("load", set, {once:true});
      im.addEventListener("load", set);
    });
  }
  if(window.MutationObserver) new MutationObserver(measure).observe(box, {childList:true});
  measure();
  window.addEventListener("resize", function(){ clearTimeout(measure.t); measure.t = setTimeout(measure, 200); });
})();

// ----- 4. search: first tap shows suggestions, the keyboard opens only when the field is tapped -----
var RKEY = "st_recent_q";
function recentQ(){ try{ var r = JSON.parse(localStorage.getItem(RKEY) || "[]"); return Array.isArray(r) ? r.filter(function(x){ return typeof x === "string"; }).slice(0, 8) : []; }catch(e){ return []; } }
function saveQ(q){ q = String(q || "").trim(); if(q.length < 2 || (typeof SITE === "function" && !SITE().search.recent)) return; var r = recentQ().filter(function(x){ return x.toLowerCase() !== q.toLowerCase(); }); r.unshift(q.slice(0, 40)); try{ localStorage.setItem(RKEY, JSON.stringify(r.slice(0, 8))); }catch(e){} }
function renderChips(){
  var cats = (CATS || []).filter(function(c){ return c && c[L]; }).slice(0, 8);
  $("#chips").innerHTML = '<span>'+esc(t("popular"))+'</span>' + cats.map(function(c){ return '<button data-chip="'+esc(c[L])+'">'+esc(c[L])+'</button>'; }).join("");
}
function searchHay(p){
  var c = CAT[p.cat] || {};
  return [p.en, p.bn, c.en, c.bn, p.sku, p.den, p.dbn, (p.sizes || []).join(" "), (p.colorNames || []).join(" ")].filter(Boolean).join(" ").toLowerCase();
}
function runSearch(){
  var raw = $("#q").value, q = enDigits(raw).trim().toLowerCase(), terms = q ? qTerms(q) : [];
  var sres = $("#sres"), box = $("#search");
  if(!q){
    box.classList.add("pre");
    var SS = typeof SITE === "function" ? SITE().search : {recent:true, popular:true};
    var rec = SS.recent ? recentQ() : [], cats = SS.popular ? (CATS || []).filter(function(c){ return c && c[L]; }).slice(0, 8) : [];
    var pop = PL().filter(function(p){ return p.top; }); if(pop.length < 4) pop = pop.concat(PL().filter(function(p){ return !p.top; })).slice(0, 6); else pop = pop.slice(0, 6);
    if(!SS.popular) pop = [];
    var bn = L === "bn";
    sres.innerHTML = '<div class="s-sug">'
      + (touchUI() ? '<button class="s-tap" data-sfocus>'+ic("search")+' '+esc(bn ? "লিখে খুঁজতে উপরের ঘরে চাপুন" : "Tap the box above to type")+'</button>' : '')
      + (rec.length ? '<div><h4>'+esc(bn ? "সাম্প্রতিক খোঁজ" : "Recent searches")+'<button data-sclear>'+esc(bn ? "মুছুন" : "Clear")+'</button></h4><div class="row">' + rec.map(function(r){ return '<button data-chip="'+esc(r)+'">'+ic("search")+esc(r)+'</button>'; }).join("") + '</div></div>' : '')
      + (cats.length ? '<div><h4>'+esc(bn ? "জনপ্রিয় ক্যাটাগরি" : "Popular categories")+'</h4><div class="row">' + cats.map(function(c){ return '<button data-chip="'+esc(c[L])+'">'+esc(c[L])+'</button>'; }).join("") + '</div></div>' : '')
      + (pop.length ? '<div><h4>'+esc(bn ? "জনপ্রিয় প্রোডাক্ট" : "Popular products")+'</h4><div class="s-pop">' + pop.map(resRow).join("") + '</div></div>' : '')
      + '</div>';
    return;
  }
  box.classList.remove("pre");
  var res = PL().filter(function(p){ var hay = searchHay(p); return terms.some(function(w){ return hay.indexOf(w) > -1; }); });
  sres.innerHTML = res.length ? res.map(resRow).join("") : '<p style="color:var(--muted);font-size:17px">'+esc(fill(t("noresult"), raw.trim()))+'</p>';
}
function resRow(p, i){
  return '<button data-qv="'+p.id+'" style="animation-delay:'+((i || 0)*30)+'ms"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt="" loading="lazy"></span><span><b>'+esc(nm(p))+'</b><span style="color:var(--muted);font-size:14px;display:block">'+esc(alt(p))+'</span><small>'+money(price(p))+'</small></span></button>';
}
(function(){
  var sres = $("#sres"), q = $("#q");
  sres.addEventListener("click", function(e){
    var c = e.target.closest("[data-chip]"); if(c){ q.value = c.dataset.chip; runSearch(); saveQ(c.dataset.chip); return; }
    if(e.target.closest("[data-sclear]")){ try{ localStorage.removeItem(RKEY); }catch(x){} runSearch(); return; }
    if(e.target.closest("[data-sfocus]")){ q.focus(); return; }
    if(e.target.closest("[data-qv]") && q.value.trim()) saveQ(q.value);
  });
  q.addEventListener("keydown", function(e){ if(e.key === "Enter"){ saveQ(q.value); q.blur(); } });
})();

// ----- 5. stop Chrome's "Translate this page?" bar: the shop already has its own বাং / EN switch -----
(function(){ var h = document.documentElement; h.setAttribute("translate", "no");
  if(!document.querySelector('meta[name="google"]')){ var m = document.createElement("meta"); m.name = "google"; m.content = "notranslate"; document.head.appendChild(m); } })();
