
/**
 * @file This file contains constant values used throughout the application,
 * serving as the primary knowledge base for the deterministic engine.
 */
import { AppState, PedCompound } from './shared/types';
import { nanoid } from 'nanoid';

/**
 * The core knowledge base for the deterministic simulation engine.
 * Each compound is rated on several axes to drive the rule-based models.
 */
export const PED_COMPOUNDS: PedCompound[] = [
  // Name, Category, Half-life, Anabolic, Androgenic, Hepato, Cardio, HPTA Supp, Nephro
  { name: 'None', category: 'Other', halfLifeDays: 0, anabolic: 0, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 0, hptaSuppression: 0, nephroToxicity: 0 },
  
  // AAS
  { name: 'Testosterone Enanthate', category: 'AAS', halfLifeDays: 7, anabolic: 8, androgenic: 8, hepatoToxicity: 1, cardioToxicity: 5, hptaSuppression: 9, nephroToxicity: 2 },
  { name: 'Testosterone Cypionate', category: 'AAS', halfLifeDays: 8, anabolic: 8, androgenic: 8, hepatoToxicity: 1, cardioToxicity: 5, hptaSuppression: 9, nephroToxicity: 2 },
  { name: 'Testosterone Propionate', category: 'AAS', halfLifeDays: 2, anabolic: 8, androgenic: 8, hepatoToxicity: 1, cardioToxicity: 5, hptaSuppression: 9, nephroToxicity: 2 },
  { name: 'Trenbolone Acetate', category: 'AAS', halfLifeDays: 3, anabolic: 10, androgenic: 10, hepatoToxicity: 3, cardioToxicity: 9, hptaSuppression: 10, nephroToxicity: 8 },
  { name: 'Trenbolone Enanthate', category: 'AAS', halfLifeDays: 7, anabolic: 10, androgenic: 10, hepatoToxicity: 3, cardioToxicity: 9, hptaSuppression: 10, nephroToxicity: 8 },
  { name: 'Nandrolone Decanoate', category: 'AAS', halfLifeDays: 14, anabolic: 9, androgenic: 3, hepatoToxicity: 1, cardioToxicity: 4, hptaSuppression: 10, nephroToxicity: 3 },
  { name: 'Oxandrolone (Anavar)', category: 'AAS', halfLifeDays: 0.5, anabolic: 5, androgenic: 2, hepatoToxicity: 5, cardioToxicity: 3, hptaSuppression: 3, nephroToxicity: 2 },
  { name: 'Metandienone (Dianabol)', category: 'AAS', halfLifeDays: 0.25, anabolic: 7, androgenic: 5, hepatoToxicity: 8, cardioToxicity: 6, hptaSuppression: 8, nephroToxicity: 4 },
  { name: 'Drostanolone (Masteron)', category: 'AAS', halfLifeDays: 2.5, anabolic: 6, androgenic: 4, hepatoToxicity: 2, cardioToxicity: 6, hptaSuppression: 4, nephroToxicity: 3 },
  { name: 'Stanozolol (Winstrol)', category: 'AAS', halfLifeDays: 0.4, anabolic: 6, androgenic: 3, hepatoToxicity: 9, cardioToxicity: 9, hptaSuppression: 5, nephroToxicity: 6 },

  // SARMs
  { name: 'Ostarine (MK-2866)', category: 'SARM', halfLifeDays: 1, anabolic: 4, androgenic: 1, hepatoToxicity: 3, cardioToxicity: 2, hptaSuppression: 4, nephroToxicity: 1 },
  { name: 'Ligandrol (LGD-4033)', category: 'SARM', halfLifeDays: 1.2, anabolic: 6, androgenic: 2, hepatoToxicity: 4, cardioToxicity: 3, hptaSuppression: 7, nephroToxicity: 2 },
  { name: 'Testolone (RAD-140)', category: 'SARM', halfLifeDays: 2.5, anabolic: 7, androgenic: 3, hepatoToxicity: 4, cardioToxicity: 4, hptaSuppression: 8, nephroToxicity: 3 },
  
  // Peptides
  { name: 'BPC-157', category: 'Peptide', halfLifeDays: 0.2, anabolic: 1, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 0, hptaSuppression: 0, nephroToxicity: 0 },
  { name: 'TB-500', category: 'Peptide', halfLifeDays: 2, anabolic: 1, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 0, hptaSuppression: 0, nephroToxicity: 0 },
  { name: 'Ipamorelin', category: 'Peptide', halfLifeDays: 0.1, anabolic: 2, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 1, hptaSuppression: 1, nephroToxicity: 0 },
  { name: 'CJC-1295 (with DAC)', category: 'Peptide', halfLifeDays: 8, anabolic: 3, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 2, hptaSuppression: 2, nephroToxicity: 1 },
  
  // Hormones
  { name: 'Growth Hormone (GH)', category: 'Hormone', halfLifeDays: 0.2, anabolic: 5, androgenic: 0, hepatoToxicity: 1, cardioToxicity: 3, hptaSuppression: 2, nephroToxicity: 2 },
  { name: 'Insulin (Humalog)', category: 'Hormone', halfLifeDays: 0.1, anabolic: 9, androgenic: 0, hepatoToxicity: 1, cardioToxicity: 2, hptaSuppression: 1, nephroToxicity: 1 },
  
  // SERMs (for PCT)
  { name: 'Clomiphene (Clomid)', category: 'SERM', halfLifeDays: 5, anabolic: 0, androgenic: 0, hepatoToxicity: 2, cardioToxicity: 1, hptaSuppression: 0, hptaStimulation: 8, estrogenBlockade: 5, nephroToxicity: 1 },
  { name: 'Tamoxifen (Nolvadex)', category: 'SERM', halfLifeDays: 7, anabolic: 0, androgenic: 0, hepatoToxicity: 2, cardioToxicity: 0, hptaSuppression: 0, hptaStimulation: 7, estrogenBlockade: 8, nephroToxicity: 1 },

  // Support Compounds (On-Cycle)
  { name: 'Anastrozole (Arimidex)', category: 'Support', halfLifeDays: 2, anabolic: 0, androgenic: 0, hepatoToxicity: 1, cardioToxicity: 2, hptaSuppression: 0, estrogenReduction: 0.5, nephroToxicity: 0 },
  { name: 'Exemestane (Aromasin)', category: 'Support', halfLifeDays: 1, anabolic: 0, androgenic: 0, hepatoToxicity: 1, cardioToxicity: 1, hptaSuppression: 0, estrogenReduction: 0.65, nephroToxicity: 0 },
  { name: 'Telmisartan', category: 'Support', halfLifeDays: 1, anabolic: 0, androgenic: 0, hepatoToxicity: 0, cardioToxicity: 0, hptaSuppression: 0, bloodPressureReduction: 10, nephroToxicity: -2 }, // Nephroprotective
];

// Options now use translation keys
export const GOAL_OPTIONS: string[] = [
    'goals.aggressive_bulk',
    'goals.lean_gain',
    'goals.recomposition',
    'goals.moderate_cut',
    'goals.aggressive_shred',
    'goals.competition_prep',
    'goals.anti_aging',
];

export const EXPERIENCE_LEVEL_OPTIONS: { value: AppState['profile']['experienceLevel'], tKey: string }[] = [
    { value: 'beginner', tKey: 'experience.beginner' },
    { value: 'intermediate', tKey: 'experience.intermediate' },
    { value: 'expert', tKey: 'experience.expert' },
];

export const GENETIC_FACTOR_OPTIONS: string[] = [
    'genetics.cardio_risk',
    'genetics.aromatization',
    'genetics.alopecia',
    'genetics.lipid_response',
];

export const SUPPLEMENT_OPTIONS: string[] = [
    'supplements.creatine',
    'supplements.omega3',
    'supplements.d3',
    'supplements.whey',
    'supplements.glutamine',
    'supplements.nac',
    'supplements.tudca',
    'supplements.bergamot',
    'supplements.coq10',
    'supplements.ashwagandha',
    'supplements.berberine',
];

export const DEFAULT_APP_STATE: AppState = {
  profile: {
    age: 30,
    gender: 'male',
    weight: 85,
    bfp: 15,
    goal: 'goals.lean_gain',
    experienceLevel: 'intermediate',
    geneticFactors: [],
    medicalHistory: 'None reported.',
    baselineBloodWork: {
        systolicBP: 120,
        diastolicBP: 80,
        glucose: 85,
        totalTestosterone: 500,
        hdl: 50,
        ldl: 100,
        alt: 25,
        ast: 25,
        egfr: 100,
    }
  },
  nutrition: {
    calories: 3000,
    protein: 180,
    carbs: 350,
    fat: 80,
    supplements: ['supplements.creatine', 'supplements.omega3', 'supplements.whey'],
  },
  protocolPhases: [
    {
      id: nanoid(),
      name: "Main Cycle",
      durationWeeks: 12,
      compounds: [
        {
          id: nanoid(),
          compound: 'Testosterone Enanthate',
          dosage: 250,
          frequency: 'weekly',
        },
      ]
    }
  ],
  support: [
     {
      id: nanoid(),
      compound: 'None',
      dosage: 0,
      frequency: 'daily',
    },
  ],
  pct: [
      {
          id: nanoid(),
          compound: 'None',
          dosage: 0,
          frequency: 'daily',
          durationWeeks: 4,
      }
  ],
  labReports: [],
};