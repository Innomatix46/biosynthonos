
/**
 * @file This is the root component of the BioSynthonos application.
 * It handles the primary application layout, age verification, and global providers.
 */
import React from 'react';
import { Header } from './components/Header';
import { Disclaimer } from './components/Disclaimer';
import { AgeGate } from './components/AgeGate';
import { SimulatorPage } from './pages/SimulatorPage';
import { ToastProvider } from './hooks/useToast';

const App: React.FC = () => {
  // State for age verification gate
  const [isAgeVerified, setIsAgeVerified] = React.useState(() => {
    // Check localStorage synchronously on init to prevent flash of age gate
    return typeof window !== 'undefined' && localStorage.getItem('isAgeVerified') === 'true';
  });

  /**
   * Handles the age verification confirmation.
   * Sets the state and stores the confirmation in localStorage.
   */
  const handleAgeVerification = () => {
    localStorage.setItem('isAgeVerified', 'true');
    setIsAgeVerified(true);
  };

  // If the user is not verified, show the age gate.
  if (!isAgeVerified) {
    return <AgeGate onConfirm={handleAgeVerification} />;
  }

  // Once verified, render the main application structure.
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand-dark to-black text-gray-200 font-sans">
        <Header />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          <SimulatorPage />
          <Disclaimer />
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;