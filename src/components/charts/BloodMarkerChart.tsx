/**
 * @file A reusable chart component for displaying key blood marker progression.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProtocolPhase, BloodMarkerWeeklyHistory } from '../../shared/types';
import { ShareButtons } from '../ui/ShareButtons';

const ChartWithPhases: React.FC<{
  data: any[];
  cyclePhases: ProtocolPhase[];
  pctDuration: number;
  children: React.ReactNode;
}> = ({ data, cyclePhases, pctDuration, children }) => {
  const { t } = useTranslation();
  let cumulativeDuration = 0;
  
  const phaseLines = cyclePhases.slice(0, -1).map(phase => {
      cumulativeDuration += phase.durationWeeks;
      return <ReferenceLine key={`phase-${cumulativeDuration}`} x={cumulativeDuration} stroke="#4A5568" strokeDasharray="2 2" />;
  });
  
  const cycleDuration = cyclePhases.reduce((sum, p) => sum + p.durationWeeks, 0);
  
  const pctLine = pctDuration > 0 ? (
      <ReferenceLine x={cycleDuration} stroke="#FFD166" strokeDasharray="3 3" label={{ value: t('results.pct_starts'), position: 'insideTopRight', fill: '#FFD166', fontSize: 12, dy: -5 }} />
  ) : null;

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        {children}
        {phaseLines}
        {pctLine}
      </LineChart>
    </ResponsiveContainer>
  );
}


interface BloodMarkerChartProps {
    history: BloodMarkerWeeklyHistory[];
    phases: ProtocolPhase[];
    pctDuration: number;
}

export const BloodMarkerChart: React.FC<BloodMarkerChartProps> = ({ history, phases, pctDuration }) => {
    const { t } = useTranslation();
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    const chartData = history.map(weeklyData => {
        const dataPoint: {[key: string]: number | string} = { week: weeklyData.week };
        weeklyData.markers.forEach(m => {
            const key = m.marker.replace(/[\s/]+/g, ''); // Sanitize key: 'Total Testosterone' -> 'TotalTestosterone'
            dataPoint[key] = parseFloat(m.value);
        });
        return dataPoint;
    });

    return (
        <div ref={chartContainerRef} className="relative bg-gray-900/40 p-4 rounded-lg border border-gray-700">
            <ShareButtons 
                chartRef={chartContainerRef}
                title={t('results.blood_chart_title')}
                filename="blood-marker-progression.png"
            />
            <div className="h-80 w-full">
                <ChartWithPhases data={chartData} cyclePhases={phases} pctDuration={pctDuration}>
                    <XAxis dataKey="week" tickFormatter={(tick) => `W${tick}`} stroke="#A0AEC0" />
                    <YAxis yAxisId="left" stroke="#A0AEC0" domain={[0, 'dataMax + 200']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#A0AEC0" domain={[0, 'dataMax + 20']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="TotalTestosterone" name={t('bloodMarkers.totalTestosterone_short')} stroke="#06D6A0" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="HDL-C" name={t('bloodMarkers.hdl_short')} stroke="#FFD166" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="ALT" name={t('bloodMarkers.alt_short')} stroke="#EF476F" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="eGFR" name={t('bloodMarkers.egfr_short')} stroke="#00B4D8" strokeWidth={2} dot={false} />
                </ChartWithPhases>
            </div>
        </div>
    );
};