// Static server for the exported web build (web-demo/). Serves files only, no code execution.
import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'web-demo');
const port = Number(process.env.PORT || 8099);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, path.normalize(urlPath));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    let stat = await fs.stat(file).catch(() => null);
    if (stat?.isDirectory()) { file = path.join(file, 'index.html'); stat = await fs.stat(file).catch(() => null); }
    if (!stat) {
      // Expo routes that have no file: serve index.html so the client router handles them (like _redirects on Netlify).
      file = path.join(root, 'index.html');
    }
    const type = types[path.extname(file)] || 'application/octet-stream';
    const headers = { 'Content-Type': type, Vary: 'Accept-Encoding' };
    // Compress text assets like Netlify does, so the numbers match what visitors get.
    const compressible = /text|javascript|json|svg/.test(type);
    const accepts = String(req.headers['accept-encoding'] || '');
    if (compressible && accepts.includes('br')) {
      res.writeHead(200, { ...headers, 'Content-Encoding': 'br' });
      createReadStream(file).pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })).pipe(res);
    } else if (compressible && accepts.includes('gzip')) {
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
      createReadStream(file).pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, headers);
      createReadStream(file).pipe(res);
    }
  } catch {
    res.writeHead(500).end();
  }
}).listen(port, () => console.log(`serving web-demo on ${port}`));
