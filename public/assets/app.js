
(function(){
"use strict";
var IMG = {"b1": "/assets/img/b1.svg", "b2": "/assets/img/b2.svg", "b3": "/assets/img/b3.svg", "b4": "/assets/img/b4.svg", "b5": "/assets/img/b5.svg", "b6": "/assets/img/b6.svg", "b7": "/assets/img/b7.svg", "n1": "/assets/img/n1.svg", "n2": "/assets/img/n2.svg", "n3": "/assets/img/n3.svg", "n4": "/assets/img/n4.svg", "n5": "/assets/img/n5.svg", "n6": "/assets/img/n6.svg", "n7": "/assets/img/n7.svg", "n8": "/assets/img/n8.svg", "x-hijab-teal": "/assets/img/x-hijab-teal.svg", "x-womens": "/assets/img/x-womens.svg", "cover": "/assets/brand/cover.jpg", "logo-dark": "/assets/brand/logo-dark.png", "logo-light": "/assets/brand/logo-light.png", "logo-gold": "/assets/brand/logo-gold.png"};
var $ = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
var clone = function(o){ return JSON.parse(JSON.stringify(o)); };
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var store = {
  get:function(k,d){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set:function(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
};

// ================= premium duotone icons =================
var ICP = {
  search:'<circle class="d" cx="11" cy="11" r="6.5"/><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/><path class="g" d="M8.3 9.2a3 3 0 0 1 2.4-1.6"/>',
  user:'<circle class="d" cx="12" cy="8.5" r="3.8"/><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/>',
  heart:'<path class="d" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  bag:'<path class="d" d="M5 8h14l-1.2 12H6.2z"/><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path class="g" d="M9.5 12a2.5 2.5 0 0 0 5 0"/>',
  pin:'<path class="d" d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle class="g" cx="12" cy="9" r="2.5"/>',
  truck:'<path class="d" d="M3 6.5h11v9.5H3z"/><path d="M3 6.5h11v9.5H3zM14 9.5h4l3 3.2V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/><path class="g" d="M5.5 10h5M5.5 12.5h3"/>',
  cash:'<rect class="d" x="3" y="6" width="18" height="12" rx="2.5"/><rect x="3" y="6" width="18" height="12" rx="2.5"/><circle class="g" cx="12" cy="12" r="2.8"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
  wa:'<path class="d" d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/><path class="g" d="M9 9.2c.4 2.6 2.6 4.8 5.2 5.3l1.3-1.3-1.8-1-1 .8c-.9-.4-1.7-1.2-2.1-2.1l.8-1-1-1.8z"/>',
  route:'<circle class="d" cx="6" cy="18" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle class="g" cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  shield:'<path class="d" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path class="g" d="M8.5 12l2.5 2.5 4.5-5"/>',
  layers:'<path class="d" d="M12 4l9 4.5-9 4.5-9-4.5z"/><path d="M12 4l9 4.5-9 4.5-9-4.5z"/><path d="M3 12.5l9 4.5 9-4.5"/><path class="g" d="M3 16.5l9 4.5 9-4.5"/>',
  leaf:'<path class="d" d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z"/><path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z"/><path class="g" d="M5 19l9-9"/>',
  fire:'<path class="d" d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 .8-3.6 2-4.6.2 1.8 1.2 2.8 2 3C10.6 8.6 11 5.6 12 3z"/><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 .8-3.6 2-4.6.2 1.8 1.2 2.8 2 3C10.6 8.6 11 5.6 12 3z"/>',
  bolt:'<path class="d" d="M13 3L5 13h6l-1 8 8-10h-6z"/><path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  call:'<path class="d" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  mail:'<rect class="d" x="3" y="5" width="18" height="14" rx="2.5"/><rect x="3" y="5" width="18" height="14" rx="2.5"/><path class="g" d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevL:'<path d="M14.5 6l-6 6 6 6"/>', chevR:'<path d="M9.5 6l6 6-6 6"/>', up:'<path d="M6 14l6-6 6 6"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  trash:'<path class="d" d="M7 7l1 13h8l1-13z"/><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  check:'<circle class="d" cx="12" cy="12" r="9"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  menu:'<path d="M4 7h16M4 12h11M4 17h16"/>',
  grid:'<rect class="d" x="4" y="4" width="7" height="7" rx="2"/><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect class="d" x="13" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  home:'<path class="d" d="M4 11l8-7 8 7v9H4z"/><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  edit:'<path class="d" d="M15 5l4 4L9 19H5v-4z"/><path d="M15 5l4 4L9 19H5v-4zM13 7l4 4"/>',
  up2:'<path d="M12 19V5M6 11l6-6 6 6"/>', down2:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  ig:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle class="gf" cx="16.6" cy="7.4" r="1"/>',
  yt:'<rect x="3" y="6" width="18" height="12" rx="4"/><path class="gf" d="M10.5 9.5l4 2.5-4 2.5z"/>',
  tt:'<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path class="g" d="M14 4c.5 2.5 2.5 4.5 5 4.5"/>'
};
var ic = function(n, cls){ return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICP[n]||"")+'</svg>'; };
function paintIcons(root){ (root||document).querySelectorAll("i[data-ic]").forEach(function(el){ el.outerHTML = ic(el.dataset.ic); }); }

// ================= language =================
var T = {
bn:{offer:"অফার জোন",c_abaya:"বোরকা ও আবায়া",c_three:"থ্রি-পিস",c_hijab:"হিজাব ও খিমার",c_kurti:"কুর্তি",c_women:"নারী",c_men:"পুরুষ",c_kids:"শিশু",
 track:"অর্ডার ট্র্যাক",help:"সাহায্য",signin:"সাইন ইন",wishlist:"উইশলিস্ট",cart:"কার্ট",search:"খুঁজুন",menu:"মেনু",prev:"আগের",next:"পরের",close:"বন্ধ করুন",top:"উপরে যান",home:"হোম",categories:"ক্যাটাগরি",customize:"কাস্টমাইজ",
 tr1t:"ফ্রি ডেলিভারি",tr1s:"ঢাকায় ৳২,০০০+ অর্ডারে",tr2t:"ক্যাশ অন ডেলিভারি",tr2s:"পণ্য হাতে পেয়ে টাকা দিন",tr3t:"WhatsApp অর্ডার",tr3s:"এক মেসেজেই অর্ডার করুন",tr4t:"সহজ ট্র্যাকিং",tr4s:"অর্ডারের প্রতিটি ধাপ দেখুন",
 cat_k:"Featured Categories",cat_h:"ফিচারড ক্যাটাগরি",top_k:"Top Selling",top_h:"সবচেয়ে বেশি বিক্রিত",new_k:"New Arrivals",new_h:"নতুন এসেছে",ab_k:"Modest Essentials",ab_h:"বোরকা, আবায়া ও হিজাব",tp_k:"Everyday Elegance",tp_h:"থ্রি-পিস ও কুর্তি",see_all:"সব দেখুন",
 v1:"প্রিমিয়াম কোয়ালিটি",v2:"আরামদায়ক ফেব্রিক",v3:"শালীন ও মার্জিত",v4:"প্রতিটি বোনের জন্য",bb_btn:"কালেকশন দেখুন",
 news_h:"নতুন কালেকশন আর অফার সবার আগে পেতে চান?",news_p:"ইমেইল দিন, নতুন কিছু এলেই আপনাকে জানাব।",news_ph:"আপনার ইমেইল লিখুন",news_alt:"Want new arrivals and offers first?",news_lang:"ভাষা বেছে নিন",subscribe:"সাবস্ক্রাইব",news_ok:"ধন্যবাদ! (ডেমো — এখনো কিছু সেভ হচ্ছে না)",news_bad:"সঠিক ইমেইল লিখুন, যেমন name@example.com",
 f_info:"তথ্য",f_shop:"ক্যাটাগরি",f_support:"সহায়তা",f_policy:"নীতিমালা",l_about:"আমাদের সম্পর্কে",l_contact:"যোগাযোগ",l_terms:"শর্তাবলি",l_privacy:"প্রাইভেসি পলিসি",l_how:"কীভাবে অর্ডার করবেন",l_pay:"পেমেন্ট",l_ship:"শিপিং",l_faq:"প্রশ্নোত্তর",l_return:"রিটার্ন পলিসি",l_exchange:"এক্সচেঞ্জ",l_refund:"রিফান্ড পলিসি",l_size:"সাইজ গাইড",
 addr:"[শোরুমের ঠিকানা], ঢাকা",phone:"[ফোন নম্বর]",email:"[ইমেইল ঠিকানা]",rights:"সর্বস্বত্ব সংরক্ষিত।",cod:"ক্যাশ অন ডেলিভারি",
 about:"{b} — বাংলাদেশের নারী, পুরুষ ও শিশুদের জন্য প্রিমিয়াম মডেস্ট ফ্যাশন: বোরকা, আবায়া, হিজাব, থ্রি-পিস ও আরও অনেক কিছু।",
 bag:"আপনার ব্যাগ",inside:"ঢাকার ভিতরে",outside:"ঢাকার বাইরে",subtotal:"সাবটোটাল",delivery:"ডেলিভারি চার্জ",total:"সর্বমোট",checkout:"চেকআউট করুন",wa_order:"WhatsApp-এ অর্ডার",free:"ফ্রি",
 empty_h:"আপনার ব্যাগ খালি",empty_p:"নতুন কালেকশন থেকে শুরু করুন।",start:"শপিং শুরু করুন",maylike:"এগুলোও পছন্দ হতে পারে",each:"প্রতিটি",size:"সাইজ",color:"রঙ",qty:"পরিমাণ",
 free_need:"আর মাত্র <b>{x}</b> কিনলেই ঢাকায় <b>ফ্রি ডেলিভারি!</b>",free_got:"অভিনন্দন! আপনি <b>ফ্রি ডেলিভারি</b> পাচ্ছেন।",free_out:"ফ্রি ডেলিভারি শুধু ঢাকার ভিতরে প্রযোজ্য।",
 add:"কার্টে যোগ করুন",addcaps:"কার্টে যোগ করুন",buynow:"এখনই কিনুন",waorder:"WhatsApp অর্ডার",callorder:"কল করে অর্ডার",instock:"স্টকে আছে (ডেমো)",save:"সাশ্রয়",newtag:"নতুন",best:"বেস্ট সেলিং",
 d1t:"ফ্রি ডেলিভারি",d1s:"ঢাকায় ৳২,০০০+ অর্ডারে",d2t:"ক্যাশ অন ডেলিভারি",d2s:"সারা বাংলাদেশে",
 from:"শুরু মাত্র <strong>{x}</strong> থেকে",from_s:"শুরু {x} থেকে",shopnow:"এখনই দেখুন",allcats:"সব ক্যাটাগরি",
 all:"সব",sale:"অফার",items:"টি পণ্য",added:"ব্যাগে যোগ হয়েছে",viewbag:"ব্যাগ দেখুন",wish_saved:"উইশলিস্টে সেভ হয়েছে",wish_removed:"উইশলিস্ট থেকে সরানো হয়েছে",wish_count:"উইশলিস্টে {x}টি পণ্য আছে",wish_empty:"পছন্দের পণ্যে ♡ চাপুন",
 checkout_soon:"চেকআউট পেজ পরের ধাপে তৈরি হবে",call_soon:"দোকানের ফোন নম্বর অ্যাডমিন প্যানেল থেকে বসবে",signin_soon:"কাস্টমার লগইন পুরো বিল্ডে আসবে",
 search_ph:"কী খুঁজছেন? যেমন: আবায়া",popular:"জনপ্রিয়:",noresult:"\"{x}\" এর সাথে মিলে এমন কিছু পাওয়া যায়নি।",newin:"নতুন এসেছে",
 typed:["আবায়া খুঁজুন…","থ্রি-পিস খুঁজুন…","হিজাব ও খিমার…","বোরকা খুঁজুন…"],empty_cat:"এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট নেই।",upload_hint:"এখানে ব্যানার ছবি আপলোড করুন (Customize)"},
en:{offer:"Offer Zone",c_abaya:"Burqa & Abaya",c_three:"Three Piece",c_hijab:"Hijab & Khimar",c_kurti:"Kurti",c_women:"Women",c_men:"Men",c_kids:"Kids",
 track:"Track Order",help:"Help",signin:"Sign In",wishlist:"Wishlist",cart:"Cart",search:"Search",menu:"Menu",prev:"Previous",next:"Next",close:"Close",top:"Back to top",home:"Home",categories:"Categories",customize:"Customize",
 tr1t:"Free Delivery",tr1s:"Inside Dhaka above ৳2,000",tr2t:"Cash on Delivery",tr2s:"Pay when it arrives",tr3t:"WhatsApp Order",tr3s:"Order in one message",tr4t:"Easy Tracking",tr4s:"Follow every step",
 cat_k:"জনপ্রিয় ক্যাটাগরি",cat_h:"Featured Categories",top_k:"সবচেয়ে বেশি বিক্রিত",top_h:"Top Selling Products",new_k:"নতুন এসেছে",new_h:"New Arrivals",ab_k:"বোরকা, আবায়া ও হিজাব",ab_h:"Modest Essentials",tp_k:"থ্রি-পিস ও কুর্তি",tp_h:"Everyday Elegance",see_all:"See all",
 v1:"Premium Quality",v2:"Comfortable Fabric",v3:"Modest & Elegant",v4:"For Every Sister",bb_btn:"Explore Collection",
 news_h:"Want new arrivals and offers first?",news_p:"Leave your email and we will tell you when something new lands.",news_ph:"Your email address",news_alt:"নতুন কালেকশন আর অফার সবার আগে পেতে চান?",news_lang:"Choose language",subscribe:"Subscribe",news_ok:"Thank you! (Demo: nothing is saved yet)",news_bad:"Enter a valid email, like name@example.com",
 f_info:"Information",f_shop:"Shop By",f_support:"Support",f_policy:"Policy",l_about:"About us",l_contact:"Contact us",l_terms:"Terms & Conditions",l_privacy:"Privacy Policy",l_how:"How to Order",l_pay:"Payment",l_ship:"Shipping",l_faq:"FAQ",l_return:"Return Policy",l_exchange:"Exchange",l_refund:"Refund Policy",l_size:"Size Guide",
 addr:"[Showroom address], Dhaka",phone:"[Phone number]",email:"[Email address]",rights:"All rights reserved.",cod:"Cash on Delivery",
 about:"{b} brings premium modest fashion for women, men and kids in Bangladesh: burqa, abaya, hijab, three piece and more.",
 bag:"Your Bag",inside:"Inside Dhaka",outside:"Outside Dhaka",subtotal:"Subtotal",delivery:"Delivery",total:"Total",checkout:"Proceed to Checkout",wa_order:"Order on WhatsApp",free:"Free",
 empty_h:"Your bag is empty",empty_p:"Start with our new arrivals.",start:"Start shopping",maylike:"You may also like",each:"each",size:"Size",color:"Color",qty:"Qty",
 free_need:"Add <b>{x}</b> more for <b>free delivery</b> inside Dhaka!",free_got:"You get <b>free delivery</b> inside Dhaka.",free_out:"Free delivery applies inside Dhaka only.",
 add:"Add to Cart",addcaps:"ADD TO CART",buynow:"BUY NOW",waorder:"WhatsApp Order",callorder:"Call for Order",instock:"In stock",save:"Save",newtag:"New Arrival",best:"Best Selling",
 d1t:"Free delivery",d1s:"Inside Dhaka above ৳2,000",d2t:"Cash on Delivery",d2s:"All over Bangladesh",
 from:"Starting from <strong>{x}</strong>",from_s:"From {x}",shopnow:"Shop now",allcats:"All categories",
 all:"All",sale:"Offers",items:"Items",added:"added to bag",viewbag:"View bag",wish_saved:"Saved to wishlist",wish_removed:"Removed from wishlist",wish_count:"{x} items in your wishlist",wish_empty:"Tap ♡ on a product to save it",
 checkout_soon:"Checkout page comes in the next step",call_soon:"The shop's phone number will be set from the admin panel",signin_soon:"Customer sign-in comes with the full build",
 search_ph:"What are you looking for? e.g. abaya",popular:"Popular:",noresult:"Nothing matches \"{x}\".",newin:"New Arrivals",
 typed:["Search abaya…","Search three piece…","Hijab & khimar…","Search burqa…"],empty_cat:"No products in this category yet.",upload_hint:"Upload a banner image here (Customize)"}
};
var L = store.get("st3_lang","bn");
var t = function(k){ var v = T[L][k]; return v == null ? (T.en[k] == null ? k : T.en[k]) : v; };
var tx = function(o){ return o ? (o[L] || o.bn || o.en || "") : ""; };
var digits = function(s){ return L === "bn" ? String(s).replace(/\d/g, function(d){ return "০১২৩৪৫৬৭৮৯"[d]; }) : String(s); };
var num = function(n){ return digits(Number(n).toLocaleString("en-IN")); };
var money = function(n){ return "৳" + num(n); };
var fill = function(s, x){ return String(s).replace("{x}", x); };

// ================= catalogue (demo) =================
var DEFAULT_CATS = [
  {id:"abaya", bn:"বোরকা ও আবায়া", en:"Burqa & Abaya", img:"b1", tint:"#EFE6D6"},
  {id:"three", bn:"থ্রি-পিস", en:"Three Piece", img:"n1", tint:"#E1EEE8"},
  {id:"hijab", bn:"হিজাব ও খিমার", en:"Hijab & Khimar", img:"b4", tint:"#F5E3EA"},
  {id:"kurti", bn:"কুর্তি", en:"Kurti", img:"b5", tint:"#FBE5E3"},
  {id:"women", bn:"নারীদের পোশাক", en:"Women's Wear", img:"x-womens", tint:"#E8E8EC"},
  {id:"men", bn:"পুরুষদের পোশাক", en:"Men's Fashion", img:"b6", tint:"#E3EDE7"},
  {id:"kids", bn:"শিশুদের পোশাক", en:"Kids", img:"b7", tint:"#FCE6EC"}
];
var CATS, CAT = {};
var DEFAULT_P = [
  {id:"n1", en:"Noor Embroidered Three Piece", bn:"নূর এমব্রয়ডারি থ্রি-পিস", cat:"three", price:3450, sale:2950, sizes:["M","L","XL"], colors:["#0F4A3F","#7A2540","#8DB3C2"], tint:"#E1EEE8", isNew:1, top:1,
   den:"Emerald cotton kameez with gold-tone neckline embroidery, a soft printed dupatta and matching salwar.", dbn:"গোল্ডেন এমব্রয়ডারি করা এমারেল্ড কটন কামিজ, নরম প্রিন্টেড ওড়না আর ম্যাচিং সালোয়ার।"},
  {id:"n2", en:"Mehr Chiffon Abaya", bn:"মেহের শিফন আবায়া", cat:"abaya", price:4200, sizes:["52","54","56"], colors:["#1C1B19","#3B3F45"], tint:"#EFE9DF", isNew:1,
   den:"Flowing black chiffon abaya with a gold front trim and wide bell sleeves.", dbn:"সামনে সোনালি ট্রিম আর চওড়া হাতার হালকা কালো শিফন আবায়া।"},
  {id:"n3", en:"Zarin Block-Print Kurti", bn:"জারিন ব্লক-প্রিন্ট কুর্তি", cat:"kurti", price:1450, sizes:["S","M","L","XL"], colors:["#C98C8C","#D19E2F"], tint:"#F7E6E3", isNew:1,
   den:"Hand-block style print on breathable cotton for everyday wear.", dbn:"প্রতিদিন পরার জন্য আরামদায়ক কটনে ব্লক-প্রিন্ট ডিজাইন।"},
  {id:"n4", en:"Ayra Jamdani-Style Saree", bn:"আয়রা জামদানি-স্টাইল শাড়ি", cat:"women", price:5800, sizes:["Free size"], colors:["#F7F0DF","#0F4A3F"], tint:"#F3EEE2", isNew:1,
   den:"Ivory saree with a woven gold border and a contrasting emerald blouse piece.", dbn:"সোনালি পাড়ের আইভরি শাড়ি, সাথে এমারেল্ড ব্লাউজ পিস।"},
  {id:"n5", en:"Saba Lawn Three Piece", bn:"সাবা লন থ্রি-পিস", cat:"three", price:2650, sale:2250, sizes:["M","L","XL"], colors:["#8DB3C2","#F6F1E6"], tint:"#E4EEF2", isNew:1,
   den:"Light sky-blue lawn set with a white dupatta, made for warm days.", dbn:"গরমের দিনের জন্য হালকা আকাশি লন সেট, সাথে সাদা ওড়না।"},
  {id:"n6", en:"Rida Nida Burqa Set", bn:"রিদা নিদা বোরকা সেট", cat:"abaya", price:3600, sizes:["52","54","56","58"], colors:["#8A7A68","#1C1B19","#5A2B3E"], tint:"#EEE8DF", isNew:1,
   den:"Two-piece nida burqa with a matching khimar in warm taupe.", dbn:"ম্যাচিং খিমারসহ দুই পিসের নিদা বোরকা সেট।"},
  {id:"n7", en:"Inaya Festive Kurti", bn:"ইনায়া ফেস্টিভ কুর্তি", cat:"kurti", price:1850, sale:1650, sizes:["S","M","L"], colors:["#D19E2F","#C8526A"], tint:"#FAF0D9", isNew:1,
   den:"Mustard festive kurti with a contrast placket and printed stripes.", dbn:"কনট্রাস্ট প্ল্যাকেট আর প্রিন্টেড স্ট্রাইপের সরিষা রঙের উৎসবের কুর্তি।"},
  {id:"n8", en:"Little Maryam Frock", bn:"লিটল মারিয়াম ফ্রক", cat:"kids", price:1250, sizes:["2-3Y","4-5Y","6-7Y"], colors:["#F1B8A0","#EBA3B6"], tint:"#FCEBE4", isNew:1,
   den:"Peach party frock with a tiered skirt and flower trim.", dbn:"ফুলেল ট্রিম আর ঘের দেওয়া পিচ রঙের পার্টি ফ্রক।"},
  {id:"b1", en:"Classic Black Abaya", bn:"ক্লাসিক কালো আবায়া", cat:"abaya", price:3200, sale:2850, sizes:["52","54","56","58"], colors:["#1B1A18","#2F4A46"], tint:"#EFE6D6",
   den:"A clean everyday black abaya with a matching khimar.", dbn:"ম্যাচিং খিমারসহ প্রতিদিনের জন্য ক্লাসিক কালো আবায়া।"},
  {id:"b2", en:"Luxury Embroidered Burqa", bn:"লাক্সারি এমব্রয়ডারি বোরকা", cat:"abaya", price:3800, sale:3200, sizes:["52","54","56"], colors:["#141312","#0F3B33"], tint:"#F1E7D2", top:1,
   den:"Long khimar burqa with gold motif embroidery down the front and along the hem.", dbn:"সামনে ও নিচের পাড়ে সোনালি মোটিফ এমব্রয়ডারি করা লম্বা খিমার বোরকা।"},
  {id:"b3", en:"Georgette Three Piece", bn:"জর্জেট থ্রি-পিস", cat:"three", price:2450, sizes:["M","L","XL"], colors:["#7A2540","#0F4A3F"], tint:"#F6E3E8",
   den:"Deep maroon georgette set with a rose dupatta.", dbn:"গোলাপি ওড়নাসহ গাঢ় মেরুন জর্জেট সেট।"},
  {id:"b4", en:"Hijab & Khimar Set", bn:"হিজাব ও খিমার সেট", cat:"hijab", price:1250, sizes:["Free size"], colors:["#A34E72","#4F8077","#1B1A18"], tint:"#F5E3EA",
   den:"Soft plum khimar with a matching inner abaya.", dbn:"ম্যাচিং ইনার আবায়াসহ নরম প্লাম রঙের খিমার।"},
  {id:"b5", en:"Floral Kurti", bn:"ফ্লোরাল কুর্তি", cat:"kurti", price:2100, sale:1850, sizes:["S","M","L","XL"], colors:["#C8526A","#0F4A3F"], tint:"#FBE5E3",
   den:"Rose-red kurti with a cream floral print.", dbn:"ক্রিম ফুলেল প্রিন্টের গোলাপি-লাল কুর্তি।"},
  {id:"b6", en:"Men's Classic Panjabi", bn:"ক্লাসিক পাঞ্জাবি", cat:"men", price:1450, sizes:["38","40","42","44"], colors:["#1F4B3F","#F1ECE2"], tint:"#E3EDE7",
   den:"Bottle-green panjabi with a band collar and gold-tone buttons.", dbn:"ব্যান্ড কলার আর সোনালি বোতামের বোতল-সবুজ পাঞ্জাবি।"},
  {id:"b7", en:"Kids Party Frock", bn:"কিডস পার্টি ফ্রক", cat:"kids", price:950, sizes:["2-3Y","4-5Y","6-7Y"], colors:["#EBA3B6","#F1B8A0"], tint:"#FCE6EC",
   den:"Pink frock with a tiered skirt for little ones.", dbn:"ছোট্ট মনিদের জন্য ঘের দেওয়া গোলাপি ফ্রক।"},
  {id:"x-hijab-teal", en:"Teal Khimar Set", bn:"টিল খিমার সেট", cat:"hijab", price:1350, sizes:["Free size"], colors:["#4F8077","#A34E72"], tint:"#E2EEEB",
   den:"Two-piece khimar set in a calm teal.", dbn:"শান্ত টিল রঙের দুই পিসের খিমার সেট।"}
];
var DB, P, BY = {}, cfg, DBKEY = "st4_db", FLOW_S = ["received","confirmed","processing","shipped","delivered"];
var nm = function(p){ return p[L]; };
var alt = function(p){ return L === "bn" ? p.en : p.bn; };
var price = function(p){ return p.sale && p.sale < p.price ? p.sale : p.price; };
var off = function(p){ return p.sale && p.sale < p.price ? Math.round((1 - p.sale / p.price) * 100) : 0; };
var I = function(k){ return !k ? "" : (k.indexOf("data:") === 0 ? k : (IMG[k] || "")); };
var minOf = function(cat){ var m = Math.min.apply(null, PL().filter(function(p){ return p.cat === cat; }).map(price)); return isFinite(m) ? m : 0; };

// ================= site config (what the admin panel controls) =================
var DEF = {
  v:3, skin:"emerald", tickerOn:true, interval:6.5,
  brand:{name:"Sitraya", logo:""},
  delivery:{inside:80, outside:150, free:2000},
  ticker:[
    {bn:"ঢাকায় ৳২,০০০+ অর্ডারে ফ্রি ডেলিভারি", en:"Free delivery inside Dhaka above ৳2,000"},
    {bn:"সারা বাংলাদেশে ক্যাশ অন ডেলিভারি", en:"Cash on Delivery all over Bangladesh"},
    {bn:"নতুন প্রিমিয়াম বোরকা কালেকশন এসেছে", en:"The new premium burka collection is here"},
    {bn:"WhatsApp-এ সহজেই অর্ডার করুন", en:"Order easily on WhatsApp"}
  ],
  slides:[
    {on:true, img:"cover", bg:"noir", art:[], pill:{bn:"",en:""}, h:{bn:"",en:""}, p:{bn:"",en:""}, btn:{bn:"কালেকশন দেখুন",en:"Shop the Collection"}, link:"abaya"},
    {on:true, img:"", bg:"emerald", art:["b2","b1","n2"], pill:{bn:"নতুন কালেকশন",en:"New Collection"}, h:{bn:"বোরকা ও আবায়া",en:"Burqa & Abaya"}, p:{bn:"প্রতিদিনের জন্য আরামদায়ক, উৎসবের জন্য অভিজাত। বেছে নিন আপনার পছন্দের ডিজাইন।",en:"Comfortable for every day, refined for every occasion. Find the design that is yours."}, btn:{bn:"এখনই কিনুন",en:"Shop Now"}, link:"abaya"},
    {on:true, img:"", bg:"plum", art:["b4","x-hijab-teal","b1"], pill:{bn:"নরম ও আরামদায়ক",en:"Soft & Breathable"}, h:{bn:"হিজাব ও খিমার",en:"Hijab & Khimar"}, p:{bn:"নরম ফেব্রিক আর মানানসই রঙে সাজানো হিজাব ও খিমার সেট।",en:"Hijab and khimar sets in soft fabrics and easy colours."}, btn:{bn:"এখনই কিনুন",en:"Shop Now"}, link:"hijab"},
    {on:true, img:"", bg:"teal", art:["n1","b3","n5"], pill:{bn:"বিশেষ ছাড়",en:"Special Offer"}, h:{bn:"থ্রি-পিস কালেকশন",en:"Three Piece"}, p:{bn:"ঐতিহ্য আর আধুনিকতার মেলবন্ধন, উৎসব থেকে অফিস সব জায়গায় মানানসই।",en:"Tradition meets modern cuts, from festivals to the office."}, btn:{bn:"এখনই কিনুন",en:"Shop Now"}, link:"three"}
  ],
  promos:[
    {on:true, img:"b5", bg:"rose", k:{bn:"নতুন রঙে",en:"New colours"}, h:{bn:"কুর্তি কালেকশন",en:"Kurti Collection"}, link:"kurti"},
    {on:true, img:"n8", bg:"gold", k:{bn:"ছোট্ট মনিদের জন্য",en:"For little ones"}, h:{bn:"কিডস পার্টি ওয়্যার",en:"Kids' Party Wear"}, link:"kids"},
    {on:true, img:"b6", bg:"mint", k:{bn:"উৎসবের জন্য",en:"For celebrations"}, h:{bn:"পাঞ্জাবি কালেকশন",en:"Panjabi Collection"}, link:"men"}
  ],
  bb:{h:{bn:"শালীনতায় সৌন্দর্য",en:"Beauty in Modesty"}, line:{bn:"আত্মবিশ্বাসে পরিচয়, প্রতিটি বোনের জন্য",en:"Confidence, for every sister"}}
};
var SBG = {
  emerald:{bg:"linear-gradient(125deg,#082721 0%,#0F3B33 55%,#17564A 100%)", glow:"rgba(233,207,146,.30)", label:"Emerald"},
  plum:{bg:"linear-gradient(125deg,#2E1020 0%,#4A1F33 50%,#6E2D4B 100%)", glow:"rgba(255,200,220,.26)", label:"Plum"},
  teal:{bg:"linear-gradient(125deg,#0C2E2B 0%,#124540 50%,#1C6158 100%)", glow:"rgba(233,207,146,.32)", label:"Teal"},
  noir:{bg:"linear-gradient(125deg,#050505 0%,#141210 60%,#241E18 100%)", glow:"rgba(233,207,146,.22)", label:"Noir (black)"},
  navy:{bg:"linear-gradient(125deg,#0B1530 0%,#1A2A55 55%,#2B3F78 100%)", glow:"rgba(233,207,146,.28)", label:"Navy"}
};
var PBG = {
  rose:{pbg:"linear-gradient(135deg,#FFF1EE,#FBDCD8)", blob:"rgba(200,82,106,.16)", label:"Rose"},
  gold:{pbg:"linear-gradient(135deg,#FFF8E9,#F4E2B8)", blob:"rgba(201,163,90,.24)", label:"Gold"},
  mint:{pbg:"linear-gradient(135deg,#EEF7F2,#D6EBDF)", blob:"rgba(31,107,90,.16)", label:"Mint"},
  noir:{pbg:"linear-gradient(135deg,#1A1714,#2E2822)", blob:"rgba(233,207,146,.12)", label:"Noir", dark:1},
  emerald:{pbg:"linear-gradient(135deg,#0F3B33,#17564A)", blob:"rgba(233,207,146,.14)", label:"Emerald", dark:1}
};
initDB();
function saveCfg(){ if(!store.set(DBKEY, DB)) toast(L === "bn" ? "ছবি অনেক বড়, এই ব্রাউজারে সেভ হয়নি" : "Image too large to save in this browser", L === "bn" ? "এই সেশনে দেখাবে, ছোট ছবি দিন" : "It shows for now; try a smaller image"); }
var BRAND = function(){ return cfg.brand.name || "Sitraya"; };
var logoSrc = function(kind){ return cfg.brand.logo || IMG["logo-" + kind] || ""; };

// ================= state =================
var cart = store.get("st3_cart", []).filter(function(l){ return BY[l.id] && BY[l.id].status === "active"; });
var wish = store.get("st3_wish", {});
var zone = "in", tab = "all";

// ================= static text =================
function applyStatic(){
  document.documentElement.lang = L;
  document.documentElement.dataset.skin = cfg.skin;
  document.title = BRAND() + (L === "bn" ? " — প্রিমিয়াম মডেস্ট ফ্যাশন" : " — Premium Modest Fashion");
  $$("[data-t]").forEach(function(el){ el.textContent = t(el.dataset.t); });
  $$("[data-tp]").forEach(function(el){ el.placeholder = t(el.dataset.tp); });
  $$("[data-ta]").forEach(function(el){ el.setAttribute("aria-label", t(el.dataset.ta)); });
  $$("[data-lang]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.lang === L)); });
  $$(".brandLogo").forEach(function(im){ im.src = logoSrc(im.dataset.logo); im.alt = BRAND(); });
  $("#fAbout").textContent = t("about").replace("{b}", BRAND());
  $("#fCopy").textContent = "© " + digits(2026) + " " + BRAND() + ". " + t("rights");
  $("#typed").textContent = t("typed")[0];
  $("#tickerBar").hidden = !cfg.tickerOn; applySettings();
  $("#fabWa").href = waBase() + "?text=" + encodeURIComponent(L === "bn" ? "আসসালামু আলাইকুম, আমি " + BRAND() + " থেকে অর্ডার করতে চাই।" : "Hello, I would like to order from " + BRAND() + ".");
}
function renderTicker(){
  var one = cfg.ticker.filter(function(x){ return tx(x); }).map(function(x){ return "<span><i></i>" + esc(tx(x)) + "</span>"; }).join("");
  $("#ticker").innerHTML = one + one;
}
(function(){ var wi = 0; if(reduce) return; setInterval(function(){ var w = t("typed"); wi = (wi + 1) % w.length; var el = $("#typed"); el.style.opacity = 0; setTimeout(function(){ el.textContent = w[wi]; el.style.opacity = 1; }, 250); }, 2800); })();

// ================= hero slider =================
var cur = 0, timer = null;
var liveSlides = function(){ return cfg.slides.filter(function(s){ return s.on; }); };
var sparks = function(){ var s = ""; for(var i = 0; i < 9; i++){ s += '<span class="spark" style="left:'+(8+Math.random()*84).toFixed(1)+'%;top:'+(6+Math.random()*80).toFixed(1)+'%;animation-delay:'+(Math.random()*3).toFixed(2)+'s"></span>'; } return s; };
function slideHTML(s, i){
  var g = SBG[s.bg] || SBG.emerald, hasText = !!tx(s.h), tag = i === 0 ? "h1" : "h2";
  var mv = s.vid ? parseVideo(s.vid) : null, fileV = !!(mv && mv.type === "file" && mv.src);
  var cta = '<a class="btn b-gold" href="#new" data-cat="'+esc(s.link)+'">'+esc(tx(s.btn) || t("shopnow"))+' '+ic("arrow")+'</a>' + (mv && !fileV ? '<button type="button" class="btn b-ghost vwatch" data-vpop="'+esc(s.vid)+'">'+ic("play")+esc(t("pvideo"))+'</button>' : '');
  var copy = '<div class="copy">'
    + (tx(s.pill) ? '<span class="pill"><b>'+(L === "bn" ? "নতুন" : "NEW")+'</b>'+esc(tx(s.pill))+'</span>' : '')
    + (hasText ? '<'+tag+'>'+esc(tx(s.h))+'</'+tag+'>' : '')
    + (tx(s.p) ? '<p>'+esc(tx(s.p))+'</p>' : '')
    + (CAT[s.link] && minOf(s.link) ? '<span class="from">'+fill(t("from"), money(minOf(s.link)))+'</span>' : '')
    + '<div class="cta">'+cta+'<a class="btn b-ghost" href="#categories">'+esc(t("allcats"))+'</a></div></div>';
  var style = '--bg:'+g.bg+';--glow:'+g.glow;
  if(s.img || fileV){
    var spos = (typeof SPOS !== "undefined" && SPOS[s.pos]) || "50% 50%", sfit = s.fit === "fill" ? "fill" : "fit", mob = s.imgM && !fileV;
    return '<div class="sl pic'+(i === 0 ? ' on' : '')+'" data-fit="'+sfit+'" style="'+style+';--pos:'+spos+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+'">'
      + (fileV ? '<video class="full" src="'+esc(mv.src)+'" autoplay muted loop playsinline preload="metadata"'+(s.img ? ' poster="'+I(s.img)+'"' : '')+' aria-label="'+esc(BRAND())+' video"></video>' : (mob ? '<picture><source media="(max-width:760px)" srcset="'+I(s.imgM)+'">' : '') + '<img class="full" src="'+I(s.img)+'" alt="'+esc(hasText ? tx(s.h) : BRAND() + " banner")+'"'+(i ? ' loading="lazy"' : ' fetchpriority="high"')+'>' + (mob ? '</picture>' : ''))
      + (hasText ? '<span class="shade"></span>' + copy : '<span class="glint"></span>' + (i === 0 ? '<h1 class="sr">'+esc(BRAND())+'</h1>' : '') + '<div class="solo">'+cta+'</div>')
      + '</div>';
  }
  var figs = (s.art || []).slice(0, 3);
  var cls = ["main","b1","b2"];
  return '<div class="sl'+(i === 0 ? ' on' : '')+'" style="'+style+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+'">' + copy
    + '<div class="art" aria-hidden="true"><span class="ring"></span><span class="ring r2"></span><span class="pedestal"></span>' + sparks()
    + (figs.length ? figs.map(function(k, j){ return '<div class="fig '+cls[j]+'"><div class="floaty" style="--d:'+(6+j*.7)+'s;--dl:'+(j*.6)+'s"><img src="'+I(k)+'" alt=""></div></div>'; }).join("") : '<div class="empty-art">'+esc(t("upload_hint"))+'</div>')
    + '</div></div>';
}
function renderSlides(keep){
  var live = liveSlides();
  if(!keep) cur = 0;
  if(cur >= live.length) cur = 0;
  $("#slides").innerHTML = live.length ? live.map(slideHTML).join("") : '<div class="sl on" style="--bg:'+SBG.emerald.bg+'"><div class="copy"><h2>'+esc(BRAND())+'</h2></div></div>';
  $("#dots").innerHTML = live.map(function(s, i){ return '<button class="sdot" aria-label="'+(i+1)+'"></button>'; }).join("");
  $("#dots").hidden = live.length < 2; $("#prev").hidden = $("#next").hidden = live.length < 2;
  $$("#dots .sdot").forEach(function(d, i){ d.addEventListener("click", function(){ go(i); play(); }); });
  go(cur, true); play();
}
function go(n, silent){
  var els = $$("#slides .sl"), ds = $$("#dots .sdot"); if(!els.length) return;
  cur = (n + els.length) % els.length;
  els.forEach(function(el, i){ el.classList.toggle("on", i === cur); });
  ds.forEach(function(el, i){ if(i === cur) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); });
  runProg();
}
function runProg(){
  var pr = $("#prog"); if(reduce || liveSlides().length < 2){ pr.style.width = "0"; return; }
  pr.style.transition = "none"; pr.style.width = "0"; void pr.offsetWidth;
  pr.style.transition = "width " + (cfg.interval * 1000) + "ms linear"; pr.style.width = "100%";
}
function play(){ stop(); if(reduce || liveSlides().length < 2) return; timer = setInterval(function(){ go(cur + 1); }, cfg.interval * 1000); runProg(); }
function stop(){ clearInterval(timer); var pr = $("#prog"); pr.style.transition = "none"; pr.style.width = "0"; }
$("#prev").addEventListener("click", function(){ go(cur - 1); play(); });
$("#next").addEventListener("click", function(){ go(cur + 1); play(); });
var sld = $("#slider"), sx = null;
sld.addEventListener("mouseenter", stop); sld.addEventListener("mouseleave", play);
sld.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, {passive:true});
sld.addEventListener("touchend", function(e){ if(sx === null) return; var dx = e.changedTouches[0].clientX - sx; if(Math.abs(dx) > 45){ go(cur + (dx < 0 ? 1 : -1)); play(); } sx = null; });
sld.addEventListener("mousemove", function(e){
  if(reduce) return;
  var r = sld.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  var el = $$("#slides .sl")[cur]; if(!el) return;
  el.querySelectorAll(".fig").forEach(function(f, i){ var k = i === 0 ? 16 : -10; f.style.translate = (x*k).toFixed(1) + "px " + (y*k*.6).toFixed(1) + "px"; });
});

function renderPromos(){
  var act = cfg.promos.filter(function(p){ return p.on; });
  $("#hside").innerHTML = act.length ? promoHTML(act[0], 0).replace('class="promo', 'class="promo side') : "";
  $("#htop").classList.toggle("solo-slider", !act.length);
  $("#promos").innerHTML = act.slice(1).map(promoHTML).join("");
  $("#promos").closest(".promo-sec").hidden = act.length < 2;
}
function promoHTML(c, i){
  {
    var b = PBG[c.bg] || PBG.rose, upl = !!c.img && /^(data:image\/|\/m\/|https:\/\/)/.test(c.img), pv = c.vid ? parseVideo(c.vid) : null, pfv = !!(pv && pv.type === "file" && pv.src);
    var style = '--pbg:'+b.pbg+';--blob:'+b.blob + (b.dark ? ';--ph:#fff;--pk:var(--gold-hi)' : '');
    return '<a class="promo'+(upl ? ' has-full' : '')+'" href="#new" data-cat="'+esc(c.link)+'" style="'+style+'">'
      + (pfv ? '<span class="ph full"><video src="'+esc(pv.src)+'" autoplay muted loop playsinline preload="metadata"'+(upl ? ' poster="'+I(c.img)+'"' : '')+'></video></span>' : upl ? '<span class="ph full"><img src="'+I(c.img)+'" alt="" loading="lazy" style="object-position:'+((typeof SPOS !== "undefined" && SPOS[c.pos]) || "50% 50%")+'"></span>' : '<span class="ph" aria-hidden="true"><span class="floaty" style="--d:'+(5.5+i*.6)+'s;--dl:'+(i*.7)+'s"><img src="'+I(c.img)+'" alt=""></span></span>')
      + (pv && !pfv ? '<span class="pvplay" role="button" tabindex="0" data-vpop="'+esc(c.vid)+'" aria-label="'+esc(t("pvideo"))+'">'+ic("play")+'</span>' : '')
      + '<span class="k">'+esc(tx(c.k))+'</span><h3>'+esc(tx(c.h))+'</h3>'
      + (CAT[c.link] && minOf(c.link) ? '<span class="pr">'+esc(fill(t("from_s"), money(minOf(c.link))))+'</span>' : '')
      + '<span class="lnk">'+esc(t("shopnow"))+' '+ic("arrow")+'</span></a>';
  }
}

// ================= categories =================
function renderCats(){
  $("#cats").innerHTML = CATS.map(function(c, i){
    return '<a class="cat" href="#new" data-cat="'+c.id+'"><span class="tile" style="--tint:'+c.tint+'"><span class="floaty" style="--d:'+(5+i%3)+'s;--dl:'+(i*.35)+'s"><img src="'+I(c.img)+'" alt="" loading="lazy"></span></span><span><b>'+esc(c[L])+'</b><small>'+esc(c[L === "bn" ? "en" : "bn"])+'</small></span></a>';
  }).join("");
  railBtns();
}
var rail = $("#cats");
function railBtns(){ $("#cPrev").disabled = rail.scrollLeft < 8; $("#cNext").disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8; }
$("#cPrev").addEventListener("click", function(){ rail.scrollBy({left:-rail.clientWidth * .8, behavior:"smooth"}); });
$("#cNext").addEventListener("click", function(){ rail.scrollBy({left:rail.clientWidth * .8, behavior:"smooth"}); });
rail.addEventListener("scroll", railBtns, {passive:true}); window.addEventListener("resize", railBtns);

// ================= top selling & brand banner =================
function renderTop(){
  $("#big2").innerHTML = PL().filter(function(p){ return p.top; }).map(function(p, i){
    var o = off(p);
    return '<article class="bigc rv-me"><span class="ribbon">'+ic("fire")+esc(t("best"))+'</span>'
      + '<button class="stg" data-qv="'+p.id+'" style="--tint:'+p.tint+'" aria-label="'+esc(nm(p))+'"><span class="stage-shadow" style="--d:6s;--dl:'+(i*.8)+'s"></span><span class="floaty" style="--d:6s;--dl:'+(i*.8)+'s"><img src="'+I(p.img || p.id)+'" alt="'+esc(nm(p))+'"></span></button>'
      + '<div class="info"><span class="cl">'+esc(CAT[p.cat][L])+'</span><h3>'+esc(nm(p))+'</h3><span class="alt">'+esc(alt(p))+'</span>'
      + '<div class="prc"><span class="now">'+money(price(p))+'</span>'+(o ? '<s>'+money(p.price)+'</s>' : '')+'</div>'
      + (o ? '<span class="save">'+esc(t("save"))+' '+money(p.price - price(p))+'</span>' : '')
      + '<div class="btns"><button class="btn b-out" data-add="'+p.id+'">'+ic("bag")+esc(t("add"))+'</button><button class="btn b-em" data-buy="'+p.id+'">'+ic("bolt")+esc(t("buynow"))+'</button></div></div></article>';
  }).join("");
}
function renderBB(){
  $("#bbH").textContent = tx(cfg.bb.h); $("#bbL").textContent = tx(cfg.bb.line);
  if($("#bbStage").childElementCount) return;
  $("#bbStage").innerHTML = [
    {k:"n2", l:"6%", w:"30%", ph:"40%", pl:"4%", pw:"34%"},
    {k:"b2", l:"34%", w:"36%", ph:"28%", pl:"33%", pw:"38%"},
    {k:"n1", l:"68%", w:"30%", ph:"46%", pl:"66%", pw:"32%"}
  ].map(function(s, i){
    return '<span class="plinth" style="left:'+s.pl+';width:'+s.pw+';height:'+s.ph+'"></span>'
      + '<div class="fig" style="left:'+s.l+';width:'+s.w+';bottom:calc('+s.ph+' + 4px)"><div class="floaty" style="--d:'+(6+i*.7)+'s;--dl:'+(i*.5)+'s"><img src="'+I(s.k)+'" alt=""></div></div>';
  }).join("");
}

// ================= product grids =================
function card(p, i){
  var o = off(p), on = !!wish[p.id];
  return '<article class="card rv-me" style="--tint:'+p.tint+'">'
    + '<div class="stg"><button class="open" data-qv="'+p.id+'" aria-label="'+esc(nm(p))+'"></button>'
    + (p.isNew ? '<span class="tag l">'+esc(t("newtag"))+'</span>' : '')
    + (o ? '<span class="tag r">'+esc(t("save"))+' '+num(o)+'%</span>' : '')
    + '<span class="floaty" style="--d:'+(5+(i%4)*.6)+'s;--dl:'+((i%5)*.4)+'s"><img src="'+I(p.img || p.id)+'" alt="'+esc(nm(p))+'" loading="lazy"></span>'
    + (p.video ? '<span class="vbadge" title="'+esc(t("pvideo"))+'">'+ic("play")+'</span>' : '')
    + '<button class="heart" data-wish="'+p.id+'" aria-pressed="'+on+'" aria-label="'+esc(t("wishlist"))+'">'+ic("heart")+'</button></div>'
    + '<div class="bd"><button class="nm" data-qv="'+p.id+'">'+esc(nm(p))+'</button><span class="alt">'+esc(alt(p))+'</span>'
    + '<div class="prc"><span class="now">'+money(price(p))+'</span>'+(o ? '<s>'+money(p.price)+'</s>' : '')+'</div>'
    + (totalStock(p) ? '<button class="btn b-em add" data-add="'+p.id+'">'+ic("bag")+esc(t("add"))+'</button>' : '<button class="btn add" disabled>'+esc(t("oos"))+'</button>') + '</div></article>';
}
var TABS = ["all","sale","abaya","three","hijab","kurti","women","men","kids"];
function tabLabel(id){ return id === "all" ? t("all") : id === "sale" ? t("sale") : t("c_" + id); }
function renderTabs(){ $("#tabs").innerHTML = TABS.map(function(id){ return '<button class="tab" role="tab" aria-selected="'+(id === tab)+'" data-tab="'+id+'">'+esc(tabLabel(id))+'</button>'; }).join(""); }
function listFor(id){
  if(id === "all") return PL().filter(function(p){ return p.isNew; });
  if(id === "sale") return PL().filter(function(p){ return off(p); });
  return PL().filter(function(p){ return p.cat === id; });
}
function renderGrids(){
  var l = listFor(tab);
  $("#newGrid").innerHTML = l.length ? l.map(card).join("") : '<p class="empty">'+esc(t("empty_cat"))+'</p>';
  $("#rowAbaya").innerHTML = PL().filter(function(p){ return p.cat === "abaya" || p.cat === "hijab"; }).slice(0, 5).map(card).join("");
  $("#rowThree").innerHTML = PL().filter(function(p){ return p.cat === "three" || p.cat === "kurti"; }).slice(0, 5).map(card).join("");
  var wc = Object.keys(wish).length; $("#wishCount").textContent = num(wc); $("#wishCount").hidden = !wc;
  observe();
}
function setTab(id){ tab = id; renderTabs(); renderGrids(); }

// ================= reveal on scroll =================
var io = ("IntersectionObserver" in window) && !reduce ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var el = e.target; el.classList.add("in"); io.unobserve(el); setTimeout(function(){ el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1400); } }); }, {rootMargin:"0px 0px -8% 0px"}) : null;
function observe(){
  if(!io) return;
  var vh = window.innerHeight;
  $$(".rv-me:not(.rvd)").forEach(function(el, i){
    el.classList.add("rvd");
    if(el.getBoundingClientRect().top > vh){ el.classList.add("rv"); el.style.transitionDelay = ((i % 5) * 70) + "ms"; io.observe(el); }
  });
}

// ================= toast & fly =================
var tTimer;
function toast(title, sub, thumbKey, showGo){
  var th = $("#toTh");
  if(thumbKey && BY[thumbKey]){ th.style.setProperty("--tint", BY[thumbKey].tint); th.innerHTML = '<img src="'+I(BY[thumbKey].img || thumbKey)+'" alt="">'; }
  else { th.style.removeProperty("--tint"); th.innerHTML = ic("check"); }
  $("#toT").textContent = title; $("#toS").textContent = sub || "";
  $("#toGo").hidden = !showGo; $("#toGo").textContent = t("viewbag");
  var el = $("#toast"), bar = $("#toBar");
  el.classList.add("on");
  bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth;
  bar.style.transition = "transform 3s linear"; bar.style.transform = "scaleX(0)";
  clearTimeout(tTimer); tTimer = setTimeout(function(){ el.classList.remove("on"); }, 3000);
}
$("#toGo").addEventListener("click", function(){ $("#toast").classList.remove("on"); openCart(); });
$$("[data-toastk]").forEach(function(b){ b.addEventListener("click", function(){ toast(t(b.dataset.toastk), "Demo"); }); });
function fly(fromEl, key){
  if(reduce || !fromEl) return;
  var tgt = [$("#miniCart"), $("#tbCart"), $("#openCart")].filter(function(x){ return x && x.getClientRects().length && getComputedStyle(x).display !== "none"; })[0];
  if(!tgt) return;
  var a = fromEl.getBoundingClientRect(), b = tgt.getBoundingClientRect();
  var img = document.createElement("img"); img.src = I((BY[key] || {}).img || key); img.className = "flyer"; img.alt = "";
  img.style.left = (a.left + a.width / 2 - 45) + "px"; img.style.top = (a.top + a.height / 2 - 60) + "px";
  document.body.appendChild(img);
  var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  var an = img.animate([
    {transform:"translate(0,0) scale(1)", opacity:1},
    {transform:"translate("+(dx*.5)+"px,"+(dy*.5 - 120)+"px) scale(.7) rotate(-12deg)", opacity:1, offset:.5},
    {transform:"translate("+dx+"px,"+dy+"px) scale(.15)", opacity:.3}
  ], {duration:850, easing:"cubic-bezier(.5,0,.3,1)"});
  an.onfinish = function(){ img.remove(); [$("#miniCart"), $("#cartCount"), $("#tbCount")].forEach(function(el){ el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }); };
}

// ================= cart =================
function add(id, size, qty, color){
  var p = BY[id]; if(!p) return false;
  if(!size){ var v = firstAvail(p); if(!v){ toast(t("oos"), nm(p), id); return false; } size = v.size; color = v.color; }
  color = color || p.colors[0];
  var left = stockOf(p, size, color) - inCart(id, size, color);
  if(left < qty){ toast(left > 0 ? fill(t("only_left"), num(left)) : t("oos"), nm(p), id); return false; }
  var l = cart.filter(function(x){ return x.id === id && x.size === size && x.color === color; })[0];
  if(l) l.qty += qty; else cart.push({id:id, size:size, color:color, qty:qty});
  saveCart(); return {size:size, color:color};
}
function totals(){
  var D = cfg.delivery;
  var sub = cart.reduce(function(a, l){ return a + price(BY[l.id]) * l.qty; }, 0);
  var free = zone === "in" && sub >= D.free;
  var del = !cart.length ? 0 : free ? 0 : (zone === "in" ? D.inside : D.outside);
  var disc = couponDisc(sub);
  return {sub:sub, disc:disc, del:del, free:free, tot:sub - disc + del, n:cart.reduce(function(a, l){ return a + l.qty; }, 0)};
}
function saveCart(){
  store.set("st3_cart", cart);
  var s = totals();
  $("#cartCount").textContent = num(s.n); $("#tbCount").textContent = num(s.n);
  $("#mcN").textContent = num(s.n) + " " + t("items"); $("#mcT").textContent = money(s.sub);
}
function waText(){
  var s = totals();
  var lines = cart.map(function(l, i){ var p = BY[l.id]; return (i + 1) + ". " + p[L] + " (" + l.size + ") x" + l.qty + " = " + money(price(p) * l.qty); });
  return (L === "bn" ? "আসসালামু আলাইকুম, আমি " + BRAND() + " থেকে অর্ডার করতে চাই:\n" : "Hello, I would like to order from " + BRAND() + ":\n")
    + lines.join("\n") + "\n" + t("subtotal") + ": " + money(s.sub) + "\n" + t("delivery") + " (" + t(zone === "in" ? "inside" : "outside") + "): " + (s.free ? t("free") : money(s.del)) + "\n" + t("total") + ": " + money(s.tot);
}
function renderCart(){
  if(bagView !== "cart"){ renderCheckout(); return; }
  $("#bagWa").hidden = false; $("#checkout span").textContent = t("checkout");
  var s = totals(), D = cfg.delivery;
  $("#bagN").textContent = num(s.n);
  var need = Math.max(0, D.free - s.sub), pct = Math.min(100, s.sub / D.free * 100);
  $("#freebar").hidden = !cart.length;
  $("#freeMsg").innerHTML = zone !== "in" ? t("free_out") : need ? fill(t("free_need"), money(need)) : t("free_got");
  $("#fbFill").style.width = (zone === "in" ? pct : 0) + "%"; $("#fbTruck").style.left = Math.max(4, zone === "in" ? pct : 0) + "%";
  if(!cart.length){
    $("#bagBody").innerHTML = '<div class="dempty"><span class="bag floaty" style="--d:4s">'+ic("bag")+'</span><h3>'+esc(t("empty_h"))+'</h3><p>'+esc(t("empty_p"))+'</p><button class="btn b-gold" data-close data-cat="all">'+esc(t("start"))+' '+ic("arrow")+'</button></div>';
    $("#bagFoot").hidden = true; return;
  }
  $("#bagFoot").hidden = false;
  var ups = PL().filter(function(p){ return !cart.some(function(l){ return l.id === p.id; }); }).slice(0, 3);
  $("#bagBody").innerHTML = cart.map(function(l, i){
    var p = BY[l.id];
    return '<div class="ln" style="animation-delay:'+(i*60)+'ms"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span><div>'
      + '<div class="tp"><b>'+esc(nm(p))+'</b><button class="trash" data-rm="'+i+'" aria-label="Remove">'+ic("trash")+'</button></div>'
      + '<div class="meta">'+esc(t("size"))+' '+esc(l.size)+' · <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:'+l.color+';vertical-align:-1px;border:1px solid rgba(0,0,0,.15)"></span> · '+money(price(p))+' '+esc(t("each"))+'</div>'
      + '<div class="bt"><span class="stepper"><button data-dec="'+i+'" aria-label="−">−</button><span>'+num(l.qty)+'</span><button data-inc="'+i+'" aria-label="+">+</button></span><strong>'+money(price(p) * l.qty)+'</strong></div></div></div>';
  }).join("") + '<div class="ups"><h4>'+esc(t("maylike"))+'</h4><div class="row3">' + ups.map(function(p){
    return '<div class="up"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span>'+money(price(p))+'<button data-addq="'+p.id+'" aria-label="'+esc(t("add"))+'">'+ic("plus")+'</button></div>';
  }).join("") + '</div></div>';
  paintSums(s);
  $("#bagWa").href = waBase() + "?text=" + encodeURIComponent(waText());
}
$("#bagBody").addEventListener("click", function(e){
  var b = e.target.closest("[data-inc],[data-dec],[data-rm],[data-addq]"); if(!b) return;
  if(b.dataset.addq){ add(b.dataset.addq, null, 1); }
  else if(b.dataset.inc !== undefined){ var l = cart[+b.dataset.inc]; if(l.qty < stockOf(BY[l.id], l.size, l.color)) l.qty++; else toast(fill(t("only_left"), num(l.qty)), nm(BY[l.id]), l.id); }
  else if(b.dataset.dec !== undefined){ var k = +b.dataset.dec; cart[k].qty--; if(cart[k].qty < 1) cart.splice(k, 1); }
  else { cart.splice(+b.dataset.rm, 1); }
  saveCart(); renderCart();
});
$("#zIn").addEventListener("click", function(){ zone = "in"; $("#zIn").setAttribute("aria-pressed", "true"); $("#zOut").setAttribute("aria-pressed", "false"); renderCart(); });
$("#zOut").addEventListener("click", function(){ zone = "out"; $("#zOut").setAttribute("aria-pressed", "true"); $("#zIn").setAttribute("aria-pressed", "false"); renderCart(); });
$("#checkout").addEventListener("click", function(){ if(bagView === "cart") openCheckout(); else placeOrder(); });

// ================= overlays =================
var lastFocus = null;
var PANELS = ["#menu", "#cart", "#pm", "#search", "#trk"];
function openPanel(el){
  lastFocus = document.activeElement; closeAll(true);
  el.classList.add("on"); el.setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on"); document.body.style.overflow = "hidden";
  var f = el.querySelector((el.id === "search" && typeof touchUI === "function" && touchUI()) ? ".x" : "input[type=search],.x"); if(f) setTimeout(function(){ f.focus({preventScroll:true}); }, 80);
}
function closeAll(silent){
  PANELS.forEach(function(s){ var el = $(s); el.classList.remove("on"); el.setAttribute("aria-hidden", "true"); });
  $("#scrim").classList.remove("on"); document.body.style.overflow = "";
  if(!silent && lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
}
function openCart(){ if(bagView === "done") bagView = "cart"; renderCart(); openPanel($("#cart")); }
$("#scrim").addEventListener("click", function(){ closeAll(); });
document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeAll(); });
["#openCart", "#miniCart", "#tbCart"].forEach(function(s){ $(s).addEventListener("click", openCart); });
["#openSearch2", "#tbSearch"].forEach(function(s){ $(s).addEventListener("click", function(){ openPanel($("#search")); runSearch(); }); });
["#openMenu", "#tbMenu"].forEach(function(s){ $(s).addEventListener("click", function(){ openPanel($("#menu")); }); });
function wishMsg(){ var n = Object.keys(wish).length; toast(n ? fill(t("wish_count"), num(n)) : t("wish_empty"), t("wishlist")); }
$("#wishBtn").addEventListener("click", wishMsg); $("#tbWish").addEventListener("click", wishMsg);
function renderMenu(){
  $("#mnav").innerHTML = [{id:"all", bn:t("newin"), en:t("newin"), img:"n2"}, {id:"sale", bn:"অফার জোন", en:"Offer Zone", img:"b5"}].concat(CATS).map(function(c){
    return '<a href="#new" data-cat="'+c.id+'"><span class="th"><img src="'+I(c.img)+'" alt=""></span>'+esc(c[L])+'<small>'+esc(c[L === "bn" ? "en" : "bn"])+'</small></a>';
  }).join("");
}

// ================= product modal =================
var pm = {};
var BGS = [function(p){ return "radial-gradient(circle at 50% 55%,#fff 0,"+p.tint+" 70%)"; }, function(){ return "radial-gradient(circle at 50% 55%,#2A2520 0,#0A0908 75%)"; }, function(){ return "radial-gradient(circle at 50% 55%,#FFF8EA 0,#EAD9B4 75%)"; }];
function openPM(id){
  var p = BY[id];
  var fv = firstAvail(p) || (p.variants || [])[0] || {size:p.sizes[0], color:p.colors[0]}; pm = {id:id, size:fv.size, color:fv.color, qty:1, bg:0};
  $("#pmImg").src = I(p.img || p.id); $("#pmImg").alt = nm(p);
  $("#mstage").style.setProperty("--mbg", BGS[0](p));
  $("#pmThumbs").innerHTML = (p.gallery && p.gallery.length)
    ? [p.img || p.id].concat(p.gallery).map(function(k, i){ return '<button data-gi="'+i+'" aria-pressed="'+(i === 0)+'" aria-label="'+(i+1)+'" style="background:'+BGS[0](p)+'"><img src="'+I(k)+'" alt=""></button>'; }).join("")
    : BGS.map(function(f, i){ return '<button data-bg="'+i+'" aria-pressed="'+(i === 0)+'" aria-label="'+(i+1)+'" style="background:'+f(p)+'"><img src="'+I(p.img || p.id)+'" alt=""></button>'; }).join("");
  var vb = $("#pmVid"); vb.hidden = !p.video; vb.innerHTML = p.video ? '<h3 class="pv-h">'+ic("play")+esc(t("pvideo"))+'</h3>' + videoBlock(p.video) : "";
  renderPMInfo(true);
  openPanel($("#pm"));
}
function renderPMInfo(anim){
  var p = BY[pm.id], o = off(p), left = stockOf(p, pm.size, pm.color) - inCart(p.id, pm.size, pm.color), dis = left < 1;
  $("#pmInfo").innerHTML = '<button class="x" data-close aria-label="'+esc(t("close"))+'">'+ic("x")+'</button>'
    + '<span class="crumb">'+esc(t("home"))+' / <b>'+esc(CAT[p.cat][L])+'</b></span>'
    + '<h2 id="pmName">'+esc(nm(p))+'</h2><span class="alt">'+esc(alt(p))+'</span>'
    + '<div class="prc"><span class="now">'+money(price(p))+'</span>'+(o ? '<s>'+money(p.price)+'</s><span class="save">'+esc(t("save"))+' '+money(p.price - price(p))+' ('+num(o)+'%)</span>' : '')+'</div>'
    + '<p class="desc">'+esc(L === "bn" ? p.dbn : p.den)+'</p>'
    + '<div class="opt"><span>'+esc(t("color"))+'</span><div class="sw">'+p.colors.map(function(c, i){ return '<button data-color="'+c+'" aria-pressed="'+(c === pm.color)+'" aria-label="'+esc(t("color"))+' '+(i+1)+'" style="background:'+c+'"></button>'; }).join("")+'</div></div>'
    + '<div class="opt"><span>'+esc(t("size"))+'</span><div class="sizes">'+p.sizes.map(function(s){ var z = stockOf(p, s, pm.color) < 1; return '<button class="size" data-size="'+esc(s)+'" aria-pressed="'+(s === pm.size)+'"'+(z ? ' disabled title="'+esc(t("oos"))+'"' : '')+'>'+esc(s)+'</button>'; }).join("")+'</div></div>'
    + '<div class="qrow"><span class="stepper"><button id="pmMinus" aria-label="−">−</button><span>'+num(pm.qty)+'</span><button id="pmPlus" aria-label="+">+</button></span><span class="stock'+(dis ? ' out' : left <= 3 ? ' low' : '')+'"><i></i>'+esc(dis ? t("oos") : left <= 3 ? fill(t("only_left"), num(left)) : t("instock"))+'</span></div>'
    + '<div class="mbtns"><button class="btn b-gold" id="pmAdd"'+(dis ? ' disabled' : '')+'>'+ic("bag")+esc(t("addcaps"))+'</button><button class="btn b-ink" id="pmBuy"'+(dis ? ' disabled' : '')+'>'+esc(t("buynow"))+'</button>'
    + '<a class="btn b-wa" target="_blank" rel="noopener" href="'+waBase()+'?text='+encodeURIComponent((L === "bn" ? "আসসালামু আলাইকুম, আমি অর্ডার করতে চাই:\n" : "Hello, I would like to order:\n") + p[L] + "\n" + t("size") + ": " + pm.size + "\n" + t("qty") + ": " + pm.qty + "\n" + money(price(p) * pm.qty))+'">'+ic("wa")+esc(t("waorder"))+'</a>'
    + '<button class="btn b-navy" id="pmCall">'+ic("call")+esc(t("callorder"))+'</button></div>'
    + '<div class="dinfo"><div>'+ic("truck")+'<span><b>'+esc(t("d1t"))+'</b><br>'+esc(t("d1s"))+'</span></div><div>'+ic("cash")+'<span><b>'+esc(t("d2t"))+'</b><br>'+esc(t("d2s"))+'</span></div></div>';
  if(!anim) $$("#pmInfo > *").forEach(function(el){ el.style.animation = "none"; });
}
$("#pm").addEventListener("click", function(e){
  var b;
  if((b = e.target.closest("[data-color]"))){ pm.color = b.dataset.color; if(stockOf(BY[pm.id], pm.size, pm.color) < 1){ var fa = firstAvail(BY[pm.id], pm.color); if(fa) pm.size = fa.size; } pm.qty = 1; renderPMInfo(); }
  else if((b = e.target.closest("[data-size]"))){ pm.size = b.dataset.size; pm.qty = 1; renderPMInfo(); }
  else if((b = e.target.closest("[data-bg]"))){ pm.bg = +b.dataset.bg; $("#mstage").style.setProperty("--mbg", BGS[pm.bg](BY[pm.id])); $$("#pmThumbs button").forEach(function(x, i){ x.setAttribute("aria-pressed", String(i === pm.bg)); }); }
  else if(e.target.closest("#pmMinus")){ pm.qty = Math.max(1, pm.qty - 1); renderPMInfo(); }
  else if(e.target.closest("#pmPlus")){ pm.qty = Math.min(Math.max(1, stockOf(BY[pm.id], pm.size, pm.color) - inCart(pm.id, pm.size, pm.color)), pm.qty + 1); renderPMInfo(); }
  else if(e.target.closest("#pmAdd")){ if(add(pm.id, pm.size, pm.qty, pm.color)){ closeAll(true); fly($("#mstage"), pm.id); toast(nm(BY[pm.id]), t("size") + " " + pm.size + " · " + t("added"), pm.id, true); } }
  else if(e.target.closest("#pmBuy")){ if(add(pm.id, pm.size, pm.qty, pm.color)) openCart(); }
  else if(e.target.closest("#pmCall")){ toast(t("callorder"), t("call_soon")); }
});
var ms = $("#mstage");
ms.addEventListener("mousemove", function(e){ var r = ms.getBoundingClientRect(), img = $("#pmImg"); img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%"; img.style.transform = "scale(1.6)"; });
ms.addEventListener("mouseleave", function(){ $("#pmImg").style.transform = ""; });

// ================= search =================
function renderChips(){
  var words = L === "bn" ? ["আবায়া","বোরকা","থ্রি-পিস","হিজাব","কুর্তি","পাঞ্জাবি"] : ["Abaya","Burqa","Three Piece","Hijab","Kurti","Panjabi"];
  $("#chips").innerHTML = '<span>'+esc(t("popular"))+'</span>' + words.map(function(w){ return '<button data-chip="'+esc(w)+'">'+esc(w)+'</button>'; }).join("");
}
$("#chips").addEventListener("click", function(e){ var b = e.target.closest("[data-chip]"); if(b){ $("#q").value = b.dataset.chip; runSearch(); } });
function runSearch(){
  var q = $("#q").value.trim().toLowerCase();
  var res = PL().filter(function(p){ return !q || (p.en + " " + p.bn + " " + CAT[p.cat].en + " " + CAT[p.cat].bn).toLowerCase().indexOf(q) > -1; });
  $("#sres").innerHTML = res.length ? res.map(function(p, i){
    return '<button data-qv="'+p.id+'" style="animation-delay:'+(i*30)+'ms"><span class="th" style="--tint:'+p.tint+'"><img src="'+I(p.img || p.id)+'" alt=""></span><span><b>'+esc(nm(p))+'</b><span style="color:var(--muted);font-size:14px;display:block">'+esc(alt(p))+'</span><small>'+money(price(p))+'</small></span></button>';
  }).join("") : '<p style="color:var(--muted);font-size:17px">'+esc(fill(t("noresult"), q))+'</p>';
}
$("#q").addEventListener("input", runSearch);

// ================= global clicks =================
document.addEventListener("click", function(e){
  if(e.target.closest("#admin")) return;
  var tkl = e.target.closest('a[href="#track"]'); if(tkl){ e.preventDefault(); openTrack(); return; }
  var adl = e.target.closest('a[href="#admin"]'); if(adl){ e.preventDefault(); goAdmin(true); return; }
  var el = e.target.closest("[data-lang]");
  if(el){ L = el.dataset.lang; store.set("st3_lang", L); renderAll(true); return; }
  if(e.target.closest("#cz")) return;
  var tg = e.target.closest("[data-tab],[data-cat],[data-wish],[data-add],[data-buy],[data-qv],[data-close]");
  if(!tg) return;
  if(tg.dataset.tab){ setTab(tg.dataset.tab); return; }
  if(tg.dataset.wish){
    var id = tg.dataset.wish; if(wish[id]) delete wish[id]; else wish[id] = 1; store.set("st3_wish", wish);
    tg.setAttribute("aria-pressed", String(!!wish[id])); tg.classList.remove("bump"); void tg.offsetWidth; tg.classList.add("bump");
    var wc = Object.keys(wish).length; $("#wishCount").textContent = num(wc); $("#wishCount").hidden = !wc;
    toast(wish[id] ? t("wish_saved") : t("wish_removed"), nm(BY[id]), id); return;
  }
  if(tg.dataset.add){ var p = BY[tg.dataset.add], rr = add(p.id, null, 1); if(rr){ var src = tg.closest(".card,.bigc"); fly(src ? src.querySelector("img") : tg, p.id); toast(nm(p), t("size") + " " + rr.size + " · " + t("added"), p.id, true); } return; }
  if(tg.dataset.buy){ if(add(tg.dataset.buy, null, 1)) openCart(); return; }
  if(tg.dataset.qv){ openPM(tg.dataset.qv); return; }
  if(tg.dataset.cat){
    setTab(tg.dataset.cat); closeAll(true);
    if(tg.getAttribute("href") === "#new" || tg.tagName === "BUTTON"){ e.preventDefault(); $("#new").scrollIntoView({behavior: reduce ? "auto" : "smooth", block:"start"}); }
    return;
  }
  if(tg.hasAttribute("data-close")) closeAll();
});
window.addEventListener("scroll", function(){ $("#toTop").classList.toggle("on", window.scrollY > 700); }, {passive:true});
$("#toTop").addEventListener("click", function(){ window.scrollTo({top:0, behavior: reduce ? "auto" : "smooth"}); });
if(!reduce){ var lv = ""; for(var i = 0; i < 14; i++){ lv += '<span class="leafy" style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(40+Math.random()*60).toFixed(1)+'%;animation-duration:'+(7+Math.random()*8).toFixed(1)+'s;animation-delay:'+(-Math.random()*10).toFixed(1)+'s"></span>'; } $("#leaves").innerHTML = lv; }
$("#nlForm").addEventListener("submit", function(e){
  e.preventDefault();
  var v = $("#nlEmail").value.trim(), m = $("#nlMsg");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ m.style.color = "#FFC9D2"; m.textContent = t("news_bad"); return; }
  m.style.color = ""; m.textContent = t("news_ok"); $("#nlEmail").value = "";
});

// ================= CUSTOMIZE PANEL (admin preview) =================
var czTab = "slider";
var CZT = [["slider","Slider · স্লাইডার"],["banners","Banners · ব্যানার"],["brand","Brand · ব্র্যান্ড"],["theme","Theme · থিম"]];
var linkOpts = function(sel){ return [["all","New arrivals · নতুন"],["sale","Offers · অফার"]].concat(CATS.map(function(c){ return [c.id, c.en + " · " + c.bn]; })).map(function(o){ return '<option value="'+o[0]+'"'+(o[0] === sel ? ' selected' : '')+'>'+esc(o[1])+'</option>'; }).join(""); };
var bgOpts = function(map, sel){ return Object.keys(map).map(function(k){ return '<option value="'+k+'"'+(k === sel ? ' selected' : '')+'>'+esc(map[k].label)+'</option>'; }).join(""); };
var fld = function(label, path, val, area){ return '<label class="fld">'+esc(label)+(area ? '<textarea data-path="'+path+'">'+esc(val)+'</textarea>' : '<input type="text" data-path="'+path+'" value="'+esc(val)+'">')+'</label>'; };
var pair = function(label, path, obj, area){ return '<div class="two">'+fld(label + " (বাংলা)", path + ".bn", obj.bn, area)+fld(label + " (English)", path + ".en", obj.en, area)+'</div>'; };
var toggle = function(path, on, label){ return '<label class="sw2"><input type="checkbox" data-path="'+path+'"'+(on ? ' checked' : '')+'><i></i>'+esc(label)+'</label>'; };
var vfield = function(path, val){ val = val || ""; var isUp = val.indexOf("idb:") === 0, mv = val ? parseVideo(val) : null;
  return '<div class="fld">Video · ভিডিও <span style="font-weight:500">(optional)</span></div><div class="vrow2"><input type="text" data-path="'+path+'" value="'+esc(isUp ? "" : val)+'" placeholder="'+(isUp ? "Uploaded video in use" : "YouTube, Facebook or .mp4 link")+'" aria-label="Video link"><label class="up-btn">'+ic("upload")+'Upload video<input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" data-vidup="'+path+'"></label></div>'
    + (val ? '<div class="vstat'+(mv ? '' : ' bad')+'">'+(mv ? ic("check") + (isUp ? 'Uploaded video ready' : mv.name + ' video found') + (mv.type === "file" ? ' · plays silently in the background' : ' · adds a “Product video” button') : ic("info") + 'Not a YouTube, Facebook or video-file link')+'<button class="lnkbtn" data-act="clearvid" data-path="'+path+'">Remove</button></div>' : ''); };
var upl = function(path, img, contain){ return '<div class="imgrow"><span class="pv'+(contain ? ' contain' : '')+'" style="background-image:url(\''+(img ? I(img) : '')+'\')"></span><label class="up-btn">'+ic("upload")+'Upload image · ছবি দিন<input type="file" accept="image/*" data-img="'+path+'"></label>'+(img && img.indexOf("data:") === 0 ? '<button class="lnkbtn" data-act="clearimg" data-path="'+path+'">Remove</button>' : '')+'</div>'; };
function renderCZ(){
  $("#czTabs").innerHTML = CZT.map(function(x){ return '<button role="tab" aria-selected="'+(x[0] === czTab)+'" data-cztab="'+x[0]+'">'+esc(x[1])+'</button>'; }).join("");
  var h = "";
  if(czTab === "slider"){
    h += '<div class="blk"><label class="fld">Auto-slide every (seconds) · কত সেকেন্ড পর পর<input type="number" min="3" max="20" step=".5" data-path="interval" data-num="1" value="'+esc(cfg.interval)+'"></label></div>';
    h += cfg.slides.map(function(s, i){
      var title = tx(s.h) || (s.img === "cover" ? "Brand cover photo" : "Slide " + (i + 1));
      return '<div class="blk'+(s.on ? '' : ' off')+'"><div class="blk-h"><b>'+(i + 1)+'. '+esc(title)+'</b>'
        + '<button class="mini" data-act="up" data-i="'+i+'"'+(i === 0 ? ' disabled' : '')+' aria-label="Move up">'+ic("up2")+'</button>'
        + '<button class="mini" data-act="down" data-i="'+i+'"'+(i === cfg.slides.length - 1 ? ' disabled' : '')+' aria-label="Move down">'+ic("down2")+'</button>'
        + '<button class="mini danger" data-act="del" data-i="'+i+'" aria-label="Delete">'+ic("trash")+'</button></div>'
        + toggle("slides." + i + ".on", s.on, "Show this slide · দেখাও")
        + '<div class="fld">Banner image · ব্যানার ছবি (empty = illustrated design)</div>' + upl("slides." + i + ".img", s.img)
        + '<div class="fld">Phone banner · মোবাইলের ছবি <span style="font-weight:500">(optional · e.g. 1080×1080 or 1080×1350)</span></div>' + upl("slides." + i + ".imgM", s.imgM)
        + '<div class="two"><label class="fld">On phones · ফোনে<select data-path="slides.'+i+'.fit"><option value="fit"'+(s.fit !== "fill" ? ' selected' : '')+'>No crop · পুরো ছবি</option><option value="fill"'+(s.fit === "fill" ? ' selected' : '')+'>Fill · ভরাট</option></select></label>'
        + '<label class="fld">Keep in view · যে অংশ দেখাবে<select data-path="slides.'+i+'.pos">' + [["top","Top · উপর"],["upper","Upper · উপরের দিক"],["center","Middle · মাঝ"],["lower","Lower · নিচের দিক"],["bottom","Bottom · নিচ"],["left","Left · বাম"],["right","Right · ডান"]].map(function(o){ return '<option value="'+o[0]+'"'+((s.pos || "center") === o[0] ? ' selected' : '')+'>'+o[1]+'</option>'; }).join("") + '</select></label></div>'
        + vfield("slides." + i + ".vid", s.vid)
        + (s.img === "cover" ? '<button class="lnkbtn" style="align-self:flex-start;color:var(--muted)" data-act="nocover" data-i="'+i+'">Use illustrated design instead</button>' : '')
        + pair("Heading · শিরোনাম", "slides." + i + ".h", s.h)
        + pair("Small label · ছোট লেবেল", "slides." + i + ".pill", s.pill)
        + pair("Text · বিবরণ", "slides." + i + ".p", s.p, true)
        + pair("Button text · বোতাম", "slides." + i + ".btn", s.btn)
        + '<div class="two"><label class="fld">Button link · লিংক<select data-path="slides.'+i+'.link">'+linkOpts(s.link)+'</select></label><label class="fld">Background · ব্যাকগ্রাউন্ড<select data-path="slides.'+i+'.bg">'+bgOpts(SBG, s.bg)+'</select></label></div>'
        + '</div>';
    }).join("");
    h += '<div class="addrow"><button class="btn b-em" data-act="addslide">'+ic("plus")+'Add slide · স্লাইড যোগ</button></div>';
  } else if(czTab === "banners"){
    h += cfg.promos.map(function(c, i){
      return '<div class="blk'+(c.on ? '' : ' off')+'"><div class="blk-h"><b>Banner '+(i + 1)+' · '+esc(tx(c.h))+'</b>'
        + '<button class="mini" data-act="pup" data-i="'+i+'"'+(i === 0 ? ' disabled' : '')+' aria-label="Move up">'+ic("up2")+'</button>'
        + '<button class="mini" data-act="pdown" data-i="'+i+'"'+(i === cfg.promos.length - 1 ? ' disabled' : '')+' aria-label="Move down">'+ic("down2")+'</button></div>'
        + toggle("promos." + i + ".on", c.on, "Show · দেখাও") + upl("promos." + i + ".img", c.img, true)
        + '<label class="fld">Keep in view (photo banners) · যে অংশ দেখাবে<select data-path="promos.'+i+'.pos">' + [["top","Top · উপর"],["upper","Upper · উপরের দিক"],["center","Middle · মাঝ"],["lower","Lower · নিচের দিক"],["bottom","Bottom · নিচ"],["left","Left · বাম"],["right","Right · ডান"]].map(function(o){ return '<option value="'+o[0]+'"'+((c.pos || "center") === o[0] ? ' selected' : '')+'>'+o[1]+'</option>'; }).join("") + '</select></label>'
        + vfield("promos." + i + ".vid", c.vid)
        + pair("Title · শিরোনাম", "promos." + i + ".h", c.h) + pair("Label · লেবেল", "promos." + i + ".k", c.k)
        + '<div class="two"><label class="fld">Link · লিংক<select data-path="promos.'+i+'.link">'+linkOpts(c.link)+'</select></label><label class="fld">Colour · রঙ<select data-path="promos.'+i+'.bg">'+bgOpts(PBG, c.bg)+'</select></label></div></div>';
    }).join("");
    h += '<div class="blk"><div class="blk-h"><b>Brand banner · ব্র্যান্ড ব্যানার</b></div>' + pair("Heading · শিরোনাম", "bb.h", cfg.bb.h) + pair("Line · লাইন", "bb.line", cfg.bb.line) + '</div>';
  } else if(czTab === "brand"){
    h += '<div class="blk"><div class="blk-h"><b>Logo & name · লোগো ও নাম</b></div>'
      + '<label class="fld">Website name · ওয়েবসাইটের নাম<input type="text" data-path="brand.name" value="'+esc(cfg.brand.name)+'"></label>'
      + upl("brand.logo", cfg.brand.logo || "logo-dark", true)
      + '<p style="margin:0;font-size:12.5px;color:var(--muted)">Use a PNG with a transparent background for the best result. · স্বচ্ছ ব্যাকগ্রাউন্ডের PNG দিন।</p></div>';
    h += '<div class="blk"><div class="blk-h"><b>Announcement bar · উপরের ঘোষণা</b></div>' + toggle("tickerOn", cfg.tickerOn, "Show · দেখাও")
      + cfg.ticker.map(function(x, i){ return '<div class="blk-h" style="align-items:flex-end">' + '<div style="flex:1">' + pair("Line " + (i + 1), "ticker." + i, x) + '</div><button class="mini danger" data-act="tdel" data-i="'+i+'" aria-label="Delete">'+ic("trash")+'</button></div>'; }).join("")
      + '<div class="addrow"><button class="btn b-out" data-act="tadd">'+ic("plus")+'Add line · লাইন যোগ</button></div></div>';
    h += '<div class="blk"><div class="blk-h"><b>Delivery · ডেলিভারি চার্জ (৳)</b></div><div class="two">'
      + '<label class="fld">Inside Dhaka<input type="number" min="0" data-num="1" data-path="delivery.inside" value="'+cfg.delivery.inside+'"></label>'
      + '<label class="fld">Outside Dhaka<input type="number" min="0" data-num="1" data-path="delivery.outside" value="'+cfg.delivery.outside+'"></label></div>'
      + '<label class="fld">Free delivery from (Dhaka) · ফ্রি ডেলিভারি সীমা<input type="number" min="0" data-num="1" data-path="delivery.free" value="'+cfg.delivery.free+'"></label></div>';
  } else {
    h += '<div class="blk"><div class="blk-h"><b>Colour theme · রঙের থিম</b></div><div class="skin">'
      + [["emerald","Emerald & Gold",["#0F3B33","#C9A35A","#FBF7F0"]],["noir","Noir (brand black)",["#141210","#C9A35A","#FBF7F0"]]].map(function(s){ return '<button data-skin="'+s[0]+'" aria-pressed="'+(cfg.skin === s[0])+'"><span>'+s[2].map(function(c){ return '<i style="background:'+c+';border:1px solid #0002"></i>'; }).join("")+'</span>'+esc(s[1])+'</button>'; }).join("")
      + '</div></div>';
    h += '<div class="blk"><div class="blk-h"><b>Add to Cart button colour · কার্ট বোতামের রঙ</b></div><div class="skin">'
      + [["ghorer","Ghorer Bazar style · কমলা আউটলাইন",["#FFFFFF","#F7931E","#E07B00"]],["gold","Gold · সোনালি",["#F3DFA8","#C9A35A","#A9843F"]],["emerald","Emerald · সবুজ",["#1B6252","#0F3B33","#0B2E28"]],["orange","Orange · কমলা",["#FFB15C","#F7931E","#E07B00"]],["black","Black & gold · কালো",["#3A3530","#171512","#C9A35A"]]].map(function(s){ return '<button data-btnc="'+s[0]+'" aria-pressed="'+((cfg.btn || "ghorer") === s[0])+'"><span>'+s[2].map(function(c){ return '<i style="background:'+c+';border:1px solid #0002"></i>'; }).join("")+'</span>'+esc(s[1])+'</button>'; }).join("")
      + '</div><p style="margin:0;font-size:12.5px;color:var(--muted)">Used for Add to Cart, Buy Now and Checkout on the website.</p></div>';
    h += '<div class="blk"><div class="blk-h"><b>Reset · আগের অবস্থায় ফেরত</b></div><p style="margin:0;font-size:13.5px;color:var(--muted)">Puts every slide, banner and setting back to the original design.</p><div class="addrow"><button class="btn b-out" data-act="reset">Reset to original · রিসেট</button></div></div>';
  }
  $("#czBody").innerHTML = h;
}
function getPath(path){ return path.split(".").reduce(function(o, k){ return o == null ? o : o[k]; }, cfg); }
function setPath(path, val){ var ks = path.split("."), o = cfg; for(var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }
var rTimer;
function liveRefresh(path){
  clearTimeout(rTimer);
  rTimer = setTimeout(function(){
    saveCfg();
    var root = path.split(".")[0];
    if(root === "slides" || root === "interval") renderSlides(true);
    else if(root === "promos") renderPromos();
    else if(root === "bb") renderBB();
    else if(root === "ticker" || root === "tickerOn"){ renderTicker(); applyStatic(); }
    else if(root === "delivery"){ saveCart(); renderCart(); }
    else applyStatic();
  }, 180);
}
$("#czBody").addEventListener("input", function(e){
  var el = e.target; if(!el.dataset.path) return;
  var v = el.type === "checkbox" ? el.checked : el.dataset.num ? Math.max(0, parseFloat(el.value) || 0) : el.value;
  if(el.dataset.path === "interval") v = Math.min(20, Math.max(3, v || 6.5));
  setPath(el.dataset.path, v);
  if(el.type === "checkbox"){ var b = el.closest(".blk"); if(b && /\.on$/.test(el.dataset.path)) b.classList.toggle("off", !v); }
  liveRefresh(el.dataset.path);
});
$("#czBody").addEventListener("change", function(e){
  var el = e.target;
  if(el.dataset.img && el.files && el.files[0]){
    var path = el.dataset.img, f = el.files[0];
    readImg(f, path.indexOf("brand") === 0 ? 600 : 1800, function(url){ setPath(path, url); saveCfg(); renderAfterImg(path); renderCZ(); });
  } else if(el.dataset.vidup && el.files && el.files[0]){
    var vp = el.dataset.vidup; saveVideoFile(el.files[0], function(ref){ setPath(vp, ref); saveCfg(); renderAfterImg(vp); renderCZ(); toast("Video uploaded", el.files[0].name); });
  } else if(el.tagName === "SELECT"){ setPath(el.dataset.path, el.value); liveRefresh(el.dataset.path); }
});
function renderAfterImg(path){ var r = path.split(".")[0]; if(r === "slides") renderSlides(true); else if(r === "promos") renderPromos(); else applyStatic(); }
function readImg(file, maxW, cb){
  if(!/^image\//.test(file.type)){ toast("Please choose an image file", "PNG / JPG / WebP"); return; }
  var r = new FileReader();
  r.onload = function(){ var im = new Image(); im.onload = function(){
    var s = Math.min(1, maxW / im.width), c = document.createElement("canvas");
    c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    var fmt = typeof imgFormat === "function" ? imgFormat(file.type === "image/png") : (file.type === "image/png" ? "image/png" : "image/jpeg");
    cb(c.toDataURL(fmt, fmt === "image/png" ? undefined : .86));
  }; im.onerror = function(){ toast("That image could not be read", "Try another file"); }; im.src = r.result; };
  r.readAsDataURL(file);
}
$("#cz").addEventListener("click", function(e){
  var b;
  if((b = e.target.closest("[data-cztab]"))){ czTab = b.dataset.cztab; renderCZ(); $("#czBody").scrollTop = 0; return; }
  if((b = e.target.closest("[data-btnc]"))){ cfg.btn = b.dataset.btnc; saveCfg(); applyStatic(); renderCZ(); logA("Button colour changed", cfg.btn); return; }
  if((b = e.target.closest("#cz [data-skin]"))){ cfg.skin = b.dataset.skin; saveCfg(); applyStatic(); renderCZ(); return; }
  if((b = e.target.closest("[data-close]"))){ closeAll(); return; }
  b = e.target.closest("[data-act]"); if(!b) return;
  var i = +b.dataset.i, a = b.dataset.act, S = cfg.slides, Pm = cfg.promos;
  var swap = function(arr, x, y){ var tmp = arr[x]; arr[x] = arr[y]; arr[y] = tmp; };
  if(a === "up") swap(S, i, i - 1);
  else if(a === "down") swap(S, i, i + 1);
  else if(a === "del"){ if(S.length <= 1){ toast("Keep at least one slide", "কমপক্ষে একটি স্লাইড রাখুন"); return; } S.splice(i, 1); }
  else if(a === "addslide"){ S.push({on:true, img:"", bg:"navy", art:["n1"], pill:{bn:"নতুন",en:"New"}, h:{bn:"নতুন স্লাইড",en:"New slide"}, p:{bn:"এখানে আপনার লেখা দিন।",en:"Write your text here."}, btn:{bn:"এখনই কিনুন",en:"Shop Now"}, link:"all"}); }
  else if(a === "nocover"){ S[i].img = ""; S[i].art = ["b2","b1","n2"]; S[i].h = {bn:"প্রিমিয়াম বোরকা",en:"Premium Burka"}; }
  else if(a === "pup") swap(Pm, i, i - 1);
  else if(a === "pdown") swap(Pm, i, i + 1);
  else if(a === "tadd") cfg.ticker.push({bn:"নতুন ঘোষণা",en:"New announcement"});
  else if(a === "tdel") cfg.ticker.splice(i, 1);
  else if(a === "clearvid"){ setPath(b.dataset.path, ""); }
  else if(a === "clearimg"){ var path = b.dataset.path, def = getPath.call(null, path); var parts = path.split("."); var root = parts[0];
    if(root === "brand") cfg.brand.logo = "";
    else if(root === "promos") cfg.promos[+parts[1]].img = DEF.promos[+parts[1]] ? DEF.promos[+parts[1]].img : "b1";
    else setPath(path, ""); }
  else if(a === "reset"){ var keepD = cfg.delivery, keepPg = cfg.pages; cfg = DB.cfg = clone(DEF); cfg.delivery = keepD; if(keepPg) cfg.pages = keepPg; logA("Website content reset", ""); saveCfg(); renderAll(); renderCZ(); toast("Reset to original", "রিসেট হয়েছে"); return; }
  logA("Website content changed", a); saveCfg(); renderSlides(true); renderPromos(); renderTicker(); applyStatic(); renderCZ();
});

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
  var h = '<div class="bar"><div class="chips" role="group" aria-label="Date range">' + R.map(function(x){ return '<button class="chip" data-range="'+x[0]+'" aria-pressed="'+(A.range === x[0])+'">'+x[1]+'</button>'; }).join("") + '</div><span class="hint2">'+ic("info")+'Figures come from your own orders.</span></div>';
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
  h += '<section class="card2"><div class="ch"><h3>'+ic("shield")+'What each role can do</h3><span>Checked on the server for every action, not just hidden in the menu</span></div><div class="rgrid">'
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
  else if(a === "uadd"){ aOpenDrawer("Add admin", '<div class="err" id="uErr" hidden></div><label class="fld">Name<input type="text" id="uN"></label><label class="fld">Email<input type="email" id="uE"></label><label class="fld">Role<select id="uR">'+ROLES.slice(1).map(function(r){ return '<option>'+r+'</option>'; }).join("")+'</select></label><p class="mut sm2">After you add them you get a one-time temporary password to give them privately. They choose their own password when they first sign in.</p>', '<button class="btn b-em sm push" data-a="usave">Add admin</button>'); }
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

// ================= boot =================
function renderAll(keepSlide){
  P = DB.products; CATS = DB.categories; cfg = DB.cfg; reindex();
  applyStatic(); renderTicker(); renderSlides(keepSlide); renderPromos(); renderCats(); renderTop(); renderBB();
  renderTabs(); renderGrids(); renderNav(); renderMenu(); renderChips(); saveCart();
  if($("#cart").classList.contains("on")) renderCart();
  if($("#pm").classList.contains("on")) renderPMInfo();
  if($("#search").classList.contains("on")) runSearch();
  observe();
}
prodBoot();
})();
