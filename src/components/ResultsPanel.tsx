/**
 * @file This component is the main display area for simulation results.
 * It handles conditional rendering for the initial empty state and the
 * final grid of result cards.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimulationResult } from '../shared/types';
import { Bot } from 'lucide-react';
import { SimulationResultCard } from './SimulationResultCard';

interface ResultsPanelProps {
  results: SimulationResult[];
  onGetAiAnalysis: (resultId: string) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onGetAiAnalysis }) => {
  const { t } = useTranslation();
  /**
   * Renders the content of the panel based on the current state.
   */
  const renderContent = () => {
    // Show the initial welcome message if no simulations have been run yet.
    if (results.length === 0) {
       return (
        <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 space-y-4 p-8">
          <Bot className="w-20 h-20 mx-auto text-gray-600 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-400">{t('results.welcome_title')}</h2>
          <p className="max-w-md">{t('results.welcome_subtitle')}</p>
        </div>
      );
    }

    // If there are results, render them in a responsive grid for comparison.
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                 {/* Map over the results array and render a card for each simulation */}
                 {results.map((result) => (
                    <SimulationResultCard 
                        key={result.id} 
                        result={result}
                        onGetAiAnalysis={onGetAiAnalysis} 
                    />
                ))}
            </div>
        </div>
    );
  };


  return (
    <div className="bg-brand-dark/30 p-2 md:p-6 rounded-xl min-h-[600px]">
      {renderContent()}
    </div>
  );
};
