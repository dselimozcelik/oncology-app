import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { PatientStatusChart, SurveyCompletionChart } from '@/components/dashboard/charts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, ClipboardList, CheckCircle, Moon } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalPatients },
    { data: assignments },
    { data: sleepRecords },
    { data: patients },
    { data: recentAssignments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('survey_assignments').select('status, completed_at'),
    supabase.from('sleep_records').select('hours').gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd')),
    supabase.from('profiles').select('status').eq('role', 'patient'),
    supabase.from('survey_assignments').select('*, patient:profiles(full_name), survey:surveys(title)').order('assigned_at', { ascending: false }).limit(5),
  ]);

  const pendingSurveys = assignments?.filter((a) => a.status === 'pending').length ?? 0;
  const completedSurveys = assignments?.filter((a) => a.status === 'completed').length ?? 0;
  const totalAssignments = assignments?.length ?? 0;
  const completionRate = totalAssignments > 0 ? Math.round((completedSurveys / totalAssignments) * 100) : 0;
  const avgSleep = sleepRecords && sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, r) => sum + Number(r.hours), 0) / sleepRecords.length).toFixed(1)
    : '—';

  const statusCounts: Record<string, number> = {};
  patients?.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const completionTrend: { date: string; completed: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayLabel = format(subDays(new Date(), i), 'dd MMM');
    const count = assignments?.filter(
      (a) => a.completed_at && format(new Date(a.completed_at), 'yyyy-MM-dd') === day
    ).length ?? 0;
    completionTrend.push({ date: dayLabel, completed: count });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Hasta" value={totalPatients ?? 0} icon={Users} color="blue" />
        <StatCard title="Bekleyen Anketler" value={pendingSurveys} icon={ClipboardList} color="amber" />
        <StatCard title="Tamamlanma Oranı" value={`%${completionRate}`} icon={CheckCircle} color="green" />
        <StatCard title="Ort. Uyku (7g)" value={`${avgSleep}s`} icon={Moon} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Hasta Durumu</h2>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <PatientStatusChart data={statusData} />
            ) : (
              <p className="text-gray-500 text-center py-8">Hasta verisi yok</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Anket Tamamlanma (30g)</h2>
          </CardHeader>
          <CardContent>
            <SurveyCompletionChart data={completionTrend} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
        </CardHeader>
        <CardContent>
          {recentAssignments && recentAssignments.length > 0 ? (
            <div className="space-y-3">
              {recentAssignments.map((a) => {
                const patient = a.patient as unknown as { full_name: string } | null;
                const survey = a.survey as unknown as { title: string } | null;
                return (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      <span className="font-medium">{patient?.full_name}</span>
                      {' — '}
                      {a.status === 'completed' ? 'tamamladı' : 'atandı'}
                      {' '}
                      <span className="font-medium">{survey?.title}</span>
                    </span>
                    <span className="text-gray-400 text-xs">
                      {a.completed_at
                        ? format(new Date(a.completed_at), 'dd MMM')
                        : format(new Date(a.assigned_at), 'dd MMM')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Henüz aktivite yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
