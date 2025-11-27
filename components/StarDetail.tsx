import React from 'react';
import { StarData } from '../types';

interface StarDetailProps {
  star: StarData | null;
  onClose: () => void;
}

const StarDetail: React.FC<StarDetailProps> = ({ star, onClose }) => {
  if (!star) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500" 
        onClick={onClose}
      />
      <div 
        className="relative glass-panel rounded-3xl p-8 max-w-lg w-full border-t border-white/20 shadow-2xl animate-[float_6s_ease-in-out_infinite] overflow-hidden"
        style={{
          boxShadow: `0 0 100px ${star.aiResponse.sentimentColor}20`
        }}
      >
        {/* Background Accent */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ backgroundColor: star.aiResponse.sentimentColor }}
        />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white hover:rotate-90 transition-all duration-300"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="flex flex-col items-center text-center space-y-8 relative z-10">
          
          {/* Header Icon */}
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-full blur-xl animate-pulse absolute inset-0"
              style={{ backgroundColor: star.aiResponse.sentimentColor }}
            />
            <div 
              className="w-24 h-24 rounded-full relative flex items-center justify-center border-2 border-white/20 bg-black/20 backdrop-blur-sm"
              style={{ borderColor: star.aiResponse.sentimentColor }}
            >
              <i className="fas fa-star text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"></i>
            </div>
          </div>
          
          <div className="space-y-3">
            <span 
              className="text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/10"
              style={{ color: star.aiResponse.sentimentColor, backgroundColor: `${star.aiResponse.sentimentColor}15` }}
            >
              {star.aiResponse.category}
            </span>
            <h2 className="text-3xl font-light text-white italic leading-tight">
              "{star.originalText}"
            </h2>
          </div>

          <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Fun Info Grid */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Archetype</span>
              <span className="text-xs font-semibold text-white/90">{star.aiResponse.archetype}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Distance</span>
              <span className="text-xs font-semibold text-white/90">{star.aiResponse.distance}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Resonance</span>
              <span className="text-xs font-semibold text-white/90">{star.aiResponse.frequency}</span>
            </div>
          </div>

          <p className="text-lg text-stardust leading-relaxed font-serif border-l-2 pl-4 text-left italic opacity-90"
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