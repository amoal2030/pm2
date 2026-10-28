import React from 'react';
import { MessageCircle, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

export const BottomSelectionBar: React.FC = () => {
  const { totalCount, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { isAr, currency } = useLanguage();

  if (totalCount === 0 || isCartOpen) return null;

  const handleSendOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCartOpen(true);
  };

  const counterText = isAr
    ? `تم اختيار ${totalCount} ${totalCount === 1 ? 'صنف' : totalCount === 2 ? 'صنفين' : 'أصناف'}`
    : `Selected ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none animate-slide-up">
      <div
        onClick={() => setIsCartOpen(true)}
        className="pointer-events-auto w-full max-w-xl p-2.5 sm:p-3.5 rounded-2xl bg-neutral-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 cursor-pointer hover:border-amber-400 transition-all text-start group"
      >
        {/* Left Side: Green Send Order Button */}
        <button
          type="button"
          onClick={handleSendOrder}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-md shadow-emerald-950/40 shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-neutral-950" />
          <span>{isAr ? 'إرسال الطلب' : 'Send Order'}</span>
        </button>

        {/* Right Side: Selection Counter & Details */}
        <div className="flex flex-col items-end min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-base font-black text-amber-400 truncate">
              {counterText}
            </span>
            <span className="text-white font-mono font-black text-xs sm:text-base shrink-0">
              ({totalPrice.toFixed(0)} {currency})
            </span>
            <ChevronUp className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition-colors shrink-0" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate max-w-[200px] sm:max-w-none">
            {isAr
              ? `واتساب: ${RESTAURANT_INFO.whatsappFormatted}`
              : `WhatsApp: ${RESTAURANT_INFO.whatsappFormatted}`}
          </span>
        </div>
      </div>
    </div>
  );
};
