'use client';

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#f59e0b',
  critical: '#ef4444',
  discharged: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Pasif',
  critical: 'Kritik',
  discharged: 'Taburcu',
};

interface StatusData {
  name: string;
  value: number;
}

export function PatientStatusChart({ data }: { data: StatusData[] }) {
  const localizedData = data.map((d) => ({ ...d, label: STATUS_LABELS[d.name] || d.name }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={localizedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          nameKey="label"
        >
          {localizedData.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface CompletionData {
  date: string;
  completed: number;
}

export function SurveyCompletionChart({ data }: { data: CompletionData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Tamamlanan" />
      </LineChart>
    </ResponsiveContainer>
  );
}
