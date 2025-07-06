# BioSynthonos: Virtual Athlete Simulator

[![Version](https://img.shields.io/badge/version-8.0.0-blue.svg)](package.json)

**BioSynthonos** is a state-of-the-art, predictive simulation model designed to forecast the complex physiological, metabolic, and hormonal changes of a "virtual athlete." Based on detailed nutrition and pharmacology protocols, it serves as an advanced educational and research tool to explore the optimization of physique and health goals.

The application is engineered as a secure, performant, and fully client-side Single-Page Application (SPA) using React, Vite, and TypeScript.

---

## Core Features

- **Dynamic Time-Series Simulation:** Instead of just static results, the engine simulates week-by-week impacts, capturing cumulative effects, adaptations, and recovery.
- **Modular Sub-Systems:** A highly modular engine models pharmacokinetics (PKE), hormonal effects (HPS), metabolism (MES), body composition (AMS), and organ health (OHS).
- **Detailed Personalization:** Users can calibrate the simulation by inputting biometrics, genetic factors, and optional baseline blood work.
- **Integrated Model Validator:** Every simulation result is automatically checked for consistency and physiological plausibility, ensuring data reliability.
- **AI-Powered Deep-Dive:** Optional integration with the Google Gemini API to generate nuanced, qualitative analyses of simulation outcomes.
- **Intelligent Protocol Suggestions:** An AI feature to generate theoretically sound protocol examples based on user goals and experience.
- **Advanced Visualization & Export:** Interactive charts for physique and blood marker progression, which can be shared as PNGs or exported as part of a full PDF report.
- **Full Internationalization (i18n):** The entire user interface is available in multiple languages (English/German).

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **i18n:** i18next
- **Visualization:** Recharts
- **Export:** jspdf, html-to-image
- **Testing:** Jest, ts-jest

## Local Setup & Execution

**Prerequisites:**
- Node.js (v18.x or higher)
- npm or yarn

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd biosynthonos
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env.local` file in the project root and add your Gemini API key. This is required for the optional AI features.
    ```
    # .env.local
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Note: The `.env.local` is in the `.gitignore` and should never be versioned.*

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The application will now be available at `http://localhost:5173` (or another port).

5.  **Run Tests:**
    To ensure the integrity of the core engine, run the test suite:
    ```bash
    npm test
    ```

## Build for Production

To create an optimized version of the application, run:
```bash
npm run build
```
This command will create a `dist` directory with all the static assets ready for deployment. See the `DEPLOYMENT_GUIDE.md` for detailed instructions.
