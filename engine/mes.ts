/**
 * @file The deterministic Metabolic & Energetic Sub-Model (MES).
 * Calculates TDEE and calorie balance, adjusted for hormonal factors.
 */
import { AthleteProfile, NutritionPlan } from '../shared/types';
import { HpsResult, MesResult } from './types';

const GOAL_ACTIVITY_FACTORS: { [key: string]: number } = {
  'Aggressive Muscle Gain (Bulk)': 1.55,
  'Lean Muscle Gain': 1.55,
  'Maintenance / Recomposition': 1.375,
  'Moderate Fat Loss (Cut)': 1.375,
  'Aggressive Fat Loss (Shred)': 1.55,
  'Competition Preparation': 1.725,
  'Anti-Aging / TRT': 1.2,
};

/**
 * Runs the MES simulation.
 * @param profile The athlete's profile.
 * @param nutrition The athlete's nutrition plan.
 * @param hpsResult The result from the HPS model, containing hormonal adjustments.
 * @returns A MesResult object with calculated metabolic data.
 */
export const runMesSimulation = (
  profile: AthleteProfile,
  nutrition: NutritionPlan,
  hpsResult: HpsResult
): MesResult => {
  // Calculate Lean Body Mass (LBM) in kg
  const leanBodyMassKg = profile.weight * (1 - profile.bfp / 100);

  // Calculate Basal Metabolic Rate (BMR) using the Katch-McArdle formula
  const bmr = 370 + 21.6 * leanBodyMassKg;

  // Determine the activity factor from the user's goal
  const activityFactor = GOAL_ACTIVITY_FACTORS[profile.goal] || 1.375;

  // Calculate base TDEE
  const baseTdee = bmr * activityFactor;

  // Adjust TDEE based on the hormonal factor from the HPS model
  const adjustedTdee = baseTdee * hpsResult.metabolicAdjustmentFactor;

  // Calculate the final calorie balance
  const calorieBalance = nutrition.calories - adjustedTdee;

  return {
    tdee: adjustedTdee,
    calorieBalance,
  };
};