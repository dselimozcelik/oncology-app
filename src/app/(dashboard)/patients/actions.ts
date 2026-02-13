'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

interface CreatePatientInput {
  username: string;
  password: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  conditions?: string;
  medical_notes?: string;
}

export async function createPatient(input: CreatePatientInput) {
  const email = `${input.username}@patients.local`;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });

  if (authError) {
    return { error: authError.message };
  }

  const conditions = input.conditions
    ? input.conditions.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: input.full_name,
    role: 'patient' as const,
    status: 'active' as const,
    date_of_birth: input.date_of_birth || null,
    gender: input.gender || null,
    phone: input.phone || null,
    conditions,
    medical_notes: input.medical_notes || null,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: profileError.message };
  }

  revalidatePath('/patients');
  return { success: true };
}
