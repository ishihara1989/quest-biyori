'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, 'public');
const developmentRoot = path.join(__dirname, 'development');
const port = Number(process.env.PORT || 4191);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.gif': 'image/gif', '.md': 'text/plain; charset=utf-8',
};
function createServer({ development = true } = {}) {
return http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
  }
  // Keep existing bookmarked lab URLs usable, while the canonical paths expose
  // that these pages belong to development.
  if (development && /^\/[^/]+\.html$/.test(pathname) && pathname !== '/game.html' && fs.existsSync(path.join(developmentRoot, 'labs', pathname.slice(1)))) {
    response.writeHead(302, { Location: '/development/labs' + pathname + new URL(request.url, 'http://localhost').search }); response.end(); return;
  }
  const isDevelopment = pathname.startsWith('/development/');
  if (isDevelopment && (!development || !/^\/development\/(?:assets|labs)\//.test(pathname))) {
    response.writeHead(404); response.end('Not found'); return;
  }
  const mount = isDevelopment ? pathname.split('/')[2] : null;
  const selectedRoot = isDevelopment ? path.join(developmentRoot, mount) : root;
  const selectedPath = isDevelopment ? pathname.slice(('/development/' + mount).length) : pathname === '/' ? '/game.html' : pathname;
  const target = path.resolve(selectedRoot, '.' + selectedPath);
  const relative = path.relative(selectedRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end('Not found'); return; }
    response.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
});
}
if (require.main === module) createServer({ development: !process.argv.includes('--game-only') })
  .listen(port, '127.0.0.1', () => console.log(`Forestbound: http://127.0.0.1:${port}`));
module.exports = { createServer };
