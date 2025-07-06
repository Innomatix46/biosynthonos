

/**
 * @file A component to display and manage the user's imported lab report history.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LabReport } from '../shared/types';
import { History, FileText } from 'lucide-react';
import { CollapsibleSection } from './ui/CollapsibleSection';

interface LabReportHistoryProps {
  reports: LabReport[];
  onLoadReport: (report: LabReport) => void;
}

export const LabReportHistory: React.FC<LabReportHistoryProps> = ({ reports, onLoadReport }) => {
  const { t } = useTranslation();

  return (
    <CollapsibleSection title={t('lab_history.title')} icon={<History size={20} />}>
      <div className="pt-2">
        {reports.length === 0 ? (
          <p className="text-sm text-gray-500">{t('lab_history.no_reports')}</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {reports.map(report => (
              <li key={report.id}>
                <button
                  onClick={() => onLoadReport(report)}
                  className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-300 flex items-center gap-2"><FileText size={14}/> {report.fileName}</span>
                    <span className="text-xs text-gray-400">{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleSection>
  );
};