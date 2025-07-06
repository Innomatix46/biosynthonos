/**
 * @file A reusable UI component for displaying a single health risk score as a gauge.
 */
import React from 'react';

interface RiskGaugeProps {
  name: string;
  score: number;
  icon: React.ReactNode;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ name, score, icon }) => {
    const getScoreColor = () => {
        if (score > 75) return 'bg-brand-pink';
        if (score > 50) return 'bg-brand-yellow';
        if (score > 25) return 'bg-sky-500';
        return 'bg-brand-green';
    };

    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1.5 text-gray-300">{icon} {name}</div>
                <span className={`font-bold ${getScoreColor().replace('bg-', 'text-')}`}>{score}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                    className={`${getScoreColor()} h-2.5 rounded-full transition-all duration-500`} 
                    style={{ width: `${score}%` }}
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                    aria-label={`${name} risk score`}
                ></div>
            </div>
        </div>
    );
};