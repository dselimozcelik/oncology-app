'use client';

import { SleepRecord } from '@/lib/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const qualityLabel: Record<string, string> = {
  poor: 'Kötü',
  fair: 'Orta',
  good: 'İyi',
  excellent: 'Mükemmel',
};

const qualityVariant: Record<string, 'danger' | 'warning' | 'success' | 'info'> = {
  poor: 'danger',
  fair: 'warning',
  good: 'success',
  excellent: 'info',
};

export function SleepTab({ records }: { records: SleepRecord[] }) {
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: format(new Date(r.date), 'dd MMM'),
      hours: Number(r.hours),
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 12]} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Saat" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Uyku verisi bulunamadı</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Tarih</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>Kalite</TableHead>
              <TableHead>Notlar</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{format(new Date(r.date), 'dd.MM.yyyy')}</TableCell>
                <TableCell className="font-medium">{Number(r.hours).toFixed(1)}s</TableCell>
                <TableCell>
                  <Badge variant={qualityVariant[r.quality] ?? 'default'}>{qualityLabel[r.quality] ?? r.quality}</Badge>
                </TableCell>
                <TableCell className="text-gray-500">{r.notes ?? '—'}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  Uyku kaydı yok
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
