import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Languages } from 'lucide-react';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-brand-dark/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700/50">
      <div className="container mx-auto flex items-center justify-between p-4 text-gray-200">
        <div className="flex items-center gap-3">
          <Bot size={32} className="text-brand-blue" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t('header.title')}</h1>
            <p className="text-xs text-gray-400">{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Languages size={18} className="text-gray-400" />
           <button 
             onClick={() => changeLanguage('en')} 
             className={`px-2 py-1 text-sm font-semibold rounded-md transition-colors ${i18n.language.startsWith('en') ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
             aria-pressed={i18n.language.startsWith('en')}
           >
             EN
           </button>
           <button 
             onClick={() => changeLanguage('de')} 
             className={`px-2 py-1 text-sm font-semibold rounded-md transition-colors ${i18n.language.startsWith('de') ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
             aria-pressed={i18n.language.startsWith('de')}
           >
             DE
           </button>
        </div>
      </div>
    </header>
  );
};
