/**
 * @file A simple, static component that displays an important legal and medical disclaimer.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-12 p-4 bg-gray-800 border border-yellow-600 rounded-lg text-center">
      <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
        <ShieldAlert size={20} />
        <h3 className="text-lg font-bold">{t('disclaimer.title')}</h3>
      </div>
      <p className="text-sm text-gray-400">
        {t('disclaimer.text')}
      </p>
    </div>
  );
};
