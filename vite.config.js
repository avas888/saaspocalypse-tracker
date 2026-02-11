import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Middleware to serve data directory as /api/data — used by dev and preview
function dataApiMiddleware(req, res, next) {
  const dataDir = path.resolve(__dirname, 'data');

  if (req.url === '/' || req.url === '') {
    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json'))
      .sort();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ files }));
    return;
  }

  const filePath = path.join(dataDir, req.url.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.end(content);
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'not found' }));
}

function dataApiPlugin() {
  return {
    name: 'data-api',
    configureServer(server) {
      server.middlewares.use('/api/data', dataApiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/data', dataApiMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), dataApiPlugin()],
  root: 'frontend',
  build: {
    outDir: '../dist',
  },
});
