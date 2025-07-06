/**
 * @file The deterministic Organ & Health Sub-Model (OHS).
 * This module calculates health risk scores and predicts blood marker changes for a single week.
 * It is now a stateful model, where each week's values are based on the previous week.
 */
import { BloodMarker, RiskScore, AthleteProfile, BloodWork } from '../shared/types';
import { HpsResult, OhsResult } from './types';

/**
 * Creates a baseline set of blood markers from user input or healthy defaults.
 * @param baseline - Optional baseline bloodwork from user input.
 * @returns An array of BloodMarker objects.
 */
export const getBaselineBloodMarkers = (baseline?: BloodWork): BloodMarker[] => {
    const createMarker = (marker: string, value: number, status: BloodMarker['status'] = 'normal', notes: string = 'Baseline value.'): BloodMarker => ({
        marker, value: String(value), status, notes
    });

    return [
        // Cardiovascular
        createMarker('Systolic BP', baseline?.systolicBP ?? 120),
        createMarker('Diastolic BP', baseline?.diastolicBP ?? 80),
        createMarker('HDL-C', baseline?.hdl ?? 50),
        createMarker('LDL-C', baseline?.ldl ?? 100),
        // Metabolic
        createMarker('Glucose', baseline?.glucose ?? 85),
        // Hormonal
        createMarker('Total Testosterone', baseline?.totalTestosterone ?? 500),
        createMarker('Estradiol (E2)', 25), // Always starts at a default
        createMarker('LH / FSH', 5), // Always starts at a default
        // Liver
        createMarker('ALT', baseline?.alt ?? 25),
        createMarker('AST', baseline?.ast ?? 25),
        // Kidney
        createMarker('eGFR', baseline?.egfr ?? 100),
        // Blood Counts
        createMarker('Hematocrit', 42),
    ];
};


/**
 * Calculates a single risk score based on toxicity scores and profile data.
 */
const calculateRisk = (baseScore: number, age: number, geneticRiskFactor: boolean, notes: string): RiskScore => {
  let score = baseScore;
  if (age > 35) score += (age - 35) * 0.5;
  if (geneticRiskFactor) score = Math.min(100, score * 1.3);

  return {
    score: Math.min(Math.max(0, Math.round(score)), 100),
    notes,
  };
};

/**
 * Calculates the next week's blood marker values based on the previous week and current hormonal stimuli.
 */
const calculateNextWeekBloodMarkers = (profile: AthleteProfile, hpsResult: HpsResult, previousMarkers: BloodMarker[]): BloodMarker[] => {
    const { totalAnabolic, totalAndrogenic, totalCardioToxicity, totalHepatoToxicity, totalHptaSuppression, totalEstrogenReduction, totalBloodPressureReduction, totalNephroToxicity } = hpsResult;
    const { geneticFactors } = profile;
    const prevMap = new Map(previousMarkers.map(m => [m.marker, parseFloat(m.value)]));

    const getPrev = (marker: string, defaultValue: number) => prevMap.get(marker) ?? defaultValue;
    const markers: BloodMarker[] = [];

    // --- Liver Model (Regeneration) ---
    const liverRegenFactor = 0.85; // Recovers 15% of the excess value per week if toxicity is low
    const alt = getPrev('ALT', 25);
    const newAlt = Math.max(25, alt * (totalHepatoToxicity > 5 ? 1.05 : liverRegenFactor) + totalHepatoToxicity * 0.5);
    markers.push({ marker: 'ALT', value: newAlt.toFixed(0), status: newAlt > 50 ? 'elevated' : 'normal', notes: `Strain from hepato-toxicity score of ${totalHepatoToxicity}.` });

    const ast = getPrev('AST', 25);
    const newAst = Math.max(25, ast * (totalHepatoToxicity > 5 ? 1.05 : liverRegenFactor) + totalHepatoToxicity * 0.4);
    markers.push({ marker: 'AST', value: newAst.toFixed(0), status: newAst > 50 ? 'elevated' : 'normal', notes: `Strain from hepato-toxicity and muscle breakdown.` });

    // --- Kidney Model (Filtration Rate) ---
    const gfr = getPrev('eGFR', 100);
    const gfrStrain = (totalNephroToxicity * 0.2) + (totalCardioToxicity * 0.1); // Strain from direct toxicity and BP
    const gfrRecovery = 0.5; // Recovers 0.5 points per week if strain is zero
    const newGfr = Math.max(15, gfr - gfrStrain + (gfrStrain === 0 ? gfrRecovery : 0));
    markers.push({ marker: 'eGFR', value: newGfr.toFixed(0), status: newGfr < 60 ? 'low' : 'normal', notes: `Filtration rate affected by renal strain score of ${gfrStrain.toFixed(1)}.` });
    
    // --- Cardiovascular Model ---
    const sysBP = getPrev('Systolic BP', 120);
    const newSysBP = sysBP + totalCardioToxicity * 0.4 - totalBloodPressureReduction * 0.5;
    markers.push({ marker: 'Systolic BP', value: newSysBP.toFixed(0), status: newSysBP > 130 ? 'elevated' : 'normal', notes: `Influenced by cardio-toxicity and support drugs.` });
    
    const diaBP = getPrev('Diastolic BP', 80);
    const newDiaBP = diaBP + totalCardioToxicity * 0.2 - totalBloodPressureReduction * 0.25;
    markers.push({ marker: 'Diastolic BP', value: newDiaBP.toFixed(0), status: newDiaBP > 85 ? 'elevated' : 'normal', notes: `` });

    let hdl = getPrev('HDL-C', 50);
    hdl -= totalCardioToxicity * 0.2;
    if (geneticFactors.includes('Poor Lipid Response')) hdl -= totalCardioToxicity * 0.1;
    markers.push({ marker: 'HDL-C', value: hdl.toFixed(0), status: hdl < 40 ? 'low' : 'normal', notes: `Suppressed by cardio-toxicity.` });

    let ldl = getPrev('LDL-C', 100);
    ldl += totalCardioToxicity * 0.3;
    if (geneticFactors.includes('Poor Lipid Response')) ldl += totalCardioToxicity * 0.15;
    markers.push({ marker: 'LDL-C', value: ldl.toFixed(0), status: ldl > 130 ? 'elevated' : 'normal', notes: `Elevated by cardio-toxicity.` });
    
    // --- Hormonal Model ---
    const suppressedTest = Math.max(50, getPrev('Total Testosterone', 500) - totalHptaSuppression * 20);
    const totalTest = suppressedTest + totalAnabolic * 25;
    markers.push({ marker: 'Total Testosterone', value: totalTest.toFixed(0), status: totalTest > 900 ? 'elevated' : 'normal', notes: 'Exogenous sources elevate levels.' });

    let baseE2 = getPrev('Estradiol (E2)', 25) + totalAndrogenic * 0.3;
    if (geneticFactors.includes('High Aromatization Tendency')) baseE2 *= 1.05;
    const finalE2 = baseE2 * (1 - Math.min(totalEstrogenReduction, 0.95) * 0.1); // AI effect is gradual
    markers.push({ marker: 'Estradiol (E2)', value: finalE2.toFixed(0), status: finalE2 > 45 ? 'elevated' : 'normal', notes: `Aromatization from androgens.` });

    markers.push({ marker: 'LH / FSH', value: Math.max(0.1, 5 - totalHptaSuppression * 0.5).toFixed(1), status: totalHptaSuppression > 5 ? 'critical' : 'normal', notes: `` });
    
    // --- Other markers ---
    const newGlucose = getPrev('Glucose', 85) + hpsResult.metabolicAdjustmentFactor - 1; // GH/Anabolics slightly raise glucose
    markers.push({ marker: 'Glucose', value: newGlucose.toFixed(0), status: newGlucose > 100 ? 'elevated' : 'normal', notes: `Influenced by hormonal metabolic shift.` });

    const hematocrit = getPrev('Hematocrit', 42) + totalAndrogenic * 0.08;
    markers.push({ marker: 'Hematocrit', value: hematocrit.toFixed(1), status: hematocrit > 50 ? 'elevated' : 'normal', notes: `Increased by androgenic load.` });
    
    return markers;
};

/**
 * Runs the OHS simulation for a single week.
 */
export const runOhsWeekSimulation = (profile: AthleteProfile, hpsResult: HpsResult, previousMarkers: BloodMarker[]): OhsResult => {
  const { totalCardioToxicity, totalHepatoToxicity, totalHptaSuppression, totalNephroToxicity } = hpsResult;

  const bloodMarkers = calculateNextWeekBloodMarkers(profile, hpsResult, previousMarkers);
  const markerMap = new Map(bloodMarkers.map(m => [m.marker, parseFloat(m.value)]));

  const riskScores = {
    cardiovascular: calculateRisk(totalCardioToxicity, profile.age, profile.geneticFactors.includes('Cardiovascular Disease Risk'), "Based on lipid impact, androgen load, and genetics."),
    hepatic: calculateRisk(totalHepatoToxicity, profile.age, false, `Based on direct toxicity of oral compounds. ALT: ${markerMap.get('ALT')}`),
    renal: calculateRisk(totalNephroToxicity, profile.age, false, `Based on direct nephrotoxicity and BP strain. eGFR: ${markerMap.get('eGFR')}`),
    endocrine: calculateRisk(totalHptaSuppression, profile.age, false, "Based on severity of HPTA shutdown."),
  };
  
  return {
    riskScores,
    bloodMarkers,
  };
};