/**
 * @file A form component for managing the on-cycle support protocol,
 * including Aromatase Inhibitors, BP meds, etc.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PedProtocol } from '../shared/types';
import { PED_COMPOUNDS } from '../constants';
import { Shield, PlusCircle, Trash2 } from 'lucide-react';

interface SupportFormProps {
  support: PedProtocol[];
  onChange: (support: PedProtocol[]) => void;
}

// Filter compounds to only include those categorized as 'Support'.
const supportCompounds = PED_COMPOUNDS.filter(c => c.category === 'Support' || c.name === 'None');

export const SupportForm: React.FC<SupportFormProps> = ({ support, onChange }) => {
  const { t } = useTranslation();
  const handleAddCompound = () => {
    const newCompound: PedProtocol = {
      id: `support-${Date.now()}`,
      compound: 'None',
      dosage: 0,
      frequency: 'daily',
    };
    onChange([...support, newCompound]);
  };

  const handleRemoveCompound = (id: string) => {
    onChange(support.filter(p => p.id !== id));
  };

  const handleCompoundChange = (id: string, field: keyof Omit<PedProtocol, 'id'>, value: string | number) => {
    onChange(
      support.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };
  
  const isAddDisabled = support.some(p => p.compound === 'None');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2"><Shield size={20}/> {t('forms.support.title')}</h2>
      <div className="space-y-4">
        {support.map((p, index) => (
          <div key={p.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-400">{t('forms.common.compound_num', { num: index + 1 })}</label>
                 <button onClick={() => handleRemoveCompound(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                </button>
            </div>
            <select
              name="compound"
              value={p.compound}
              onChange={(e) => handleCompoundChange(p.id, 'compound', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              {supportCompounds.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className={`grid grid-cols-2 gap-4 transition-opacity ${p.compound === 'None' ? 'opacity-50' : 'opacity-100'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.dosage')}</label>
                <input
                  type="number"
                  name="dosage"
                  value={p.dosage}
                  onChange={(e) => handleCompoundChange(p.id, 'dosage', Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                  disabled={p.compound === 'None'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.frequency')}</label>
                 <select
                  name="frequency"
                  value={p.frequency}
                  onChange={(e) => handleCompoundChange(p.id, 'frequency', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                  disabled={p.compound === 'None'}
                >
                  <option value="daily">{t('frequency.daily')}</option>
                  <option value="eod">{t('frequency.eod')}</option>
                  <option value="weekly">{t('frequency.weekly')}</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddCompound}
        className="w-full flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isAddDisabled}
      >
        <PlusCircle size={16} />
        {t('forms.support.add_button')}
      </button>
    </div>
  );
};