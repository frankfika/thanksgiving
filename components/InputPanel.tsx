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
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4 z-20">
      <div className="glass-panel rounded-2xl p-2 shadow-2xl shadow-purple-900/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={appState === AppState.GENERATING}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 outline-none border-none text-lg"
            maxLength={100}
          />
          <button
            type="submit"
            disabled={!text.trim() || appState === AppState.GENERATING}
            className={`
              rounded-xl px-6 py-3 font-semibold transition-all duration-300
              flex items-center gap-2
              ${!text.trim() || appState === AppState.GENERATING
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5'
              }
            `}
          >
            {appState === AppState.GENERATING ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                <span className="hidden sm:inline">{t('sending')}</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{t('send')}</span>
                <i className="fas fa-paper-plane"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputPanel;