# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.0.0] - 2024-08-18

### Added
- **Model Validator Module (`engine/validator.ts`):** Implemented a dedicated module to validate simulation results for data integrity, consistency, and physiological plausibility, as per the technical proposal.
- **Automated Tests for Validator:** Created a `jest` test suite (`engine/__tests__/validator.test.ts`) to ensure the validator functions correctly and to prevent future regressions.
- **Toast Notification System:** Added a non-intrusive, global toast notification system (`hooks/useToast.tsx`) to provide users with feedback (e.g., validation warnings, success messages) without disrupting the UI.
- **PDF Report Export:** Users can now export a full, multi-page PDF report of any simulation result directly from the result card. This uses `jspdf` and `html-to-image`.
- **Chart Sharing Functionality:** Added share buttons to all charts, allowing users to download them as PNGs or share them using the Web Share API.
- **UI Sub-components:** Created several new reusable UI components (`CollapsibleSection.tsx`, `RiskGauge.tsx`, etc.) to improve code organization and consistency.
- **New Core Documentation:** Created `VALIDATION.md` and `SECURITY.md` to improve project transparency and formalize policies.

### Changed
- **Major Architectural Refactoring:** The main `App.tsx` component was refactored into a lean application shell. All simulation-related state and logic were moved to a new `pages/SimulatorPage.tsx` component, significantly improving separation of concerns and maintainability.
- **Modular Result Card:** The monolithic `SimulationResultCard.tsx` was broken down into smaller, more manageable sub-components (`PhysiqueChart.tsx`, `BloodMarkerChart.tsx`, `FullBloodPanel.tsx`), making the code easier to read and maintain.
- **Improved ID Generation:** Replaced all instances of `Date.now()` for key generation with `nanoid` for more robust and unique IDs in dynamic forms and simulation results.
- **Validator Integration:** The `SimulatorPage` now calls the model validator after each simulation and displays any warnings or errors as toast notifications.
- **Project Documentation:** Updated `THESIS.md`, `CONCEPT_DETERMINISTIC_ENGINE.md`, and `DEPLOYMENT_GUIDE.md` to reflect the new validation layer and testing procedures.

### Fixed
- **JavaScript Compatibility:** Replaced `Array.prototype.at()` in the validator logic with standard bracket notation (`arr[arr.length - 1]`) to ensure broader browser and environment compatibility.
- **Dynamic MES Simulation:** The metabolic simulation (`MES`) now recalculates TDEE each week based on the athlete's updated weight and body fat percentage, making it truly dynamic.

---

## [7.0.0] - 2024-08-17

### Added
- **Youth Protection (Age Gate):** Implemented a mandatory age verification screen (`AgeGate.tsx`) for first-time users. The user's confirmation is stored in `localStorage` to prevent repeated checks.
- **New Core Documentation:** Created `PROJECT_GOALS.md` to define the project's objectives and `DEPLOYMENT_GUIDE.md` to provide comprehensive instructions for setup and deployment.

### Changed
- **Comprehensive Documentation Update:** Overhauled key project documents. `THESIS.md` and `CONCEPT_DETERMINISTIC_ENGINE.md` were updated to reflect the current state of the simulation engine, its AI integration, and its implementation in the "BioSynthonos" software.
- **Improved Code Commenting:** Conducted a full-code review to enhance and standardize all comments in `.ts` and `.tsx` files to be in English, improving clarity and maintainability.
- **Application Flow:** Modified `App.tsx` to conditionally render the `AgeGate` component based on the verification status in `localStorage`.

### Security
- **Content Access Control:** The new age gate serves as a crucial mechanism to ensure the application's content is accessed only by an appropriate, adult audience, reinforcing its intended use for educational and scientific purposes.
