import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

const translations = {
  zh: {
    title: '感恩星轨',
    subtitle: 'GRATITUDE ORBIT • Happy Thanksgiving',
    introTitle: '分享你的光芒',
    introDesc: '每一份感恩都会化为一颗星星。\n让宇宙将你的感谢转化为祝福的星座。',
    introHint: '点击任意位置开始',
    placeholder: '今天你感恩什么？',
    sending: '点亮中...',
    send: '发送',
    archetype: '原型',
    distance: '距离',
    resonance: '共振',
    missingKey: '缺少 DEEPSEEK_KEY 环境变量，AI 功能将无法使用。',
    rateLimitExceeded: '今日发送次数已达上限（20次）',
    remaining: '今日剩余',
    times: '次',
  },
  en: {
    title: 'GRATITUDE ORBIT',
    subtitle: 'Happy Thanksgiving • 感恩星轨',
    introTitle: 'Share Your Light',
    introDesc: 'Every gratitude creates a star.\nLet the universe transform your thanks into a constellation of blessings.',
    introHint: 'Tap anywhere to begin',
    placeholder: 'What are you thankful for today?',
    sending: 'Igniting...',
    send: 'Send',
    archetype: 'Archetype',
    distance: 'Distance',
    resonance: 'Resonance',
    missingKey: 'Missing DEEPSEEK_KEY in environment variables. AI features will fail.',
    rateLimitExceeded: 'Daily limit reached (20 times)',
    remaining: 'Remaining today',
    times: '',
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.zh) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('zh');

  const t = (key: keyof typeof translations.zh): string => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
