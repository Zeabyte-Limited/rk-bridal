#!/usr/bin/env python3
"""
Deploy the built site (dist/) + Worker to Cloudflare WITHOUT wrangler, via the
Workers Static Assets direct-upload API. Needed because wrangler/workerd has no
Windows-ARM64 build. CI (GitHub Actions / Cloudflare Builds) still uses wrangler.

Usage (token NEVER stored — pass it for the one run):
  CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... python scripts/deploy-api.py

Steps: bundle src/worker.js with esbuild → manifest of dist/ → upload session →
upload missing files in buckets → PUT script with assets jwt → enable workers.dev.
"""
import base64, hashlib, json, mimetypes, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")
ACC = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
SCRIPT = "rk-bridal"
API = "https://api.cloudflare.com/client/v4"
if not TOKEN or not ACC:
    sys.exit("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.")
if not os.path.isdir(DIST):
    sys.exit("dist/ missing — run `npm run build` first.")

def req(method, url, headers=None, data=None):
    r = urllib.request.Request(url, method=method, data=data, headers=headers or {})
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def multipart(parts):
    """parts: list of (field, filename, content_type, bytes)"""
    boundary = "----rkbridal" + hashlib.md5(os.urandom(8)).hexdigest()
    body = b""
    for field, filename, ctype, content in parts:
        body += f"--{boundary}\r\n".encode()
        disp = f'Content-Disposition: form-data; name="{field}"' + (f'; filename="{filename}"' if filename else "") + "\r\n"
        body += disp.encode() + f"Content-Type: {ctype}\r\n\r\n".encode() + content + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    return body, f"multipart/form-data; boundary={boundary}"

# 1. bundle the worker (ESM, single file) with the esbuild already in node_modules
bundle = os.path.join(ROOT, ".deploy", "worker.js")
os.makedirs(os.path.dirname(bundle), exist_ok=True)
esbuild = os.path.join(ROOT, "node_modules", ".bin", "esbuild.cmd" if os.name == "nt" else "esbuild")
subprocess.run([esbuild, os.path.join(ROOT, "src", "worker.js"), "--bundle", "--format=esm", "--platform=browser", "--target=es2022", f"--outfile={bundle}", "--log-level=warning"], check=True)
worker_code = open(bundle, "rb").read()
print(f"worker bundle: {len(worker_code)//1024} KB")

# 2. manifest of dist/  (hash = sha256(base64(content) + ext)[:32], per Cloudflare docs)
manifest, files = {}, {}
for dp, _, fns in os.walk(DIST):
    for fn in fns:
        p = os.path.join(dp, fn)
        rel = "/" + os.path.relpath(p, DIST).replace(os.sep, "/")
        content = open(p, "rb").read()
        ext = os.path.splitext(fn)[1][1:]
        h = hashlib.sha256((base64.b64encode(content).decode() + ext).encode()).hexdigest()[:32]
        manifest[rel] = {"hash": h, "size": len(content)}
        files[h] = (rel, content)
print(f"assets: {len(manifest)} files, {sum(v['size'] for v in manifest.values())//1024//1024} MB")

hdr = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
st, body = req("POST", f"{API}/accounts/{ACC}/workers/scripts/{SCRIPT}/assets-upload-session", hdr, json.dumps({"manifest": manifest}).encode())
sess = json.loads(body)
if not sess.get("success"):
    sys.exit(f"upload-session failed {st}: {body[:500]}")
jwt, buckets = sess["result"]["jwt"], sess["result"].get("buckets") or []
print(f"upload session ok — {sum(len(b) for b in buckets)} files to upload in {len(buckets)} bucket(s)")

# 3. upload buckets; the completion jwt comes back once everything is present
completion = jwt if not buckets else None
for i, bucket in enumerate(buckets):
    parts = []
    for h in bucket:
        rel, content = files[h]
        ctype = mimetypes.guess_type(rel)[0] or "application/octet-stream"
        parts.append((h, h, ctype, base64.b64encode(content)))
    data, ctype = multipart(parts)
    st, body = req("POST", f"{API}/workers/assets/upload?base64=true".replace("/workers/", f"/accounts/{ACC}/workers/"), {"Authorization": f"Bearer {jwt}", "Content-Type": ctype}, data)
    res = json.loads(body)
    if not res.get("success"):
        sys.exit(f"bucket {i} upload failed {st}: {body[:500]}")
    if res["result"].get("jwt"):
        completion = res["result"]["jwt"]
    print(f"  bucket {i+1}/{len(buckets)} uploaded ({len(bucket)} files)")
if not completion:
    sys.exit("no completion jwt received")

# 4. PUT the script with the assets jwt
metadata = {
    "main_module": "worker.js",
    "compatibility_date": "2026-06-01",
    "assets": {"jwt": completion, "config": {"html_handling": "auto-trailing-slash", "not_found_handling": "404-page"}},
    "bindings": [{"name": "ASSETS", "type": "assets"}],
}
data, ctype = multipart([("metadata", None, "application/json", json.dumps(metadata).encode()), ("worker.js", "worker.js", "application/javascript+module", worker_code)])
st, body = req("PUT", f"{API}/accounts/{ACC}/workers/scripts/{SCRIPT}", {"Authorization": f"Bearer {TOKEN}", "Content-Type": ctype}, data)
res = json.loads(body)
if not res.get("success"):
    sys.exit(f"script upload failed {st}: {body[:800]}")
print("script deployed:", res["result"].get("id"), "modified", res["result"].get("modified_on"))

# 5. make sure the workers.dev route is on
st, body = req("POST", f"{API}/accounts/{ACC}/workers/scripts/{SCRIPT}/subdomain", hdr, json.dumps({"enabled": True, "previews_enabled": False}).encode())
print("workers.dev:", st, body[:120].decode(errors="ignore"))
print(f"LIVE -> https://{SCRIPT}.zeabyte.workers.dev/")
