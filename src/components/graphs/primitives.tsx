'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CountEntry } from '@/lib/stats/aggregate';

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
  backgroundColor: PAPER_SOFT,
  border: '1px solid var(--ink)',
  borderRadius: 0,
  fontFamily: 'var(--font-jetbrains)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  padding: '6px 10px',
};

export function Panel({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lib-panel">
      <div className="lib-panel__head">
        <h3 className="lib-panel__title">{title}</h3>
        <span className="lib-panel__eyebrow">{kicker}</span>
      </div>
      <div className="lib-panel__body">{children}</div>
    </div>
  );
}

export function Kpi({
  label,
  value,
  note = 'counted',
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
        <p className={`lib-plate__value${compact ? ' lib-plate__value--compact' : ''}`}>
          {value}
        </p>
        <span className="lib-plate__note">{note}</span>
      </div>
    </div>
  );
}

export function DistributionPie({ entries }: { entries: CountEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={entries.map((e) => ({ name: e.label, value: e.value }))}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          stroke={INK}
          strokeWidth={2}
          label={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, fill: INK }}
        >
          {entries.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
