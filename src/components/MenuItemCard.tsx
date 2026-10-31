import React from 'react';
import { Check, Flame, Edit3, Plus } from 'lucide-react';
import { MenuItem, CATEGORIES } from '../data/menuData';
import { useLanguage } from '../context/LanguageContext';
import { useCustomImages } from '../context/CustomImagesContext';
import { CATEGORY_FALLBACKS } from '../data/itemImages';

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  selectedQuantity?: number;
  userNotes?: string;
  onOpenDetails: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  selectedQuantity = 0,
  userNotes,
  onOpenDetails,
}) => {
  const { isAr, currency, t } = useLanguage();
  const { getImage } = useCustomImages();
  const imageUrl = item.image || getImage(item);
  const hasVariants = item.variants && item.variants.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...item.variants!.map((v) => v.price))
    : item.price;

  const categoryObj = CATEGORIES.find((c) => c.id === item.category);

  // Determine badge text
  let badgeText = item.badge;
  if (!isAr && item.badge) {
    if (item.badge === 'الأكثر طلباً') badgeText = 'Best Seller';
    else if (item.badge === 'حراق مميز') badgeText = 'Spicy Special';
  } else if (!badgeText && categoryObj) {
    badgeText = isAr ? categoryObj.name : categoryObj.nameEn;
  }

  const primaryName = isAr ? item.name : item.nameEn || item.name;
  const secondaryName = isAr ? item.nameEn : item.name;

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer text-start shadow-md hover:shadow-lg ${
        isSelected
          ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5 dark:bg-neutral-900/95'
          : 'bg-white dark:bg-neutral-900/95 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
      } border`}
    >
      <div>
        {/* Dedicated Automatic Item Image with Badges */}
        <div className="relative w-full h-44 sm:h-48 mb-3.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-950 transition-all">
          <img
            src={imageUrl}
            alt={primaryName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const fallback = CATEGORY_FALLBACKS[item.category] || CATEGORY_FALLBACKS.broasted;
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Top Badge (Category or Popular) */}
          <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 z-10">
            {badgeText && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-black text-xs shadow-md">
                {badgeText}
              </span>
            )}
          </div>

          {/* Bottom Calories Badge */}
          {item.calories !== undefined && (
            <span className="absolute bottom-2.5 start-2.5 px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-neutral-100 text-xs font-mono border border-white/10 flex items-center gap-1 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{item.calories} {isAr ? 'سعرة حرارية' : 'cal'}</span>
            </span>
          )}
        </div>

        {/* Item Info */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
              {primaryName}
            </h3>
          </div>

          {secondaryName && secondaryName !== primaryName && (
            <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 font-medium">
              {secondaryName}
            </p>
          )}

          {item.description && (
            <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 pt-0.5 leading-relaxed">
              {item.description}
            </p>
          )}

          {item.freeSideNotes && (
            <div className="pt-1 text-[11px] font-bold text-amber-700 dark:text-amber-400/90 flex items-center gap-1">
              <span>🎁</span>
              <span>{item.freeSideNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price & Selection Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80">
        <div className="flex items-center justify-between gap-2">
          {/* Price display */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-neutral-400">
              {item.isPriceUnspecified
                ? (isAr ? 'السعر' : 'Price')
                : hasVariants
                ? (isAr ? 'يبدأ من' : 'Starts at')
                : (isAr ? 'السعر' : 'Price')}
            </span>
            {item.isPriceUnspecified ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                  {isAr ? 'غير محدد' : 'Unspecified'}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-amber-400">
                  {lowestPrice}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-neutral-300">
                  {currency}
                </span>
              </div>
            )}
          </div>

          {/* Action Button: Opens Details Modal */}
          {isSelected ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {selectedQuantity > 0 ? `${selectedQuantity} × ` : ''}
                {isAr ? 'تم الاختيار' : 'Selected'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 dark:bg-neutral-800 dark:hover:bg-amber-500 text-slate-800 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-neutral-950 font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">{isAr ? 'اختيار للطلب' : 'Add to Order'}</span>
            </button>
          )}
        </div>

        {/* Note preview if user added notes */}
        {isSelected && userNotes && (
          <div className="flex items-center justify-between text-[11px] px-1 pt-1.5 text-slate-500 dark:text-neutral-400">
            <span className="truncate max-w-[210px] text-amber-600 dark:text-amber-300/90 font-medium">
              📝 {userNotes}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-white flex items-center gap-0.5 font-bold cursor-pointer shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isAr ? 'تعديل' : 'Edit'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
