import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Support large image payloads (WebP/JPEG base64 up to 30MB)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const IMAGES_FILE = path.join(DATA_DIR, 'public_item_images.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'items');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded & AI-generated static images with caching
const publicDir = path.resolve(process.cwd(), 'public');
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));
app.use('/menu-images', express.static(path.join(publicDir, 'menu-images')));
app.use('/pm2/uploads', express.static(path.join(publicDir, 'uploads')));
app.use('/pm2/menu-images', express.static(path.join(publicDir, 'menu-images')));

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Read images map
function getImagesMap(): Record<string, string> {
  if (fs.existsSync(IMAGES_FILE)) {
    try {
      const content = fs.readFileSync(IMAGES_FILE, 'utf-8');
      return JSON.parse(content || '{}');
    } catch (err) {
      console.error('Error reading public_item_images.json:', err);
    }
  }
  return {};
}

// Helper: Save images map
function saveImagesMap(map: Record<string, string>): void {
  fs.writeFileSync(IMAGES_FILE, JSON.stringify(map, null, 2), 'utf-8');
}

// Helper: Build accurate, appetizing culinary prompts for Gemini image generation
function buildFoodImagePrompt(name: string, nameEn?: string, description?: string, category?: string): string {
  const dishTitle = nameEn ? `${name} (${nameEn})` : name;
  return `Professional appetizing food photography of "${dishTitle}". Category: ${category || 'restaurant food'}. ${description ? `Details: ${description}. ` : ''}Freshly prepared, gourmet restaurant presentation on authentic tableware, warm cinematic lighting, high-resolution commercial culinary photo, delicious textures, vibrant natural colors, shallow depth of field. Clean aesthetic. Absolutely NO text, NO watermarks, NO letters, NO prices, NO logos in the image.`;
}

// GET all public item images (accessible by all visitors and devices)
app.get('/api/item-images', (_req, res) => {
  const map = getImagesMap();
  res.json(map);
});

// Paths for local static menu images
const MENU_IMAGES_DIR = path.resolve(process.cwd(), 'public', 'menu-images');
const LOCAL_MAP_FILE = path.resolve(process.cwd(), 'src', 'data', 'localGeneratedImages.json');

if (!fs.existsSync(MENU_IMAGES_DIR)) {
  fs.mkdirSync(MENU_IMAGES_DIR, { recursive: true });
}

function getLocalMap(): Record<string, string> {
  if (fs.existsSync(LOCAL_MAP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_MAP_FILE, 'utf-8') || '{}');
    } catch {}
  }
  return {};
}

function saveLocalMap(map: Record<string, string>): void {
  fs.writeFileSync(LOCAL_MAP_FILE, JSON.stringify(map, null, 2), 'utf-8');
}

// Arabic to English food terms dictionary for real photo search engines
const ARABIC_FOOD_MAP: Record<string, string> = {
  "بروستد": "broasted fried chicken",
  "كرسبي": "crispy chicken tenders",
  "اصابع دجاج": "chicken tenders strips",
  "جمبري": "fried shrimp prawns",
  "روبيان": "fried shrimp prawns",
  "فيليه": "crispy fish fillet",
  "سمك": "grilled fish fillet",
  "كباب": "kebab skewers",
  "شيش طاووق": "shish tawook chicken skewers",
  "اوصال": "grilled meat cubes skewers",
  "مشاوي": "mixed grill platter",
  "مشوي": "mixed grill platter",
  "فحم": "charcoal grilled chicken",
  "مضغوط": "chicken kabsa rice",
  "رز": "rice dish arabic",
  "ملوخية": "molokhia soup",
  "بامية": "okra stew",
  "مصقعة": "moussaka eggplant",
  "برجر": "gourmet burger",
  "زنجر": "crispy zinger chicken burger",
  "شاورما": "chicken shawarma wrap",
  "بيتزا": "pizza gourmet",
  "باستاء": "creamy pasta dish",
  "مكرونة": "pasta dish",
  "فطائر": "arabic savory pastry",
  "زعتر": "zaatar manakish",
  "لبنة": "labneh dip pastry",
  "جبن": "cheese pastry fatayer",
  "سبانخ": "spinach fatayer",
  "فراولة": "strawberry juice",
  "مانجو": "mango juice smoothie",
  "موز": "banana milkshake",
  "افكادو": "avocado smoothie",
  "ليمون": "fresh lemonade mint",
  "برتقال": "fresh orange juice",
  "رمان": "pomegranate juice",
  "بطيخ": "watermelon juice",
  "حبحب": "watermelon juice",
  "شمندر": "beetroot juice",
  "كوكتيل": "mixed fruit cocktail juice",
  "شاي": "tea cup",
  "كرك": "karak chai tea",
  "قهوة": "coffee cup",
  "نسكافي": "nescafe coffee",
  "حمص": "hummus dip",
  "متبل": "mutabal eggplant dip",
  "ثوم": "garlic sauce dip",
  "بطاطس": "crispy french fries",
  "سلطة": "fresh green salad",
  "عوار قلب": "strawberry mango smoothie",
  "طبقات": "layered fruit cocktail",
  "عرايسي": "arabic cocktail drink",
  "اصفهاني": "mango melon smoothie",
  "شمام": "cantaloupe melon smoothie",
  "كيوي": "kiwi smoothie juice",
  "اناناس": "pineapple juice",
  "جوافة": "guava juice"
};

function getSearchQueryForDish(arabicName: string, englishName?: string): string {
  if (englishName && englishName.trim().length > 2) {
    return englishName.trim();
  }
  const cleanName = arabicName.trim();
  for (const [key, val] of Object.entries(ARABIC_FOOD_MAP)) {
    if (cleanName.includes(key)) {
      return val;
    }
  }
  return cleanName;
}

// GET /api/photos/search: Search real food photos via Wikimedia Commons & Unsplash API
app.get('/api/photos/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const nameEn = String(req.query.nameEn || '').trim();
    const category = String(req.query.category || '').trim();
    const unsplashKey = String(req.query.unsplashKey || process.env.UNSPLASH_ACCESS_KEY || '').trim();

    if (!q && !nameEn) {
      return res.status(400).json({ error: 'Search query or dish name is required' });
    }

    const searchEnglish = getSearchQueryForDish(q, nameEn);
    console.log(`[Photo Search] Searching real photos for "${q}" (resolved: "${searchEnglish}")...`);

    const results: Array<{
      id: string;
      title: string;
      thumbUrl: string;
      fullUrl: string;
      source: string;
      author?: string;
    }> = [];

    // 1. Search Wikimedia Commons Real Food Photography
    try {
      const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchEnglish + ' food -drawing -logo -icon')}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=700`;
      const wikiRes = await fetch(endpoint, {
        headers: { 'User-Agent': 'MenuAsnaf/1.0 (contact: amoal2030@gmail.com)' },
      });
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const pages = Object.values(wikiData.query?.pages || {});
        for (const p of pages as any[]) {
          const info = p.imageinfo?.[0];
          const thumb = info?.thumburl || info?.url;
          if (thumb && (thumb.includes('.jpg') || thumb.includes('.jpeg') || thumb.includes('.png'))) {
            results.push({
              id: `wiki-${p.pageid}`,
              title: (p.title || '').replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' '),
              thumbUrl: thumb,
              fullUrl: info?.url || thumb,
              source: 'Wikimedia Commons (Real Food Archive)',
              author: info?.extmetadata?.Artist?.value || 'Public / Creative Commons',
            });
          }
        }
      }
    } catch (wikiErr) {
      console.warn('[Photo Search] Wikimedia search error:', wikiErr);
    }

    // 2. If Unsplash Key is provided, also search Unsplash API
    if (unsplashKey) {
      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchEnglish)}&per_page=8&orientation=landscape&client_id=${unsplashKey}`
        );
        if (unsplashRes.ok) {
          const unData = await unsplashRes.json();
          for (const item of (unData.results || [])) {
            results.push({
              id: `unsplash-${item.id}`,
              title: item.alt_description || item.description || searchEnglish,
              thumbUrl: item.urls?.small || item.urls?.regular,
              fullUrl: item.urls?.regular || item.urls?.full,
              source: 'Unsplash Food Photography',
              author: item.user?.name ? `Photo by ${item.user.name}` : 'Unsplash',
            });
          }
        }
      } catch (unErr) {
        console.warn('[Photo Search] Unsplash search error:', unErr);
      }
    }

    return res.json({
      success: true,
      query: q,
      resolvedQuery: searchEnglish,
      resultsCount: results.length,
      results,
    });
  } catch (err: any) {
    console.error('[Photo Search] Error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// POST /api/photos/assign: Download chosen real photo and map permanently to item ID
app.post('/api/photos/assign', async (req, res) => {
  try {
    const { itemId, photoUrl, itemName } = req.body;
    if (!itemId || !photoUrl) {
      return res.status(400).json({ error: 'itemId and photoUrl are required' });
    }

    const cleanItemId = itemId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanItemId}.jpg`;
    const targetFilePath = path.join(MENU_IMAGES_DIR, filename);

    console.log(`[Photo Assign] Downloading real photo for "${cleanItemId}" from ${photoUrl}...`);

    const imgRes = await fetch(photoUrl, {
      headers: { 'User-Agent': 'MenuAsnaf/1.0 (contact: amoal2030@gmail.com)' },
    });
    if (!imgRes.ok) {
      return res.status(502).json({ error: `Failed to fetch image source (HTTP ${imgRes.status})` });
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(targetFilePath, buffer);

    // Register in localGeneratedImages.json
    const relativePath = `menu-images/${filename}`;
    const localMap = getLocalMap();
    localMap[cleanItemId] = relativePath;
    saveLocalMap(localMap);

    // Also update server images map
    const serverMap = getImagesMap();
    serverMap[cleanItemId] = `/pm2/${relativePath}`;
    saveImagesMap(serverMap);

    console.log(`[Photo Assign] Successfully saved "${cleanItemId}" to ${targetFilePath} (${buffer.length} bytes)`);

    return res.json({
      success: true,
      itemId: cleanItemId,
      relativePath,
      url: `/pm2/${relativePath}`,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('[Photo Assign] Error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// GET AI status & model info
app.get('/api/ai/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const imagesMap = getImagesMap();
  res.json({
    hasKey,
    model: 'gemini-3.1-flash-lite-image',
    generatedCount: Object.keys(imagesMap).length,
    generatedItems: Object.keys(imagesMap),
  });
});

// POST Generate an AI image for a menu item using Gemini
app.post('/api/ai/generate-item-image', async (req, res) => {
  try {
    const { itemId, name, nameEn, description, category } = req.body;
    if (!itemId || !name) {
      return res.status(400).json({ error: 'itemId and name are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر في متغيرات البيئة.',
        requiresKey: true,
      });
    }

    const cleanItemId = itemId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const prompt = buildFoodImagePrompt(name, nameEn, description, category);

    console.log(`[Gemini AI] Generating image for item "${cleanItemId}" (${name})...`);

    // Call Gemini Image Generation model
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
        },
      },
    });

    let base64Data = '';
    let mimeType = 'image/png';
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Data = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        break;
      }
    }

    if (!base64Data) {
      return res.status(500).json({
        error: 'لم يُرجع نموذج Gemini أي بيانات صورة في الاستجابة.',
      });
    }

    // Save physically to disk in public/uploads/items/
    let ext = mimeType.split('/')[1] || 'png';
    if (ext === 'jpeg') ext = 'jpg';
    const filename = `${cleanItemId}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/items/${filename}?v=${Date.now()}`;

    // Update public images map
    const map = getImagesMap();
    map[cleanItemId] = imageUrl;
    saveImagesMap(map);

    console.log(`[Gemini AI] Successfully generated and saved image for "${cleanItemId}": ${imageUrl}`);
    return res.json({
      success: true,
      itemId: cleanItemId,
      imageUrl,
      prompt,
    });
  } catch (err: any) {
    console.error('[Gemini AI] Generation error:', err);
    const errorStr = String(err?.message || err);
    const isQuotaExceeded =
      err?.status === 429 ||
      errorStr.includes('Quota exceeded') ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('limit: 0');

    let userFacingMessage = errorStr;
    if (isQuotaExceeded) {
      userFacingMessage =
        'تم تجاوز حصة الاستخدام أو أن الحساب مجاني بدون فوترة مفعلة (Free Tier limit: 0). يتطلب نموذج توليد الصور gemini-3.1-flash-lite-image مفتاح API مدفوع مفعّل به الفوترة.';
    }

    return res.status(isQuotaExceeded ? 429 : 500).json({
      error: userFacingMessage,
      rawError: errorStr,
      isQuotaExceeded,
      requiresPaidKey: isQuotaExceeded,
    });
  }
});

// POST save an individual item image
app.post('/api/item-images', (req, res) => {
  try {
    const { itemId, dataUrl, name } = req.body;
    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ error: 'itemId string is required' });
    }

    const cleanItemId = itemId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const map = getImagesMap();

    if (!dataUrl) {
      delete map[cleanItemId];
      saveImagesMap(map);
      return res.json({ success: true, itemId: cleanItemId, count: Object.keys(map).length });
    }

    let finalUrl = dataUrl;

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const buffer = Buffer.from(match[2], 'base64');

        try {
          const oldFiles = fs.readdirSync(UPLOADS_DIR).filter((f) => f.startsWith(`${cleanItemId}.`));
          for (const oldFile of oldFiles) {
            fs.unlinkSync(path.join(UPLOADS_DIR, oldFile));
          }
        } catch {}

        const filename = `${cleanItemId}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, buffer);

        finalUrl = `/uploads/items/${filename}?v=${Date.now()}`;
      }
    }

    map[cleanItemId] = finalUrl;
    saveImagesMap(map);

    return res.json({ success: true, itemId: cleanItemId, imageUrl: finalUrl, count: Object.keys(map).length });
  } catch (err) {
    console.error('Error saving public item image:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE remove an item image
app.delete('/api/item-images/:itemId', (req, res) => {
  try {
    const rawItemId = req.params.itemId;
    const cleanItemId = rawItemId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const map = getImagesMap();

    try {
      const files = fs.readdirSync(UPLOADS_DIR).filter((f) => f.startsWith(`${cleanItemId}.`));
      for (const f of files) {
        fs.unlinkSync(path.join(UPLOADS_DIR, f));
      }
    } catch {}

    delete map[cleanItemId];
    saveImagesMap(map);

    return res.json({ success: true, itemId: cleanItemId });
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
    console.log(`Meshwar Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
