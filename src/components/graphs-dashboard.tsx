'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CountEntry, TimeseriesPoint } from '@/lib/stats/aggregate';

const INK = '#231608';
const BLOOD = '#8a2318';
const OCHRE = '#b8832a';
const MOSS = '#3d4a1f';
const LEATHER = '#5a2a17';
const WALNUT = '#6b4423';
const CHESTNUT = '#8a5a2b';
const PALETTE = [LEATHER, OCHRE, WALNUT, BLOOD, CHESTNUT, MOSS, INK];

interface Props {
  data: {
    booksPerMonth: CountEntry[];
    categories: CountEntry[];
    languages: CountEntry[];
    cumulativePages: TimeseriesPoint[];
    meanPagesPerDay: number;
    totalBooks: number;
    totalPages: number;
  };
}

const tooltipStyle = {
  backgroundColor: '#ecdfbe',
  border: '3px solid #231608',
  borderRadius: 0,
  fontFamily: 'var(--font-jetbrains)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  padding: '6px 10px',
};

export function GraphsDashboard({ data }: Props) {
  if (data.totalBooks === 0) {
    return (
      <div className="ledger border-[3px] border-ink p-12 text-center">
        <p className="font-serif text-3xl font-black">No record yet.</p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-mute">
          Catalogue volumes on the ledger page to populate these metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <Kpi label="Volumes" value={data.totalBooks} accent={INK} />
        <Kpi label="Pages turned" value={data.totalPages.toLocaleString()} accent={BLOOD} />
        <Kpi label="Mean pp / day" value={data.meanPagesPerDay} accent={MOSS} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-2">
        <Panel title="Volumes by month" kicker="Fig. 1" accent={INK}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.booksPerMonth.map((e) => ({ name: e.label, value: e.value }))}
            >
              <CartesianGrid strokeDasharray="2 4" stroke="#231608" strokeOpacity={0.18} />
              <XAxis dataKey="name" fontSize={10} stroke={INK} tickLine={false} />
              <YAxis allowDecimals={false} fontSize={10} stroke={INK} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#23160810' }} />
              <Bar dataKey="value" fill={LEATHER} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Cumulative pages" kicker="Fig. 2" accent={BLOOD}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.cumulativePages}>
              <CartesianGrid strokeDasharray="2 4" stroke="#231608" strokeOpacity={0.18} />
              <XAxis dataKey="date" fontSize={10} stroke={INK} tickLine={false} />
              <YAxis fontSize={10} stroke={INK} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="stepAfter"
                dataKey="pages"
                stroke={BLOOD}
                strokeWidth={3}
                dot={{ fill: INK, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Shelves" kicker="Fig. 3" accent={OCHRE}>
          <DistributionPie entries={data.categories} />
        </Panel>

        <Panel title="Tongues" kicker="Fig. 4" accent={MOSS}>
          <DistributionPie entries={data.languages} />
        </Panel>
      </div>
    </div>
  );
}

function DistributionPie({ entries }: { entries: CountEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={entries.map((e) => ({ name: e.label, value: e.value }))}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          stroke={INK}
          strokeWidth={3}
          label={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10 }}
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

function Panel({
  title,
  kicker,
  accent,
  children,
}: {
  title: string;
  kicker: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-[3px] border-ink bg-paper-soft brutal-shadow-sm">
      <div
        className="flex items-center justify-between border-b-[3px] border-ink px-5 py-3 bg-paper"
        style={{ boxShadow: `inset 0 -6px 0 ${accent}22` }}
      >
        <h3 className="font-serif text-xl font-black leading-none tracking-tight">{title}</h3>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ color: accent }}
        >
          {kicker}
        </span>
      </div>
      <div className="ledger p-5">{children}</div>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="relative border-[3px] border-ink bg-paper-soft brutal-shadow">
      <div className="border-b-[3px] border-ink bg-paper px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-mute">
          {label}
        </p>
      </div>
      <div className="flex items-end justify-between gap-4 px-6 py-7">
        <p
          className="font-serif text-6xl font-black leading-none tracking-tight"
          style={{ color: accent }}
        >
          {value}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute shrink-0">
          counted
        </span>
      </div>
    </div>
  );
}
