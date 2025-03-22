from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Security Headers
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        
        # CORS Headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # Content Security Policy - Allow local resources
        csp = (
            "default-src 'self' cdnjs.cloudflare.com fonts.googleapis.com fonts.gstatic.com; "
            "script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com; "
            "font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com; "
            "img-src 'self' data: blob:; "
            "media-src 'self' blob:; "
            "worker-src 'self' blob:; "
            "connect-src 'self' blob:;"
        )
        self.send_header('Content-Security-Policy', csp)
        
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def guess_type(self, path):
        # Override mime types
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.wasm'):
            return 'application/wasm'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

    def translate_path(self, path):
        # Serve files from the current directory
        path = super().translate_path(path)
        rel_path = os.path.relpath(path, os.getcwd())
        return os.path.join(os.getcwd(), rel_path)

if __name__ == '__main__':
    print('Starting server on port 8000...')
    print('Working directory:', os.getcwd())
    httpd = HTTPServer(('localhost', 8000), CORSHTTPRequestHandler)
    httpd.serve_forever()