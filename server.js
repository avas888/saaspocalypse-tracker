#!/usr/bin/env node
/**
 * Production server: serves static frontend + /api/data from data/
 * Use: npm run build && npm start
 * For Railway: set PORT in env; mount volume at /app/data
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const distDir = path.resolve(__dirname, 'dist');
const port = process.env.PORT || 3000;

const app = express();

// /api/data — list files or serve individual JSON
app.use('/api/data', (req, res) => {
  if (req.url === '/' || req.url === '') {
    if (!fs.existsSync(dataDir)) {
      res.status(200).json({ files: [] });
      return;
    }
    const files = fs.readdirSync(dataDir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    res.json({ files });
    return;
  }

  const filePath = path.resolve(dataDir, req.url.replace(/^\//, ''));
  const rel = path.relative(dataDir, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.existsSync(filePath)) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Content-Type', 'application/json');
  res.send(content);
});

// Static frontend
app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
