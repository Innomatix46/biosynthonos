/**
 * @file This component renders a single, detailed card for a simulation result.
 * It now includes an interactive section for fetching and displaying AI analysis.
 */
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TFunction } from 'i18next';
import { SimulationResult, BloodMarker, BloodMarkerWeeklyHistory, PedProtocol, ProtocolPhase, TranslatableText } from '../shared/types';
import { EXPERIENCE_LEVEL_OPTIONS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
    AlertTriangle, CheckCircle, Stethoscope, Scale, FileText, HeartPulse, Shield, Activity,
    ChevronDown, ChevronUp, ListChecks, Recycle, Sparkles, BrainCircuit, TestTube
} from 'lucide-react';

/**
 * Renders translatable text, handling simple strings and complex objects with values.
 * Uses the <Trans> component for interpolation.
 */
const renderTranslatableText = (text: TranslatableText, t: TFunction<"translation", undefined>) => {
  if (!text) return null;
  if (typeof text === 'string') return <p>{t(text)}</p>; // Fallback for simple keys
  
  return <Trans i18nKey={text.key} values={text.values} components={{ bold: <strong /> }} t={t} />;
};

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-700/50 transition-colors">
                <h3 className="text-xl font-semibold flex items-center gap-2">{icon} {title}</h3>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && <div className="p-4 pt-0 border-t border-gray-700">{children}</div>}
        </div>
    );
};

const RiskGauge: React.FC<{ name: string; score: number; icon: React.ReactNode }> = ({ name, score, icon }) => {
    const getScoreColor = () => score > 75 ? 'bg-brand-pink' : score > 50 ? 'bg-brand-yellow' : score > 25 ? 'bg-sky-500' : 'bg-brand-green';
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1.5 text-gray-300">{icon} {name}</div>
                <span className={`font-bold ${getScoreColor().replace('bg-', 'text-')}`}>{score}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5"><div className={`${getScoreColor()} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div></div>
        </div>
    );
};

const ProtocolSnapshot: React.FC<{ result: SimulationResult }> = ({ result }) => {
  const { t } = useTranslation();
  const { profile, nutrition, protocolPhases, support, pct } = result;
  const summarizeProtocol = (protocol: PedProtocol[]) => protocol.filter(p => p.compound !== 'None').map(p => `${p.compound.split(' ')[0]} ${p.dosage}mg`).join(' + ');
  
  const supportSummary = summarizeProtocol(support);
  const pctSummary = pct.filter(p => p.compound !== 'None').map(p => `${p.compound.split(' ')[0]} ${p.dosage}mg/day for ${p.durationWeeks}w`).join(' + ');
  const cycleDuration = protocolPhases.reduce((sum, phase) => sum + phase.durationWeeks, 0);
  const totalDuration = cycleDuration + (pct[0]?.durationWeeks || 0);

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
       <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2"><ListChecks /> {t('results.snapshot_title')}</h3>
       <div className="text-xs text-gray-400 space-y-2">
          <p><strong>{t('forms.profile.goal')}:</strong> {t(profile.goal)} ({t(EXPERIENCE_LEVEL_OPTIONS.find(o => o.value === profile.experienceLevel)?.tKey || '')})</p>
          <div className="space-y-1">
            {protocolPhases.map((phase, index) => (
                <p key={phase.id}>
                    <strong>{t('results.phase', { index: index + 1, name: phase.name })}:</strong> {summarizeProtocol(phase.compounds) || t('common.none')} ({t('results.weeks', { count: phase.durationWeeks })})
                </p>
            ))}
          </div>
          {supportSummary && <p><strong>{t('results.support')}:</strong> {supportSummary}</p>}
          {pctSummary && <p><strong>{t('results.pct')}:</strong> {pctSummary}</p>}
          <p><strong>{t('results.total_duration')}:</strong> {t('results.weeks', { count: totalDuration })}</p>
       </div>
    </div>
  );
};

const ChartWithPhases: React.FC<{
  data: any[];
  cyclePhases: ProtocolPhase[];
  pctDuration: number;
  children: React.ReactNode;
}> = ({ data, cyclePhases, pctDuration, children }) => {
  const { t } = useTranslation();
  let cumulativeDuration = 0;
  const phaseLines = cyclePhases.slice(0,-1).map(phase => {
      cumulativeDuration += phase.durationWeeks;
      return <ReferenceLine key={`phase-${cumulativeDuration}`} x={`W${cumulativeDuration}`} stroke="#4A5568" strokeDasharray="2 2" />;
  });
  
  const cycleDuration = cyclePhases.reduce((sum, p) => sum + p.durationWeeks, 0);
  const pctLine = pctDuration > 0 ? (
      <ReferenceLine x={`W${cycleDuration}`} stroke="#FFD166" strokeDasharray="3 3" label={{ value: t('results.pct_starts'), position: 'insideTopRight', fill: '#FFD166', fontSize: 12 }} />
  ) : null;

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis dataKey="week" stroke="#A0AEC0" />
        {children}
        {phaseLines}
        {pctLine}
      </LineChart>
    </ResponsiveContainer>
  );
}


const BloodMarkerChart: React.FC<{ history: BloodMarkerWeeklyHistory[], phases: ProtocolPhase[], pctDuration: number }> = ({ history, phases, pctDuration }) => {
    const { t } = useTranslation();
    const chartData = history.map(weeklyData => {
        const dataPoint: {[key: string]: number | string} = { week: `W${weeklyData.week}` };
        weeklyData.markers.forEach(m => {
            const key = m.marker.split(' ')[0].replace('/','');
            dataPoint[key] = parseFloat(m.value);
        });
        return dataPoint;
    });

    return (
        <div className="h-80 w-full pt-4">
            <ChartWithPhases data={chartData} cyclePhases={phases} pctDuration={pctDuration}>
                <YAxis yAxisId="left" stroke="#A0AEC0" domain={[0, 'dataMax + 100']} />
                <YAxis yAxisId="right" orientation="right" stroke="#A0AEC0" domain={[0, 'dataMax + 10']} />
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Total" name={t('bloodMarkers.totalTestosterone_short')} stroke="#06D6A0" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="HDL-C" name={t('bloodMarkers.hdl_short')} stroke="#FFD166" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="ALT" name={t('bloodMarkers.alt_short')} stroke="#EF476F" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="eGFR" name={t('bloodMarkers.egfr_short')} stroke="#00B4D8" strokeWidth={2} dot={false} />
            </ChartWithPhases>
        </div>
    );
};

const FullBloodPanel: React.FC<{ history: BloodMarkerWeeklyHistory[] }> = ({ history }) => {
    const { t } = useTranslation();
    if (!history || history.length === 0) return null;
    
    const start = history[0].markers;
    const end = history[history.length - 1].markers;

    const peak = start.map(startMarker => {
        let peakValue = parseFloat(startMarker.value);
        let peakStatus = startMarker.status;
        const isLowerBetter = ['LDL-C', 'Glucose', 'ALT', 'AST'].includes(startMarker.marker);

        for (const weekly of history) {
            const currentMarker = weekly.markers.find(m => m.marker === startMarker.marker);
            if (currentMarker) {
                const currentValue = parseFloat(currentMarker.value);
                if ((!isLowerBetter && currentValue > peakValue) || (isLowerBetter && currentValue < peakValue)) {
                    peakValue = currentValue;
                    peakStatus = currentMarker.status;
                }
            }
        }
        return { marker: startMarker.marker, value: String(peakValue), status: peakStatus };
    });

    const getStatusColor = (status: BloodMarker['status']) => {
        switch(status) {
            case 'critical': return 'text-red-400';
            case 'elevated':
            case 'low': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="px-4 py-2">{t('results.blood_panel.marker')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.start')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.peak')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.end')}</th>
                    </tr>
                </thead>
                <tbody>
                    {start.map((marker, i) => (
                        <tr key={marker.marker} className="border-b border-gray-700">
                            <td className="px-4 py-2 font-medium">{marker.marker}</td>
                            <td className={`px-4 py-2 text-center ${getStatusColor(marker.status)}`}>{marker.value}</td>
                            <td className={`px-4 py-2 text-center font-semibold ${getStatusColor(peak[i].status)}`}>{peak[i].value}</td>
                            <td className={`px-4 py-2 text-center ${getStatusColor(end[i].status)}`}>{end[i].value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


interface SimulationResultCardProps {
  result: SimulationResult;
  onGetAiAnalysis: (resultId: string) => void;
}

export const SimulationResultCard: React.FC<SimulationResultCardProps> = ({ result, onGetAiAnalysis }) => {
  const { t } = useTranslation();
  const { profile, id, aiAnalysis, protocolPhases, pct } = result;
  const isAiLoading = typeof aiAnalysis === 'object' && aiAnalysis !== null && aiAnalysis.key === 'loading';
  const cycleDuration = protocolPhases.reduce((sum, phase) => sum + phase.durationWeeks, 0);
  const pctDuration = pct.reduce((max, p) => Math.max(max, p.durationWeeks || 0), 0);

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-200">{t('results.main_title', { age: profile.age, gender: t(`forms.profile.${profile.gender}`) })}</h2>
      
      <ProtocolSnapshot result={result} />
      
      <div>
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-brand-blue"><FileText /> {t('results.summary_title')}</h3>
        <div className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-sm">{renderTranslatableText(result.summary, t)}</div>
      </div>

      <div className="space-y-4">
        <CollapsibleSection title={t('results.risk_assessment_title')} icon={<Shield />} defaultOpen={true}>
          <div className="space-y-4 pt-4">
              <RiskGauge name={t('risk.cardio')} score={result.riskScores.cardiovascular.score} icon={<HeartPulse size={16}/>} />
              <RiskGauge name={t('risk.hepatic')} score={result.riskScores.hepatic.score} icon={<Activity size={16}/>} />
              <RiskGauge name={t('risk.renal')} score={result.riskScores.renal.score} icon={<TestTube size={16}/>} />
              <RiskGauge name={t('risk.endocrine')} score={result.riskScores.endocrine.score} icon={<Recycle size={16}/>} />
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title={t('results.physique_title')} icon={<Scale />}>
            <div className="h-72 w-full pt-4">
               <ChartWithPhases data={result.physiqueProjection} cyclePhases={protocolPhases} pctDuration={pctDuration}>
                  <XAxis dataKey="week" tickFormatter={(tick) => `W${tick}`} stroke="#A0AEC0"/>
                  <YAxis yAxisId="left" stroke="#A0AEC0" unit=" kg" domain={['dataMin - 2', 'dataMax + 2']} tickCount={6} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="muscleMassKg" name={t('results.physique.muscle')} stroke="#06D6A0" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="fatMassKg" name={t('results.physique.fat')} stroke="#FFD166" strokeWidth={2} dot={false} />
               </ChartWithPhases>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title={t('results.blood_chart_title')} icon={<Stethoscope />}>
            <BloodMarkerChart history={result.bloodMarkerHistory} phases={protocolPhases} pctDuration={pctDuration} />
        </CollapsibleSection>
        
        <CollapsibleSection title={t('results.blood_panel_title')} icon={<TestTube />}>
            <div className="pt-4">
              <FullBloodPanel history={result.bloodMarkerHistory} />
            </div>
        </CollapsibleSection>

        <CollapsibleSection title={t('results.ai_title')} icon={<BrainCircuit />}>
            <div className="pt-4 text-sm text-gray-300">
                {aiAnalysis === null || aiAnalysis === undefined ? (
                    <button
                        onClick={() => onGetAiAnalysis(id)}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                    >
                        <Sparkles size={20} />
                        {t('results.ai_button')}
                    </button>
                ) : isAiLoading ? (
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                        <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                        <span>{t('results.ai_loading')}</span>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-invert max-w-none">{renderTranslatableText(aiAnalysis, t)}</div>
                )}
            </div>
        </CollapsibleSection>

        <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <h3 className="text-lg font-semibold text-brand-yellow mb-2 flex items-center gap-2"><AlertTriangle /> {t('results.warnings_title')}</h3>
          <ul className="list-inside space-y-2 text-yellow-200/90 text-sm">{result.warnings.map((w, i) => <li key={i}>{renderTranslatableText(w, t)}</li>)}</ul>
        </div>
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
          <h3 className="text-lg font-semibold text-brand-green mb-2 flex items-center gap-2"><CheckCircle /> {t('results.recommendations_title')}</h3>
          <ul className="list-inside space-y-2 text-green-200/90 text-sm">{result.recommendations.map((r, i) => <li key={i}>{renderTranslatableText(r, t)}</li>)}</ul>
        </div>
      </div>
    </div>
  );
};