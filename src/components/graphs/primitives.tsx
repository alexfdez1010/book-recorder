'use client';

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { CountEntry } from '@/lib/stats/aggregate';
import { useChartMotion } from './use-chart-motion';

export const INK = 'var(--ink)';
export const OXBLOOD = 'var(--oxblood)';
export const BRASS = 'var(--brass)';
export const MOSS = 'var(--moss)';
export const LEATHER = 'var(--leather)';
export const WALNUT = 'var(--walnut)';
export const CHESTNUT = 'var(--chestnut)';
export const PAPER_SOFT = 'var(--paper-soft)';

export const PALETTE = [LEATHER, BRASS, WALNUT, OXBLOOD, CHESTNUT, MOSS, INK];

export const tooltipStyle = {
  backgroundColor: 'var(--bone)',
  border: '1px solid var(--paper-edge)',
  borderRadius: 10,
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  color: INK,
  padding: '10px 14px',
};

/** Frames one historical chart with a descriptive heading and responsive body. */
export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lib-panel">
      <div className="lib-panel__head">
        <h3 className="lib-panel__title">{title}</h3>
      </div>
      <div className="lib-panel__body">{children}</div>
    </div>
  );
}

/** Displays a lifetime metric; optional notes explain textual or numeric values. */
export function Kpi({
  label,
  value,
  note = '',
  compact = false,
}: {
  label: string;
  value: number | string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className="lib-plate">
      <div className="lib-plate__head">
        <p className="lib-plate__label">{label}</p>
      </div>
      <div className="lib-plate__body">
        <p
          className={`lib-plate__value${compact ? ' lib-plate__value--compact' : ''}`}
        >
          {value}
        </p>
        <span className="lib-plate__note">{note}</span>
      </div>
    </div>
  );
}

/** Renders a compact distribution; tooltips and legend identify each segment. */
export function DistributionPie({ entries }: { entries: CountEntry[] }) {
  const animate = useChartMotion();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={entries.map((e) => ({ name: e.label, value: e.value }))}
          dataKey="value"
          nameKey="name"
          outerRadius={78}
          innerRadius={52}
          paddingAngle={2}
          stroke="var(--bone)"
          strokeWidth={3}
          animationDuration={450}
          isAnimationActive={animate}
        >
          {entries.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
