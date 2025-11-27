import React from 'react';
import { StarData } from '../types';
import { useI18n } from '../i18n';

interface StarDetailProps {
  star: StarData | null;
  onClose: () => void;
}

const StarDetail: React.FC<StarDetailProps> = ({ star, onClose }) => {
  const { t } = useI18n();
  if (!star) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      <div
        className="relative glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border-t border-white/20 shadow-2xl"
        style={{
          boxShadow: `0 0 100px ${star.aiResponse.sentimentColor}20`
        }}
      >
        {/* Background Accent */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ backgroundColor: star.aiResponse.sentimentColor }}
        />

        {/* Close Button - larger touch target on mobile */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 z-20"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 relative z-10">

          {/* Header Icon */}
          <div className="relative">
            <div
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full blur-xl animate-pulse absolute inset-0"
              style={{ backgroundColor: star.aiResponse.sentimentColor }}
            />
            <div
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full relative flex items-center justify-center border-2 border-white/20 bg-black/20 backdrop-blur-sm"
              style={{ borderColor: star.aiResponse.sentimentColor }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <span
              className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/10 inline-block"
              style={{ color: star.aiResponse.sentimentColor, backgroundColor: `${star.aiResponse.sentimentColor}15` }}
            >
              {star.aiResponse.category}
            </span>
            <h2 className="text-xl sm:text-3xl font-light text-white italic leading-tight px-2">
              "{star.originalText}"
            </h2>
          </div>

          <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Fun Info Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
            <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">{t('archetype')}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-white/90 break-words text-center">{star.aiResponse.archetype}</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">{t('distance')}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-white/90 break-words text-center">{star.aiResponse.distance}</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1">{t('resonance')}</span>
              <span className="text-[10px] sm:text-xs font-semibold text-white/90 break-words text-center">{star.aiResponse.frequency}</span>
            </div>
          </div>

          <p className="text-sm sm:text-lg text-stardust leading-relaxed font-serif border-l-2 pl-3 sm:pl-4 text-left italic opacity-90"
             style={{ borderColor: star.aiResponse.sentimentColor }}
          >
            {star.aiResponse.blessing}
          </p>

        </div>
      </div>
    </div>
  );
};

export default StarDetail;
