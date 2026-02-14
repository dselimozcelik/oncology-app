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
