import React, { useState, useEffect, useCallback } from 'react';
import GalaxyCanvas from './components/GalaxyCanvas';
import InputPanel from './components/InputPanel';
import StarDetail from './components/StarDetail';
import { analyzeGratitude } from './services/deepseekService';
import { StarData, AppState } from './types';
import { useI18n } from './i18n';
import { checkRateLimit, incrementCount, getRemainingCount } from './services/rateLimit';
import { fetchStars, saveStar } from './services/starsApi';

// Default stars as fallback
const DEFAULT_STARS: StarData[] = [
  {
    id: 'init-1',
    originalText: "I am thankful for my healthy family",
    aiResponse: {
      category: "Family",
      sentimentColor: "#FFD700",
      blessing: "Family is the root that anchors us in the storm of life; cherish their warmth.",
      brightness: 0.9,
      archetype: "The Guardian",
      distance: "12 Light Years",
      frequency: "432 Hz"
    }
  },
  {
    id: 'init-2',
    originalText: "感恩今天的温暖阳光",
    aiResponse: {
      category: "自然",
      sentimentColor: "#e67e22",
      blessing: "阳光是宇宙对你的微笑，每一缕光都承载着无尽的温暖。",
      brightness: 0.7,
      archetype: "观察者",
      distance: "8.3 光分",
      frequency: "528 Hz"
    }
  },
  {
    id: 'init-3',
    originalText: "Thankful for good friends",
    aiResponse: {
      category: "Friendship",
      sentimentColor: "#9b59b6",
      blessing: "Friends are stars in your personal galaxy; their light guides you through the darkest nights.",
      brightness: 0.85,
      archetype: "The Connector",
      distance: "Heart's Distance",
      frequency: "396 Hz"
    }
  },
  {
    id: 'init-4',
    originalText: "感恩每一次成长的机会",
    aiResponse: {
      category: "成长",
      sentimentColor: "#2ecc71",
      blessing: "成长是灵魂的扩展，每一次挑战都是宇宙赐予的礼物。",
      brightness: 0.8,
      archetype: "探索者",
      distance: "无限远",
      frequency: "741 Hz"
    }
  }
];

const App: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>(DEFAULT_STARS);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [remaining, setRemaining] = useState(20);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [isWechat, setIsWechat] = useState(false);
  const { lang, setLang, t } = useI18n();

  // Detect WeChat browser
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('micromessenger')) {
      setIsWechat(true);
    }
  }, []);

  // Load shared stars and check rate limit on mount
  useEffect(() => {
    setRemaining(getRemainingCount());

    // Fetch shared stars from API and merge with defaults
    fetchStars().then((sharedStars) => {
      if (sharedStars.length > 0) {
        // Merge: default stars + API stars (avoid duplicates by id)
        const existingIds = new Set(sharedStars.map(s => s.id));
        const uniqueDefaults = DEFAULT_STARS.filter(s => !existingIds.has(s.id));
        setStars([...uniqueDefaults, ...sharedStars]);
      }
    });
  }, []);

  // Handle creating a new star
  const handleCreateStar = useCallback(async (text: string) => {
    // Check rate limit
    const { allowed } = checkRateLimit();
    if (!allowed) {
      setRateLimitError(true);
      setTimeout(() => setRateLimitError(false), 3000);
      return;
    }

    setAppState(AppState.GENERATING);
    try {
      const newStar = await analyzeGratitude(text);

      // Save to shared API
      await saveStar(newStar);

      // Increment rate limit counter
      incrementCount();
      setRemaining(getRemainingCount());

      // Add the new star locally
      setStars((prev) => [...prev, newStar]);

      // Show the newly created star's detail card
      setSelectedStar(newStar);

    } catch (error) {
      console.error("Failed to create star", error);
    } finally {
      setAppState(AppState.IDLE);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-space text-white overflow-hidden selection:bg-purple-500/30">

      {/* WeChat Browser Warning */}
      {isWechat && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-6">🌟</div>
            <h2 className="text-xl font-medium mb-4 text-white">
              {lang === 'zh' ? '请在浏览器中打开' : 'Please Open in Browser'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {lang === 'zh'
                ? '为了获得最佳体验并支持图片下载功能，请点击右上角「···」选择「在浏览器中打开」'
                : 'For the best experience and to enable image download, please tap "..." in the top right corner and select "Open in Browser"'}
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <span>👆</span>
                <span>{lang === 'zh' ? '点击右上角 ···' : 'Tap ... in top right'}</span>
              </div>
              <svg className="w-16 h-16 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#000000] to-black opacity-80" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />

      {/* Header / Title */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10 pointer-events-none">
        <h1 className="text-2xl sm:text-4xl font-thin tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-400">
          {t('title')}
        </h1>
        <p className="text-white/40 text-xs sm:text-sm mt-1 sm:mt-2 tracking-widest uppercase">
          {t('subtitle')}
        </p>
      </div>

      {/* Language Switcher */}
      <button
        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        className="absolute top-4 sm:top-8 right-4 sm:right-8 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full glass-panel text-white/60 hover:text-white text-xs sm:text-sm transition-colors"
      >
        {lang === 'zh' ? 'EN' : '中文'}
      </button>

      {/* Intro Overlay (Disappears on interaction or after time) */}
      {showIntro && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-1000"
          onClick={() => setShowIntro(false)}
        >
          <div className="text-center max-w-2xl px-4 sm:px-6 animate-pulse-slow cursor-pointer">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light mb-4 sm:mb-6 text-white">{t('introTitle')}</h2>
            <p className="text-sm sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
              {t('introDesc')}
            </p>
            <div className="mt-6 sm:mt-8 text-white/30 text-xs sm:text-sm uppercase tracking-widest">
              {t('introHint')}
            </div>
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <GalaxyCanvas stars={stars} onStarClick={setSelectedStar} />

      {/* Controls */}
      <InputPanel appState={appState} onSubmit={handleCreateStar} />

      {/* Detail Modal */}
      <StarDetail star={selectedStar} onClose={() => setSelectedStar(null)} />

      {/* Rate Limit Error */}
      {rateLimitError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-orange-600/90 text-white px-4 py-2 rounded-lg text-sm z-50 animate-pulse">
          {t('rateLimitExceeded')}
        </div>
      )}

      {/* Remaining Count */}
      <div className="fixed bottom-16 sm:absolute sm:bottom-24 left-1/2 transform -translate-x-1/2 text-white/40 text-[10px] sm:text-xs z-10">
        {t('remaining')}: {remaining} {t('times')}
      </div>
    </div>
  );
};

export default App;