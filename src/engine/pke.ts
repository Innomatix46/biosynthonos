/**
 * @file The new Pharmacokinetic Engine (PKE).
 * This module simulates the active concentration of compounds in the body
 * over time, based on dosage, frequency, and half-life. It now supports multi-phase protocols.
 */
import { PedProtocol, ProtocolPhase } from '../shared/types';
import { PED_COMPOUNDS } from '../constants';
import { PkeResult } from './types';

const compoundDataMap = new Map(PED_COMPOUNDS.map(c => [c.name, c]));

const getDosagesPerWeek = (frequency: PedProtocol['frequency']): number => {
    switch(frequency) {
        case 'daily': return 7;
        case 'eod': return 3.5;
        case 'e3d': return 2.33;
        case 'weekly': return 1;
        case 'bi-weekly': return 0.5;
        default: return 1;
    }
}

/**
 * Calculates the active concentrations of all compounds for a given week.
 */
export const calculateWeeklyConcentrations = (
    week: number,
    protocolPhases: ProtocolPhase[],
    supportProtocol: PedProtocol[],
    pctProtocol: PedProtocol[],
    previousConcentrations: Map<string, number>
): PkeResult => {
    const newConcentrations = new Map<string, number>();
    const cycleDuration = protocolPhases.reduce((sum, phase) => sum + phase.durationWeeks, 0);

    // First, handle decay of all previously active compounds
    for (const [compoundName, oldConc] of previousConcentrations.entries()) {
        const data = compoundDataMap.get(compoundName);
        if (data && data.halfLifeDays > 0) {
            const decayFactor = Math.pow(0.5, 7 / data.halfLifeDays);
            const decayedConc = oldConc * decayFactor;
            if (decayedConc > 0.05) { // Only keep non-trivial amounts
                newConcentrations.set(compoundName, decayedConc);
            }
        }
    }

    // Determine the active protocol for the current week
    let activeProtocols: PedProtocol[] = [];
    if (week <= cycleDuration) {
        // Find the active phase
        let cumulativeWeeks = 0;
        let activePhase: ProtocolPhase | null = null;
        for (const phase of protocolPhases) {
            cumulativeWeeks += phase.durationWeeks;
            if (week <= cumulativeWeeks) {
                activePhase = phase;
                break;
            }
        }
        if (activePhase) {
            activeProtocols = [...activePhase.compounds, ...supportProtocol];
        }
    } else {
        // We are in the PCT phase
        activeProtocols = pctProtocol;
    }

    // Now, add new dosages for the current week from the active protocol
    for (const protocol of activeProtocols) {
        if (protocol.compound === 'None' || protocol.dosage <= 0) continue;
        
        const data = compoundDataMap.get(protocol.compound);
        if (!data) continue;

        const dosagesPerWeek = getDosagesPerWeek(protocol.frequency);
        const weeklyDosage = protocol.dosage * dosagesPerWeek;

        // The "concentration" is a simplified score normalized to a reference dosage.
        let referenceDosage = 500; // Default for AAS/SARMs
        if (data.category === 'SERM') referenceDosage = 350; // e.g., 50mg/day * 7
        if (data.category === 'Support') referenceDosage = 7; // e.g., 1mg/day * 7
        
        const addedConcentration = weeklyDosage / referenceDosage;
        
        const currentConc = newConcentrations.get(protocol.compound) || 0;
        newConcentrations.set(protocol.compound, currentConc + addedConcentration);
    }

    return {
        activeConcentrations: newConcentrations
    };
};
