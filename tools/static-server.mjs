import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

/**
 * Serves the prerendered output the way GitHub Pages does: a directory URL
 * resolves to its index.html, and anything missing is a real 404 rather than
 * an SPA fallback. Keeping those semantics locally is the point — it is how
 * a missing prerendered route gets caught before deployment.
 */
export function startStaticServer(root, port = 0) {
  const server = createServer(async (request, response) => {
    const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const candidates = [
      join(root, normalize(urlPath)),
      join(root, normalize(urlPath), 'index.html'),
    ];

    for (const candidate of candidates) {
      if (!candidate.startsWith(root)) {
        break; // refuse traversal outside the served root
      }
      try {
        const stats = await stat(candidate);
        if (stats.isFile()) {
          response.writeHead(200, {
            'Content-Type': MIME[extname(candidate)] ?? 'application/octet-stream',
          });
          createReadStream(candidate).pipe(response);
          return;
        }
      } catch {
        // try the next candidate
      }
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}
