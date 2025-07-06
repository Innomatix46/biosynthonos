/**
 * @file The deterministic model validator.
 * This module contains functions to validate the results of a simulation run
 * for consistency, plausibility, and data integrity.
 */
import { SimulationResult } from '../shared/types';

/**
 * Defines the structure of the validation report returned by the validator.
 */
export interface ValidationReport {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

/**
 * Validates the determinism, consistency, and bounds of a simulation result.
 * @param sim The SimulationResult object to validate.
 * @returns A ValidationReport containing errors, warnings, and suggestions.
 */
export function validateSimulationModel(sim: SimulationResult): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const totalDuration = sim.protocolPhases.reduce((sum, p) => sum + p.durationWeeks, 0) 
                      + sim.pct.reduce((max, p) => Math.max(max, p.durationWeeks || 0), 0);

  // Check for missing weeks in time series data
  if (sim.physiqueProjection.length !== totalDuration + 1) {
    errors.push(`Physique projection length (${sim.physiqueProjection.length}) does not match expected total weeks + 1 (${totalDuration + 1}).`);
  }
  if (sim.bloodMarkerHistory.length !== totalDuration + 1) {
    errors.push(`Blood marker history length (${sim.bloodMarkerHistory.length}) does not match expected total weeks + 1 (${totalDuration + 1}).`);
  }

  // Check for physiological plausibility if there's data to check
  if (sim.physiqueProjection.length > 0) {
      const initialMuscle = sim.physiqueProjection[0].muscleMassKg;
      // Use standard bracket notation for compatibility
      const finalMuscle = sim.physiqueProjection[sim.physiqueProjection.length - 1]?.muscleMassKg || 0;
      const gain = finalMuscle - initialMuscle;
      if (gain > 12) {
          suggestions.push(`Muscle gain (${gain.toFixed(1)} kg) may exceed typical natural limits.`);
      }

      const initialFat = sim.physiqueProjection[0].fatMassKg;
      const finalFat = sim.physiqueProjection[sim.physiqueProjection.length - 1]?.fatMassKg || 0;
      if (finalFat < 3 && initialFat >= 3) {
          warnings.push(`Final fat mass is very low (${finalFat.toFixed(1)} kg), which may be unrealistic or unsustainable.`);
      }
  }

  // Check simulation ID format
  if (!sim.id.startsWith('sim-')) {
      warnings.push('Simulation ID format invalid. Should be prefixed with "sim-".');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}