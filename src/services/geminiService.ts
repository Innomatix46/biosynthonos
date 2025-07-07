import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SimulationResult, PedProtocol, ProtocolPhase, AthleteProfile, TranslatableText, SuggestedProtocol, BloodWork } from '../shared/types';
import { TFunction } from "i18next";
import { nanoid } from 'nanoid';

/**
 * @file This service handles communication with the Google Gemini API
 * to provide advanced AI-driven analysis of simulation results and protocol suggestions.
 * It now uses process.env.API_KEY as per the execution environment requirements.
 */

// Per coding guidelines, the API key is assumed to be available on process.env.API_KEY.
// The execution environment is responsible for providing this variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const constructAnalysisPrompt = (result: SimulationResult, t: TFunction): string => {
  const summaryData = {
    profile: result.profile,
    protocol: {
      phases: result.protocolPhases.map(phase => ({
          name: phase.name,
          durationWeeks: phase.durationWeeks,
          compounds: phase.compounds.filter(p => p.compound !== 'None')
      })),
      support: result.support?.filter((p: PedProtocol) => p.compound !== 'None') || [],
      pct: result.pct.filter(p => p.compound !== 'None'),
    },
    peakRiskScores: result.riskScores,
    physiqueChanges: {
      muscleGainKg: (result.physiqueProjection[result.physiqueProjection.length - 1].muscleMassKg - result.physiqueProjection[0].muscleMassKg).toFixed(1),
      fatLossKg: (result.physiqueProjection[0].fatMassKg - result.physiqueProjection[result.physiqueProjection.length - 1].fatMassKg).toFixed(1),
    },
    deterministicSummary: typeof result.summary === 'object' && result.summary.key ? t(result.summary.key, { ...result.summary.values, lng: 'en' }) : t(result.summary as string, { lng: 'en' }),
    deterministicWarnings: result.warnings.map(w => typeof w === 'object' && w.key ? t(w.key, { ...w.values, lng: 'en' }) : t(w as string, { lng: 'en' })).join(' '),
  };

  return `
    You are "Synthonos AI", an expert sports scientist and endocrinologist specializing in pharmacological performance enhancement and harm reduction. Your role is to provide a deep, nuanced, and professional analysis of a simulated protocol for a virtual athlete.
    DO NOT give direct medical advice. Use cautious and educational language like "The model suggests..." or "The protocol appears to...". Frame your response as an analysis of a theoretical model. Analyze the following simulation data. Provide insights that go beyond the basic deterministic output. Focus on:
    1.  **Protocol Synergy & Efficiency:** Critique the combination and phasing of compounds. Is it a well-designed protocol for the user's goal?
    2.  **Advanced Risk Interpretation:** Elaborate on the "why" behind the risk scores. Explain the mechanisms, especially considering the genetics.
    3.  **Holistic Lifestyle Recommendations:** Suggest actionable lifestyle adjustments beyond basic supplements.
    4.  **Long-Term Considerations:** Discuss the potential long-term trajectory.
    Keep the tone professional, educational, and cautious. Structure your response with clear headings in markdown. Output **only** the markdown analysis.
    **Simulation Data:**
    \`\`\`json
    ${JSON.stringify(summaryData, null, 2)}
    \`\`\`
  `;
};

export const getAiAnalysis = async (result: SimulationResult, t: TFunction): Promise<TranslatableText> => {
    try {
        const prompt = constructAnalysisPrompt(result, t);
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return response.text;
    } catch (error) {
        console.error("AI Analysis failed:", error);
        if (error instanceof Error && (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid'))) {
             throw new Error(t('errors.ai_api_key_invalid'));
        }
        throw new Error(t('errors.ai_analysis_failed'));
    }
};

const constructSuggestionPrompt = (profile: AthleteProfile, t: TFunction): string => {
    return `
        You are an AI-powered protocol optimization engine. Your task is to generate a **theoretically sound and safety-conscious** pharmacological protocol for a virtual athlete based on their profile.
        Your output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text before or after the JSON.
        The athlete's profile is:
        - Goal: "${t(profile.goal, { lng: 'en' })}"
        - Experience Level: "${t(`experience.${profile.experienceLevel}`, { lng: 'en' })}"
        Generate a JSON object with the structure: { "protocolPhases": [...], "support": [...], "pct": [...] }.
        Guidelines:
        1.  **protocolPhases**: For Beginners, suggest simple Testosterone-only cycles (10-12 weeks). For Intermediate/Expert, you can add other compounds like Masteron or Nandrolone.
        2.  **support**: If using aromatizing compounds, ALWAYS include an Aromatase Inhibitor (e.g., Anastrozole). If high cardiovascular strain, consider Telmisartan.
        3.  **pct**: ALWAYS include a PCT protocol (e.g., Tamoxifen or Clomiphene) unless the protocol is a cruise phase.
        4.  **Dosages**: Use conservative, commonly cited dosages. Prioritize safety.
    `;
};

export const getAiProtocolSuggestion = async (profile: AthleteProfile, t: TFunction): Promise<SuggestedProtocol | null> => {
    try {
        const prompt = constructSuggestionPrompt(profile, t);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const suggestion = JSON.parse(jsonStr);
        
        if (suggestion && Array.isArray(suggestion.protocolPhases)) {
            suggestion.protocolPhases.forEach((phase: any) => {
                phase.id = `phase-${nanoid()}`;
                if (phase.compounds && Array.isArray(phase.compounds)) {
                    phase.compounds.forEach((c: any) => c.id = `ped-${nanoid()}`);
                }
            });
            if (suggestion.support && Array.isArray(suggestion.support)) {
                suggestion.support.forEach((s: any) => s.id = `support-${nanoid()}`);
            }
            if (suggestion.pct && Array.isArray(suggestion.pct)) {
                suggestion.pct.forEach((p: any) => p.id = `pct-${nanoid()}`);
            }
            return suggestion as SuggestedProtocol;
        }
        return null;
    } catch (error) {
        console.error("Protocol suggestion failed:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
                throw new Error(t('errors.ai_api_key_invalid_suggestion'));
            }
        }
        throw new Error(t('errors.ai_suggestion_failed'));
    }
};

// --- Lab Report OCR Service ---
const constructLabReportPrompt = (): string => {
    return `
        You are an expert OCR and data extraction AI. Your task is to analyze the provided image of a lab report and extract specific blood marker data.
        You MUST ignore all patient data. Focus only on the marker names, values, and units.
        Respond ONLY with a valid JSON array of objects. Do not include markdown fences or any other text.
        The JSON schema for each object MUST be: { "marker": string, "value": string, "unit": string }.
        
        Prioritize extracting these common markers if present: 'Testosterone' (any form), 'Estradiol', 'E2', 'LH', 'FSH', 'ALT', 'SGPT', 'AST', 'SGOT', 'HDL', 'LDL', 'Glucose', 'eGFR', 'Systolic', 'Diastolic'.
        
        Example of a valid response:
        [
          {"marker": "Testosterone, Total", "value": "450.5", "unit": "ng/dL"},
          {"marker": "ALT (SGPT)", "value": "25", "unit": "U/L"},
          {"marker": "HDL Cholesterol", "value": "55", "unit": "mg/dL"}
        ]
    `;
};

const MARKER_MAP: { [key: string]: keyof BloodWork } = {
    'testosterone': 'totalTestosterone',
    'alt': 'alt',
    'sgpt': 'alt',
    'ast': 'ast',
    'sgot': 'ast',
    'hdl': 'hdl',
    'ldl': 'ldl',
    'glucose': 'glucose',
    'egfr': 'egfr',
    'systolic': 'systolicBP',
    'diastolic': 'diastolicBP',
};

const findBloodWorkKey = (markerName: string): keyof BloodWork | null => {
    const lowerCaseName = markerName.toLowerCase();
    for (const key in MARKER_MAP) {
        const regex = new RegExp(`\\b${key}\\b`);
        if (regex.test(lowerCaseName)) {
            return MARKER_MAP[key];
        }
    }
    return null;
}

export const getAiLabAnalysis = async (base64Data: string, mimeType: string): Promise<any[] | null> => {
    try {
        const prompt = constructLabReportPrompt();
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64Data
            }
        };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: { parts: [imagePart, textPart] },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const extractedData = JSON.parse(jsonStr);
        if (Array.isArray(extractedData)) {
            return extractedData.map(item => ({
                ...item,
                appKey: findBloodWorkKey(item.marker)
            })).filter(item => item.appKey);
        }
        return null;

    } catch (error) {
        console.error("Error calling Gemini API for lab report analysis:", error);
        throw new Error("Failed to analyze the lab report with AI. The document might be unclear or the service is unavailable.");
    }
};
