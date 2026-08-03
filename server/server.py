#!/usr/bin/env python3
"""
Command Center — local server.

Serves index.html and stores all board data in data.json next to this file.
No installation needed. Python 3.8+ only.

    python3 server.py

Then open http://localhost:8787
"""

import http.server
import json
import os
import shutil
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from datetime import datetime

PORT = int(os.environ.get("CC_PORT", "8787"))
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, "..", "dist"))
DATA = os.path.join(HERE, "data.json")
BACKUPS = os.path.join(HERE, "backups")
MAX_BODY = 20 * 1024 * 1024  # 20 MB


def now_stamp():
    return datetime.now().strftime("%Y-%m-%d_%H%M%S")


def snapshot():
    """Keep a timestamped copy before every overwrite. Nothing is ever lost."""
    if not os.path.exists(DATA):
        return
    os.makedirs(BACKUPS, exist_ok=True)
    dest = os.path.join(BACKUPS, f"data_{now_stamp()}.json")
    try:
        shutil.copy2(DATA, dest)
    except Exception as e:
        print("  backup failed:", e)
    # keep the most recent 200 snapshots
    try:
        files = sorted(os.listdir(BACKUPS))
        for old in files[:-200]:
            os.remove(os.path.join(BACKUPS, old))
    except Exception:
        pass


def read_data():
    if not os.path.exists(DATA):
        return {}
    try:
        with open(DATA, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("  data.json unreadable:", e)
        return {}


def write_data(obj):
    snapshot()
    tmp = DATA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
    os.replace(tmp, DATA)  # atomic — never a half-written file


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=APP, **kw)

    def log_message(self, fmt, *args):
        if "/api/" in (self.path or ""):
            print(f"  {self.command} {self.path}")

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/data"):
            return self._json(read_data())
        if self.path == "/":
            self.path = "/index.html"
        self.send_header_noop = None
        return super().do_GET()

    def end_headers(self):
        # never cache the app shell, so a new build shows up immediately
        if self.path.endswith(".html") or self.path == "/":
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if not self.path.startswith("/api/data"):
            return self._json({"error": "unknown endpoint"}, 404)
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0 or length > MAX_BODY:
                return self._json({"error": "bad length"}, 400)
            raw = self.rfile.read(length)
            obj = json.loads(raw.decode("utf-8"))
            if not isinstance(obj, dict):
                return self._json({"error": "expected object"}, 400)
            write_data(obj)
            return self._json({"ok": True, "saved": datetime.now().isoformat(timespec="seconds")})
        except Exception as e:
            return self._json({"error": str(e)}, 500)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


def main():
    if not os.path.exists(os.path.join(APP, "index.html")):
        print("dist/index.html is missing. Run:  npm run build")
        sys.exit(1)

    port = PORT
    for attempt in range(12):
        try:
            httpd = Server(("0.0.0.0", port), Handler)
            break
        except OSError:
            port += 1
    else:
        print("Could not find a free port.")
        sys.exit(1)

    url = f"http://localhost:{port}"
    ip = lan_ip()

    print()
    print("  Command Center is running")
    print(f"  → {url}")
    if ip:
        print(f"  → http://{ip}:{port}   (phone or tablet on the same wifi)")
    print(f"  data:    {DATA}")
    print(f"  backups: {BACKUPS}")
    print()
    print("  Leave this window open. Press Ctrl+C to stop.")
    print()

    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Your data is saved in data.json")
        httpd.shutdown()


if __name__ == "__main__":
    main()
