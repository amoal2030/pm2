import React, { useState, useEffect, useRef } from 'react';
import { X, Clipboard, Link2, Check, AlertCircle, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useCustomImages } from '../context/CustomImagesContext';
import { useLanguage } from '../context/LanguageContext';

interface PasteImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
}

export const PasteImageModal: React.FC<PasteImageModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemName,
}) => {
  const { saveImage } = useCustomImages();
  const { isAr } = useLanguage();
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput('');
      setErrorMsg(null);
      setIsProcessing(false);
      // Automatically focus paste area for immediate Ctrl+V
      setTimeout(() => {
        pasteAreaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processAndSave = async (source: File | Blob | string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const ok = await saveImage(itemId, source, itemName);
      if (ok) {
        onClose();
      } else {
        setErrorMsg(isAr ? 'تعذر حفظ الصورة، يرجى المحاولة بصورة أو رابط آخر' : 'Could not save image, please try another link or image');
      }
    } catch (err) {
      setErrorMsg(isAr ? 'حدث خطأ أثناء معالجة الصورة' : 'Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handles pasting into the modal paste zone
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Check for clipboard image files/blobs (Screenshots, copied image from browser or apps)
    const files = e.clipboardData.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          await processAndSave(files[i]);
          return;
        }
      }
    }

    const items = e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            await processAndSave(blob);
            return;
          }
        }
      }
    }

    // 2. Check for copied text (e.g. image URL / link)
    const pastedText = e.clipboardData.getData('text')?.trim();
    if (pastedText) {
      if (
        pastedText.startsWith('http://') ||
        pastedText.startsWith('https://') ||
        pastedText.startsWith('data:image/')
      ) {
        await processAndSave(pastedText);
        return;
      }
    }

    // 3. Check for HTML containing <img> (when copying from web page)
    const pastedHtml = e.clipboardData.getData('text/html');
    if (pastedHtml) {
      const match = pastedHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        await processAndSave(match[1]);
        return;
      }
    }

    setErrorMsg(
      isAr
        ? 'لم يتم العثور على صورة أو رابط صورة في الحافظة. انسخ صورة أو رابط صورة أولاً ثم الصقها هنا.'
        : 'No image or image link found in clipboard. Please copy an image or image URL first.'
    );
  };

  // Handles submitting an image link directly
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg(isAr ? 'يرجى إدخال رابط الصورة' : 'Please enter an image URL');
      return;
    }
    await processAndSave(trimmed);
  };

  // Try to read directly from clipboard on button click
  const handleQuickPasteClick = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      if (navigator.clipboard) {
        // Try reading items (images)
        if (navigator.clipboard.read) {
          try {
            const clipItems = await navigator.clipboard.read();
            for (const item of clipItems) {
              const imgType = item.types.find((t) => t.startsWith('image/'));
              if (imgType) {
                const blob = await item.getType(imgType);
                await processAndSave(blob);
                return;
              }
            }
          } catch {
            // Read permission might be denied, continue to text
          }
        }

        // Try reading text (image URL)
        if (navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            const trimmed = text.trim();
            if (
              trimmed.startsWith('http://') ||
              trimmed.startsWith('https://') ||
              trimmed.startsWith('data:image/')
            ) {
              await processAndSave(trimmed);
              return;
            }
          } catch {
            // Ignore
          }
        }
      }

      // If browser doesn't allow automated reading, prompt user to press Ctrl+V
      pasteAreaRef.current?.focus();
      setErrorMsg(
        isAr
          ? 'المتصفح يطلب ضغط مفتاحي (Ctrl + V) أو النقر بالزر الأيمن واختيار لصق داخل المربع أدناه.'
          : 'Please press Ctrl + V inside the box below to paste your image.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in text-start overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col text-slate-900 dark:text-neutral-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isAr ? 'لصق صورة وحفظها تلقائياً' : 'Paste & Auto-Save Image'}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                {itemName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Paste Zone: captures Ctrl+V or right-click paste */}
          <div
            ref={pasteAreaRef}
            tabIndex={0}
            onPaste={handlePaste}
            className="relative group p-6 sm:p-8 rounded-2xl border-2 border-dashed border-amber-500/60 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-neutral-950/70 dark:hover:bg-neutral-950 transition-all flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
              ) : (
                <Clipboard className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1 max-w-sm">
              <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                {isAr
                  ? 'انقر هنا واضغط على (Ctrl + V) للصق الصورة فوراً'
                  : 'Click here & press (Ctrl + V) to paste image instantly'}
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                {isAr
                  ? 'انسخ أي صورة من المتصفح أو لقطة شاشة أو واتساب، والصقها هنا مباشرة دون الحاجة لحفظها بجهازك!'
                  : 'Copy any image from web, screenshot, or chat, and paste it directly without saving to your device!'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickPasteClick}
              disabled={isProcessing}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Clipboard className="w-4 h-4" />
              <span>{isAr ? 'لصق الآن من الحافظة' : 'Paste Now from Clipboard'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-neutral-800 w-full" />
            <span className="bg-white dark:bg-neutral-900 px-3 text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase">
              {isAr ? 'أو عبر رابط الصورة المباشر' : 'OR via Direct Image URL'}
            </span>
            <div className="border-t border-slate-200 dark:border-neutral-800 w-full" />
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ضع رابط الصورة هنا (مثال: https://.../image.jpg)'
                      : 'Paste image link here (e.g. https://.../image.jpg)'
                  }
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-600 transition-colors"
                />
                <Link2 className="absolute end-3 top-3 w-4 h-4 text-slate-400 dark:text-neutral-600 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !urlInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-neutral-950 font-black text-xs hover:bg-amber-500 dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{isAr ? 'حفظ تلقائي' : 'Auto-Save'}</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500 px-1">
              {isAr
                ? '💡 يمكنك النقر بالزر الأيمن على أي صورة في الإنترنت واختيار «نسخ عنوان الصورة» ولصقه هنا.'
                : '💡 You can right-click any image online, click "Copy image address", and paste it here.'}
            </p>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <Check className="w-4 h-4" />
            <span>{isAr ? 'الحفظ يتم تلقائياً دون لمس ملفات جهازك' : 'Saves automatically without touching device files'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
