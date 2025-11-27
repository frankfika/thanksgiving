import React, { useState, useEffect, useCallback } from 'react';
import GalaxyCanvas from './components/GalaxyCanvas';
import InputPanel from './components/InputPanel';
import StarDetail from './components/StarDetail';
import { analyzeGratitude } from './services/geminiService';
import { StarData, AppState } from './types';

// Pre-fill with some initial stars so the galaxy isn't empty
const INITIAL_STARS: StarData[] = [
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
    originalText: "Grateful for the warm coffee this morning",
    aiResponse: { 
      category: "Small Joys", 
      sentimentColor: "#e67e22", 
      blessing: "In the smallest sips, we taste the vast comfort of the universe.", 
      brightness: 0.6,
      archetype: "The Observer",
      distance: "0.01 Light Years",
      frequency: "528 Hz"
    }
  },
  {
    id: 'init-3',
    originalText: "Thankful for the code that runs without errors",
    aiResponse: { 
      category: "Career", 
      sentimentColor: "#2ecc71", 
      blessing: "Order from chaos is a divine act; may your logic always flow clear.", 
      brightness: 0.8,
      archetype: "The Architect",
      distance: "10101 Light Years",
      frequency: "60 Hz"
    }
  }
];

const App: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>(INITIAL_STARS);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Handle creating a new star
  const handleCreateStar = useCallback(async (text: string) => {
    setAppState(AppState.GENERATING);
    try {
      const newStar = await analyzeGratitude(text);
      // Add the new star. Note: D3 handles the x/y initialization naturally.
      setStars((prev) => [...prev, newStar]);
      
      // Auto-select the new star after a brief delay so the user sees the result
      setTimeout(() => {
        setSelectedStar(newStar);
      }, 800);
      
    } catch (error) {
      console.error("Failed to create star", error);
    } finally {
      setAppState(AppState.IDLE);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-space text-white overflow-hidden selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#000000] to-black opacity-80" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />

      {/* Header / Title */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-thin tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-400">
          GRATITUDE ORBIT
        </h1>
        <p className="text-white/40 text-sm mt-2 tracking-widest uppercase">
          Happy Thanksgiving • 感恩星轨
        </p>
      </div>

      {/* Intro Overlay (Disappears on interaction or after time) */}
      {showIntro && (
        <div 
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-1000"
          onClick={() => setShowIntro(false)}
        >
          <div className="text-center max-w-2xl px-6 animate-pulse-slow cursor-pointer">
            <h2 className="text-3xl md:text-5xl font-light mb-6 text-white">Share Your Light</h2>
            <p className="text-lg text-gray-300 font-light leading-relaxed">
              Every gratitude creates a star. <br/>
              Let the universe transform your thanks into a constellation of blessings.
            </p>
            <div className="mt-8 text-white/30 text-sm uppercase tracking-widest">
              Tap anywhere to begin
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
      
      {/* API Key Warning (Hidden if env valid) */}
      {!process.env.API_KEY && (
        <div className="absolute top-0 w-full bg-red-600/80 text-white text-center p-2 text-xs z-50">
          Missing API_KEY in environment variables. Gemini features will fail.
        </div>
      )}
    </div>
  );
};

export default App;