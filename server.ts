import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Support large image payloads (WebP/JPEG base64)
app.use(express.json({ limit: '25mb' }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const IMAGES_FILE = path.join(DATA_DIR, 'public_item_images.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// GET all public item images (accessible by all visitors and devices)
app.get('/api/item-images', (_req, res) => {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const content = fs.readFileSync(IMAGES_FILE, 'utf-8');
      return res.json(JSON.parse(content || '{}'));
    }
  } catch (err) {
    console.error('Error reading public_item_images.json:', err);
  }
  return res.json({});
});

// POST save a public item image (published globally for all users)
app.post('/api/item-images', (req, res) => {
  try {
    const { itemId, dataUrl, name } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }

    let map: Record<string, string> = {};
    if (fs.existsSync(IMAGES_FILE)) {
      try {
        map = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf-8') || '{}');
      } catch {
        map = {};
      }
    }

    if (dataUrl) {
      map[itemId] = dataUrl;
    } else {
      delete map[itemId];
    }

    fs.writeFileSync(IMAGES_FILE, JSON.stringify(map, null, 2), 'utf-8');
    return res.json({ success: true, itemId, count: Object.keys(map).length });
  } catch (err) {
    console.error('Error saving public item image:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE remove a public item image (restore default)
app.delete('/api/item-images/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    let map: Record<string, string> = {};
    if (fs.existsSync(IMAGES_FILE)) {
      try {
        map = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf-8') || '{}');
      } catch {
        map = {};
      }
    }
    delete map[itemId];
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(map, null, 2), 'utf-8');
    return res.json({ success: true, itemId });
  } catch (err) {
    console.error('Error deleting public item image:', err);
    return res.status(500).json({ error: String(err) });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
