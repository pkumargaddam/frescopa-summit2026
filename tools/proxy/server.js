/*
 * Simple CORS proxy for local development.
 * Forwards /api/* requests to the AEM compute backend, adding CORS headers.
 *
 * Usage: node tools/proxy/server.js
 * Runs on port 3001 by default (configurable via PORT env var).
 */

import http from 'node:http';
import https from 'node:https';

const PORT = process.env.PORT || 3001;
const BACKEND = 'https://compute-backend-p45403-e1547974-first-compute.adobeaemcloud.com';

function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    addCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Only proxy /api/ paths
  if (!req.url.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // Map /api/frescopa-locations?... → /compute/frescopa-locations?...
  const backendPath = req.url.replace('/api/', '/compute/');
  const backendUrl = new URL(backendPath, BACKEND);

  const proxyReq = https.request(backendUrl, { method: req.method }, (proxyRes) => {
    addCorsHeaders(res);
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'access-control-allow-origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    addCorsHeaders(res);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }));
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log(`CORS proxy running at http://localhost:${PORT}`);
  /* eslint-disable-next-line no-console */
  console.log(`Proxying /api/* → ${BACKEND}/compute/*`);
});
