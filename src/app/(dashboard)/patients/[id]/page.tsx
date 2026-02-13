import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge, statusBadgeVariant, statusLabel } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InfoTab } from '@/components/patients/info-tab';
import { SleepTab } from '@/components/patients/sleep-tab';
import { NutritionTab } from '@/components/patients/nutrition-tab';
import { SurveysTab } from '@/components/patients/surveys-tab';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { subDays, format } from 'date-fns';

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [
    { data: patient },
    { data: sleepRecords },
    { data: foodEntries },
    { data: assignments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('sleep_records').select('*').eq('patient_id', id).gte('date', thirtyDaysAgo).order('date', { ascending: false }),
    supabase.from('food_entries').select('*').eq('patient_id', id).gte('date', thirtyDaysAgo).order('date', { ascending: false }),
    supabase.from('survey_assignments').select('*, survey:surveys(*), survey_responses(*)').eq('patient_id', id).order('assigned_at', { ascending: false }),
  ]);

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusBadgeVariant(patient.status)}>{statusLabel(patient.status)}</Badge>
            <span className="text-sm text-gray-500">{patient.email}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Bilgiler</TabsTrigger>
          <TabsTrigger value="sleep">Uyku</TabsTrigger>
          <TabsTrigger value="nutrition">Beslenme</TabsTrigger>
          <TabsTrigger value="surveys">Anketler</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <InfoTab patient={patient} />
        </TabsContent>

        <TabsContent value="sleep">
          <SleepTab records={sleepRecords ?? []} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionTab entries={foodEntries ?? []} />
        </TabsContent>

        <TabsContent value="surveys">
          <SurveysTab assignments={(assignments as never) ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
