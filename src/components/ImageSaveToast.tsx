import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCustomImages } from '../context/CustomImagesContext';

export const ImageSaveToast: React.FC = () => {
  const { toast, dismissToast } = useCustomImages();

  if (!toast) return null;

  return (
    <div className="fixed top-24 end-4 sm:end-6 z-50 max-w-sm w-full animate-bounce-subtle pointer-events-auto">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-neutral-900/95 text-white border border-amber-500/50 shadow-2xl backdrop-blur-md text-start">
        {toast.image ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-400/50 bg-black/50 shadow-sm">
            <img src={toast.image} alt="Thumbnail" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400" />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
            <span>{toast.type === 'success' ? 'حفظ تلقائي ناجح' : toast.type === 'error' ? 'تنبيه' : 'معلومة'}</span>
          </div>
          <p className="text-xs text-neutral-200 mt-0.5 leading-snug line-clamp-2">
            {toast.text}
          </p>
        </div>

        <button
          type="button"
          onClick={dismissToast}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
