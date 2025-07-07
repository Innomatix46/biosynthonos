/**
 * @file Defines the internal types and interfaces for the deterministic engine modules.
 * These act as the data contracts between the different sub-models.
 */
import { RiskScore, PhysiqueDataPoint, BloodMarker, TranslatableText } from '../shared/types';


// --- PKE (Pharmacokinetic Engine) ---
export interface PkeResult {
  activeConcentrations: Map<string, number>; // Maps compound name to its active concentration score
}

// --- HPS (Hormonal & Pharmacological Sub-Model) ---
export interface HpsResult {
  // Aggregated scores based on the entire PED stack
  totalAnabolic: number;
  totalAndrogenic: number;
  totalHepatoToxicity: number;
  totalCardioToxicity: number;
  totalHptaSuppression: number;
  totalNephroToxicity: number;
  // Effect modifiers from support compounds
  totalEstrogenReduction: number;
  totalBloodPressureReduction: number;
  // A factor to adjust metabolic rate based on hormonal influence
  metabolicAdjustmentFactor: number; // e.g., 1.0 for neutral, >1 for increased, <1 for decreased
}


// --- MES (Metabolic & Energetic Sub-Model) ---
export interface MesResult {
  tdee: number; // Total Daily Energy Expenditure
  calorieBalance: number; // Daily calorie surplus or deficit
}


// --- AMS (Anthropometric & Morphological Sub-Model) ---
// This now represents the result of the entire simulation run for synthesis
export interface AmsResult {
  physiqueProjection: PhysiqueDataPoint[];
  finalMuscleGainKg: number;
  finalFatLossKg: number;
}
// This represents the change in a single week
export interface AmsWeeklyResult {
    muscleChangeKg: number;
    fatChangeKg: number;
}


// --- OHS (Organ & Health Sub-Model) ---
export interface OhsResult {
  riskScores: {
    cardiovascular: RiskScore;
    hepatic: RiskScore;
    renal: RiskScore;
    endocrine: RiskScore;
  };
  bloodMarkers: BloodMarker[];
}


// --- Synthesis Module ---
export interface SynthesisResult {
  summary: TranslatableText;
  inferredGoal: string;
  warnings: TranslatableText[];
  recommendations: TranslatableText[];
  longTermOutlook: TranslatableText;
}
