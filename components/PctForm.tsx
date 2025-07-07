/**
 * @file A form component for managing the Post-Cycle Therapy (PCT) protocol.
 * It allows the user to add, remove, and edit PCT compounds.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { PedProtocol } from '../shared/types';
import { PED_COMPOUNDS } from '../constants';
import { Recycle, PlusCircle, Trash2 } from 'lucide-react';

interface PctFormProps {
  pct: PedProtocol[];
  onChange: (pct: PedProtocol[]) => void;
}

// Filter compounds to only include those categorized as 'SERM' for PCT.
const pctCompounds = PED_COMPOUNDS.filter(c => c.category === 'SERM' || c.name === 'None');

export const PctForm: React.FC<PctFormProps> = ({ pct, onChange }) => {
  const { t } = useTranslation();
  /**
   * Adds a new, empty compound entry to the PCT protocol.
   */
  const handleAddCompound = () => {
    const newCompound: PedProtocol = {
      id: nanoid(),
      compound: 'None',
      dosage: 0,
      frequency: 'daily',
      durationWeeks: 4,
    };
    onChange([...pct, newCompound]);
  };

  /**
   * Removes a compound from the PCT protocol by its unique ID.
   */
  const handleRemoveCompound = (id: string) => {
    onChange(pct.filter(p => p.id !== id));
  };

  /**
   * Updates a specific field of a compound in the PCT protocol.
   */
  const handleCompoundChange = (id: string, field: keyof Omit<PedProtocol, 'id'>, value: string | number) => {
    onChange(
      pct.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };
  
  // Disable the "Add" button if there's already an unused "None" entry.
  const isAddDisabled = pct.some(p => p.compound === 'None');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-pink flex items-center gap-2"><Recycle size={20}/> {t('forms.pct.title')}</h2>
      <div className="space-y-4">
        {pct.map((p, index) => (
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
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-pink focus:outline-none"
            >
              {pctCompounds.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className={`grid grid-cols-2 gap-4 transition-opacity ${p.compound === 'None' ? 'opacity-50' : 'opacity-100'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.dosage_daily')}</label>
                <input
                  type="number"
                  name="dosage"
                  value={p.dosage}
                  onChange={(e) => handleCompoundChange(p.id, 'dosage', Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-pink focus:outline-none"
                  disabled={p.compound === 'None'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.duration_weeks')}</label>
                 <input
                  type="number"
                  name="durationWeeks"
                  value={p.durationWeeks}
                  onChange={(e) => handleCompoundChange(p.id, 'durationWeeks', Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-pink focus:outline-none"
                  disabled={p.compound === 'None'}
                />
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
        {t('forms.pct.add_button')}
      </button>
    </div>
  );
};