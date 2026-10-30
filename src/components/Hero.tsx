import React from 'react';
import { MapPin, ArrowDown, MessageCircle, Clock } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu }) => {
  const { isAr, t, currency } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900 transition-colors duration-200">
      {/* Subtle warm ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-start">
            {/* Top Tagline from menu */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs sm:text-sm font-bold shadow-xs">
              <span>{t('tagline')}</span>
              <span className="text-slate-400 dark:text-neutral-500">·</span>
              <span className="text-slate-700 dark:text-neutral-300">{t('station_location_tag')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t('hero_h1_lead')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-500 dark:to-amber-500">
                {t('hero_h1_highlight')}
              </span>{' '}
              {t('hero_h1_trail')}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {t('hero_description')}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 font-black text-base rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>{t('explore_menu_btn')}</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>

              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=${encodeURIComponent(
                  isAr
                    ? 'السلام عليكم، أود الاستفسار والطلب من مطعم بروستد مشوار الفرسان'
                    : 'Hello, I would like to inquire and place an order from Meshwar Al Forsan Broasted'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t('quick_order_whatsapp')}</span>
              </a>

              <a
                href={`${import.meta.env.BASE_URL}assets/aistudio/______________36724bc9.pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-amber-400 border border-slate-300 dark:border-neutral-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>{t('view_original_pdf')}</span>
              </a>

              <a
                href={RESTAURANT_INFO.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white border border-slate-300 dark:border-neutral-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{t('view_on_map')}</span>
              </a>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl group">
              <img
                src={`${import.meta.env.BASE_URL}assets/images/broasted_chicken_hero_1792665160048.jpg`}
                alt={isAr ? 'بروستد مشوار الفرسان الذهبي المقرمش' : 'Golden Crispy Broasted Chicken'}
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
              
              {/* Official Brand Stamp with Logo */}
              <div className="absolute top-4 start-4 z-10 flex items-center gap-2 p-1.5 pe-3 rounded-xl bg-neutral-950/85 text-white text-xs font-black shadow-lg backdrop-blur-md border border-amber-500/30">
                <div className="w-8 h-6 rounded-md overflow-hidden bg-amber-400/20 p-0.5 border border-amber-400/40 shrink-0">
                  <img src={RESTAURANT_INFO.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-amber-400">{isAr ? 'بروستد مشوار الفرسان' : 'Meshwar Al Forsan'}</span>
              </div>

              {/* Overlay Badge */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-start">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {isAr ? 'تحضير فوري طازج' : 'Fresh & Fast Preparation'}
                  </span>
                  <span className="text-xs text-neutral-300 font-mono font-bold">
                    {isAr ? `تبدأ من 18 ${currency}` : `Starts from 18 ${currency}`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {isAr ? 'بروستد الفرسان المقرمش (عادي / حراق)' : 'Al Forsan Crispy Broasted (Regular / Spicy)'}
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {isAr
                    ? 'مع البطاطس الذهبية، صلصة الثوم الأصلية، والخبز الطازج.'
                    : 'Served with golden fries, authentic garlic dip, and warm bread.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
