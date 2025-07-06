# Menschenersatzmodell: "BioSynthonos" (Biological Synthetic Human Optimization System)

## I. Modellphilosophie und Zielsetzung:
BioSynthonos ist ein prädiktives, dynamisches und hochgradig personalisiertes Simulationsmodell, das darauf abzielt, die komplexen, nicht-linearen Wechselwirkungen zwischen externen (Ernährung, Training, Medikamente) und internen (Physiologie, Genetik, Alter) eines Bodybuilders zu modellieren. Es integriert Multi-Skalen-Ansätze, um optimale Strategien für Muskelaufbau, Fettverlust und Gesundheitsmanagement unter pharmakologischer Unterstützung zu identifizieren. Das Modell dient als "virtueller Athlet" für Bildungs- und Forschungszwecke, dessen Parameter **aktiv gegen publizierte klinische Daten validiert und kalibriert werden**, wie im `VALIDATION.md` Bericht dokumentiert.

*Die Anwendung ist eine mit Vite gebaute Single-Page-Anwendung (SPA). Der API-Schlüssel für die KI-Funktionen wird sicher als Build-Zeit-Umgebungsvariable (`VITE_GEMINI_API_KEY`) verwaltet und ist nicht im Client-Code exponiert.*

## II. Kernarchitektur: Dynamische Zeitreihen-Simulation
Im Gegensatz zu statischen Modellen, die nur ein Endergebnis vorhersagen, basiert BioSynthonos auf einer wöchentlichen, zustandsbasierten Simulation. Jeder Zustand in Woche `N+1` wird auf der Grundlage des Zustands in Woche `N` berechnet. Dies ermöglicht die Modellierung von kumulativen Effekten, Anpassungen, Organsbelastung und Regenerationsprozessen.

Die Simulation wird von einem zentralen Orchestrator (`src/engine/index.ts`) gesteuert, der die folgenden Sub-Modelle in einer Schleife für jede Woche der Gesamtdauer (Hauptprotokoll + PCT) ausführt.

### 1. Pharmakokinetik-Engine (PKE) - `src/engine/pke.ts`
- **Zweck:** Simulation der aktiven Wirkstoffkonzentrationen im Körper über die Zeit.
- **Inputs:**
  - Protokoll-Phasen (mehrphasig, z.B. Blast & Cruise) mit jeweiligen Wirkstoffen, Dosierungen und Frequenzen.
  - On-Cycle-Support-Protokoll.
  - Post-Cycle-Therapie (PCT)-Protokoll.
  - Wirkstoff-Datenbank mit Halbwertzeiten (`src/constants.ts`).
  - Konzentrationen der Vorwoche (als `Map<string, number>`).
- **Prozess:**
  1.  **Zerfall (Decay):** Berechnet den Zerfall der Konzentrationen aus der Vorwoche basierend auf der Halbwertzeit jedes Wirkstoffs. Eine exponentielle Zerfallsformel (`konz_neu = konz_alt * 0.5^(7 / halbwertszeit_tage)`) wird angewendet.
  2.  **Akkumulation:** Fügt die Dosis der aktuellen Woche hinzu, die für den jeweiligen aktiven Protokollabschnitt (Phase, Support oder PCT) gilt. Die Dosis wird auf eine Referenzdosis normalisiert, um einen vergleichbaren "Konzentrations-Score" zu erhalten.
- **Output:** Eine aktualisierte Map von `Wirkstoffname -> aktiver Konzentrations-Score` für die aktuelle Woche.

### 2. Hormon- & Pharmakologisches Sub-Modell (HPS) - `src/engine/hps.ts`
- **Zweck:** Übersetzung der rohen Wirkstoffkonzentrationen in aggregierte physiologische Effekt-Scores.
- **Inputs:** PKE-Output (Konzentrations-Scores für die aktuelle Woche), Status ob PCT-Phase aktiv ist.
- **Prozess:** Multipliziert die Konzentration jedes Wirkstoffs mit seinen jeweiligen Ratings (anabol, androgen, Toxizitäten etc.) aus der Wissensdatenbank (`src/constants.ts`) und summiert die Effekte über alle aktiven Wirkstoffe.
- **Outputs:** Aggregierte Scores für die aktuelle Woche:
  - `totalAnabolic`, `totalAndrogenic`
  - `totalHepatoToxicity`, `totalCardioToxicity`, `totalNephroToxicity` (Nierenbelastung)
  - `totalHptaSuppression` (Unterdrückung der körpereigenen Hormonachse, wird durch PCT-Wirkstoffe antagonisiert)
  - `totalEstrogenReduction`, `totalBloodPressureReduction` (Effekte von Support-Wirkstoffen)
  - `metabolicAdjustmentFactor` (zur Anpassung der Stoffwechselrate basierend auf der anabolen Last)

### 3. Metabolismus- & Energetik-Sub-Modell (MES) - `src/engine/mes.ts`
- **Zweck:** Berechnung des Energiehaushalts des virtuellen Athleten.
- **Inputs:** Athletenprofil, Ernährungsplan, HPS-Output (`metabolicAdjustmentFactor`). **Das Profil wird jede Woche mit dem aktualisierten Gewicht/KFA übergeben.**
- **Prozess:** Berechnet den Grundumsatz (BMR) mit der Katch-McArdle-Formel (basierend auf der aktuellen Magermasse) und passt den Gesamtenergieverbrauch (TDEE) basierend auf dem aus dem Ziel abgeleiteten Aktivitätslevel und dem hormonellen Stoffwechsel-Faktor an.
- **Output:** `tdee` (Gesamtenergieverbrauch) und `calorieBalance` (Kalorienbilanz) für den Tag.

### 4. Anthropometrie- & Morphologie-Sub-Modell (AMS) - `src/engine/ams.ts`
- **Zweck:** Simulation der wöchentlichen Veränderung der Körperzusammensetzung.
- **Inputs:** MES-Output (`calorieBalance`), HPS-Output (`totalAnabolic`).
- **Prozess:** Nutzt den wöchentlichen Kalorienüberschuss/-defizit und teilt diesen basierend auf einem "P-Ratio" (Nährstoffpartitionierungsverhältnis) auf Muskel- und Fettgewebe auf. Das P-Ratio wird stark vom `totalAnabolic`-Score beeinflusst: Ein hoher Score lenkt mehr Kalorien in den Muskelaufbau (im Überschuss) oder schützt Muskelmasse (im Defizit).
- **Output:** Veränderung der Muskel- und Fettmasse in kg für die aktuelle Woche (`AmsWeeklyResult`).

### 5. Organ- & Gesundheits-Sub-Modell (OHS) - `src/engine/ohs.ts`
- **Zweck:** Simulation der Auswirkungen auf die Gesundheit, insbesondere auf Blutwerte. Dies ist ein **zustandsbasiertes** Modul, bei dem jede Woche auf der vorherigen aufbaut.
- **Inputs:**
  - Athletenprofil (insb. genetische Faktoren, Alter und optionales **Baseline-Blutbild** zur Kalibrierung).
  - HPS-Output (Toxizitäts- und Hormon-Scores der aktuellen Woche).
  - Blutwerte der Vorwoche.
- **Prozess:**
  1.  **Initialisierung:** Verwendet das vom Benutzer bereitgestellte Baseline-Blutbild oder gesunde Standardwerte als Zustand für Woche 0 (`getBaselineBloodMarkers`).
  2.  **Wöchentliche Veränderung:** Berechnet für jeden Blutmarker die *Veränderung* (Delta) für die aktuelle Woche basierend auf den HPS-Scores (`totalHepatoToxicity`, `totalNephroToxicity` etc.), genetischen Faktoren und dem Wert der Vorwoche.
  3.  **Lebermodell:** Simuliert die Leberenzymwerte (ALT, AST) mit einem Regenerationsfaktor. Bei geringer toxischer Last können sich die Werte wöchentlich erholen; bei hoher Last steigen sie an.
  4.  **Nierenmodell:** Simuliert die glomeruläre Filtrationsrate (eGFR) basierend auf der kumulativen Belastung durch nephrotoxische Substanzen (`totalNephroToxicity`) und erhöhtem Blutdruck.
  5.  **Genetische Faktoren:** Die Berechnungen werden direkt von den genetischen Faktoren beeinflusst (z.B. erhöht "Hohe Aromatase-Neigung" den prognostizierten Östrogenspiegel bei gleicher Androgenlast).
- **Outputs:**
  - Ein Array mit detaillierten wöchentlichen Blutwerten (`BloodMarker[]`).
  - Aggregierte Risikoscores für kardiovaskuläre, hepatische, renale und endokrine Systeme für die aktuelle Woche.

### 6. Synthese-Modul - `src/engine/synthesis.ts`
- **Zweck:** Übersetzung der quantitativen Simulationsdaten in qualitative, menschenlesbare und übersetzbare Texte.
- **Inputs:**
  - Der gesamte `AppState` (Benutzereingaben).
  - Die finalen Ergebnisse aus AMS (gesamte Physique-Projektion).
  - Die Ergebnisse aus OHS und HPS aus der Woche des **höchsten Risikos** (nicht zwangsläufig der letzten Woche), um die relevantesten Warnungen zu generieren. Dies ist ein entscheidender Logikpunkt für die Relevanz der Warnungen.
- **Outputs:** Eine `SynthesisResult`-Struktur mit:
  - `summary`: Eine prägnante, übersetzbare Zusammenfassung der Simulationsergebnisse.
  - `warnings`: Spezifische, priorisierte und übersetzbare Warnungen basierend auf den Spitzenrisiken.
  - `recommendations`: Gezielte, übersetzbare Empfehlungen zur Schadensminimierung.

### 7. Modell-Validator (`src/engine/validator.ts`)
- **Zweck:** Eine nachgeschaltete Kontrollinstanz zur Sicherstellung der Modellintegrität und -plausibilität.
- **Inputs:** Das finale `SimulationResult`-Objekt, nachdem die Synthese abgeschlossen ist.
- **Prozess:**
  1.  **Konsistenzprüfung:** Überprüft, ob alle Zeitreihen (z.B. `physiqueProjection`, `bloodMarkerHistory`) für jede Woche der Simulation einen Datenpunkt enthalten. Fehlende Datenpunkte deuten auf einen Fehler im Simulationsloop hin.
  2.  **Plausibilitätsprüfung:** Kontrolliert, ob die Ergebnisse physiologisch plausibel sind (z.B. unrealistisch hoher Muskelzuwachs, extrem niedriger Körperfettanteil).
  3.  **Datenintegritätsprüfung:** Stellt sicher, dass generierte IDs und Formate den Erwartungen entsprechen.
- **Outputs:** Ein `ValidationReport` mit Listen von Fehlern (blockierend), Warnungen (informativ) und Vorschlägen (für Entwickler), die in der UI als nicht-intrusive Benachrichtigungen angezeigt werden, um das Vertrauen in die Simulation zu stärken.

## III. KI-Erweiterungsschicht (Optional)
Zusätzlich zur deterministischen Kern-Engine gibt es eine optionale KI-Schicht, die über den `src/services/geminiService.ts` angesprochen wird.

### 1. KI-Tiefenanalyse
- **Zweck:** Bietet eine tiefere, nuanciertere Interpretation der Simulationsergebnisse, die über regelbasierte Logik hinausgeht.
- **Prozess:** Ein detaillierter Prompt, der die Simulationszusammenfassung enthält, wird an das Gemini-Modell gesendet. Die KI wird angewiesen, als Experte für Sportwissenschaft zu agieren und Aspekte wie Protokoll-Synergie, fortgeschrittene Risikobewertung und ganzheitliche Empfehlungen zu analysieren.
- **Output:** Ein formatierter Markdown-Text, der in der UI angezeigt wird.

### 2. KI-Protokoll-Optimierer (Suggestion Engine)
- **Zweck:** Dient als intelligenter Assistent zur Erstellung eines theoretischen Protokollvorschlags, der als Ausgangspunkt für den Benutzer dient.
- **Prozess:** Ein Prompt, der das Ziel und die Erfahrungsstufe des Benutzers enthält, wird an das Gemini-Modell gesendet. Die KI wird angewiesen, ein sicheres, gut begründetes und vollständiges Protokoll (inkl. Phasen, Support und PCT) in einem strikten JSON-Format zu generieren.
- **Output:** Ein `SuggestedProtocol`-Objekt. Der Service fügt diesem Objekt mit `nanoid` generierte, eindeutige IDs hinzu, bevor es an die Anwendung zurückgegeben wird, um die Eingabefelder automatisch auszufüllen.
