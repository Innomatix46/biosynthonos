/**
 * @file A container component that groups all user input forms,
 * the main action buttons, and a Profile Management section.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from '../shared/types';
import { AthleteProfileForm } from './AthleteProfileForm';
import { NutritionForm } from './NutritionForm';
import { ProtocolDesignerForm } from './ProtocolDesignerForm';
import { SupportForm } from './SupportForm';
import { PctForm } from './PctForm';
import { PlayCircle, XCircle, Save, Trash2, FolderOpen, Wand2 } from 'lucide-react';

interface InputPanelProps {
  appState: AppState;
  onInputChange: <K extends keyof AppState>(section: K, data: AppState[K]) => void;
  onSimulate: () => void;
  onClear: () => void;
  onSuggestProtocol: () => void;
  isSuggesting: boolean;
  hasResults: boolean;
  // --- Profile Management Props ---
  savedProfiles: Record<string, AppState>;
  activeProfileName: string;
  onSaveProfile: () => void;
  onLoadProfile: (name: string) => void;
  onDeleteProfile: () => void;
}

// A local component for managing profiles, only used within InputPanel.
const ProfileManager: React.FC<Pick<InputPanelProps, 'savedProfiles' | 'activeProfileName' | 'onSaveProfile' | 'onLoadProfile' | 'onDeleteProfile'>> = ({
    savedProfiles,
    activeProfileName,
    onSaveProfile,
    onLoadProfile,
    onDeleteProfile
}) => {
    const { t } = useTranslation();
    const profileNames = Object.keys(savedProfiles);

    return (
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-brand-blue flex items-center gap-2"><FolderOpen size={18}/> {t('profiles.title')}</h3>
            <div className="space-y-3">
                <div>
                    <label htmlFor="profile-select" className="block text-sm font-medium text-gray-400 mb-1">{t('profiles.load')}</label>
                    <div className="flex items-center gap-2">
                        <select
                            id="profile-select"
                            value={activeProfileName}
                            onChange={(e) => onLoadProfile(e.target.value)}
                            className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                            aria-label={t('profiles.aria_load')}
                        >
                            {profileNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <button
                            onClick={onDeleteProfile}
                            disabled={activeProfileName === 'Default'}
                            className="p-2 text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                            aria-label={t('profiles.aria_delete')}
                        >
                            <Trash2 size={20}/>
                        </button>
                    </div>
                </div>
                <button
                    onClick={onSaveProfile}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    <Save size={16} />
                    {t('profiles.save_button')}
                </button>
            </div>
        </div>
    )
}

export const InputPanel: React.FC<InputPanelProps> = ({ 
    appState, onInputChange, onSimulate, onClear, onSuggestProtocol, isSuggesting, hasResults,
    savedProfiles, activeProfileName, onSaveProfile, onLoadProfile, onDeleteProfile 
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 bg-brand-dark p-6 rounded-xl shadow-lg border border-gray-700 sticky top-24">
      <div className="space-y-3">
         <button
            onClick={onSuggestProtocol}
            disabled={isSuggesting}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:bg-indigo-800 disabled:cursor-wait"
        >
            {isSuggesting ? (
                <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>{t('actions.suggesting')}</span>
                </>
            ) : (
                <>
                    <Wand2 size={20} />
                    <span>{t('actions.suggest_protocol')}</span>
                </>
            )}
        </button>
        <button
          onClick={onSimulate}
          className="w-full flex items-center justify-center gap-3 bg-brand-blue hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all duration-300 transform hover:scale-105 active:scale-100"
        >
          <PlayCircle size={20} />
          <span>{t('actions.run_simulation')}</span>
        </button>
        {hasResults && (
           <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-3 bg-brand-pink hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          >
             <XCircle size={20} />
             <span>{t('actions.clear_simulations')}</span>
           </button>
        )}
      </div>

      <div className="border-t border-gray-700"></div>

      <ProfileManager 
        savedProfiles={savedProfiles}
        activeProfileName={activeProfileName}
        onSaveProfile={onSaveProfile}
        onLoadProfile={onLoadProfile}
        onDeleteProfile={onDeleteProfile}
      />
      <div className="border-t border-gray-700"></div>

      <AthleteProfileForm
        profile={appState.profile}
        onChange={(data) => onInputChange('profile', data)}
      />
      <div className="border-t border-gray-700"></div>
      
      <NutritionForm
        nutrition={appState.nutrition}
        onChange={(data) => onInputChange('nutrition', data)}
      />
      <div className="border-t border-gray-700"></div>
      
      <ProtocolDesignerForm
        protocolPhases={appState.protocolPhases}
        onChange={(data) => onInputChange('protocolPhases', data)}
      />
      <div className="border-t border-gray-700"></div>

      <SupportForm
        support={appState.support}
        onChange={(data) => onInputChange('support', data)}
      />
      <div className="border-t border-gray-700"></div>

      <PctForm
        pct={appState.pct}
        onChange={(data) => onInputChange('pct', data)}
      />
      
    </div>
  );
};