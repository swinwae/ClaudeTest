/**
 * MyBlog - Simple Static File Server
 * Run: node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // Strip query string

  // Default to index.html
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Security: prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Return 404 page
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>404 - 页面未找到</title>
<style>
  body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
         min-height: 100vh; margin: 0; background: #f8fafc; }
  .box { text-align: center; }
  h1 { font-size: 5rem; margin: 0; color: #6366f1; }
  p { color: #64748b; margin: 16px 0; }
  a { color: #6366f1; font-weight: 600; }
</style>
</head>
<body>
  <div class="box">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
  </div>
</body>
</html>`);
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ◆ MyBlog 开发服务器');
  console.log('');
  console.log(`  本地地址: http://localhost:${PORT}`);
  console.log('');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('');
});
