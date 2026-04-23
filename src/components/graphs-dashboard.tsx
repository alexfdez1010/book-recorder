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

/* All colors resolve to CSS custom properties declared in globals.css.
   Reskinning the palette only requires editing that file — charts included. */
const INK = 'var(--ink)';
const OXBLOOD = 'var(--oxblood)';
const BRASS = 'var(--brass)';
const MOSS = 'var(--moss)';
const LEATHER = 'var(--leather)';
const WALNUT = 'var(--walnut)';
const CHESTNUT = 'var(--chestnut)';
const PAPER_SOFT = 'var(--paper-soft)';

const PALETTE = [LEATHER, BRASS, WALNUT, OXBLOOD, CHESTNUT, MOSS, INK];

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
  backgroundColor: PAPER_SOFT,
  border: '1px solid var(--ink)',
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
      <div className="lib-empty">
        <p className="lib-empty__title">No record yet.</p>
        <p className="lib-meta mt-3">
          Catalogue volumes on the ledger page to populate these metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Kpi label="Volumes" value={data.totalBooks} />
        <Kpi label="Pages turned" value={data.totalPages.toLocaleString()} />
        <Kpi label="Mean pp / day" value={data.meanPagesPerDay} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-2">
        <Panel title="Volumes by month" kicker="Fig. 1">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.booksPerMonth.map((e) => ({ name: e.label, value: e.value }))}
            >
              <CartesianGrid strokeDasharray="2 4" stroke={INK} strokeOpacity={0.2} />
              <XAxis dataKey="name" fontSize={10} stroke={INK} tickLine={false} />
              <YAxis allowDecimals={false} fontSize={10} stroke={INK} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--ink)', fillOpacity: 0.06 }} />
              <Bar dataKey="value" fill={LEATHER} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Cumulative pages" kicker="Fig. 2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.cumulativePages}>
              <CartesianGrid strokeDasharray="2 4" stroke={INK} strokeOpacity={0.2} />
              <XAxis dataKey="date" fontSize={10} stroke={INK} tickLine={false} />
              <YAxis fontSize={10} stroke={INK} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="stepAfter"
                dataKey="pages"
                stroke={OXBLOOD}
                strokeWidth={2.5}
                dot={{ fill: INK, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Shelves" kicker="Fig. 3">
          <DistributionPie entries={data.categories} />
        </Panel>

        <Panel title="Tongues" kicker="Fig. 4">
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

function Panel({
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

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="lib-plate">
      <div className="lib-plate__head">
        <p className="lib-plate__label">{label}</p>
      </div>
      <div className="lib-plate__body">
        <p className="lib-plate__value">{value}</p>
        <span className="lib-plate__note">counted</span>
      </div>
    </div>
  );
}
