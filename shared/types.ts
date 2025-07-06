/**
 * @file This file defines all the core TypeScript types and interfaces used throughout the application.
 * It serves as the single source of truth for the application's data structures.
 */

/**
 * Represents a translatable string, which can be a simple key or a key with dynamic values for interpolation.
 */
export type TranslatableText = {
  key: string;
  values?: Record<string, any>;
} | string;

/**
 * Represents a snapshot of key blood markers.
 * Used for both baseline input and weekly simulation output.
 */
export interface BloodWork {
  // Cardiovascular
  systolicBP?: number;
  diastolicBP?: number;
  hdl?: number;
  ldl?: number;
  // Metabolic
  glucose?: number;
  // Hormonal
  totalTestosterone?: number;
  // Liver
  alt?: number;
  ast?: number;
  // Kidney
  egfr?: number;
}

/**
 * Represents the profile of the virtual athlete.
 */
export interface AthleteProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // in kilograms
  bfp: number; // body fat percentage
  goal: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  geneticFactors: string[];
  medicalHistory: string;
  baselineBloodWork?: BloodWork; // Optional baseline values for calibration
}

/**
 * Represents the daily nutrition plan.
 */
export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  supplements: string[];
}

/**
 * Represents a single compound in any pharmacological protocol.
 */
export interface PedProtocol {
  id: string;
  compound: string;
  dosage: number;
  frequency: 'daily' | 'eod' | 'e3d' | 'weekly' | 'bi-weekly';
  durationWeeks?: number;
}

/**
 * Represents a single phase of a pharmacological protocol.
 */
export interface ProtocolPhase {
  id: string;
  name: string;
  durationWeeks: number;
  compounds: PedProtocol[];
}

/**
 * Represents the entire state of the user's input.
 */
export interface AppState {
  profile: AthleteProfile;
  nutrition: NutritionPlan;
  protocolPhases: ProtocolPhase[];
  support: PedProtocol[];
  pct: PedProtocol[];
}

/**
 * Type definition for a compound entry in the knowledge base.
 */
export type PedCompound = {
  name: string;
  category: 'AAS' | 'Peptide' | 'Hormone' | 'SERM' | 'Support' | 'SARM' | 'Other';
  halfLifeDays: number;
  anabolic: number;
  androgenic: number;
  hepatoToxicity: number;
  cardioToxicity: number;
  hptaSuppression: number;
  nephroToxicity: number; // New property for kidney strain
  hptaStimulation?: number;
  estrogenBlockade?: number;
  estrogenReduction?: number;
  bloodPressureReduction?: number;
};

/**
 * Represents a single predicted blood marker from the simulation.
 */
export interface BloodMarker {
  marker: string;
  value: string;
  status: 'normal' | 'elevated' | 'low' | 'critical';
  notes: string;
}

/**
 * Represents the state of all blood markers for a single week.
 */
export interface BloodMarkerWeeklyHistory {
    week: number;
    markers: BloodMarker[];
}

/**
 * Represents a single data point in the physique projection over time.
 */
export interface PhysiqueDataPoint {
  week: number;
  muscleMassKg: number;
  fatMassKg: number;
}

/**
 * Represents a quantitative risk score for a specific physiological system.
 */
export interface RiskScore {
    score: number;
    notes: string;
}

/**
 * Represents the complete output of a single simulation run.
 */
export interface SimulationResult {
  id: string;
  summary: TranslatableText;
  inferredGoal: string;
  physiqueProjection: PhysiqueDataPoint[];
  bloodMarkerHistory: BloodMarkerWeeklyHistory[];
  riskScores: {
    cardiovascular: RiskScore;
    hepatic: RiskScore;
    renal: RiskScore;
    endocrine: RiskScore;
  };
  warnings: TranslatableText[];
  recommendations: TranslatableText[];
  longTermOutlook: TranslatableText;
  profile: AthleteProfile;
  nutrition: NutritionPlan;
  protocolPhases: ProtocolPhase[];
  support: PedProtocol[];
  pct: PedProtocol[];
  aiAnalysis?: TranslatableText | null;
}

/**
 * Defines the structure for an AI-generated protocol suggestion.
 */
export interface SuggestedProtocol {
    protocolPhases: ProtocolPhase[];
    support: PedProtocol[];
    pct: PedProtocol[];
}