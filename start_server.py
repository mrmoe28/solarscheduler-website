#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to the directory containing the website files
os.chdir('/Users/edwardharrison/desktop-commander-extended/solarscheduler-website')

PORT = 8001

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")