/**
 * @file A reusable UI component for creating a collapsible content section.
 */
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
                aria-expanded={isOpen}
                aria-controls={`collapsible-content-${title.replace(/\s+/g, '-')}`}
            >
                <h3 className="text-md font-semibold flex items-center gap-2">{icon} {title}</h3>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && (
                <div id={`collapsible-content-${title.replace(/\s+/g, '-')}`} className="p-4 pt-2 border-t border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};