
/**
 * @file This page component encapsulates all logic and state for the simulation feature.
 * It manages profiles, inputs, results, and interactions with the simulation engine and AI services.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, SimulationResult, BloodWork, LabReport } from '../shared/types';
import { runSimulationEngine } from '../engine/index';
import { getAiAnalysis, getAiProtocolSuggestion } from '../services/geminiService';
import { InputPanel } from '../components/InputPanel';
import { ResultsPanel } from '../components/ResultsPanel';
import { DEFAULT_APP_STATE } from '../constants';
import { useToast } from '../hooks/useToast';
import { validateSimulationModel } from '../engine/validator';
import { LabReportImporterModal } from '../components/modals/LabReportImporterModal';
import { nanoid } from 'nanoid';

export const SimulatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [simulationResults, setSimulationResults] = React.useState<SimulationResult[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const [savedProfiles, setSavedProfiles] = React.useState<Record<string, AppState>>({
    'Default': DEFAULT_APP_STATE
  });
  const [activeProfileName, setActiveProfileName] = React.useState<string>('Default');
  const appState = savedProfiles[activeProfileName] || DEFAULT_APP_STATE;

  React.useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem('bioSynthonosProfiles');
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        parsedProfiles['Default'] = { ...DEFAULT_APP_STATE, ...(parsedProfiles['Default'] || {})};
        setSavedProfiles(parsedProfiles);
      }
    } catch (e) {
      console.error("Failed to load profiles from localStorage", e);
      setSavedProfiles({ 'Default': DEFAULT_APP_STATE });
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('bioSynthonosProfiles', JSON.stringify(savedProfiles));
    } catch (e) {
      console.error("Failed to save profiles to localStorage", e);
    }
  }, [savedProfiles]);

  const handleInputChange = React.useCallback(<K extends keyof AppState>(section: K, data: AppState[K]) => {
    setSavedProfiles(prevProfiles => {
      const currentActiveProfileState = prevProfiles[activeProfileName] || DEFAULT_APP_STATE;
      const newProfileState: AppState = {
        ...currentActiveProfileState,
        [section]: data,
      };
      return { ...prevProfiles, [activeProfileName]: newProfileState };
    });
  }, [activeProfileName]);

  const handleSimulate = () => {
    try {
      const result = runSimulationEngine(appState);
      const validationReport = validateSimulationModel(result);
      if (!validationReport.isValid) {
        validationReport.errors.forEach(error => toast.error(`Validation Failed: ${error}`, 10000));
      }
      validationReport.warnings.forEach(warning => toast.info(`Validation Warning: ${warning}`, 8000));
      if (validationReport.suggestions.length > 0) {
        console.log("Model validation suggestions:", validationReport.suggestions);
      }
      setSimulationResults(prevResults => [result, ...prevResults]);
    } catch (e: unknown) {
      console.error("Simulation failed:", e);
      const errorMessage = e instanceof Error ? e.message : t('errors.unknown_simulation');
      toast.error(`${t('errors.simulation_failed_prefix')} ${errorMessage}`);
    }
  };

  const handleClearSimulations = () => {
      setSimulationResults([]);
  };

  const handleGetAiAnalysis = async (resultId: string) => {
    const targetResult = simulationResults.find(r => r.id === resultId);
    if (!targetResult) return;
    
    setSimulationResults(prev => prev.map(r => r.id === resultId ? { ...r, aiAnalysis: { key: 'loading' } } : r));
    
    try {
        const analysis = await getAiAnalysis(targetResult, t);
        setSimulationResults(prev => prev.map(r => r.id === resultId ? { ...r, aiAnalysis: analysis } : r));
    } catch (error) {
        console.error("AI Analysis failed:", error);
        const errorMessage = error instanceof Error ? error.message : t('errors.ai_analysis_failed');
        toast.error(errorMessage);
        setSimulationResults(prev => prev.map(r => r.id === resultId ? { ...r, aiAnalysis: null } : r));
    }
  };

  const handleSaveProfile = () => {
    const profileName = prompt(t('profiles.prompt_name'), activeProfileName);
    if (profileName && profileName.trim() !== "") {
      const trimmedName = profileName.trim();
      setSavedProfiles(prev => ({ ...prev, [trimmedName]: appState }));
      setActiveProfileName(trimmedName);
      toast.success(t('profiles.alert_saved', { name: trimmedName }));
    }
  };

  const handleLoadProfile = (profileName: string) => {
    if (savedProfiles[profileName]) {
      setActiveProfileName(profileName);
    }
  };
  
  const handleDeleteProfile = () => {
    if (activeProfileName === 'Default') {
      toast.error(t('profiles.alert_delete_default'));
      return;
    }
    if (window.confirm(t('profiles.confirm_delete', { name: activeProfileName }))) {
      const newProfiles = { ...savedProfiles };
      delete newProfiles[activeProfileName];
      setSavedProfiles(newProfiles);
      setActiveProfileName('Default');
    }
  };
  
  const handleSuggestProtocol = async () => {
    setIsSuggesting(true);
    try {
      const suggestedProtocol = await getAiProtocolSuggestion(appState.profile, t);
      if (suggestedProtocol) {
        handleInputChange('protocolPhases', suggestedProtocol.protocolPhases);
        handleInputChange('support', suggestedProtocol.support);
        handleInputChange('pct', suggestedProtocol.pct);
        toast.success(t('profiles.suggestion_applied'));
      } else {
        toast.error(t('errors.ai_invalid_suggestion'));
      }
    } catch (e: unknown) {
      console.error("Protocol suggestion failed:", e);
      const errorMessage = e instanceof Error ? e.message : t('errors.unknown_suggestion');
      toast.error(`${t('errors.suggestion_failed_prefix')} ${errorMessage}`);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplyImportedMarkers = (markers: BloodWork, fileName: string) => {
    handleInputChange('profile', { ...appState.profile, baselineBloodWork: markers });
    
    const newReport: LabReport = {
        id: nanoid(),
        date: new Date().toISOString(),
        fileName,
        markers
    };

    const currentReports = appState.labReports || [];
    handleInputChange('labReports', [newReport, ...currentReports]);
    
    toast.success(t('lab_import.success_applied'));
    setIsImportModalOpen(false);
  };

  const handleLoadReport = (report: LabReport) => {
    handleInputChange('profile', { ...appState.profile, baselineBloodWork: report.markers });
    toast.info(t('lab_history.report_loaded', { date: new Date(report.date).toLocaleDateString() }));
  }

  return (
    <>
      <LabReportImporterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApply={handleApplyImportedMarkers}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <InputPanel 
            appState={appState}
            onInputChange={handleInputChange}
            onSimulate={handleSimulate}
            onClear={handleClearSimulations}
            onSuggestProtocol={handleSuggestProtocol}
            isSuggesting={isSuggesting}
            hasResults={simulationResults.length > 0}
            savedProfiles={savedProfiles}
            activeProfileName={activeProfileName}
            onSaveProfile={handleSaveProfile}
            onLoadProfile={handleLoadProfile}
            onDeleteProfile={handleDeleteProfile}
            onOpenLabImporter={() => setIsImportModalOpen(true)}
            onLoadLabReport={handleLoadReport}
          />
        </div>
        <div className="lg:col-span-8">
          <ResultsPanel 
            results={simulationResults}
            onGetAiAnalysis={handleGetAiAnalysis}
          />
        </div>
      </div>
    </>
  );
};