import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/stat-card';
import { ResponseViewer } from '@/components/surveys/response-viewer';
import { ArrowLeft, Users, CheckCircle, Percent } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { SurveyQuestion, SurveyResponse } from '@/lib/supabase/types';

const typeLabels: Record<string, string> = {
  text: 'Metin',
  number: 'Sayı',
  boolean: 'Evet/Hayır',
  multiple_choice: 'Çoktan Seçmeli',
  scale: 'Ölçek',
};

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (!survey) notFound();

  const { data: assignments } = await supabase
    .from('survey_assignments')
    .select('*, patient:profiles(full_name, email), survey_responses(*)')
    .eq('survey_id', id)
    .order('assigned_at', { ascending: false });

  const total = assignments?.length ?? 0;
  const completed = assignments?.filter((a) => a.status === 'completed').length ?? 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const questions = (survey.questions ?? []) as SurveyQuestion[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/surveys" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <Badge variant={survey.is_active ? 'success' : 'default'}>
              {survey.is_active ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
          {survey.description && (
            <p className="text-gray-500 mt-1">{survey.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Oluşturulma: {format(new Date(survey.created_at), 'dd.MM.yyyy')}
          </p>
        </div>
      </div>

      {survey.image_url && (
        <img
          src={survey.image_url}
          alt={survey.title}
          className="w-full max-w-2xl h-56 rounded-xl border border-gray-200 object-cover"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Atanan" value={total} icon={Users} color="blue" />
        <StatCard title="Tamamlanan" value={completed} icon={CheckCircle} color="green" />
        <StatCard title="Tamamlanma Oranı" value={`%${rate}`} icon={Percent} color="amber" />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Sorular ({questions.length})</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="flex gap-3 text-sm">
                <span className="text-gray-400 font-medium">{i + 1}.</span>
                <div>
                  <p className="text-gray-900">{q.label}</p>
                  <p className="text-gray-400 text-xs">{typeLabels[q.type] ?? q.type}</p>
                  {q.options && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {q.options.map((o, oi) => (
                        <span key={oi} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{o}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Yanıtlar</h2>
        </CardHeader>
        {assignments && assignments.length > 0 ? (
          <div>
            {assignments.map((a) => {
              const patient = a.patient as unknown as { full_name: string } | null;
              const raw = a.survey_responses;
              const response = Array.isArray(raw) ? (raw as SurveyResponse[])[0] ?? null : (raw as SurveyResponse | null);
              return (
                <ResponseViewer
                  key={a.id}
                  patientName={patient?.full_name ?? 'Bilinmiyor'}
                  questions={questions}
                  response={response}
                  completedAt={a.completed_at}
                  status={a.status}
                />
              );
            })}
          </div>
        ) : (
          <CardContent>
            <p className="text-gray-500 text-center py-4">Henüz atama yapılmamış</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
