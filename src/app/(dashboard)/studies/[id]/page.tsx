import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { StudyPatientsSection } from '@/components/studies/study-patients-section';
import { StudyPeriodsSection } from '@/components/studies/study-periods-section';
import { DeleteStudyButton } from '@/components/studies/delete-study-button';

export default async function StudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: study },
    { data: periods },
    { data: patientStudies },
    { data: allSurveys },
  ] = await Promise.all([
    supabase.from('studies').select('*').eq('id', id).single(),
    supabase
      .from('study_periods')
      .select('*, study_period_surveys(*, survey:surveys(id, title))')
      .eq('study_id', id)
      .order('sort_order'),
    supabase
      .from('patient_studies')
      .select('*, patient:profiles(*)')
      .eq('study_id', id)
      .order('assigned_at', { ascending: false }),
    supabase
      .from('surveys')
      .select('id, title')
      .eq('is_active', true)
      .order('title'),
  ]);

  if (!study) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/studies" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
            {study.description && (
              <p className="text-sm text-gray-500 mt-1">{study.description}</p>
            )}
          </div>
        </div>
        <DeleteStudyButton studyId={study.id} studyName={study.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Dönem Sayısı</p>
            <p className="text-2xl font-bold text-gray-900">{periods?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Hasta Sayısı</p>
            <p className="text-2xl font-bold text-gray-900">{patientStudies?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Oluşturulma</p>
            <p className="text-2xl font-bold text-gray-900">
              {format(new Date(study.created_at), 'dd.MM.yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <StudyPeriodsSection
        studyId={study.id}
        periods={(periods as never) ?? []}
        allSurveys={allSurveys ?? []}
      />

      <StudyPatientsSection
        studyId={study.id}
        patientStudies={(patientStudies as never) ?? []}
      />
    </div>
  );
}
