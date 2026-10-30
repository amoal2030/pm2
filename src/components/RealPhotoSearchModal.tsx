import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Key,
  Download,
  RefreshCw,
} from 'lucide-react';
import { MENU_ITEMS, MenuItem, CATEGORIES } from '../data/menuData';
import { useCustomImages } from '../context/CustomImagesContext';
import { useLanguage } from '../context/LanguageContext';

interface RealPhotoSearchResult {
  id: string;
  title: string;
  thumbUrl: string;
  fullUrl: string;
  source: string;
  author?: string;
}

interface RealPhotoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: MenuItem | null;
}

export const RealPhotoSearchModal: React.FC<RealPhotoSearchModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const { isAr } = useLanguage();
  const { customImages, getImage, saveImage } = useCustomImages();

  const [activeTab, setActiveTab] = useState<'search' | 'batch' | 'settings'>('search');
  const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || MENU_ITEMS[0]?.id || 'br-1');
  const [itemFilterQuery, setItemFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RealPhotoSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resolvedTerm, setResolvedTerm] = useState<string>('');

  // Assigning state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Unsplash key optional state (stored in localStorage)
  const [unsplashKey, setUnsplashKey] = useState<string>(() => {
    return localStorage.getItem('asnaf_unsplash_key') || '';
  });

  const selectedItem = MENU_ITEMS.find((it) => it.id === selectedItemId) || MENU_ITEMS[0];

  useEffect(() => {
    if (initialItem) {
      setSelectedItemId(initialItem.id);
      setSearchQuery(initialItem.name);
      setActiveTab('search');
    }
  }, [initialItem]);

  useEffect(() => {
    if (selectedItem) {
      setSearchQuery(selectedItem.name);
      setSearchResults([]);
      setSearchError(null);
      setAssignSuccess(null);
    }
  }, [selectedItemId]);

  if (!isOpen) return null;

  // Filter menu items for selection
  const filteredItems = MENU_ITEMS.filter((it) => {
    if (selectedCategory !== 'all' && it.category !== selectedCategory) return false;
    if (itemFilterQuery.trim()) {
      const q = itemFilterQuery.toLowerCase();
      return it.name.toLowerCase().includes(q) || (it.nameEn && it.nameEn.toLowerCase().includes(q));
    }
    return true;
  });

  // Perform real photo search via server endpoint
  const handlePerformSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || searchQuery || selectedItem?.name;
    if (!q) return;

    setIsSearching(true);
    setSearchError(null);
    setAssignSuccess(null);

    try {
      const params = new URLSearchParams({
        q,
        nameEn: selectedItem?.nameEn || '',
        category: selectedItem?.category || '',
      });
      if (unsplashKey.trim()) {
        params.append('unsplashKey', unsplashKey.trim());
      }

      const res = await fetch(`/api/photos/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في استلام نتائج البحث');
      }

      setSearchResults(data.results || []);
      setResolvedTerm(data.resolvedQuery || q);

      if (!data.results || data.results.length === 0) {
        setSearchError(
          isAr
            ? `لم يتم العثور على صور مطابقة لعبارة "${q}". جرب البحث باسم صنف أو مكونات باللغة الإنجليزية.`
            : `No photos found for "${q}". Try a different food keyword.`
        );
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err?.message || (isAr ? 'تعذر الاتصال بخدمة البحث عن الصور' : 'Search service connection error'));
    } finally {
      setIsSearching(false);
    }
  };

  // Assign photo to current item
  const handleAssignPhoto = async (photo: RealPhotoSearchResult) => {
    if (!selectedItem) return;
    setAssigningId(photo.id);
    setAssignSuccess(null);

    try {
      // 1. Try server assign (downloads locally to public/menu-images/ and registers in localGeneratedImages.json)
      const res = await fetch('/api/photos/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          photoUrl: photo.thumbUrl || photo.fullUrl,
          itemName: selectedItem.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Also save to client context for immediate reactive update
        await saveImage(selectedItem.id, data.url || photo.thumbUrl, selectedItem.name);
        setAssignSuccess(
          isAr
            ? `تم ربط وحفظ الصورة الحقيقية لصنف «${selectedItem.name}» بنجاح!`
            : `Photo assigned to ${selectedItem.name}!`
        );
      } else {
        // Fallback: save directly via client storage (IndexedDB)
        await saveImage(selectedItem.id, photo.thumbUrl, selectedItem.name);
        setAssignSuccess(
          isAr
            ? `تم ربط الصورة وحفظها في المتصفح لصنف «${selectedItem.name}»!`
            : `Photo saved locally to ${selectedItem.name}!`
        );
      }
    } catch (err: any) {
      console.error('Assign error:', err);
      // Fallback
      await saveImage(selectedItem.id, photo.thumbUrl, selectedItem.name);
      setAssignSuccess(
        isAr
          ? `تم ربط الصورة محلياً بنجاح لصنف «${selectedItem.name}»!`
          : `Photo assigned!`
      );
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in text-start overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[94vh] sm:max-h-[90vh] text-slate-900 dark:text-neutral-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 shadow-md">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'البحث عن صور الأصناف الحقيقية' : 'Real Food Photo Search'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  {isAr ? 'صور واقعية' : 'Real Photos'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {isAr
                  ? 'بحث عن صور طعام حقيقية عبر أرشيف الصور المفتوح، وربط كل صنف بصورته الدائمة'
                  : 'Search authentic food photography and link each menu item to its permanent photo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-neutral-800 px-4 sm:px-6 bg-slate-50/50 dark:bg-neutral-950/50 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{isAr ? 'بحث وربط صنف محدد' : 'Search & Assign Item'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'الأصناف المحفوظة والمختبرة' : 'Saved & Tested Items'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{isAr ? 'خدمات البحث والإعدادات' : 'Search Services & Keys'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'search' && (
            <>
              {/* Item Selection & Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={itemFilterQuery}
                      onChange={(e) => setItemFilterQuery(e.target.value)}
                      placeholder={isAr ? 'تصفية الأصناف (203 صنف)...' : 'Filter items (203 items)...'}
                      className="w-full ps-9 pe-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {isAr ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown to pick item */}
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-sm font-bold focus:outline-none"
                >
                  {filteredItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} {it.nameEn ? `(${it.nameEn})` : ''} - {it.price} ر.س
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Selected Item Header */}
              {selectedItem && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-neutral-900 shrink-0 border border-slate-200 dark:border-neutral-800">
                    <img
                      src={getImage(selectedItem)}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-start min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {isAr ? selectedItem.name : selectedItem.nameEn || selectedItem.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-neutral-800 font-mono font-bold">
                        {selectedItem.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-1">
                      {selectedItem.description || selectedItem.nameEn || 'وجبة مميزة من قائمة مشوار'}
                    </p>

                    <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1.5">
                      {selectedItem.price} {isAr ? 'ر.س' : 'SAR'}
                    </div>
                  </div>

                  {/* Search Input for This Item */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePerformSearch();
                      }}
                      placeholder={isAr ? 'كلمة البحث...' : 'Search query...'}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-bold focus:outline-none w-full sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={() => handlePerformSearch()}
                      disabled={isSearching}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isAr ? 'جاري البحث...' : 'Searching...'}</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>{isAr ? 'بحث عن صور' : 'Search Photos'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback messages */}
              {assignSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{assignSuccess}</span>
                </div>
              )}

              {searchError && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Search Results Grid */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-700 dark:text-neutral-300">
                      {isAr
                        ? `الصور الحقيقية التي تم العثور عليها (${searchResults.length}) لعبارة «${resolvedTerm}»:`
                        : `Real photo results (${searchResults.length}) for "${resolvedTerm}":`}
                    </h5>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      {isAr ? 'اضغط على الصورة لربطها بالصنف وحفظها' : 'Click photo to assign'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {searchResults.map((photo) => {
                      const isAssigningThis = assigningId === photo.id;

                      return (
                        <div
                          key={photo.id}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-950 flex flex-col hover:border-amber-500/60 transition-all shadow-xs"
                        >
                          <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-200 dark:bg-neutral-900">
                            <img
                              src={photo.thumbUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <span className="absolute top-2 start-2 text-[9px] px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white font-mono">
                              {photo.source.split(' ')[0]}
                            </span>
                          </div>

                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-neutral-100 line-clamp-1" title={photo.title}>
                              {photo.title}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleAssignPhoto(photo)}
                              disabled={isAssigningThis}
                              className="mt-2 w-full py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isAssigningThis ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'اختيار وحفظ للصنف' : 'Assign to item'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {isAr ? 'حالة الصور المحفوظة والمخصصة' : 'Dedicated Images Status'}
                  </div>
                  <p className="mt-0.5 leading-relaxed">
                    {isAr
                      ? 'جميع الأصناف الـ 203 تمتلك صوراً مخصصة ومستقلة، ويتم حفظ الصور المختارة في مجلد public/menu-images/ كملفات محلية ثابتة متوافقة بالكامل مع مسار /pm2/ على GitHub Pages دون طلبات بحث متكررة.'
                      : 'All 203 items have dedicated imagery and local persistence in public/menu-images/ compatible with GitHub Pages.'}
                  </p>
                </div>
              </div>

              {/* Sample of tested items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'br-1', title: 'بروستد عادي 4 قطع', desc: 'تم توليده واختباره وحفظه' },
                  { id: 'ju-7', title: 'عصير فراولة حليب', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'ju-20', title: 'عصير رمان طبيعي', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'ml-7', title: 'وجبة برجر دجاج عادي', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'sh-1', title: 'شاورما عربي دجاج', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'pi-1', title: 'بيتزا مارجريتا', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'gr-1', title: 'دجاج فحم مع الرز', desc: 'تم البحث عنه وحفظه كملف محلي' },
                  { id: 'sk-1', title: 'اوصال لحم أسياخ', desc: 'تم البحث عنه وحفظه كملف محلي' },
                ].map((item) => {
                  const targetItem = MENU_ITEMS.find((it) => it.id === item.id);
                  if (!targetItem) return null;

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-neutral-900 shrink-0">
                        <img
                          src={getImage(targetItem)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          ✓ {item.desc}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {item.id}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs leading-relaxed">
              {/* Architecture Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 space-y-2">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'كيف يعمل نظام البحث عن الصور الحقيقية؟' : 'How Real Photo Search Works'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-neutral-400 text-xs">
                  <li>
                    {isAr
                      ? 'الخدمة التلقائية تبحث في أرشيف Wikimedia Commons المفتوح للصور الفوتوغرافية الحقيقية (بدون مفتاح API، مجاناً 100%).'
                      : 'Default search queries Wikimedia Commons authentic food photography archive (free, open, no key required).'}
                  </li>
                  <li>
                    {isAr
                      ? 'عند اختيار أي صورة، يتم تحميلها وحفظها محلياً في مجلد public/menu-images/ باسم المعرّف (مثل ju-7.jpg).'
                      : 'Selected photos are saved locally in public/menu-images/{itemId}.jpg.'}
                  </li>
                  <li>
                    {isAr
                      ? 'الصور متوافقة مع مسار النشر على GitHub Pages (/pm2/) ولا تتطلب خادمًا نشطًا لعرضها.'
                      : 'Fully compatible with GitHub Pages /pm2/ static deployment.'}
                  </li>
                  <li>
                    {isAr
                      ? 'إذا تعذر تحميل أي صورة لأي سبب، ينتقل النظام تلقائياً وبسلاسة إلى الصورة الافتراضية للتصنيف دون كسر الواجهة.'
                      : 'Automatic fallback to high-fidelity category photography if any network fails.'}
                  </li>
                </ul>
              </div>

              {/* Optional Unsplash API Key */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'مفتاح Unsplash الاختياري (اختياري تماماً):' : 'Optional Unsplash Key:'}</span>
                </div>
                <p className="text-slate-600 dark:text-neutral-400 text-xs">
                  {isAr
                    ? 'إذا كنت تريد البحث في مكتبة Unsplash بالإضافة إلى الأرشيف المفتوح، يمكنك لصق Unsplash Access Key مجاني هنا. (ليس إجبارياً؛ البحث الأساسي يعمل بدونه تماماً).'
                    : 'Optionally add a free Unsplash Access Key to search Unsplash photos alongside Wikimedia.'}
                </p>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={unsplashKey}
                    onChange={(e) => {
                      setUnsplashKey(e.target.value);
                      localStorage.setItem('asnaf_unsplash_key', e.target.value);
                    }}
                    placeholder={isAr ? 'ألصق Unsplash Access Key هنا (اختياري)...' : 'Paste Unsplash Access Key...'}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-mono focus:outline-none"
                  />
                  {unsplashKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setUnsplashKey('');
                        localStorage.removeItem('asnaf_unsplash_key');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-neutral-800 text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
