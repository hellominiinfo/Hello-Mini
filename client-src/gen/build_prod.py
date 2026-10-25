#!/usr/bin/env python3
"""Builds the live website's front-end from the approved demo design.

  python3 gen/build_prod.py <scratch-root> <app-root>

1. runs gen/assemble4.py (the demo build) to get site/sitriya4.src.html
2. adds site/parts/prod.js (the real-server data layer) and switches the boot code
3. writes  <app>/public/assets/app.js, app.css, img/*, brand/*
           <app>/server/generated/shell.ts  (page markup + cache-busting version)
"""
import hashlib, json, os, re, shutil, subprocess, sys

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
APP = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "sitraya-app"))
subprocess.run([sys.executable, os.path.join(ROOT, "gen", "assemble4.py"), ROOT], check=True, stdout=subprocess.DEVNULL)
src = open(os.path.join(ROOT, "site", "sitriya4.src.html"), encoding="utf-8").read()

css = src[src.index("<style>") + 7: src.index("</style>")]
markup = src[src.index("</style>") + 8: src.index("<script>")]
js = src[src.index("<script>") + 8: src.rindex("</script>")]

def rep(s, a, b, count=1):
    n = s.count(a)
    assert n >= count, f"build_prod: expected to find {a[:70]!r} ({n} found)"
    return s.replace(a, b)

# ---- images: real files instead of embedded base64 ----
img_map = {}
for f in sorted(os.listdir(os.path.join(ROOT, "cut"))):
    if f.endswith(".svg"):
        img_map[f[:-4]] = "/assets/img/" + f
for f in ["cover.jpg", "logo-dark.png", "logo-light.png", "logo-gold.png"]:
    img_map[f.rsplit(".", 1)[0]] = "/assets/brand/" + f
js = rep(js, "__IMG_MAP__", json.dumps(img_map))
# (uploaded promo photos: handled in the design source now)

# ---- production data layer + boot ----
prod = open(os.path.join(ROOT, "site", "parts", "prod.js"), encoding="utf-8").read()
js = rep(js, "// ================= boot =================", prod + "\n// ================= boot =================")
boot_old = re.search(r"\npaintIcons\(\);\nrenderAll\(\);\n[\s\S]*?\n\}\)\(\);\s*$", js)
assert boot_old, "build_prod: boot block not found"
js = js[: boot_old.start()] + "\nprodBoot();\n})();\n"

# ---- wording: this is the real shop now ----
for old, new in [
    ("Figures come from your own orders. Demo orders are included until you clear them.", "Figures come from your own orders."),
    ("Checked on the server in the real panel, not just hidden in the menu", "Checked on the server for every action, not just hidden in the menu"),
    ("In the real panel they get an email invite to set their own password. Two-step login can be required for admins.", "After you add them you get a one-time temporary password to give them privately. They choose their own password when they first sign in."),
    ("back to the original demo.", "back to the original design."),
    ("Reset demo · রিসেট", "Reset to original · রিসেট"),
    ('instock:"In stock (demo)"', 'instock:"In stock"'),
    ('cfg = DB.cfg = clone(DEF);', 'var keepD = cfg.delivery, keepPg = cfg.pages; cfg = DB.cfg = clone(DEF); cfg.delivery = keepD; if(keepPg) cfg.pages = keepPg;'),
    ('toast("Demo reset", "রিসেট হয়েছে")', 'toast("Reset to original", "রিসেট হয়েছে")'),
]:
    js = rep(js, old, new)

# ---- markup: no demo-only entry points ----
markup = re.sub(r'<li><a[^>]*data-t="admin_login"[^>]*></a></li>', "", markup)

# ---- production-only styles ----
css += """
/* ===== production ===== */
.czbtn, .demo-note, .demo { display:none !important; }
label.up-btn:has(> input[data-vidup]), label.up-btn:has(> input[data-pvid]) { display:none !important; }
body.a-saving .a-top::after { content:"Saving…"; position:fixed; right:16px; bottom:16px; z-index:200; padding:8px 14px; border-radius:999px; background:#0F3B33; color:#F3DFA8; font:600 13px/1 Outfit, system-ui, sans-serif; box-shadow:0 8px 20px -10px rgba(0,0,0,.5); }
#admin .pwc { margin-bottom:18px; }
#admin .pwc .ch span { font-size:13px; }
#admin .chbtns { display:flex; gap:10px; flex-wrap:wrap; margin:8px 0 14px; }
#admin .chan .btn { flex:none; }
#admin .tgc { margin-top:6px; }
/* role-based: hide what this person cannot change (the server refuses it anyway) */
body.no-edit-products #admin [data-ape="new"], body.no-edit-products #admin .tflags, body.no-edit-products #admin [data-a="bulk"],
body.no-edit-products #admin [data-a="psave"], body.no-edit-products #admin [data-a="pdelete"], body.no-edit-products #admin [data-a="parchive"],
body.no-edit-products #admin .catc label.up-btn, body.no-edit-coupons #admin [data-acp="new"], body.no-edit-coupons #admin [data-a="cpsave"], body.no-edit-coupons #admin [data-a="cpdel"],
body.no-edit-orders #admin [data-a="ostatus"], body.no-edit-settings #admin [data-tgtest], body.no-edit-settings #cz .fld:has([data-setc]) { display:none !important; }
body.no-edit-products #admin .catc input, body.no-edit-products #admin [data-sel], body.no-edit-inventory #admin [data-a="inv"], body.no-edit-inventory #admin [data-invset],
body.no-edit-coupons #admin [data-cpon], body.no-edit-orders #admin [data-of], body.no-edit-orders #admin #oNext, body.no-edit-orders #admin #oNote,
body.no-edit-settings #admin [data-set], body.no-edit-settings #admin [data-setc], body.no-edit-users #admin [data-urole], body.no-edit-users #admin [data-a="utoggle"] { pointer-events:none; opacity:.55; }
#aDrawer.forced [data-adclose] { display:none !important; }
.no-phone #pmCall { display:none !important; }
@media (max-width:480px){ body:not(.is-admin) .card .tag.l { display:none; } }
"""

assets = os.path.join(APP, "public", "assets")
os.makedirs(os.path.join(assets, "img"), exist_ok=True)
os.makedirs(os.path.join(assets, "brand"), exist_ok=True)
open(os.path.join(assets, "app.js"), "w", encoding="utf-8").write(js)
open(os.path.join(assets, "app.css"), "w", encoding="utf-8").write(css)
for f in os.listdir(os.path.join(ROOT, "cut")):
    if f.endswith(".svg"):
        shutil.copy(os.path.join(ROOT, "cut", f), os.path.join(assets, "img", f))
for f in ["cover.jpg", "logo-dark.png", "logo-light.png", "logo-gold.png"]:
    shutil.copy(os.path.join(ROOT, "brand", f), os.path.join(assets, "brand", f))

ver = hashlib.sha256((js + css).encode()).hexdigest()[:10]
os.makedirs(os.path.join(APP, "server", "generated"), exist_ok=True)
open(os.path.join(APP, "server", "generated", "shell.ts"), "w", encoding="utf-8").write(
    "// Generated by gen/build_prod.py from the approved design. Do not edit by hand.\n"
    f"export const ASSET_VER = {json.dumps(ver)};\n"
    f"export const BODY = {json.dumps(markup.strip(), ensure_ascii=False)};\n")
print(f"front-end built: app.js {len(js)//1024} KB, app.css {len(css)//1024} KB, version {ver}")
