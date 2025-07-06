# Security Policy

## Supported Versions

The security policy applies to the latest version of the BioSynthonos application.

| Version | Supported          |
| ------- | ------------------ |
| 8.x.x   | :white_check_mark: |
| < 8.0   | :x:                |

## Reporting a Vulnerability

We take the security of our application seriously. If you discover a security vulnerability, please help us by reporting it responsibly.

To report a vulnerability, please open an issue on our GitHub repository with a clear description of the issue, the steps to reproduce it, and the potential impact.

We will acknowledge your report within 48 hours and will work to address the vulnerability as quickly as possible.

## API Key Security

The BioSynthonos application requires a Google Gemini API key to enable its AI-powered features. The security of this key is paramount.

**Our Policy:**
- **Never Hardcode API Keys:** The API key must **never** be hardcoded directly into the source code (`.ts`, `.tsx`, `.js` files).
- **Environment Variables Only:** The API key should only be managed through environment variables.
  - For local development, use a `.env.local` file (which is included in `.gitignore` by default). The key should be prefixed with `VITE_` (e.g., `VITE_GEMINI_API_KEY=your_key_here`).
  - For production deployment (e.g., on Netlify, Vercel), the key must be set as a secure environment variable in the platform's dashboard.

This approach ensures that the API key is not exposed in the client-side code bundle or in the public version control history.

## Content and Usage

- **Age Gate:** The application implements an age gate to ensure the content is accessed only by an appropriate, adult audience. This is a youth protection measure.
- **Disclaimer:** The application includes a prominent disclaimer clarifying that it is an educational tool and not medical advice. Users are responsible for their own actions and should always consult a healthcare professional.
