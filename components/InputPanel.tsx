import React, { useState } from 'react';
import { AppState } from '../types';
import { useI18n } from '../i18n';

interface InputPanelProps {
  appState: AppState;
  onSubmit: (text: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ appState, onSubmit }) => {
  const [text, setText] = useState('');
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && appState !== AppState.GENERATING) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-3 sm:px-4 z-20">
      <div className="glass-panel rounded-2xl p-2 shadow-2xl shadow-purple-900/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={appState === AppState.GENERATING}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 outline-none border-none text-base sm:text-lg"
            maxLength={100}
          />
          <button
            type="submit"
            disabled={!text.trim() || appState === AppState.GENERATING}
            className={`
              rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all duration-300
              flex items-center justify-center gap-2 min-w-[48px]
              ${!text.trim() || appState === AppState.GENERATING
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/50 active:scale-95'
              }
            `}
          >
            {appState === AppState.GENERATING ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">{t('sending')}</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{t('send')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputPanel;
