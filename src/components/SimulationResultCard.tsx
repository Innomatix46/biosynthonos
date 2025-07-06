/**
 * @file This component renders a single, detailed card for a simulation result.
 * It has been refactored to be a clean orchestrator, delegating display logic to sub-components.
 */
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TFunction } from 'i18next';
import { SimulationResult, TranslatableText } from '../shared/types';
import { PhysiqueChart } from './charts/PhysiqueChart';
import { BloodMarkerChart } from './charts/BloodMarkerChart';
import { FullBloodPanel } from './charts/FullBloodPanel';
import { PDFReportExport } from './ui/PDFReportExport';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { ProtocolSnapshot } from './ui/ProtocolSnapshot';
import { RiskGauge } from './ui/RiskGauge';
import { 
    AlertTriangle, CheckCircle, Stethoscope, Scale, FileText, HeartPulse, Shield, Activity,
    Recycle, Sparkles, BrainCircuit, TestTube
} from 'lucide-react';

/**
 * Renders translatable text, handling simple strings and complex objects with values.
 * Uses the <Trans> component for interpolation.
 */
const renderTranslatableText = (text: TranslatableText | null | undefined, t: TFunction<"translation", undefined>) => {
  if (!text) return null;
  if (typeof text === 'string') {
    // Handle markdown-like bolding for strings from AI response
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return <p>{parts.map((part, i) => {
      if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    })}</p>;
  }
  
  if (typeof text.key !== 'string') return null;

  return <Trans i18nKey={text.key} values={text.values} components={{ bold: <strong /> }} t={t} />;
};

interface SimulationResultCardProps {
  result: SimulationResult;
  onGetAiAnalysis: (resultId: string) => void;
}

export const SimulationResultCard: React.FC<SimulationResultCardProps> = ({ result, onGetAiAnalysis }) => {
  const { t } = useTranslation();
  const { profile, id, aiAnalysis, protocolPhases, pct } = result;
  const isAiLoading = typeof aiAnalysis === 'object' && aiAnalysis !== null && aiAnalysis.key === 'loading';
  const pctDuration = pct.reduce((max, p) => Math.max(max, p.durationWeeks || 0), 0);

  return (
    <div id={`simulation-card-${id}`} className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-200">{t('results.main_title', { age: profile.age, gender: t(`forms.profile.${profile.gender}`) })}</h2>
      
      <ProtocolSnapshot result={result} />
      
      <div>
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-brand-blue"><FileText /> {t('results.summary_title')}</h3>
        <div className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-sm">{renderTranslatableText(result.summary, t)}</div>
      </div>

      <div className="space-y-4">
        <CollapsibleSection title={t('results.risk_assessment_title')} icon={<Shield size={20} />} defaultOpen={true}>
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskGauge name={t('risk.cardio')} score={result.riskScores.cardiovascular.score} icon={<HeartPulse size={16}/>} />
                <RiskGauge name={t('risk.hepatic')} score={result.riskScores.hepatic.score} icon={<Activity size={16}/>} />
                <RiskGauge name={t('risk.renal')} score={result.riskScores.renal.score} icon={<TestTube size={16}/>} />
                <RiskGauge name={t('risk.endocrine')} score={result.riskScores.endocrine.score} icon={<Recycle size={16}/>} />
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title={t('results.physique_title')} icon={<Scale size={20} />}>
            <PhysiqueChart data={result.physiqueProjection} phases={protocolPhases} pctDuration={pctDuration} />
        </CollapsibleSection>

        <CollapsibleSection title={t('results.blood_chart_title')} icon={<Stethoscope size={20} />}>
            <BloodMarkerChart history={result.bloodMarkerHistory} phases={protocolPhases} pctDuration={pctDuration} />
        </CollapsibleSection>
        
        <CollapsibleSection title={t('results.blood_panel_title')} icon={<TestTube size={20} />}>
            <FullBloodPanel history={result.bloodMarkerHistory} />
        </CollapsibleSection>

        <CollapsibleSection title={t('results.ai_title')} icon={<BrainCircuit size={20} />}>
            <div className="pt-4 text-sm text-gray-300">
                {aiAnalysis === null || aiAnalysis === undefined ? (
                    <button
                        onClick={() => onGetAiAnalysis(id)}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                        aria-label={t('results.ai_button')}
                    >
                        <Sparkles size={20} />
                        {t('results.ai_button')}
                    </button>
                ) : isAiLoading ? (
                    <div className="flex items-center justify-center gap-3 text-gray-400" role="status">
                        <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                        <span>{t('results.ai_loading')}</span>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3">{renderTranslatableText(aiAnalysis, t)}</div>
                )}
            </div>
        </CollapsibleSection>

        <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <h3 className="text-lg font-semibold text-brand-yellow mb-2 flex items-center gap-2"><AlertTriangle /> {t('results.warnings_title')}</h3>
          <ul className="list-disc list-inside space-y-2 text-yellow-200/90 text-sm">{result.warnings.map((w, i) => <li key={i}>{renderTranslatableText(w, t)}</li>)}</ul>
        </div>
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
          <h3 className="text-lg font-semibold text-brand-green mb-2 flex items-center gap-2"><CheckCircle /> {t('results.recommendations_title')}</h3>
          <ul className="list-disc list-inside space-y-2 text-green-200/90 text-sm">{result.recommendations.map((r, i) => <li key={i}>{renderTranslatableText(r, t)}</li>)}</ul>
        </div>
        
        <div className="pt-4 border-t border-gray-700 exclude-from-capture">
            <PDFReportExport result={result} />
        </div>
      </div>
    </div>
  );
};