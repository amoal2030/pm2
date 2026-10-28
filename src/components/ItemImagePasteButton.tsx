import React, { useRef, useState } from 'react';
import { Clipboard, Upload, RotateCcw, Loader2, Link as LinkIcon } from 'lucide-react';
import { useCustomImages } from '../context/CustomImagesContext';
import { useLanguage } from '../context/LanguageContext';
import { PasteImageModal } from './PasteImageModal';

interface ItemImagePasteButtonProps {
  itemId: string;
  itemName: string;
  compact?: boolean;
  className?: string;
}

export const ItemImagePasteButton: React.FC<ItemImagePasteButtonProps> = ({
  itemId,
  itemName,
  compact = false,
  className = '',
}) => {
  const { saveImage, removeImage, hasCustomImage } = useCustomImages();
  const { isAr } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCustom = hasCustomImage(itemId);

  // When clicking paste button: try quick direct clipboard read, or open the instant paste modal
  const handlePasteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);

    try {
      // 1. Try reading clipboard directly if supported and allowed
      if (navigator.clipboard) {
        // Try reading image blobs
        if (navigator.clipboard.read) {
          try {
            const clipItems = await navigator.clipboard.read();
            for (const item of clipItems) {
              const imgType = item.types.find((t) => t.startsWith('image/'));
              if (imgType) {
                const blob = await item.getType(imgType);
                const saved = await saveImage(itemId, blob, itemName);
                if (saved) {
                  setIsProcessing(false);
                  return;
                }
              }
            }
          } catch {
            // Permission not granted or in iframe, continue to URL or modal
          }
        }

        // Try reading text in case it's an image link
        if (navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            const trimmed = text.trim();
            if (
              trimmed.startsWith('http://') ||
              trimmed.startsWith('https://') ||
              trimmed.startsWith('data:image/')
            ) {
              const saved = await saveImage(itemId, trimmed, itemName);
              if (saved) {
                setIsProcessing(false);
                return;
              }
            }
          } catch {
            // Continue to modal
          }
        }
      }

      // 2. Open PasteImageModal (handles Ctrl+V directly and Image URLs without needing device files)
      setIsModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      await saveImage(itemId, file, itemName);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await removeImage(itemId, itemName);
    } finally {
      setIsProcessing(false);
    }
  };

  if (compact) {
    return (
      <>
        <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-1">
            {/* Main Quick-Paste Button: pastes directly or opens the paste box */}
            <button
              type="button"
              onClick={handlePasteClick}
              disabled={isProcessing}
              title={
                isAr
                  ? 'لصق صورة مباشرة من الحافظة (Ctrl+V) أو عبر رابط دون الحاجة لجلبها من جهازك'
                  : 'Paste image directly from clipboard (Ctrl+V) or link without needing device files'
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-black/95 backdrop-blur-md text-white text-xs font-bold border border-white/20 hover:border-amber-400 shadow-md transition-all cursor-pointer group active:scale-95"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Clipboard className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
              <span>{isAr ? 'لصق صورة' : 'Paste'}</span>
            </button>

            {/* Optional file upload (small secondary icon) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={isAr ? 'اختيار ملف صورة من جهازك (اختياري)' : 'Upload from device (optional)'}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 hover:border-amber-400 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
            </button>

            {/* Reset original image button (only shown if customized) */}
            {isCustom && (
              <button
                type="button"
                onClick={handleResetImage}
                title={isAr ? 'استعادة الصورة الافتراضية' : 'Restore original image'}
                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 backdrop-blur-md text-rose-300 hover:text-white border border-rose-500/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Modal for pasting without device files */}
        <PasteImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemId={itemId}
          itemName={itemName}
        />
      </>
    );
  }

  // Full detailed controls (e.g. inside ItemModal)
  return (
    <>
      <div className={`space-y-2.5 ${className}`} onClick={(e) => e.stopPropagation()}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Paste Button */}
          <button
            type="button"
            onClick={handlePasteClick}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-300 text-neutral-950 font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
            <span>{isAr ? 'لصق صورة مباشرة (Ctrl+V أو رابط)' : 'Paste Image (Ctrl+V or URL)'}</span>
          </button>

          {/* Device file upload as optional alternative */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-bold text-xs border border-slate-200 dark:border-neutral-700 transition-all cursor-pointer"
            title={isAr ? 'من الجهاز' : 'From device'}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'ملف من الجهاز' : 'Upload'}</span>
          </button>

          {/* Reset Button */}
          {isCustom && (
            <button
              type="button"
              onClick={handleResetImage}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer"
              title={isAr ? 'استعادة الصورة الأصلية' : 'Restore original'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة الأصلية' : 'Reset'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 px-1">
          <span className="flex items-center gap-1">
            <span>💡</span>
            <span>
              {isAr
                ? 'انسخ أي صورة أو رابط صورة والصقها مباشرة دون الحاجة لتنزيلها على جهازك'
                : 'Copy any photo or image link and paste directly without downloading to your device'}
            </span>
          </span>
        </div>
      </div>

      {/* Modal for pasting without device files */}
      <PasteImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={itemId}
        itemName={itemName}
      />
    </>
  );
};
