/**
 * @file The deterministic Metabolic & Energetic Sub-Model (MES).
 * Calculates TDEE and calorie balance, adjusted for hormonal factors.
 */
import { AthleteProfile, NutritionPlan } from '../shared/types';
import { HpsResult, MesResult } from './types';

const GOAL_ACTIVITY_FACTORS: { [key: string]: number } = {
  'goals.aggressive_bulk': 1.55,
  'goals.lean_gain': 1.55,
  'goals.recomposition': 1.375,
  'goals.moderate_cut': 1.375,
  'goals.aggressive_shred': 1.55,
  'goals.competition_prep': 1.725,
  'goals.anti_aging': 1.2,
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