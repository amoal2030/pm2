import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Search,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { MENU_ITEMS, MenuItem, CATEGORIES } from '../data/menuData';
import { useCustomImages } from '../context/CustomImagesContext';
import { useLanguage } from '../context/LanguageContext';

interface AiImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: MenuItem | null;
}

interface GenerationLogItem {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  imageUrl?: string;
  error?: string;
}

export const AiImageGeneratorModal: React.FC<AiImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const { isAr } = useLanguage();
  const { customImages, getImage, generateItemImageWithAi } = useCustomImages();

  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || MENU_ITEMS[0]?.id || 'br-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Single generation state
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{
    success: boolean;
    imageUrl?: string;
    error?: string;
    requiresPaidKey?: boolean;
  } | null>(null);

  // Batch generation state
  const [batchSize, setBatchSize] = useState<number>(3);
  const [isConfirmingBatch, setIsConfirmingBatch] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchLogs, setBatchLogs] = useState<GenerationLogItem[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const stopBatchRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialItem) {
      setSelectedItemId(initialItem.id);
      setActiveTab('single');
    }
  }, [initialItem]);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingBatch(false);
      setIsBatchRunning(false);
      stopBatchRef.current = true;
    } else {
      stopBatchRef.current = false;
      setSingleResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedItem = MENU_ITEMS.find((it) => it.id === selectedItemId) || MENU_ITEMS[0];
  const aiGeneratedCount = Object.keys(customImages).length;
  const pendingCount = Math.max(0, MENU_ITEMS.length - aiGeneratedCount);

  // Filtered items for selector
  const filteredItems = MENU_ITEMS.filter((it) => {
    if (selectedCategory !== 'all' && it.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = it.name.toLowerCase().includes(q);
      const matchEn = it.nameEn?.toLowerCase().includes(q);
      return matchName || matchEn;
    }
    return true;
  });

  // 1. Single Item Generation
  const handleGenerateSingle = async () => {
    if (!selectedItem || isGeneratingSingle) return;
    setIsGeneratingSingle(true);
    setSingleResult(null);

    const res = await generateItemImageWithAi(selectedItem);
    setIsGeneratingSingle(false);
    setSingleResult({
      success: res.success,
      imageUrl: res.imageUrl,
      error: res.error,
      requiresPaidKey: res.requiresPaidKey,
    });
  };

  // 2. Batch Generation Execution
  const handleStartBatch = async () => {
    setIsConfirmingBatch(false);
    setIsBatchRunning(true);
    stopBatchRef.current = false;

    // Pick items that do not have custom AI images yet
    const pendingItems = MENU_ITEMS.filter((it) => !customImages[it.id]).slice(0, batchSize);

    if (pendingItems.length === 0) {
      alert(isAr ? 'جميع الأصناف في المنيو لديها صور بالفعل!' : 'All items already have images!');
      setIsBatchRunning(false);
      return;
    }

    const initialLogs: GenerationLogItem[] = pendingItems.map((item) => ({
      id: item.id,
      name: isAr ? item.name : item.nameEn || item.name,
      status: 'pending',
    }));
    setBatchLogs(initialLogs);

    for (let i = 0; i < pendingItems.length; i++) {
      if (stopBatchRef.current) {
        break;
      }

      setCurrentProcessingIndex(i);
      const item = pendingItems[i];

      // Mark loading
      setBatchLogs((prev) =>
        prev.map((log, idx) => (idx === i ? { ...log, status: 'loading' } : log))
      );

      const res = await generateItemImageWithAi(item);

      if (res.success && res.imageUrl) {
        setBatchLogs((prev) =>
          prev.map((log, idx) =>
            idx === i
              ? { ...log, status: 'success', imageUrl: res.imageUrl }
              : log
          )
        );
      } else {
        setBatchLogs((prev) =>
          prev.map((log, idx) =>
            idx === i
              ? {
                  ...log,
                  status: 'error',
                  error: res.error || (isAr ? 'فشل التوليد' : 'Generation failed'),
                }
              : log
          )
        );

        // If quota exceeded or requires paid key, stop batch to prevent runaway errors
        if (res.requiresPaidKey) {
          stopBatchRef.current = true;
          break;
        }
      }

      // Small throttle pause between requests to respect rate limits
      if (i < pendingItems.length - 1 && !stopBatchRef.current) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setIsBatchRunning(false);
    setCurrentProcessingIndex(-1);
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
    setIsBatchRunning(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in text-start overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[94vh] text-slate-900 dark:text-neutral-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-neutral-900 dark:to-orange-950/20 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {isAr ? 'توليد صور الأصناف بالذكاء الاصطناعي' : 'AI Food Image Generator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {isAr
                  ? 'نموذج: gemini-3.1-flash-lite-image · توليد صور طعام واقعية ومخصصة وحفظها دائمًا'
                  : 'Model: gemini-3.1-flash-lite-image · Generate & persist realistic food photos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-slate-50 dark:bg-neutral-950/60 border-b border-slate-200 dark:border-neutral-800 text-center shrink-0">
          <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              {isAr ? 'إجمالي الأصناف' : 'Total Items'}
            </div>
            <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {MENU_ITEMS.length}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {isAr ? 'مولدة بالذكاء الاصطناعي' : 'Generated by AI'}
            </div>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {aiGeneratedCount}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {isAr ? 'جاهزة للتوليد' : 'Ready to Generate'}
            </div>
            <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 p-2 gap-2 bg-white dark:bg-neutral-900 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'توليد لصنف محدد' : 'Single Item Generation'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'توليد تلقائي بالدفعات' : 'Batch Auto-Generation'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'single' ? (
            /* ==========================================
               Tab 1: Single Item Generation
               ========================================== */
            <div className="space-y-4">
              {/* Item Selection Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'اختر تصنيف الصنف:' : 'Select Category:'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {isAr ? c.name : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    {isAr ? 'بحث عن الصنف بالاسم:' : 'Search by name:'}
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isAr ? 'ابحث باسم الوجبة أو المشروب...' : 'Search meal or drink...'}
                      className="w-full ps-9 pe-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Item Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'الصنف المستهدف للتوليد:' : 'Target Item:'}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setSingleResult(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-sm font-bold focus:outline-none"
                >
                  {filteredItems.map((it) => {
                    const hasCustom = Boolean(customImages[it.id]);
                    return (
                      <option key={it.id} value={it.id}>
                        {hasCustom ? '✨ ' : ''}
                        {it.name} {it.nameEn ? `(${it.nameEn})` : ''} - {it.price} ر.س
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Item Card Preview */}
              {selectedItem && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-neutral-900 shrink-0 border border-slate-200 dark:border-neutral-800">
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
                      {customImages[selectedItem.id] && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                          {isAr ? 'مولدة بالذكاء الاصطناعي' : 'AI Generated'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {selectedItem.description || (isAr ? 'طبق شهي ومميز من بروستد مشوار الفرسان' : 'Delicious signature meal')}
                    </p>

                    <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-2">
                      {selectedItem.price} {isAr ? 'ر.س' : 'SAR'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateSingle}
                    disabled={isGeneratingSingle}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isGeneratingSingle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التوليد عبر Gemini...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isAr ? 'توليد وحفظ الصورة الآن' : 'Generate & Save Photo'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Single Result Feedback */}
              {singleResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    singleResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {singleResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {singleResult.success
                          ? (isAr ? 'تم توليد وحفظ الصورة بنجاح!' : 'Image Generated & Saved Successfully!')
                          : (isAr ? 'تعذر توليد الصورة لصنف: ' + selectedItem.name : 'Generation Failed')}
                      </div>
                      <p className="mt-1">
                        {singleResult.success
                          ? (isAr
                              ? 'تم حفظ الصورة الدائمة كملف على الخادم وتحديث بطاقة الصنف في المنيو فوراً.'
                              : 'Saved to server disk and updated item card immediately.')
                          : singleResult.error}
                      </p>

                      {singleResult.requiresPaidKey && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <span>{isAr ? 'ملاحظة هامة بشأن صلاحيات النموذج:' : 'Model Quota Notice:'}</span>
                          </div>
                          <p className="text-[11px] leading-normal">
                            {isAr
                              ? 'نموذج توليد الصور gemini-3.1-flash-lite-image يتطلب حساب Gemini API مفعّل به خيار الفوترة (Paid Tier) حيث أن الحساب المجاني Free Tier يحدد حصة التوليد بـ 0 طلبات بالدقيقة.'
                              : 'gemini-3.1-flash-lite-image requires a Paid Tier API key with billing enabled.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==========================================
               Tab 2: Batch Generation
               ========================================== */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {isAr ? 'توليد الصور بالدفعات الصغيرة لحماية الحساب' : 'Safe Batch Generation'}
                  </div>
                  <p className="mt-0.5 leading-relaxed">
                    {isAr
                      ? 'يتم توليد الصور على دفعات صغيرة لتفادي تجاوز حدود طلبات Google API وضمان حفظ كل صورة بشكل مستقل فور اكتمالها.'
                      : 'Generates photos in small controlled batches with automatic persistence.'}
                  </p>
                </div>
              </div>

              {/* Batch Settings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                    {isAr ? 'عدد الأصناف المراد توليدها في هذه الدفعة:' : 'Batch size:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 10].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBatchSize(size)}
                        disabled={isBatchRunning}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          batchSize === size
                            ? 'bg-amber-500 text-neutral-950 shadow-xs'
                            : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                        }`}
                      >
                        {size} {isAr ? 'أصناف' : 'items'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start / Stop Controls */}
                <div className="pt-2 flex items-center gap-3">
                  {!isBatchRunning ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingBatch(true)}
                      disabled={pendingCount === 0}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {isAr
                          ? `بدء توليد دفعة (${Math.min(batchSize, pendingCount)} أصناف)`
                          : `Start Batch (${Math.min(batchSize, pendingCount)} items)`}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopBatch}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-transform active:scale-95 shadow-md cursor-pointer"
                    >
                      <Pause className="w-4 h-4" />
                      <span>{isAr ? 'إيقاف مؤقت للعملية' : 'Pause Process'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Confirmation Prompt Dialog */}
              {isConfirmingBatch && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isAr ? 'تأكيد استخدام رصيد الذكاء الاصطناعي:' : 'Confirm AI API Usage:'}</span>
                  </div>
                  <p className="leading-relaxed">
                    {isAr
                      ? `أنت على وشك إرسال طلبات توليد صور لـ (${Math.min(batchSize, pendingCount)}) صنف باستخدام Gemini API. قد يترتب على هذا الإجراء استهلاك من رصيد API المخصص لحسابك حسب تسعير Google Cloud. هل تريد المتابعة؟`
                      : `You are about to generate ${Math.min(batchSize, pendingCount)} food images via Gemini API. Continue?`}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleStartBatch}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs shadow-xs cursor-pointer active:scale-95"
                    >
                      {isAr ? 'نعم، ابدأ التوليد الآن' : 'Yes, Start Generation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingBatch(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold text-xs cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {/* Batch Progress Log List */}
              {batchLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center justify-between">
                    <span>{isAr ? 'سجل تقدم الدفعة الحالية:' : 'Current Batch Log:'}</span>
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                      {batchLogs.filter((l) => l.status === 'success').length} / {batchLogs.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800 overflow-hidden">
                    {batchLogs.map((log, index) => (
                      <div key={log.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {log.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          )}
                          {log.status === 'loading' && (
                            <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                          )}
                          {log.status === 'success' && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          )}
                          {log.status === 'error' && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {log.name}
                            </span>
                            {log.error && (
                              <span className="text-[11px] text-rose-500 block truncate">
                                {log.error}
                              </span>
                            )}
                          </div>
                        </div>

                        {log.imageUrl && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-emerald-500/40">
                            <img src={log.imageUrl} alt={log.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span>💡</span>
            <span>{isAr ? 'الصور المولدة يتم حفظها دائمًا كملفات عامة على الخادم' : 'Generated images persist on server disk'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
