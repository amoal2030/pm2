import { MenuItem, CategoryId } from './menuData';
import localGeneratedMapRaw from './localGeneratedImages.json';
import { JUICE_EXACT_IMAGES } from './juiceImagesMap';
import { USER_PROVIDED_IMAGES } from './userCustomImagesMap';

const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
const LOCAL_GENERATED_IMAGES: Record<string, string> = localGeneratedMapRaw || {};

// Category local fallback images
export const CATEGORY_FALLBACKS: Record<CategoryId, string> = {
  broasted: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/155950?width=1440&quality=75&webp=true',
  grilled: 'https://th.bing.com/th/id/OIP.hz6S8H2GI74Q_ddaBnC9dwHaE7?w=265&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
  skewers_kg: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  meals: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  shawarma: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
  sandwiches: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://th.bing.com/th/id/OIP.zKJnE-RRT2a4zAT-pAw2aAHaE8?w=267&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
  pies: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80',
  juices: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
  hot_drinks: 'https://images.deliveryhero.io/image/hungerstation/restaurant/android_cover_photo/cbbce617baa96cc3ee1f06070f1ff8fb.jpg',
};

// Curated high-resolution food photography for all menu items
export const ITEM_DEDICATED_IMAGES: Record<string, string> = {
  // ==========================================
  // 1. بروستد / BROASTED (24 items)
  // ==========================================
  'br-1': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=700&q=80', // بروستد عادي 4 قطع
  'br-2': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=700&q=80', // بروستد حراق 4 قطع
  'br-3': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80', // كرسبي دجاج عادي
  'br-4': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // كرسبي دجاج حراق
  'br-5': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80', // اصابع دجاج حراق
  'br-6': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=80', // اصابع دجاج عادي
  'br-7': 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=700&q=80', // قطع جمبري عادي
  'br-8': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80', // قطع جمبري حراق
  'br-9': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // فيليه سمك عادي
  'br-10': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=700&q=80', // فيليه سمك حراق
  'br-11': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // كباب دجاج 4 اسياخ
  'br-12': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // كباب لحم 4 اسياخ
  'br-13': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80', // صحن فيليه عادي
  'br-14': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // صحن فيليه حراق
  'br-15': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=700&q=80', // مكسي فود
  'br-16': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80', // صحن ثوم
  'br-17': '/assets/aistudio/image_b41fac47.png', // مقبلات
  'br-18': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=700&q=80', // حمص
  'br-19': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // متبل
  'br-20': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80', // سلطة خضرا
  'br-21': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80', // حبتين ثوم
  'br-22': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80', // صحن ثوم صغير
  'br-23': 'https://media.istockphoto.com/id/1308045603/photo/mustard-tasty-sauce-in-bowl-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=iZkVoByX_DD-z83CQlZqb2ZTsmgD66sBnelmX5LID7o=', // صحن صوص حار صغير
  'br-24': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80', // صحن بطاطس

  // ==========================================
  // 2. مشويات / GRILLED (19 items)
  // ==========================================
  'gr-1': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80', // دجاج فحم مع الرز حبة
  'gr-2': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=700&q=80', // دجاج فحم مع الرز نصف
  'gr-3': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // دجاج فحم سادة
  'gr-4': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80', // دجاج مضغوط حبة
  'gr-5': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80', // دجاج مضغوط نصف
  'gr-6': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=700&q=80', // رز ابيض سادة
  'gr-7': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=700&q=80', // رز بخاري
  'gr-8': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80', // مشكل خضار
  'gr-9': 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=700&q=80', // بامية
  'gr-10': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80', // ملوخية
  'gr-11': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80', // خيار باللبن
  'gr-12': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80', // مشكل فرن
  'gr-13': 'https://th.bing.com/th/id/OIP.Shjvo5RDuf2Yna_U1dEWNwHaD4?w=328&h=180&c=7&r=0&o=7&pid=1.7&rm=3', // مسقعة باذنجان
  'gr-14': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // اوصال لحم
  'gr-15': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=700&q=80', // شيش طاووق
  'gr-16': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // كباب لحم
  'gr-17': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // كباب دجاج
  'gr-18': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80', // مشوي مشكل
  'gr-19': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // جميع انواع السمك

  // ==========================================
  // 3. مشويات بالأسياخ بالكيلو / SKEWERS BY KG (9 items)
  // ==========================================
  'sk-1': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // اوصال لحم
  'sk-2': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=700&q=80', // شيش طاووق
  'sk-3': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // كباب لحم
  'sk-4': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // كباب دجاج
  'sk-5': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80', // كباب مشكل
  'sk-6': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // مشكل لحم
  'sk-7': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // مشكل دجاج
  'sk-8': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=700&q=80', // مشكل اوصال وشيش طاووق
  'sk-9': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80', // مشكل مشوي

  // ==========================================
  // 4. وجبات سريعة / MEALS (13 items)
  // ==========================================
  'ml-1': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // وجبة زنجر دجاج على خبزترتيلا
  'ml-2': 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=700&q=80', // وجبة سندويش فيليه حراق
  'ml-3': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=80', // وجبة سندويش اصابع دجاج
  'ml-4': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // وجبة رول دجاج كرسبي
  'ml-5': 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=700&q=80', // وجبة رول روبيان
  'ml-6': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // وجبة سمك
  'ml-7': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80', // وجبة برجر دجاج عادي
  'ml-8': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', // وجبة برجر لحم
  'ml-9': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80', // وجبة زنجر دجاج على خبز برجر
  'ml-10': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=700&q=80', // وجبة برجر دجاج طازج
  'ml-11': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // وجبة كباب لحم
  'ml-12': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // وجبة كباب دجاج
  'ml-13': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80', // وجبة برجر سمك

  // ==========================================
  // 5. شاورما / SHAWARMA (15 items)
  // ==========================================
  'sh-1': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // سندويش شاورما صغير
  'sh-2': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // سندويش شاورما صاروخ
  'sh-3': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // سندويش شاورما صغير جبن
  'sh-4': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // سندويش شاورما صاروخ جبن
  'sh-5': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // شاورما تست
  'sh-6': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // شاورما تست مع الجبن
  'sh-7': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', // برجر شاورما
  'sh-8': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // برجر شاورما جبن
  'sh-9': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // صحن عربي
  'sh-10': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // صحن عربي جبن
  'sh-11': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // صحن عربي دبل
  'sh-12': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // صحن عربي دبل جبن
  'sh-13': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // صحن شرحات صغير
  'sh-14': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // صحن شرحات وسط
  'sh-15': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80', // صحن شرحات كبير

  // ==========================================
  // 6. ساندويشات / SANDWICHES (28 items)
  // ==========================================
  'sw-1': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // زنجر دجاج على خبزترتيلا
  'sw-2': 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=700&q=80', // سندويش فيليه حراق
  'sw-3': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // سندويش فيليه عادي
  'sw-4': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=80', // سندويش اصابع دجاج
  'sw-5': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80', // رول دجاج كرسبي
  'sw-6': 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=700&q=80', // رول روبيان
  'sw-7': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80', // رول سمك
  'sw-8': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80', // برجر دجاج طازج مشوي
  'sw-9': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', // برجر لحم بقري طازج مشوي
  'sw-10': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80', // برجر لحم غنم طازج مشوي
  'sw-11': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=700&q=80', // برجر دجاج عادي
  'sw-12': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', // برجر لحم عادي
  'sw-13': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80', // زنجر دجاج على خبز برجر
  'sw-14': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=700&q=80', // برجر دجاج طازج
  'sw-15': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // كباب لحم
  'sw-16': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // كباب دجاج
  'sw-17': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80', // برجر سمك
  'sw-18': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', // اصابع برجر
  'sw-19': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80', // بطاطس كرسبي كبير
  'sw-20': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80', // صحن بطاطس صغير
  'sw-21': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80', // صحن بطاطس كبير
  'sw-22': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // بطاطس كرسبي جبن
  'sw-23': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // صحن بطاطس صغير جبن
  'sw-24': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80', // صحن بطاطس كبير جبن
  'sw-25': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // كباب لحم (ساندويش)
  'sw-26': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // كباب دجاج (ساندويش)
  'sw-27': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80', // اوصال لحم (ساندويش)
  'sw-28': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=700&q=80', // شيش طاووق (ساندويش)

  // ==========================================
  // 7. بيتزا / PIZZA (21 items)
  // ==========================================
  'pz-1': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', // بيتزا باللحم
  'pz-2': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', // بيتزا دجاج
  'pz-3': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', // بيتزا مشكل
  'pz-4': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=700&q=80', // بيتزا نقانق
  'pz-5': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // عش البلبل
  'pz-6': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة عسل
  'pz-7': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // عش البلبل بالزيتون
  'pz-8': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', // بيتزا خضار
  'pz-9': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', // بيتزا جبن موزريلا
  'pz-10': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=700&q=80', // بيتزا جبن سائل
  'pz-11': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80', // بيتزا بيض جبن
  'pz-12': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', // زعتر جبن
  'pz-13': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // بيتزا زعتر ساده
  'pz-14': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // بيتزا لبنة زعتر
  'pz-15': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', // بيتزا شاورما
  'pz-16': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', // بيتزا تونا
  'pz-17': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', // بيتزا سبيشل
  'pz-18': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80', // بيتزا بيروني
  'pz-19': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80', // بيتزا خضار مع بيروني
  'pz-20': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', // بيتزا رنش
  'pz-21': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', // بيتزا باربيكيو
  'pz-22': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80', // بيتزا باربيكيو رنش
  'pz-23': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', // بيتزا ديناميت

  // ==========================================
  // 8. باستاء / PASTA (4 items)
  // ==========================================
  'pa-1': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80', // باستاء دجاج
  'pa-2': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', // باستاء لحم
  'pa-3': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=700&q=80', // باستاء نقانق
  'pa-4': 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=700&q=80', // باستاء خضار

  // ==========================================
  // 9. الفطائر / PIES (29 items)
  // ==========================================
  'pi-1': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // فهتي الدجاج
  'pi-2': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // دجاج سادة
  'pi-3': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // لحم مفروم بالجبن
  'pi-4': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80', // جبن بيض
  'pi-5': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=700&q=80', // جبن نقانق
  'pi-6': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // دجاج بالبيض
  'pi-7': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة سادة
  'pi-8': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة بالجبن
  'pi-9': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة بالزعتر
  'pi-10': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة بالزيتون
  'pi-11': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة بالعسل
  'pi-12': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=700&q=80', // لبنة بالخضار
  'pi-13': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // جبن ساده
  'pi-14': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // جبن موزريلا
  'pi-15': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // جبن مكس
  'pi-16': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // جبن بالزعتر
  'pi-17': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // جبن بالزيتون
  'pi-18': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // جبن بالخضار
  'pi-19': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // فطيرة لحم جبن
  'pi-20': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // زعتر ساده
  'pi-21': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // زعتر خضار
  'pi-22': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // زعتر بالجبن
  'pi-23': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // زعتر موزريلا
  'pi-24': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // جبن عكاوي
  'pi-25': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80', // سبانخ
  'pi-26': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // محمره
  'pi-27': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', // قشطه
  'pi-28': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // فطاير مشكل كبير
  'pi-29': 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80', // فطاير مشكل صغير

  // ==========================================
  // 10. العصائر / JUICES (33 items - User Provided)
  // ==========================================
  ...JUICE_EXACT_IMAGES,

  // ==========================================
  // 11. المشروبات الساخنة / HOT DRINKS (6 items)
  // ==========================================
  'hd-1': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80', // نسكافي حليب
  'hd-2': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80', // نسكافي ساده
  'hd-3': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80', // حليب عدني
  'hd-4': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80', // حليب كرك
  'hd-5': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80', // شاي حليب
  'hd-6': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=700&q=80', // شاي ساده

  // ==========================================
  // صور مخصصة من المستخدم (بروستد، مشويات، باستا، مشروبات ساخنة)
  // ==========================================
  ...USER_PROVIDED_IMAGES,
};

/**
 * Safely extracts a direct image URL from a raw string.
 * If the URL points to a Google search page, extracts the direct image link from query parameters (?imgurl=...) if present.
 * If it's an unextractable Google search page or non-image webpage, returns undefined to prevent broken renders.
 */
export function sanitizeDirectImageUrl(rawUrl: string | undefined | null): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;

  // Handle Google search / Google Images redirection URLs
  if (trimmed.includes('google.com')) {
    try {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      // Google Image direct target is stored in imgurl or url
      const imgurlParam = urlObj.searchParams.get('imgurl') || urlObj.searchParams.get('url');
      if (imgurlParam && (imgurlParam.startsWith('http://') || imgurlParam.startsWith('https://'))) {
        return decodeURIComponent(imgurlParam);
      }
    } catch {
      // not a valid URL
    }
    // Reject plain google search pages as image sources
    return undefined;
  }

  // Handle data URLs, absolute paths, or standard web URLs
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return trimmed;
  }

  return undefined;
}

/**
 * Returns the dedicated automatic image for any menu item.
 * Evaluates in order:
 * 1. Directly attached item image fields across all common conventions (image, imageUrl, img, photo, etc.)
 * 2. Static locally generated image (GitHub Pages compatible)
 * 3. Specific pre-assigned dedicated photo from ITEM_DEDICATED_IMAGES
 * 4. Intelligent keyword matching based on dish title
 * 5. High-fidelity category fallback
 */
export function getItemDedicatedImage(item: MenuItem): string {
  // 1. Check all possible item image field variations
  const anyItem = item as Record<string, any>;
  const rawItemImage =
    item.image ||
    anyItem.imageUrl ||
    anyItem.img ||
    anyItem.photo ||
    anyItem.image_url ||
    anyItem.picture;

  const sanitizedItemImage = sanitizeDirectImageUrl(rawItemImage);
  if (sanitizedItemImage) {
    return sanitizedItemImage;
  }

  // 2. Specific pre-assigned dedicated photo from 203 curated Unsplash items
  if (ITEM_DEDICATED_IMAGES[item.id]) {
    const sanitizedDedicated = sanitizeDirectImageUrl(ITEM_DEDICATED_IMAGES[item.id]);
    if (sanitizedDedicated) {
      return sanitizedDedicated;
    }
  }

  // 3. Static locally generated image (GitHub Pages fallback)
  if (LOCAL_GENERATED_IMAGES[item.id]) {
    const localRelPath = LOCAL_GENERATED_IMAGES[item.id];
    return localRelPath.startsWith('http')
      ? localRelPath
      : `${BASE}${localRelPath.replace(/^\//, '')}`;
  }

  const name = (item.name || '').toLowerCase();

  // 4. Intelligent keyword matching fallback
  if (name.includes('بطاطس') || name.includes('fries')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('برجر') || name.includes('burger')) {
    return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('شاورما') || name.includes('shawarma')) {
    return 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('بيتزا') || name.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('باستاء') || name.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('حمص') || name.includes('متبل')) {
    return 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('ثوم') || name.includes('صلصة') || name.includes('صوص')) {
    return 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('سلطة') || name.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('سمك') || name.includes('روبيان') || name.includes('جمبري') || name.includes('فيليه')) {
    return 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('كباب') || name.includes('شيش') || name.includes('اوصال') || name.includes('مشوي')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('شاي') || name.includes('كرك') || name.includes('قهوة') || name.includes('نسكافي')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('عصير') || name.includes('مانجو') || name.includes('ليمون') || name.includes('كوكتيل')) {
    return 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80';
  }

  // 5. Category fallback
  return CATEGORY_FALLBACKS[item.category] || CATEGORY_FALLBACKS.broasted;
}

/**
 * Returns the exact direct image link associated with this item in project data.
 * Safely sanitized and mapped 1-to-1 to each item ID.
 */
export function getItemDirectLink(item: MenuItem): string | undefined {
  if (ITEM_DEDICATED_IMAGES[item.id]) {
    return sanitizeDirectImageUrl(ITEM_DEDICATED_IMAGES[item.id]);
  }
  if (LOCAL_GENERATED_IMAGES[item.id]) {
    const localRelPath = LOCAL_GENERATED_IMAGES[item.id];
    return localRelPath.startsWith('http')
      ? localRelPath
      : `${BASE}${localRelPath.replace(/^\//, '')}`;
  }
  const anyItem = item as Record<string, any>;
  const rawItemImage =
    item.image ||
    anyItem.imageUrl ||
    anyItem.img ||
    anyItem.photo ||
    anyItem.image_url;
  return sanitizeDirectImageUrl(rawItemImage);
}
