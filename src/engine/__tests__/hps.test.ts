import { describe, it, expect } from '@jest/globals';
import { runHpsWeekSimulation } from '../hps';
import { PkeResult } from '../types';

describe('Hormonal & Pharmacological Sub-Model (HPS) Simulation', () => {

  it('should produce zero or baseline scores with empty input', () => {
    const emptyPkeResult: PkeResult = {
      activeConcentrations: new Map(),
    };
    
    const result = runHpsWeekSimulation(emptyPkeResult, false);

    expect(result.totalAnabolic).toBe(0);
    expect(result.totalAndrogenic).toBe(0);
    expect(result.totalHepatoToxicity).toBe(0);
    expect(result.totalCardioToxicity).toBe(0);
    expect(result.totalHptaSuppression).toBe(0);
    expect(result.totalNephroToxicity).toBe(0);
    expect(result.metabolicAdjustmentFactor).toBe(1.0);
  });

  it('should calculate scores for a single compound', () => {
    const pkeResult: PkeResult = {
        activeConcentrations: new Map([
            ['Testosterone Enanthate', 1.0] // Use a concentration score of 1.0 for simplicity
        ])
    };
    
    const result = runHpsWeekSimulation(pkeResult, false);

    expect(result.totalAnabolic).toBe(8);
    expect(result.totalAndrogenic).toBe(8);
    expect(result.totalHepatoToxicity).toBe(1);
    expect(result.totalCardioToxicity).toBe(5);
    expect(result.totalHptaSuppression).toBe(9);
    expect(result.totalNephroToxicity).toBe(2);
    expect(result.metabolicAdjustmentFactor).toBeCloseTo(1.0 + (8 / 100) * 0.05);
  });

  it('should correctly sum scores for multiple compounds', () => {
    const pkeResult: PkeResult = {
        activeConcentrations: new Map([
            ['Testosterone Enanthate', 1.0],
            ['Trenbolone Acetate', 0.5] // Half concentration
        ])
    };
    
    const result = runHpsWeekSimulation(pkeResult, false);

    // Test: 8 + (10 * 0.5) = 13
    expect(result.totalAnabolic).toBe(13);
    // Tren: 8 + (10 * 0.5) = 13
    expect(result.totalAndrogenic).toBe(13);
    // Hepato: 1 + (3 * 0.5) = 2.5 -> rounded to 3
    expect(result.totalHepatoToxicity).toBe(3);
    // Cardio: 5 + (9 * 0.5) = 9.5 -> rounded to 10
    expect(result.totalCardioToxicity).toBe(10);
    // HPTA: 9 + (10 * 0.5) = 14
    expect(result.totalHptaSuppression).toBe(14);
    // Nephro: 2 + (8 * 0.5) = 6
    expect(result.totalNephroToxicity).toBe(6);
  });
  
  it('should handle PCT phase by antagonizing HPTA suppression', () => {
      const pkeResult: PkeResult = {
        activeConcentrations: new Map([
            ['Testosterone Enanthate', 0.1], // Lingering testosterone
            ['Tamoxifen (Nolvadex)', 1.0] // Full PCT dose
        ])
      };
      
      const result = runHpsWeekSimulation(pkeResult, true); // isPctPhase = true

      // HPTA Suppression from Test: 9 * 0.1 = 0.9
      // HPTA Stimulation from Nolva: 7 * 1.0 = 7
      // Total Suppression = max(0, 0.9 - 7) = 0
      expect(result.totalHptaSuppression).toBe(0);
  });

});
