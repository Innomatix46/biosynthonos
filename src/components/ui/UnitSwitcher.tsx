

/**
 * @file A reusable UI component for toggling between two units.
 */
import React from 'react';

export type Unit = 'ng/dL' | 'nmol/L' | 'mg/dL' | 'mmol/L';

interface UnitSwitcherProps {
  currentUnit: Unit;
  options: [Unit, Unit];
  onChange: (newUnit: Unit) => void;
}

export const UnitSwitcher: React.FC<UnitSwitcherProps> = ({ currentUnit, options, onChange }) => {
  return (
    <div className="flex items-center bg-gray-900 rounded-md p-0.5 text-xs">
      <button
        onClick={() => onChange(options[0])}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${currentUnit === options[0] ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        aria-pressed={currentUnit === options[0]}
      >
        {options[0]}
      </button>
      <button
        onClick={() => onChange(options[1])}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${currentUnit === options[1] ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        aria-pressed={currentUnit === options[1]}
      >
        {options[1]}
      </button>
    </div>
  );
};