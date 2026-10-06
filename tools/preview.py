"""Local design review: static files, disabled auth, no shared API writes."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            config = self.path.startswith('/api/team-config')
            self.send_response(200 if config else 401)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(b'{"enabled":false}' if config else b'{"error":"Local preview only"}')
        else:
            super().do_GET()

    def do_PUT(self):
        self.send_error(405, 'Local review never writes shared data')
    do_POST = do_PATCH = do_DELETE = do_PUT

    def log_message(self, *args):
        pass

class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    print(f'Isolated review: http://127.0.0.1:{args.port}/', flush=True)
    PreviewServer(('127.0.0.1', args.port), partial(Handler, directory=str(root))).serve_forever()
