import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { PatientTable } from '@/components/patients/patient-table';
import { PatientFilters } from '@/components/patients/filters';
import { AddPatientDialog } from '@/components/patients/add-patient-dialog';
import { Suspense } from 'react';

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .order('full_name');

  if (params.search) {
    query = query.ilike('full_name', `%${params.search}%`);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data: patients } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hastalar</h1>
        <AddPatientDialog />
      </div>

      <Suspense>
        <PatientFilters />
      </Suspense>

      <Card>
        <PatientTable patients={patients ?? []} />
      </Card>
    </div>
  );
}
