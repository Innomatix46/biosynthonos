/**
 * @file A form component for inputting the athlete's profile data,
 * including biometrics, goals, and health factors. Now includes experience level and baseline blood work.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AthleteProfile } from '../shared/types';
import { User, Target, Dna, FileText, Activity, Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { GOAL_OPTIONS, GENETIC_FACTOR_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from '../constants';

interface AthleteProfileFormProps {
  profile: AthleteProfile;
  onChange: (profile: AthleteProfile) => void;
}

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-700/50 transition-colors">
                <h3 className="text-md font-semibold flex items-center gap-2">{icon} {title}</h3>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOpen && <div className="p-3 pt-2 border-t border-gray-700">{children}</div>}
        </div>
    );
};

export const AthleteProfileForm: React.FC<AthleteProfileFormProps> = ({ profile, onChange }) => {
  const { t } = useTranslation();
  /**
   * Handles changes for standard input, select, and textarea elements.
   * It correctly casts numeric values.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['age', 'weight', 'bfp'].includes(name);
    onChange({ ...profile, [name]: isNumeric ? Number(value) : value });
  };
  
  const handleBloodworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
        ...profile,
        baselineBloodWork: {
            ...profile.baselineBloodWork,
            [name]: value === '' ? undefined : Number(value)
        }
    })
  }

  /**
   * Handles changes for the genetic factor checkboxes,
   * adding or removing factors from the array.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentFactors = profile.geneticFactors;
    if (checked) {
      onChange({ ...profile, geneticFactors: [...currentFactors, value] });
    } else {
      onChange({ ...profile, geneticFactors: currentFactors.filter(factor => factor !== value) });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-blue flex items-center gap-2"><User size={20}/> {t('forms.profile.title')}</h2>
      {/* Biometric inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.profile.age')}</label>
          <input type="number" name="age" value={profile.age} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.profile.gender')}</label>
          <select name="gender" value={profile.gender} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none">
            <option value="male">{t('forms.profile.male')}</option>
            <option value="female">{t('forms.profile.female')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.profile.weight')}</label>
          <input type="number" name="weight" value={profile.weight} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.profile.bfp')}</label>
          <input type="number" name="bfp" value={profile.bfp} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
        </div>
      </div>
       <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><Activity size={16}/> {t('forms.profile.experience')}</label>
          <select name="experienceLevel" value={profile.experienceLevel} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none">
            {EXPERIENCE_LEVEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{t(option.tKey)}</option>)}
          </select>
        </div>
       <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><Target size={16}/> {t('forms.profile.goal')}</label>
          <select name="goal" value={profile.goal} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none">
            {GOAL_OPTIONS.map(optionKey => <option key={optionKey} value={optionKey}>{t(optionKey)}</option>)}
          </select>
        </div>
        
        <CollapsibleSection title={t('forms.profile.bloodwork_title')} icon={<Beaker size={16} />}>
            <p className="text-xs text-gray-500 mb-3">{t('forms.profile.bloodwork_subtitle')}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.systolicBP')}</label>
                    <input type="number" name="systolicBP" value={profile.baselineBloodWork?.systolicBP ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                 <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.diastolicBP')}</label>
                    <input type="number" name="diastolicBP" value={profile.baselineBloodWork?.diastolicBP ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.glucose')}</label>
                    <input type="number" name="glucose" value={profile.baselineBloodWork?.glucose ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.totalTestosterone')}</label>
                    <input type="number" name="totalTestosterone" value={profile.baselineBloodWork?.totalTestosterone ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                 <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.hdl')}</label>
                    <input type="number" name="hdl" value={profile.baselineBloodWork?.hdl ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.ldl')}</label>
                    <input type="number" name="ldl" value={profile.baselineBloodWork?.ldl ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.alt')}</label>
                    <input type="number" name="alt" value={profile.baselineBloodWork?.alt ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.ast')}</label>
                    <input type="number" name="ast" value={profile.baselineBloodWork?.ast ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
                 <div className="text-sm">
                    <label className="block font-medium text-gray-400">{t('bloodMarkers.egfr')}</label>
                    <input type="number" name="egfr" value={profile.baselineBloodWork?.egfr ?? ''} onChange={handleBloodworkChange} className="w-full bg-gray-800 border-gray-600 rounded p-1.5 focus:ring-1 focus:ring-brand-blue"/>
                </div>
            </div>
        </CollapsibleSection>

        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><Dna size={16}/> {t('forms.profile.genetics')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {GENETIC_FACTOR_OPTIONS.map(factorKey => (
                    <label key={factorKey} className="flex items-center space-x-2 text-sm text-gray-300">
                        <input
                            type="checkbox"
                            value={factorKey}
                            checked={profile.geneticFactors.includes(factorKey)}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-4 w-4 rounded bg-gray-600 border-gray-500 text-brand-blue focus:ring-brand-blue"
                        />
                        <span>{t(factorKey)}</span>
                    </label>
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><FileText size={16}/> {t('forms.profile.history')}</label>
            <textarea name="medicalHistory" value={profile.medicalHistory} onChange={handleInputChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none" placeholder={t('forms.profile.history_placeholder')}></textarea>
        </div>
    </div>
  );
};