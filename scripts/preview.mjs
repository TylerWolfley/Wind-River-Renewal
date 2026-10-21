import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../out');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  // A local preview never forwards forms to a service or sends a customer lead.
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end('Local preview: submissions are disabled.'); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  let content = fs.readFileSync(file);
  if (path.extname(file) === '.html' && !process.argv.includes('--test')) {
    // Preview-only guard; the built files and production integration are unchanged.
    res.setHeader('Content-Security-Policy', "connect-src 'self'; form-action 'none'; script-src 'self' 'unsafe-inline'");
    content = content.toString().replace(/(<body[^>]*>)/, '$1<div style="padding:8px 16px;background:#15345b;color:white;text-align:center;font:13px system-ui">Local review preview · Form sending is disabled · Nothing is published</div>');
  }
  res.end(req.method === 'HEAD' ? undefined : content);
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Preview: http://127.0.0.1:' + (process.env.PORT || 4173)));
