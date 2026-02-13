-- Doctor
INSERT INTO public.profiles (id, email, full_name, role, status) VALUES
  ('cfeadae2-ea8a-4910-bbdb-d48c51c2c990', 'doctor@hospital.com', 'Dr. Sarah Chen', 'doctor', 'active');

-- Patients
INSERT INTO public.profiles (id, email, full_name, role, date_of_birth, gender, phone, conditions, medical_notes, status) VALUES
  ('e103e7a6-dc02-41ab-9692-7a555891607c', 'patient1@test.com', 'John Martinez', 'patient', '1985-03-15', 'male', '+1-555-0101', ARRAY['hypertension', 'diabetes type 2'], 'Stable on current medication. Review in 3 months.', 'active'),
  ('d0de81f4-5ff0-4907-9805-74e21857d90c', 'patient2@test.com', 'Emily Watson', 'patient', '1992-07-22', 'female', '+1-555-0102', ARRAY['asthma', 'anxiety'], 'Recently started new anxiety medication. Monitor side effects.', 'active'),
  ('dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', 'patient3@test.com', 'Robert Kim', 'patient', '1978-11-08', 'male', '+1-555-0103', ARRAY['chronic back pain', 'insomnia'], 'Referred to physiotherapy. Sleep quality declining.', 'critical'),
  ('6f0bc013-280f-461d-a10d-fbe77d415da0', 'patient4@test.com', 'Maria Garcia', 'patient', '1990-01-30', 'female', '+1-555-0104', ARRAY['migraine'], 'Tracking migraine triggers through diet and sleep logs.', 'active'),
  ('b2d38de8-5b31-40c6-b800-3f049fd23736', 'patient5@test.com', 'David Thompson', 'patient', '1965-09-12', 'male', '+1-555-0105', ARRAY['heart disease', 'high cholesterol'], 'Post-surgery recovery. Diet strictly monitored.', 'inactive');

-- Sleep records (last 30 days)
INSERT INTO public.sleep_records (patient_id, date, hours, quality, notes)
SELECT
  'e103e7a6-dc02-41ab-9692-7a555891607c',
  current_date - (n || ' days')::interval,
  5.5 + random() * 3,
  (ARRAY['poor', 'fair', 'good', 'excellent'])[floor(random() * 4 + 1)],
  CASE WHEN random() > 0.7 THEN 'Woke up during the night' ELSE NULL END
FROM generate_series(0, 29) AS n;

INSERT INTO public.sleep_records (patient_id, date, hours, quality, notes)
SELECT
  'd0de81f4-5ff0-4907-9805-74e21857d90c',
  current_date - (n || ' days')::interval,
  6 + random() * 2.5,
  (ARRAY['fair', 'good', 'good', 'excellent'])[floor(random() * 4 + 1)],
  NULL
FROM generate_series(0, 29) AS n;

INSERT INTO public.sleep_records (patient_id, date, hours, quality, notes)
SELECT
  'dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0',
  current_date - (n || ' days')::interval,
  3 + random() * 4,
  (ARRAY['poor', 'poor', 'fair', 'fair'])[floor(random() * 4 + 1)],
  CASE WHEN random() > 0.5 THEN 'Pain kept me awake' ELSE NULL END
FROM generate_series(0, 29) AS n;

-- Food entries
INSERT INTO public.food_entries (patient_id, date, meal_type, items, calories) VALUES
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date, 'breakfast', '[{"quantity": "2 slices", "food": "whole wheat toast"}, {"quantity": "2", "food": "scrambled eggs"}]', 420),
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date, 'lunch', '[{"quantity": "1 bowl", "food": "chicken salad"}, {"quantity": "1", "food": "apple"}]', 550),
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date, 'dinner', '[{"quantity": "200g", "food": "grilled salmon"}, {"quantity": "1 cup", "food": "brown rice"}, {"quantity": "1 cup", "food": "steamed broccoli"}]', 680),
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date - interval '1 day', 'breakfast', '[{"quantity": "1 bowl", "food": "oatmeal"}, {"quantity": "1", "food": "banana"}]', 350),
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date - interval '1 day', 'lunch', '[{"quantity": "1", "food": "turkey sandwich"}, {"quantity": "1 cup", "food": "tomato soup"}]', 620),
  ('e103e7a6-dc02-41ab-9692-7a555891607c', current_date - interval '1 day', 'dinner', '[{"quantity": "150g", "food": "chicken breast"}, {"quantity": "1 cup", "food": "quinoa"}]', 580),
  ('d0de81f4-5ff0-4907-9805-74e21857d90c', current_date, 'breakfast', '[{"quantity": "1", "food": "yogurt parfait"}, {"quantity": "1 cup", "food": "green tea"}]', 280),
  ('d0de81f4-5ff0-4907-9805-74e21857d90c', current_date, 'lunch', '[{"quantity": "1", "food": "veggie wrap"}, {"quantity": "1", "food": "orange"}]', 480),
  ('d0de81f4-5ff0-4907-9805-74e21857d90c', current_date, 'dinner', '[{"quantity": "1 plate", "food": "pasta primavera"}, {"quantity": "1 slice", "food": "garlic bread"}]', 720),
  ('dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', current_date, 'breakfast', '[{"quantity": "1 cup", "food": "coffee"}, {"quantity": "1", "food": "granola bar"}]', 250),
  ('dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', current_date, 'lunch', '[{"quantity": "1 bowl", "food": "ramen"}]', 550),
  ('dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', current_date, 'snack', '[{"quantity": "1 handful", "food": "mixed nuts"}]', 170);

-- More food entries for chart data
INSERT INTO public.food_entries (patient_id, date, meal_type, items, calories)
SELECT
  'e103e7a6-dc02-41ab-9692-7a555891607c',
  current_date - (n || ' days')::interval,
  (ARRAY['breakfast', 'lunch', 'dinner'])[meal],
  CASE meal
    WHEN 1 THEN '[{"quantity": "1 bowl", "food": "cereal"}, {"quantity": "1 cup", "food": "milk"}]'::jsonb
    WHEN 2 THEN '[{"quantity": "1", "food": "sandwich"}, {"quantity": "1", "food": "juice"}]'::jsonb
    WHEN 3 THEN '[{"quantity": "1 plate", "food": "rice and beans"}, {"quantity": "1 cup", "food": "salad"}]'::jsonb
  END,
  (ARRAY[380, 550, 650])[meal]
FROM generate_series(2, 13) AS n, generate_series(1, 3) AS meal;

-- Surveys
INSERT INTO public.surveys (id, doctor_id, title, description, questions, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'cfeadae2-ea8a-4910-bbdb-d48c51c2c990', 'Weekly Wellness Check',
   'A weekly survey to monitor overall patient well-being.',
   '[
     {"id": "q1", "type": "scale", "label": "How would you rate your overall well-being this week?", "min": 1, "max": 10},
     {"id": "q2", "type": "boolean", "label": "Did you experience any new symptoms?"},
     {"id": "q3", "type": "text", "label": "Please describe any concerns or changes you have noticed."},
     {"id": "q4", "type": "number", "label": "How many hours of exercise did you get this week?"},
     {"id": "q5", "type": "multiple_choice", "label": "How would you rate your stress level?", "options": ["Very Low", "Low", "Moderate", "High", "Very High"]}
   ]', true),
  ('10000000-0000-0000-0000-000000000002', 'cfeadae2-ea8a-4910-bbdb-d48c51c2c990', 'Pain Assessment',
   'Detailed pain level assessment for chronic pain patients.',
   '[
     {"id": "q1", "type": "scale", "label": "Rate your current pain level", "min": 0, "max": 10},
     {"id": "q2", "type": "multiple_choice", "label": "Where is the pain located?", "options": ["Head", "Back", "Joints", "Chest", "Abdomen", "Other"]},
     {"id": "q3", "type": "boolean", "label": "Is the pain constant or intermittent?"},
     {"id": "q4", "type": "text", "label": "What activities make the pain worse?"}
   ]', true),
  ('10000000-0000-0000-0000-000000000003', 'cfeadae2-ea8a-4910-bbdb-d48c51c2c990', 'Medication Adherence',
   'Track medication compliance and side effects.',
   '[
     {"id": "q1", "type": "boolean", "label": "Have you taken all prescribed medications this week?"},
     {"id": "q2", "type": "number", "label": "How many doses did you miss?"},
     {"id": "q3", "type": "boolean", "label": "Have you experienced any side effects?"},
     {"id": "q4", "type": "text", "label": "Describe any side effects experienced"}
   ]', true);

-- Survey assignments
INSERT INTO public.survey_assignments (id, survey_id, patient_id, status, completed_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'e103e7a6-dc02-41ab-9692-7a555891607c', 'completed', now() - interval '2 days'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'd0de81f4-5ff0-4907-9805-74e21857d90c', 'completed', now() - interval '1 day'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', 'pending', NULL),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'dc25a5dd-f2bb-4483-89d4-0a3ef2b94be0', 'completed', now() - interval '3 days'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'e103e7a6-dc02-41ab-9692-7a555891607c', 'pending', NULL),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'b2d38de8-5b31-40c6-b800-3f049fd23736', 'completed', now() - interval '5 days'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'd0de81f4-5ff0-4907-9805-74e21857d90c', 'pending', NULL);

-- Survey responses
INSERT INTO public.survey_responses (assignment_id, answers) VALUES
  ('20000000-0000-0000-0000-000000000001', '{"q1": 7, "q2": false, "q3": "Feeling better overall, sleeping well.", "q4": 4, "q5": "Low"}'),
  ('20000000-0000-0000-0000-000000000002', '{"q1": 5, "q2": true, "q3": "Having occasional headaches and feeling anxious.", "q4": 2, "q5": "High"}'),
  ('20000000-0000-0000-0000-000000000004', '{"q1": 8, "q2": "Back", "q3": true, "q4": "Sitting for long periods"}'),
  ('20000000-0000-0000-0000-000000000006', '{"q1": true, "q2": 0, "q3": false, "q4": "No side effects"}');
