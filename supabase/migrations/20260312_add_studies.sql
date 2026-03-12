-- Studies (çalışmalar)
create table public.studies (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.studies enable row level security;

create policy "Doctors can do everything with studies" on public.studies
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view studies they belong to" on public.studies
  for select using (
    exists (
      select 1 from public.patient_studies
      where study_id = id and patient_id = auth.uid()
    )
  );

-- Study periods (ay klasörleri)
create table public.study_periods (
  id uuid default gen_random_uuid() primary key,
  study_id uuid references public.studies(id) on delete cascade not null,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.study_periods enable row level security;

create policy "Doctors can do everything with study_periods" on public.study_periods
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view own study periods" on public.study_periods
  for select using (
    exists (
      select 1 from public.patient_studies ps
      join public.studies s on s.id = ps.study_id
      where s.id = study_id and ps.patient_id = auth.uid()
    )
  );

-- Surveys in a period
create table public.study_period_surveys (
  id uuid default gen_random_uuid() primary key,
  period_id uuid references public.study_periods(id) on delete cascade not null,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  unique(period_id, survey_id)
);

alter table public.study_period_surveys enable row level security;

create policy "Doctors can do everything with study_period_surveys" on public.study_period_surveys
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view own study period surveys" on public.study_period_surveys
  for select using (
    exists (
      select 1 from public.study_periods sp
      join public.patient_studies ps on ps.study_id = sp.study_id
      where sp.id = period_id and ps.patient_id = auth.uid()
    )
  );

-- Patient-study assignments
create table public.patient_studies (
  id uuid default gen_random_uuid() primary key,
  study_id uuid references public.studies(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  assigned_at timestamptz default now(),
  unique(study_id, patient_id)
);

alter table public.patient_studies enable row level security;

create policy "Doctors can do everything with patient_studies" on public.patient_studies
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view own patient_studies" on public.patient_studies
  for select using (auth.uid() = patient_id);

create trigger studies_updated_at before update on public.studies
  for each row execute function public.handle_updated_at();
