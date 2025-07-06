/**
 * @file This is the main orchestrator for the new dynamic, time-series simulation engine.
 * It coordinates the week-by-week execution of all sub-models.
 */
import { AppState, SimulationResult, PhysiqueDataPoint, BloodMarkerWeeklyHistory } from '../shared/types';
import { calculateWeeklyConcentrations } from './pke';
import { runHpsWeekSimulation } from './hps';
import { runMesSimulation } from './mes';
import { runAmsWeekSimulation } from './ams';
import { runOhsWeekSimulation, getBaselineBloodMarkers } from './ohs';
import { synthesizeResults } from './synthesis';
import { AmsResult, OhsResult, PkeResult, HpsResult } from './types';

/**
 * Executes the full dynamic, time-series simulation pipeline.
 * @param appState The complete user input state.
 * @returns A comprehensive SimulationResult object.
 */
export const runSimulationEngine = (appState: AppState): SimulationResult => {
  const { profile, nutrition, protocolPhases, support = [], pct = [] } = appState;
  
  // --- Initialization ---
  const cycleDuration = protocolPhases.reduce((sum, phase) => sum + Number(phase.durationWeeks || 0), 0);
  const pctDuration = pct.reduce((max, p) => Math.max(max, p.durationWeeks || 0), 0);
  const totalSimulationWeeks = cycleDuration + pctDuration;
  
  let currentMuscleMassKg = profile.weight * (1 - profile.bfp / 100);
  let currentFatMassKg = profile.weight * (profile.bfp / 100);

  const physiqueProjection: PhysiqueDataPoint[] = [{ week: 0, muscleMassKg: currentMuscleMassKg, fatMassKg: currentFatMassKg }];
  
  // Initialize blood markers with baseline values
  const baselineMarkers = getBaselineBloodMarkers(profile.baselineBloodWork);
  const bloodMarkerHistory: BloodMarkerWeeklyHistory[] = [{ week: 0, markers: baselineMarkers }];

  let pkeResult: PkeResult = { activeConcentrations: new Map() };
  
  // Track peak risk results for the final summary
  let peakOhsResult: OhsResult | null = null;
  let peakHpsResult: HpsResult | null = null;

  // --- Main Simulation Loop ---
  for (let week = 1; week <= totalSimulationWeeks; week++) {
    // 1. PKE: Calculate active concentrations for the current week.
    pkeResult = calculateWeeklyConcentrations(week, protocolPhases, support, pct, pkeResult.activeConcentrations);

    // 2. HPS: Calculate weekly effect scores based on active concentrations.
    const isPctPhase = week > cycleDuration;
    const hpsWeeklyResult = runHpsWeekSimulation(pkeResult, isPctPhase);

    // 3. MES: Calculate TDEE and calorie balance.
    const mesResult = runMesSimulation(profile, nutrition, hpsWeeklyResult);
    
    // 4. AMS: Calculate weekly change in body composition.
    const amsWeeklyResult = runAmsWeekSimulation(mesResult, hpsWeeklyResult);
    currentMuscleMassKg += amsWeeklyResult.muscleChangeKg;
    currentFatMassKg += amsWeeklyResult.fatChangeKg;
    physiqueProjection.push({ week, muscleMassKg: parseFloat(currentMuscleMassKg.toFixed(2)), fatMassKg: parseFloat(currentFatMassKg.toFixed(2)) });

    // 5. OHS: Predict blood markers and risks for the current week, based on the previous week's state.
    const previousMarkers = bloodMarkerHistory[week - 1].markers;
    const ohsWeeklyResult = runOhsWeekSimulation(profile, hpsWeeklyResult, previousMarkers);
    bloodMarkerHistory.push({ week, markers: ohsWeeklyResult.bloodMarkers });

    // Track the peak risk results (both OHS and HPS) for the final summary.
    // We use the highest cardiovascular score as a proxy for the week of peak risk.
    if (!peakOhsResult || ohsWeeklyResult.riskScores.cardiovascular.score > peakOhsResult.riskScores.cardiovascular.score) {
        peakOhsResult = ohsWeeklyResult;
        peakHpsResult = hpsWeeklyResult; // Capture the HPS state at the point of peak risk
    }
  }

  // --- Final Aggregation & Synthesis (Post-Loop) ---
  const finalAmsResult: AmsResult = {
      physiqueProjection,
      finalMuscleGainKg: currentMuscleMassKg - (profile.weight * (1-profile.bfp/100)),
      finalFatLossKg: (profile.weight * (profile.bfp/100)) - currentFatMassKg,
  }
  
  // Ensure peak results are not null before using them, providing a baseline if the loop didn't run.
  if (!peakOhsResult || !peakHpsResult) {
      const baselineHps = runHpsWeekSimulation({ activeConcentrations: new Map() }, false);
      peakOhsResult = runOhsWeekSimulation(profile, baselineHps, baselineMarkers);
      peakHpsResult = baselineHps;
  }
  
  const synthesisResult = synthesizeResults(appState, finalAmsResult, peakOhsResult, peakHpsResult);
  
  const finalResult: SimulationResult = {
    id: `sim-${Date.now()}`,
    ...synthesisResult,
    physiqueProjection,
    bloodMarkerHistory,
    riskScores: peakOhsResult.riskScores,
    aiAnalysis: null, // Initialize AI analysis as null
    
    // Include the original inputs for the snapshot on the card
    profile,
    nutrition,
    protocolPhases,
    support,
    pct,
  };

  return finalResult;
};