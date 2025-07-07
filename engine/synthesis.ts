/**
 * @file The Text Synthesis Module.
 * This module takes the final time-series results from the engine and
 * synthesizes them into qualitative, human-readable, and translatable text fields.
 */
import { AppState, TranslatableText } from '../shared/types';
import { AmsResult, OhsResult, SynthesisResult, HpsResult } from './types';

/**
 * Generates the main summary text as a translatable object.
 */
const generateSummary = (ams: AmsResult, ohs: OhsResult, cycleDuration: number): TranslatableText => {
  const muscleGain = ams.finalMuscleGainKg.toFixed(1);
  const fatLoss = ams.finalFatLossKg.toFixed(1);
  
  let physiqueKey: string;
  let physiqueValues: Record<string, string | number> = {};

  if (ams.finalMuscleGainKg > 0.1 && ams.finalFatLossKg > 0.1) {
    physiqueKey = 'physique.gain_and_lose';
    physiqueValues = { muscleGain, fatLoss };
  } else if (ams.finalMuscleGainKg > 0.1) {
    physiqueKey = 'physique.gain';
    physiqueValues = { muscleGain };
  } else if (ams.finalFatLossKg > 0.1) {
    physiqueKey = 'physique.lose';
    physiqueValues = { fatLoss };
  } else {
    physiqueKey = 'physique.maintain';
  }

  const highestRiskScore = Math.max(
    ohs.riskScores.cardiovascular.score,
    ohs.riskScores.hepatic.score,
    ohs.riskScores.endocrine.score,
    ohs.riskScores.renal.score
  );
  
  let riskKey = 'risk.summary.manageable';
  if (highestRiskScore > 75) riskKey = 'risk.summary.critical';
  else if (highestRiskScore > 50) riskKey = 'risk.summary.significant';
  
  return {
    key: 'synthesis.summary',
    values: {
      duration: cycleDuration,
      physique: { key: physiqueKey, values: physiqueValues },
      risk: { key: riskKey }
    }
  };
};


/**
 * Generates an array of warning strings based on peak risks.
 */
const generateWarnings = (appState: AppState, ohs: OhsResult, hps: HpsResult): TranslatableText[] => {
  const warnings: TranslatableText[] = [];
  const { cardiovascular, hepatic, endocrine, renal } = ohs.riskScores;
  const { geneticFactors } = appState.profile;

  if (cardiovascular.score > 50) warnings.push({ key: 'synthesis.warnings.cardio' });
  if (hepatic.score > 50) warnings.push({ key: 'synthesis.warnings.hepatic' });
  if (renal.score > 30) warnings.push({ key: 'synthesis.warnings.renal' });
  if (endocrine.score > 75) warnings.push({ key: 'synthesis.warnings.endocrine' });

  if (hps.totalAndrogenic > 60 && geneticFactors.includes('genetics.alopecia')) {
    warnings.push({ key: 'synthesis.warnings.hair_loss' });
  }

  if (warnings.length === 0) {
      warnings.push({ key: 'synthesis.warnings.general' })
  }

  return warnings;
}


/**
 * Generates an array of recommendation strings.
 */
const generateRecommendations = (appState: AppState, ohs: OhsResult): TranslatableText[] => {
    const recommendations: TranslatableText[] = [];
    const { supplements } = appState.nutrition;
    const { cardiovascular, hepatic } = ohs.riskScores;

    if (cardiovascular.score > 40) {
        let key = 'synthesis.recommendations.cardio';
        if(!supplements.includes('supplements.omega3')) key += '_missing';
        recommendations.push({ key });
    }

    if (hepatic.score > 40) {
        let key = 'synthesis.recommendations.hepatic';
        if(!supplements.includes('supplements.tudca') && !supplements.includes('supplements.nac')) key += '_missing';
        recommendations.push({ key });
    }
    
    if (appState.pct.length === 0 || appState.pct.every(p => p.compound === 'None')) {
        recommendations.push({ key: 'synthesis.recommendations.pct_missing' });
    } else {
        recommendations.push({ key: 'synthesis.recommendations.pct_defined' });
    }

    recommendations.push({ key: "synthesis.recommendations.monitoring" });

    return recommendations;
}


/**
 * The main synthesis function that orchestrates text generation.
 * @param peakHpsResult The hormonal result from the week of *peak risk*.
 */
export const synthesizeResults = (
  appState: AppState,
  amsResult: AmsResult,
  peakOhsResult: OhsResult, 
  peakHpsResult: HpsResult
): SynthesisResult => {
  const cycleDuration = appState.protocolPhases.reduce((sum, phase) => sum + Number(phase.durationWeeks || 0), 0);
  const summary = generateSummary(amsResult, peakOhsResult, cycleDuration);
  const warnings = generateWarnings(appState, peakOhsResult, peakHpsResult);
  const recommendations = generateRecommendations(appState, peakOhsResult);
  
  const inferredGoal = appState.profile.goal; // Keep it simple, user goal is the goal.

  return {
    summary,
    warnings,
    recommendations,
    inferredGoal,
    longTermOutlook: { key: 'synthesis.long_term_outlook' },
  };
};
