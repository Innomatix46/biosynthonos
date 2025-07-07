import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SimulationResult, PedProtocol, ProtocolPhase, AthleteProfile, TranslatableText, SuggestedProtocol } from '../shared/types';
import { TFunction } from "i18next";
import { nanoid } from "nanoid";

/**
 * @file This service handles communication with the Google Gemini API
 * to provide advanced AI-driven analysis of simulation results and protocol suggestions.
 */

// Per coding guidelines, the API key is assumed to be available on process.env.API_KEY.
// The execution environment is responsible for providing this variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Constructs a detailed prompt for Gemini based on the simulation result.
 * @param result The deterministic simulation result object.
 * @returns A string containing the formatted prompt.
 */
const constructAnalysisPrompt = (result: SimulationResult, t: TFunction): string => {
  // Sanitize the result to create a concise summary for the prompt.
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
    // We send the English keys so the AI always reasons in English
    deterministicSummary: typeof result.summary === 'object' && result.summary.key ? t(result.summary.key, { ...result.summary.values, lng: 'en' }) : t(result.summary as string, { lng: 'en' }),
    deterministicWarnings: result.warnings.map(w => typeof w === 'object' && w.key ? t(w.key, { ...w.values, lng: 'en' }) : t(w as string, { lng: 'en' })).join(' '),
  };

  // The main prompt is always in English for model consistency
  return `
    You are "Synthonos AI", an expert sports scientist and endocrinologist specializing in pharmacological performance enhancement and harm reduction.
    Your role is to provide a deep, nuanced, and professional analysis of a simulated protocol for a virtual athlete.
    DO NOT give direct medical advice. Use cautious and educational language like "The model suggests..." or "The protocol appears to...". Frame your response as an analysis of a theoretical model.

    Analyze the following simulation data. Provide insights that go beyond the basic deterministic output. Focus on:
    1.  **Protocol Synergy & Efficiency:** Critique the combination and phasing of compounds. Is it a well-designed protocol for the user's goal? (e.g., "The front-loading phase appears aggressive...", "The transition from the blast to the cruise phase seems appropriate...").
    2.  **Advanced Risk Interpretation:** Elaborate on the "why" behind the risk scores. Explain the mechanisms, especially considering the genetics. (e.g., "The high cardiovascular risk score is driven by Stanozolol's known impact on HDL, which is likely exacerbated by the user's 'Poor Lipid Response' genetic marker...").
    3.  **Holistic Lifestyle Recommendations:** Suggest actionable lifestyle adjustments beyond basic supplements. Think about specific food choices (e.g., "With a high aromatization tendency, increasing cruciferous vegetable intake..."), sleep hygiene, or specific cardio types beneficial for this protocol.
    4.  **Long-Term Considerations:** Discuss the potential long-term trajectory. Mention receptor downregulation, chronic organ strain, or the importance of extended "off-cycle" periods, especially for complex protocols like "Blast and Cruise".

    Keep the tone professional, educational, and cautious. Structure your response with clear headings in markdown. Output **only** the markdown analysis.

    **Simulation Data:**
    \`\`\`json
    ${JSON.stringify(summaryData, null, 2)}
    \`\`\`
  `;
};

/**
 * Queries the Gemini API for an advanced analysis of a simulation result.
 * @param result The simulation result to be analyzed.
 * @param t The translation function from i18next.
 * @returns A promise that resolves to the AI-generated analysis as a TranslatableText object.
 */
export const getAiAnalysis = async (result: SimulationResult, t: TFunction): Promise<TranslatableText> => {
  try {
    const prompt = constructAnalysisPrompt(result, t);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text; // The response text is a markdown string.
  } catch (error) {
    console.error("AI Analysis failed:", error);
    if (error instanceof Error && (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid'))) {
         throw new Error(t('errors.ai_api_key_invalid'));
    }
    throw new Error(t('errors.ai_analysis_failed'));
  }
};


const constructSuggestionPrompt = (profile: AthleteProfile, t: TFunction): string => {
    // Prompt is always in English for model consistency.
    return `
        You are an AI-powered protocol optimization engine. Your task is to generate a **theoretically sound and safety-conscious** pharmacological protocol for a virtual athlete based on their profile.
        Your output MUST be a single, valid JSON object and nothing else. Do not include any explanatory text before or after the JSON.

        The athlete's profile is:
        - Goal: "${t(profile.goal, { lng: 'en' })}"
        - Experience Level: "${t(`experience.${profile.experienceLevel}`, { lng: 'en' })}"

        Based on this, generate a JSON object with the following structure: { "protocolPhases": [...], "support": [...], "pct": [...] }.

        Guidelines:
        1.  **protocolPhases**: Create 1 or 2 phases (e.g., for a "Blast and Cruise").
            -   **Beginner**: Suggest a simple, single-phase Testosterone-only cycle. Duration 10-12 weeks.
            -   **Intermediate**: Can be a more complex single phase (e.g., Test + one other compound like Masteron or Anavar) or a simple Blast and Cruise (e.g., 12w blast, 12w cruise).
            -   **Expert**: Can involve more advanced compounds (like Trenbolone or Nandrolone) and more complex phasing. Keep it reasonable.
        2.  **support**: Include appropriate support drugs.
            -   If using aromatizing compounds (like Testosterone), ALWAYS include an Aromatase Inhibitor (e.g., Anastrozole) at a low, prophylactic dose.
            -   If using compounds with high cardiovascular strain, consider adding Telmisartan.
        3.  **pct**: ALWAYS include a PCT protocol unless it's a cruise phase.
            -   Use standard SERMs like Tamoxifen or Clomiphene.
            -   Start PCT 2-3 weeks after the last injection of a long-ester compound. The simulation timing handles this, just define the drugs.
        4.  **Dosages**: Use conservative, commonly cited dosages. Prioritize safety.

        Example Output for a beginner wanting to bulk:
        {
          "protocolPhases": [
            { "id": "phase-1", "name": "Beginner Bulk", "durationWeeks": 12, "compounds": [{ "id": "ped-1", "compound": "Testosterone Enanthate", "dosage": 300, "frequency": "weekly" }] }
          ],
          "support": [
            { "id": "support-1", "compound": "Anastrozole", "dosage": 0.25, "frequency": "eod" }
          ],
          "pct": [
            { "id": "pct-1", "compound": "Tamoxifen", "dosage": 20, "frequency": "daily", "durationWeeks": 4 }
          ]
        }
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
}
