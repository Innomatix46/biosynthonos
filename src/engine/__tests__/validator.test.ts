import { describe, it, expect } from '@jest/globals';
import { validateSimulationModel } from '../validator';
import { SimulationResult } from '../../shared/types';
import { DEFAULT_APP_STATE } from '../../constants';

// A baseline mock simulation result that is considered valid.
const mockSimulation: SimulationResult = {
  ...DEFAULT_APP_STATE,
  protocolPhases: [{ id: '1', name: 'Test', durationWeeks: 2, compounds: [] }],
  pct: [],
  id: 'sim-12345',
  summary: { key: 'synthesis.summary', values: {} },
  inferredGoal: 'goals.lean_gain',
  physiqueProjection: [
    { week: 0, muscleMassKg: 68, fatMassKg: 12.75 },
    { week: 1, muscleMassKg: 68.2, fatMassKg: 12.6 },
    { week: 2, muscleMassKg: 68.4, fatMassKg: 12.45 },
  ],
  bloodMarkerHistory: [
    { week: 0, markers: [] },
    { week: 1, markers: [] },
    { week: 2, markers: [] },
  ],
  riskScores: {
    cardiovascular: { score: 20, notes: '' },
    hepatic: { score: 10, notes: '' },
    renal: { score: 5, notes: '' },
    endocrine: { score: 30, notes: '' },
  },
  warnings: [],
  recommendations: [],
  longTermOutlook: { key: 'synthesis.long_term_outlook' },
  aiAnalysis: null,
};


describe('Simulation Model Validator', () => {

  it('should pass a valid simulation without errors or warnings', () => {
    const result = validateSimulationModel(mockSimulation);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect mismatched physiqueProjection length as an error', () => {
    const brokenSim: SimulationResult = {
      ...mockSimulation,
      physiqueProjection: [
        { week: 0, muscleMassKg: 68, fatMassKg: 12.75 },
        // Two weeks are missing
      ],
    };
    const result = validateSimulationModel(brokenSim);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Physique projection length (1) does not match expected total weeks + 1 (3)');
  });

  it('should detect mismatched bloodMarkerHistory length as an error', () => {
    const brokenSim: SimulationResult = {
      ...mockSimulation,
      bloodMarkerHistory: [
        { week: 0, markers: [] },
        // Two weeks are missing
      ],
    };
    const result = validateSimulationModel(brokenSim);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Blood marker history length (1) does not match expected total weeks + 1 (3)');
  });

  it('should add a suggestion for unrealistic muscle gain', () => {
    const extremeGainSim: SimulationResult = {
      ...mockSimulation,
      physiqueProjection: [
        { week: 0, muscleMassKg: 68, fatMassKg: 12.75 },
        { week: 1, muscleMassKg: 75, fatMassKg: 12.6 },
        { week: 2, muscleMassKg: 81, fatMassKg: 12.45 }, // 13kg gain
      ],
    };
    const result = validateSimulationModel(extremeGainSim);
    expect(result.suggestions).toContain('Muscle gain (13.0 kg) may exceed typical natural limits.');
  });

  it('should add a warning for very low final body fat', () => {
    const lowFatSim: SimulationResult = {
        ...mockSimulation,
        physiqueProjection: [
          { week: 0, muscleMassKg: 68, fatMassKg: 12.75 },
          { week: 1, muscleMassKg: 68.2, fatMassKg: 5 },
          { week: 2, muscleMassKg: 68.4, fatMassKg: 2.5 }, // Very low fat
        ],
      };
      const result = validateSimulationModel(lowFatSim);
      expect(result.warnings).toContain('Final fat mass is very low (2.5 kg), which may be unrealistic or unsustainable.');
  });

  it('should not warn for low body fat if starting low', () => {
    const lowFatSim: SimulationResult = {
      ...mockSimulation,
      physiqueProjection: [
        { week: 0, muscleMassKg: 68, fatMassKg: 2.9 },
        { week: 1, muscleMassKg: 68.1, fatMassKg: 2.8 },
        { week: 2, muscleMassKg: 68.2, fatMassKg: 2.7 },
      ],
    };
    const result = validateSimulationModel(lowFatSim);
    expect(result.warnings).not.toContain('Final fat mass is very low');
  });

  it('should add a warning for invalid simulation ID format', () => {
    const invalidIdSim: SimulationResult = {
        ...mockSimulation,
        id: 'invalid-id-123',
    };
    const result = validateSimulationModel(invalidIdSim);
    expect(result.warnings).toContain('Simulation ID format invalid. Should be prefixed with "sim-".');
  });

});