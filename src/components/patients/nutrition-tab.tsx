'use client';

import { FoodEntry, FoodItem } from '@/lib/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const mealLabels: Record<string, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle Yemeği',
  dinner: 'Akşam Yemeği',
  snack: 'Atıştırmalık',
};

export function NutritionTab({ entries }: { entries: FoodEntry[] }) {
  const dailyTotals: Record<string, number> = {};
  const byDate: Record<string, FoodEntry[]> = {};

  entries.forEach((e) => {
    dailyTotals[e.date] = (dailyTotals[e.date] || 0) + (e.calories ?? 0);
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const chartData = Object.entries(dailyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, calories]) => ({
      date: format(new Date(date), 'dd MMM'),
      calories,
    }));

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="calories" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Kalori" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Beslenme verisi bulunamadı</p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sortedDates.map((date) => (
          <DaySection key={date} date={date} entries={byDate[date]} totalCalories={dailyTotals[date]} />
        ))}
        {sortedDates.length === 0 && (
          <p className="text-gray-500 text-center py-8">Yemek kaydı yok</p>
        )}
      </div>
    </div>
  );
}

function DaySection({ date, entries, totalCalories }: { date: string; entries: FoodEntry[]; totalCalories: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="font-medium text-gray-900">{format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: tr })}</span>
        </div>
        <Badge variant="warning">{totalCalories} kal</Badge>
      </button>
      {expanded && (
        <CardContent className="pt-0 border-t border-gray-100">
          <div className="space-y-4 pt-4">
            {entries.map((entry) => (
              <div key={entry.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">{mealLabels[entry.meal_type] ?? entry.meal_type}</span>
                  {entry.calories && <span className="text-xs text-gray-500">{entry.calories} kal</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(entry.items as FoodItem[]).map((item, i) => (
                    <Badge key={i} variant="default">
                      {item.quantity} {item.food}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
