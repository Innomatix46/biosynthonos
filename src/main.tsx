/**
 * @file This is the main entry point for the React application.
 * It uses the React 18 createRoot API to render the root App component into the DOM.
 * It also initializes the i18next internationalization library.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18next
import './index.css'; // Import Tailwind CSS

// Find the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the DOM element.
const root = ReactDOM.createRoot(rootElement);

// Render the main App component within React's StrictMode.
// StrictMode helps with highlighting potential problems in an application.
// Suspense is used to handle the async loading of translation files.
root.render(
  <React.StrictMode>
    <React.Suspense fallback="Loading...">
      <App />
    </React.Suspense>
  </React.StrictMode>
);
