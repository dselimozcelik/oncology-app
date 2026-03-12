-- Helper function to get the current user's role
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'patient' check (role in ('doctor', 'patient')),
  date_of_birth date,
  gender text,
  phone text,
  conditions text[] default '{}',
  medical_notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'critical', 'discharged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Doctors can view all profiles" on public.profiles
  for select using (public.get_user_role() = 'doctor');

create policy "Doctors can update all profiles" on public.profiles
  for update using (public.get_user_role() = 'doctor');

create policy "Patients can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Patients can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Surveys table
create table public.surveys (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  image_url text,
  questions jsonb not null default '[]',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Storage bucket for survey images
insert into storage.buckets (id, name, public) values ('survey-images', 'survey-images', true);

create policy "Doctors can upload survey images" on storage.objects
  for insert with check (bucket_id = 'survey-images' and public.get_user_role() = 'doctor');

create policy "Doctors can delete survey images" on storage.objects
  for delete using (bucket_id = 'survey-images' and public.get_user_role() = 'doctor');

create policy "Anyone can view survey images" on storage.objects
  for select using (bucket_id = 'survey-images');

alter table public.surveys enable row level security;

create policy "Doctors can do everything with surveys" on public.surveys
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view active surveys" on public.surveys
  for select using (is_active = true);

-- Survey assignments
create table public.survey_assignments (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  assigned_at timestamptz default now(),
  completed_at timestamptz,
  unique(survey_id, patient_id)
);

alter table public.survey_assignments enable row level security;

create policy "Doctors can do everything with assignments" on public.survey_assignments
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view own assignments" on public.survey_assignments
  for select using (auth.uid() = patient_id);

create policy "Patients can update own assignments" on public.survey_assignments
  for update using (auth.uid() = patient_id);

-- Survey responses
create table public.survey_responses (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.survey_assignments(id) on delete cascade not null unique,
  answers jsonb not null default '{}',
  submitted_at timestamptz default now()
);

alter table public.survey_responses enable row level security;

create policy "Doctors can view all responses" on public.survey_responses
  for select using (public.get_user_role() = 'doctor');

create policy "Patients can insert own responses" on public.survey_responses
  for insert with check (
    exists (
      select 1 from public.survey_assignments
      where id = assignment_id and patient_id = auth.uid()
    )
  );

create policy "Patients can view own responses" on public.survey_responses
  for select using (
    exists (
      select 1 from public.survey_assignments
      where id = assignment_id and patient_id = auth.uid()
    )
  );

-- Sleep records
create table public.sleep_records (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  hours numeric(4,2) not null check (hours >= 0 and hours <= 24),
  quality text not null check (quality in ('poor', 'fair', 'good', 'excellent')),
  notes text,
  created_at timestamptz default now(),
  unique(patient_id, date)
);

alter table public.sleep_records enable row level security;

create policy "Doctors can view all sleep records" on public.sleep_records
  for select using (public.get_user_role() = 'doctor');

create policy "Patients can manage own sleep records" on public.sleep_records
  for all using (auth.uid() = patient_id);

-- Food entries
create table public.food_entries (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  items jsonb not null default '[]',
  calories integer,
  notes text,
  created_at timestamptz default now()
);

alter table public.food_entries enable row level security;

create policy "Doctors can view all food entries" on public.food_entries
  for select using (public.get_user_role() = 'doctor');

create policy "Patients can manage own food entries" on public.food_entries
  for all using (auth.uid() = patient_id);

-- Studies (çalışmalar) - tablolar
create table public.studies (
  id uuid default gen_random_uuid() primary key,
  doctor_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.study_periods (
  id uuid default gen_random_uuid() primary key,
  study_id uuid references public.studies(id) on delete cascade not null,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table public.study_period_surveys (
  id uuid default gen_random_uuid() primary key,
  period_id uuid references public.study_periods(id) on delete cascade not null,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  unique(period_id, survey_id)
);

create table public.patient_studies (
  id uuid default gen_random_uuid() primary key,
  study_id uuid references public.studies(id) on delete cascade not null,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  assigned_at timestamptz default now(),
  unique(study_id, patient_id)
);

-- Studies - RLS
alter table public.studies enable row level security;
alter table public.study_periods enable row level security;
alter table public.study_period_surveys enable row level security;
alter table public.patient_studies enable row level security;

-- Studies - policies
create policy "Doctors can do everything with studies" on public.studies
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view studies they belong to" on public.studies
  for select using (
    exists (
      select 1 from public.patient_studies
      where study_id = id and patient_id = auth.uid()
    )
  );

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

create policy "Doctors can do everything with patient_studies" on public.patient_studies
  for all using (public.get_user_role() = 'doctor');

create policy "Patients can view own patient_studies" on public.patient_studies
  for select using (auth.uid() = patient_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger surveys_updated_at before update on public.surveys
  for each row execute function public.handle_updated_at();

create trigger studies_updated_at before update on public.studies
  for each row execute function public.handle_updated_at();
