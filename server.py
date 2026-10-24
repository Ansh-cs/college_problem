#!/usr/bin/env python3
"""
Campus Saathi AI - Local Web Server
Serves the Smart Campus Issue Reporting & Management System prototype.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DEFAULT_PORT = 5173

class CampusSaathiHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching for live development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "online", "system": "Campus Saathi AI", "version": "1.0"}')
            return
        return super().do_GET()

def run_server(port=DEFAULT_PORT, auto_open=True):
    # Change working directory to current file directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)

    # Find open port
    active_port = port
    server = None
    for p in range(port, port + 20):
        try:
            server = socketserver.TCPServer(("", p), CampusSaathiHandler)
            active_port = p
            break
        except OSError:
            continue

    if not server:
        print(f"Error: Could not bind to any port near {port}.")
        sys.exit(1)

    url = f"http://localhost:{active_port}"
    print("=" * 65)
    print("CAMPUS SAATHI AI - Smart Campus Issue Reporting Prototype")
    print("=" * 65)
    print(f"Server running at: {url}")
    print(f"Serving directory: {current_dir}")
    print("End-to-End Demo Scenario: Click 'Run Demo' in top navigation bar")
    print("Press Ctrl+C to stop the server.")
    print("=" * 65)

    if auto_open:
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"Note: Could not open browser automatically ({e}), please visit {url}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Campus Saathi AI server. Goodbye!")
        server.server_close()

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    run_server(port=port_arg, auto_open=True)

