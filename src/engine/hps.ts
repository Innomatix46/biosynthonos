/**
 * @file The deterministic Hormonal & Pharmacological Sub-Model (HPS).
 * This module analyzes active hormone concentrations and calculates aggregate
 * scores for anabolic, androgenic, toxicity, and support effects.
 */
import { PkeResult, HpsResult } from './types';
import { PED_COMPOUNDS } from '../constants';

const compoundDataMap = new Map(PED_COMPOUNDS.map(c => [c.name, c]));

/**
 * Runs the HPS simulation for a single week based on active concentrations.
 * @param pkeResult The result from the PKE, containing active hormone levels.
 * @param isPctPhase A boolean indicating if the simulation is in the PCT phase.
 * @returns A HpsResult object with calculated pharmacological indices for the week.
 */
export const runHpsWeekSimulation = (pkeResult: PkeResult, isPctPhase: boolean): HpsResult => {
  let totalAnabolic = 0;
  let totalAndrogenic = 0;
  let totalHepatoToxicity = 0;
  let totalCardioToxicity = 0;
  let totalHptaSuppression = 0;
  let totalNephroToxicity = 0;
  let hptaStimulation = 0;
  let totalEstrogenReduction = 0;
  let totalBloodPressureReduction = 0;

  for (const [compoundName, concentration] of pkeResult.activeConcentrations.entries()) {
    const data = compoundDataMap.get(compoundName);
    if (!data || concentration <= 0) continue;

    // Apply base compound scores to the active concentration
    totalAnabolic += data.anabolic * concentration;
    totalAndrogenic += data.androgenic * concentration;
    totalHepatoToxicity += data.hepatoToxicity * concentration;
    totalCardioToxicity += data.cardioToxicity * concentration;
    totalNephroToxicity += (data.nephroToxicity || 0) * concentration;
    
    if (isPctPhase && data.hptaStimulation) {
        hptaStimulation += data.hptaStimulation * concentration;
    } else {
        totalHptaSuppression += data.hptaSuppression * concentration;
    }
    
    // Calculate effects from support compounds
    if (data.estrogenReduction) {
        totalEstrogenReduction += data.estrogenReduction * concentration;
    }
    if (data.bloodPressureReduction) {
        totalBloodPressureReduction += data.bloodPressureReduction * concentration;
    }
  }
  
  // During PCT, HPTA suppression is reduced by stimulation from SERMs.
  if (isPctPhase) {
      totalHptaSuppression = Math.max(0, totalHptaSuppression - hptaStimulation);
  }

  // Calculate a metabolic adjustment factor.
  // This factor slightly increases TDEE based on the anabolic load.
  // The sensitivity is set to a 5% TDEE increase for a high anabolic score of 100.
  const metabolicAdjustmentFactor = 1.0 + (totalAnabolic / 100) * 0.05;

  return {
    totalAnabolic: Math.round(totalAnabolic),
    totalAndrogenic: Math.round(totalAndrogenic),
    totalHepatoToxicity: Math.round(totalHepatoToxicity),
    totalCardioToxicity: Math.round(totalCardioToxicity),
    totalHptaSuppression: Math.round(totalHptaSuppression),
    totalNephroToxicity: Math.round(totalNephroToxicity),
    totalEstrogenReduction,
    totalBloodPressureReduction,
    metabolicAdjustmentFactor,
  };
};
