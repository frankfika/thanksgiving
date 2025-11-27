import React, { useRef, useState } from 'react';
import { StarData } from '../types';
import { useI18n } from '../i18n';

interface StarDetailProps {
  star: StarData | null;
  onClose: () => void;
}

const StarDetail: React.FC<StarDetailProps> = ({ star, onClose }) => {
  const { t } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!star) return null;

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Create a pure canvas-based image without html2canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const scale = 2;
      const width = 400;
      const height = 500;

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#14141e');
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Accent glow
      const glowGradient = ctx.createRadialGradient(width - 50, 50, 0, width - 50, 50, 150);
      glowGradient.addColorStop(0, star.aiResponse.sentimentColor + '40');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Star icon circle
      ctx.beginPath();
      ctx.arc(width / 2, 70, 40, 0, Math.PI * 2);
      ctx.strokeStyle = star.aiResponse.sentimentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Star symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('★', width / 2, 78);

      // Category badge
      ctx.fillStyle = star.aiResponse.sentimentColor;
      ctx.font = 'bold 10px Arial';
      ctx.fillText(star.aiResponse.category.toUpperCase(), width / 2, 130);

      // Original text (quote)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 18px Georgia, serif';
      const quote = `"${star.originalText}"`;
      const maxWidth = width - 60;
      const lines = wrapText(ctx, quote, maxWidth);
      let y = 165;
      lines.forEach(line => {
        ctx.fillText(line, width / 2, y);
        y += 24;
      });

      // Divider line
      y += 10;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width - 80, y);
      ctx.stroke();
      y += 25;

      // Info grid
      ctx.font = '8px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const gridY = y;
      ctx.fillText(t('archetype').toUpperCase(), width / 6, gridY);
      ctx.fillText(t('distance').toUpperCase(), width / 2, gridY);
      ctx.fillText(t('resonance').toUpperCase(), (width * 5) / 6, gridY);

      ctx.font = '11px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(star.aiResponse.archetype, width / 6, gridY + 18);
      ctx.fillText(star.aiResponse.distance, width / 2, gridY + 18);
      ctx.fillText(star.aiResponse.frequency, (width * 5) / 6, gridY + 18);
      y = gridY + 45;

      // Blessing text
      ctx.fillStyle = 'rgba(200,200,220,0.9)';
      ctx.font = 'italic 13px Georgia, serif';
      ctx.textAlign = 'left';
      const blessingLines = wrapText(ctx, star.aiResponse.blessing, maxWidth - 20);
      // Left border
      ctx.strokeStyle = star.aiResponse.sentimentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(35, y + blessingLines.length * 20);
      ctx.stroke();

      blessingLines.forEach(line => {
        ctx.fillText(line, 45, y + 5);
        y += 20;
      });

      // Watermark
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Arial';
      ctx.fillText('thanksgiving.node404.fun', width / 2, height - 20);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
              <div style="text-align:center;">
                <img src="${dataUrl}" style="max-width:100%;"/>
                <p style="color:#fff;margin-top:20px;">长按图片保存</p>
              </div>
            </body></html>
          `);
        }
      } else {
        const link = document.createElement('a');
        link.download = `gratitude-star-${star.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />
      <div
        ref={cardRef}
        className="relative glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border-t border-white/20 shadow-2xl"
        style={{
          boxShadow: `0 0 100px ${star.aiResponse.sentimentColor}20`,
          background: 'linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(10,10,15,0.98) 100%)'
        }}
      >
        {/* Background Accent */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ backgroundColor: star.aiResponse.sentimentColor }}
        />

        {/* Close Button */}
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

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-amber-500/80 to-orange-600/80 text-white text-sm sm:text-base font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('downloading') || 'Downloading...'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{t('download') || 'Save Image'}</span>
              </>
            )}
          </button>

          {/* Watermark for downloaded image */}
          <div className="text-white/30 text-[10px] sm:text-xs">
            thanksgiving.node404.fun
          </div>

        </div>
      </div>
    </div>
  );
};

export default StarDetail;
