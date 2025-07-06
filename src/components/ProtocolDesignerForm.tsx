/**
 * @file A new form component for designing complex, multi-phase pharmacological protocols.
 * Allows users to add/remove phases and compounds within each phase.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { ProtocolPhase, PedProtocol, PedCompound } from '../shared/types';
import { PED_COMPOUNDS } from '../constants';
import { Beaker, PlusCircle, Trash2, Layers, Clock } from 'lucide-react';

// Group compounds by category for the dropdown. This implementation is more type-safe.
const groupedCompounds = PED_COMPOUNDS.reduce<Record<string, PedCompound[]>>((acc, compound) => {
  const { category } = compound;
  
  // Exclude support and PCT compounds from this form as they are handled in separate sections.
  // The 'None' compound is in the 'Other' category and will be included correctly.
  if (category === 'Support' || category === 'SERM') {
    return acc;
  }

  if (!acc[category]) {
    acc[category] = [];
  }
  
  acc[category].push(compound);
  return acc;
}, {});


interface ProtocolDesignerFormProps {
  protocolPhases: ProtocolPhase[];
  onChange: (phases: ProtocolPhase[]) => void;
}

export const ProtocolDesignerForm: React.FC<ProtocolDesignerFormProps> = ({ protocolPhases, onChange }) => {
  const { t } = useTranslation();
  
  const handlePhaseChange = (phaseId: string, field: keyof Omit<ProtocolPhase, 'id' | 'compounds'>, value: string | number) => {
    onChange(
      protocolPhases.map(phase =>
        phase.id === phaseId ? { ...phase, [field]: value } : phase
      )
    );
  };

  const handleAddPhase = () => {
    const newPhase: ProtocolPhase = {
      id: nanoid(),
      name: t('forms.designer.new_phase_name'),
      durationWeeks: 8,
      compounds: [{
        id: nanoid(),
        compound: 'None',
        dosage: 0,
        frequency: 'weekly',
      }],
    };
    onChange([...protocolPhases, newPhase]);
  };

  const handleRemovePhase = (phaseId: string) => {
    onChange(protocolPhases.filter(phase => phase.id !== phaseId));
  };

  const handleCompoundChange = (phaseId: string, compoundId: string, field: keyof Omit<PedProtocol, 'id'>, value: string | number) => {
    onChange(
      protocolPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            compounds: phase.compounds.map(c =>
              c.id === compoundId ? { ...c, [field]: value } : c
            ),
          };
        }
        return phase;
      })
    );
  };

  const handleAddCompound = (phaseId: string) => {
    const newCompound: PedProtocol = {
      id: nanoid(),
      compound: 'None',
      dosage: 0,
      frequency: 'weekly',
    };
    onChange(
      protocolPhases.map(phase =>
        phase.id === phaseId ? { ...phase, compounds: [...phase.compounds, newCompound] } : phase
      )
    );
  };

  const handleRemoveCompound = (phaseId: string, compoundId: string) => {
    onChange(
      protocolPhases.map(phase => {
        if (phase.id === phaseId) {
          return { ...phase, compounds: phase.compounds.filter(c => c.id !== compoundId) };
        }
        return phase;
      })
    );
  };
  
  const totalDuration = protocolPhases.reduce((sum, phase) => sum + Number(phase.durationWeeks || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-brand-yellow flex items-center gap-2"><Beaker size={20}/> {t('forms.designer.title')}</h2>
        <span className="text-sm font-mono bg-yellow-900/50 text-brand-yellow px-2 py-1 rounded">{t('forms.designer.total_duration')}: {totalDuration} {t('forms.designer.weeks')}</span>
      </div>

      <div className="space-y-6">
        {protocolPhases.map((phase, phaseIndex) => (
          <div key={phase.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2"><Layers size={18}/> {t('forms.designer.phase_num', { num: phaseIndex + 1 })}</h3>
              {protocolPhases.length > 1 && (
                <button onClick={() => handleRemovePhase(phase.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.designer.phase_name')}</label>
                    <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => handlePhaseChange(phase.id, 'name', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1"><Clock size={14}/> {t('forms.common.duration_weeks')}</label>
                    <input
                        type="number"
                        value={phase.durationWeeks}
                        onChange={(e) => handlePhaseChange(phase.id, 'durationWeeks', Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                    />
                </div>
            </div>

            <div className="space-y-3">
              {phase.compounds.map((p, index) => (
                <div key={p.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-400">{t('forms.common.compound_num', { num: index + 1 })}</label>
                    {phase.compounds.length > 1 && (
                      <button onClick={() => handleRemoveCompound(phase.id, p.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <select
                    value={p.compound}
                    onChange={(e) => handleCompoundChange(phase.id, p.id, 'compound', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                  >
                     {Object.keys(groupedCompounds).map((category) => (
                        <optgroup key={category} label={category}>
                        {groupedCompounds[category].map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </optgroup>
                    ))}
                  </select>
                  <div className={`grid grid-cols-2 gap-4 transition-opacity ${p.compound === 'None' ? 'opacity-50' : 'opacity-100'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.dosage')}</label>
                      <input
                        type="number"
                        value={p.dosage}
                        onChange={(e) => handleCompoundChange(phase.id, p.id, 'dosage', Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                        disabled={p.compound === 'None'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.common.frequency')}</label>
                      <select
                        value={p.frequency}
                        onChange={(e) => handleCompoundChange(phase.id, p.id, 'frequency', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                        disabled={p.compound === 'None'}
                      >
                        <option value="daily">{t('frequency.daily')}</option>
                        <option value="eod">{t('frequency.eod')}</option>
                        <option value="e3d">{t('frequency.e3d')}</option>
                        <option value="weekly">{t('frequency.weekly')}</option>
                        <option value="bi-weekly">{t('frequency.bi_weekly')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleAddCompound(phase.id)}
                className="w-full flex items-center justify-center gap-2 text-xs bg-gray-800 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                disabled={phase.compounds.some(c => c.compound === 'None')}
              >
                <PlusCircle size={14} /> {t('forms.designer.add_compound_button')}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddPhase}
        className="w-full flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        <PlusCircle size={16} />
        {t('forms.designer.add_phase_button')}
      </button>
    </div>
  );
};