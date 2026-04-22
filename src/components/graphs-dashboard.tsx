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

const PALETTE = ['#0f172a', '#1d4ed8', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2'];

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

export function GraphsDashboard({ data }: Props) {
  if (data.totalBooks === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
        No data yet. Add books to see graphs.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Total books" value={data.totalBooks} />
        <Kpi label="Total pages" value={data.totalPages} />
        <Kpi label="Mean pages / day" value={data.meanPagesPerDay} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Books finished per month">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.booksPerMonth.map((e) => ({ name: e.label, value: e.value }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cumulative pages read">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.cumulativePages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="pages" stroke="#1d4ed8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Categories">
          <DistributionPie entries={data.categories} />
        </Card>

        <Card title="Languages">
          <DistributionPie entries={data.languages} />
        </Card>
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
          label
        >
          {entries.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-neutral-700">{title}</h3>
      {children}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
