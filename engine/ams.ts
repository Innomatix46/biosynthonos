/**
 * @file The deterministic Anthropometric & Morphological Sub-Model (AMS).
 * This module projects the change in body composition (muscle and fat) for a single week.
 */
import { MesResult, HpsResult, AmsWeeklyResult } from './types';

// Constants for body composition changes
const KCAL_PER_KG_FAT = 7700;
const KCAL_PER_KG_MUSCLE = 5000; // Simplified value including water etc.

/**
 * Runs the AMS simulation for a single week.
 * @param mesResult The result from the MES model (calorie balance).
 * @param hpsResult The result from the HPS model (anabolic index).
 * @returns An AmsWeeklyResult object with the projected change in kg for the week.
 */
export const runAmsWeekSimulation = (
  mesResult: MesResult,
  hpsResult: HpsResult
): AmsWeeklyResult => {
  const { calorieBalance } = mesResult;
  const { totalAnabolic } = hpsResult;

  const weeklyCalorieBalance = calorieBalance * 7;

  // Nutrient partitioning factor (P-ratio): simplified model.
  // Higher anabolic score pushes calories towards muscle gain.
  // In a deficit, it helps preserve muscle.
  let pRatio = 0.3 + totalAnabolic * 0.025; // Adjusted sensitivity
  pRatio = Math.min(pRatio, 0.85); // Cap at 85% with very high anabolics

  if (weeklyCalorieBalance < 0) {
    // In a deficit, the p-ratio determines muscle preservation.
    // High anabolics reduce the proportion of the deficit coming from muscle.
    pRatio = 1 - (0.5 - totalAnabolic * 0.04); // Base 50% loss from muscle, down to 10%
    pRatio = Math.max(pRatio, 0.1); // At least 10% of deficit comes from muscle
  }

  let fatChangeKg = 0;
  let muscleChangeKg = 0;

  if (weeklyCalorieBalance > 0) { // Surplus
    muscleChangeKg = (weeklyCalorieBalance * pRatio) / KCAL_PER_KG_MUSCLE;
    fatChangeKg = (weeklyCalorieBalance * (1 - pRatio)) / KCAL_PER_KG_FAT;
  } else { // Deficit
    muscleChangeKg = (weeklyCalorieBalance * pRatio) / KCAL_PER_KG_MUSCLE; // This will be negative
    fatChangeKg = (weeklyCalorieBalance * (1 - pRatio)) / KCAL_PER_KG_FAT; // This will be negative
  }
  
  return {
    muscleChangeKg,
    fatChangeKg
  };
};