/**
 * @file A reusable component for displaying the full, detailed blood panel table.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BloodMarkerWeeklyHistory, BloodMarker } from '../../shared/types';

interface FullBloodPanelProps {
    history: BloodMarkerWeeklyHistory[];
}

export const FullBloodPanel: React.FC<FullBloodPanelProps> = ({ history }) => {
    const { t } = useTranslation();
    if (!history || history.length === 0) return null;
    
    const start = history[0].markers;
    const end = history[history.length - 1].markers;

    // Calculate peak or trough for each marker
    const peak = start.map(startMarker => {
        let peakValue = parseFloat(startMarker.value);
        let peakStatus = startMarker.status;
        const isLowerBetter = ['LDL-C', 'Glucose', 'ALT', 'AST'].includes(startMarker.marker);

        for (const weekly of history) {
            const currentMarker = weekly.markers.find(m => m.marker === startMarker.marker);
            if (currentMarker) {
                const currentValue = parseFloat(currentMarker.value);
                if ((!isLowerBetter && currentValue > peakValue) || (isLowerBetter && currentValue < peakValue)) {
                    peakValue = currentValue;
                    peakStatus = currentMarker.status;
                }
            }
        }
        return { marker: startMarker.marker, value: String(peakValue.toFixed(1)), status: peakStatus };
    });

    const getStatusColor = (status: BloodMarker['status']) => {
        switch(status) {
            case 'critical': return 'text-red-400 font-bold';
            case 'elevated':
            case 'low': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    }

    return (
        <div className="overflow-x-auto pt-4">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="px-4 py-2">{t('results.blood_panel.marker')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.start')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.peak')}</th>
                        <th className="px-4 py-2 text-center">{t('results.blood_panel.end')}</th>
                    </tr>
                </thead>
                <tbody>
                    {start.map((marker, i) => (
                        <tr key={marker.marker} className="border-b border-gray-700 hover:bg-gray-700/30">
                            <td className="px-4 py-2 font-medium">{t(`bloodMarkers.${marker.marker.replace(/[\s/]+/g, '')}`) || marker.marker}</td>
                            <td className={`px-4 py-2 text-center ${getStatusColor(marker.status)}`}>{marker.value}</td>
                            <td className={`px-4 py-2 text-center ${getStatusColor(peak[i].status)}`}>{peak[i].value}</td>
                            <td className={`px-4 py-2 text-center ${getStatusColor(end[i].status)}`}>{end[i].value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};