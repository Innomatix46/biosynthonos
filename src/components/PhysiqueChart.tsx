/**
 * @file A reusable chart component for displaying physique projection over time.
 * It includes logic for rendering reference lines for different protocol phases and sharing functionality.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProtocolPhase, PhysiqueDataPoint } from '../shared/types';
import { ShareButtons } from './ui/ShareButtons';

/**
 * A helper component to render reference lines on a chart based on cycle phases.
 * Not exported as it's only used within PhysiqueChart.
 */
const ChartWithPhases: React.FC<{
  data: any[];
  cyclePhases: ProtocolPhase[];
  pctDuration: number;
  children: React.ReactNode;
}> = ({ data, cyclePhases, pctDuration, children }) => {
  const { t } = useTranslation();
  let cumulativeDuration = 0;
  
  // Create reference lines for the end of each major cycle phase.
  const phaseLines = cyclePhases.slice(0, -1).map(phase => {
      cumulativeDuration += phase.durationWeeks;
      return <ReferenceLine key={`phase-${cumulativeDuration}`} x={cumulativeDuration} stroke="#4A5568" strokeDasharray="2 2" />;
  });
  
  const cycleDuration = cyclePhases.reduce((sum, p) => sum + p.durationWeeks, 0);
  
  // Create a distinct reference line for the start of the PCT phase.
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

interface PhysiqueChartProps {
    data: PhysiqueDataPoint[];
    phases: ProtocolPhase[];
    pctDuration: number;
}

export const PhysiqueChart: React.FC<PhysiqueChartProps> = ({ data, phases, pctDuration }) => {
    const { t } = useTranslation();
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    return (
        <div ref={chartContainerRef} className="relative bg-gray-900/40 p-4 rounded-lg border border-gray-700">
            <ShareButtons 
                chartRef={chartContainerRef}
                title={t('results.physique_title')}
                filename="physique-projection.png"
            />
            <div className="h-72 w-full">
                <ChartWithPhases data={data} cyclePhases={phases} pctDuration={pctDuration}>
                    <XAxis dataKey="week" tickFormatter={(tick) => `W${tick}`} stroke="#A0AEC0" />
                    <YAxis yAxisId="left" stroke="#A0AEC0" unit=" kg" domain={['dataMin - 2', 'dataMax + 2']} tickCount={6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="muscleMassKg" name={t('results.physique.muscle')} stroke="#06D6A0" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="fatMassKg" name={t('results.physique.fat')} stroke="#FFD166" strokeWidth={2} dot={false} />
                </ChartWithPhases>
            </div>
        </div>
    );
};