/**
 * @file A component that acts as an age gate, requiring user confirmation before displaying the main app.
 * This is for youth protection and to clarify the scientific purpose of the tool.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

interface AgeGateProps {
  onConfirm: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onConfirm }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-brand-dark p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full text-center text-gray-200">
        <ShieldAlert size={48} className="mx-auto text-brand-yellow mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('ageGate.title')}</h1>
        <p className="text-sm text-gray-400 mb-6">{t('ageGate.disclaimer')}</p>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
           <p className="text-md font-semibold text-gray-200">{t('ageGate.confirmationQuestion')}</p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onConfirm}
            className="w-full flex-1 bg-brand-blue hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all duration-300 transform hover:scale-105"
            aria-label={t('ageGate.confirmButton')}
          >
            {t('ageGate.confirmButton')}
          </button>
          <a 
            href="https://www.google.com" // A neutral exit point
            className="w-full flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-4 rounded-lg transition-colors"
            aria-label={t('ageGate.exitButton')}
          >
            {t('ageGate.exitButton')}
          </a>
        </div>
      </div>
    </div>
  );
};
