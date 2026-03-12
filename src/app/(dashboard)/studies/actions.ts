'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

interface CreateStudyInput {
  name: string;
  description?: string;
  periods: { name: string; surveyIds: string[] }[];
}

export async function createStudy(doctorId: string, input: CreateStudyInput) {
  const { data: study, error } = await supabaseAdmin
    .from('studies')
    .insert({
      doctor_id: doctorId,
      name: input.name,
      description: input.description || null,
    })
    .select('id')
    .single();

  if (error || !study) return { error: error?.message ?? 'Çalışma oluşturulamadı' };

  for (let i = 0; i < input.periods.length; i++) {
    const p = input.periods[i];
    const { data: period, error: pError } = await supabaseAdmin
      .from('study_periods')
      .insert({ study_id: study.id, name: p.name, sort_order: i })
      .select('id')
      .single();

    if (pError || !period) continue;

    if (p.surveyIds.length > 0) {
      const rows = p.surveyIds.map((sid) => ({
        period_id: period.id,
        survey_id: sid,
      }));
      await supabaseAdmin.from('study_period_surveys').insert(rows);
    }
  }

  revalidatePath('/studies');
  return { success: true, studyId: study.id };
}

export async function deleteStudy(studyId: string) {
  const { error } = await supabaseAdmin.from('studies').delete().eq('id', studyId);
  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}

export async function assignPatientsToStudy(studyId: string, patientIds: string[]) {
  const rows = patientIds.map((pid) => ({
    study_id: studyId,
    patient_id: pid,
  }));

  const { error } = await supabaseAdmin.from('patient_studies').insert(rows);
  if (error) return { error: error.message };

  revalidatePath('/studies');
  return { success: true };
}

export async function removePatientFromStudy(studyId: string, patientId: string) {
  const { error } = await supabaseAdmin
    .from('patient_studies')
    .delete()
    .eq('study_id', studyId)
    .eq('patient_id', patientId);

  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}

export async function addPeriod(studyId: string, name: string, sortOrder: number) {
  const { error } = await supabaseAdmin
    .from('study_periods')
    .insert({ study_id: studyId, name, sort_order: sortOrder });

  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}

export async function deletePeriod(periodId: string) {
  const { error } = await supabaseAdmin.from('study_periods').delete().eq('id', periodId);
  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}

export async function addSurveyToPeriod(periodId: string, surveyId: string) {
  const { error } = await supabaseAdmin
    .from('study_period_surveys')
    .insert({ period_id: periodId, survey_id: surveyId });

  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}

export async function removeSurveyFromPeriod(periodId: string, surveyId: string) {
  const { error } = await supabaseAdmin
    .from('study_period_surveys')
    .delete()
    .eq('period_id', periodId)
    .eq('survey_id', surveyId);

  if (error) return { error: error.message };
  revalidatePath('/studies');
  return { success: true };
}
