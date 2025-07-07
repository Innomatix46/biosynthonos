/**
 * @file A reusable UI component for displaying a snapshot of the protocol details.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimulationResult, PedProtocol } from '../../shared/types';
import { EXPERIENCE_LEVEL_OPTIONS } from '../../constants';
import { ListChecks } from 'lucide-react';

interface ProtocolSnapshotProps {
  result: SimulationResult;
}

export const ProtocolSnapshot: React.FC<ProtocolSnapshotProps> = ({ result }) => {
  const { t } = useTranslation();
  const { profile, protocolPhases, support, pct } = result;
  
  // Helper to summarize compounds in a protocol array, now with guards for malformed data
  const summarizeProtocol = (protocol?: PedProtocol[]) => 
    (protocol || [])
      .filter(p => p && p.compound && p.compound !== 'None')
      .map(p => `${p.compound.split(' ')[0]} ${p.dosage}mg`)
      .join(' + ') || t('common.none');
  
  const supportSummary = summarizeProtocol(support);
  
  const pctSummary = (pct || [])
    .filter(p => p && p.compound && p.compound !== 'None')
    .map(p => `${p.compound.split(' ')[0]} ${p.dosage}mg/day for ${p.durationWeeks}w`)
    .join(' + ');

  const cycleDuration = (protocolPhases || []).reduce((sum, phase) => sum + (phase?.durationWeeks || 0), 0);
  const pctDuration = (pct || []).reduce((max, p) => Math.max(max, p?.durationWeeks || 0), 0);
  const totalDuration = cycleDuration + pctDuration;
  
  const experienceTKey = EXPERIENCE_LEVEL_OPTIONS.find(o => o.value === profile.experienceLevel)?.tKey || '';

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
       <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2"><ListChecks /> {t('results.snapshot_title')}</h3>
       <div className="text-xs text-gray-400 space-y-2">
          <p><strong>{t('forms.profile.goal')}:</strong> {t(profile.goal)} ({t(experienceTKey)})</p>
          <div className="space-y-1">
            {(protocolPhases || []).map((phase, index) => (
                phase && <p key={phase.id}>
                    <strong>{t('results.phase', { index: index + 1, name: phase.name })}:</strong> {summarizeProtocol(phase.compounds)} ({t('results.weeks', { count: phase.durationWeeks })})
                </p>
            ))}
          </div>
          {supportSummary !== t('common.none') && <p><strong>{t('results.support')}:</strong> {supportSummary}</p>}
          {pctSummary && <p><strong>{t('results.pct')}:</strong> {pctSummary}</p>}
          {totalDuration > 0 && <p><strong>{t('results.total_duration')}:</strong> {t('results.weeks', { count: totalDuration })}</p>}
       </div>
    </div>
  );
};
