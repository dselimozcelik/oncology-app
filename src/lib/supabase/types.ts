export type UserRole = 'doctor' | 'patient';

export type PatientStatus = 'active' | 'inactive' | 'critical' | 'discharged';

export type QuestionType = 'text' | 'number' | 'boolean' | 'multiple_choice' | 'scale';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type AssignmentStatus = 'pending' | 'completed' | 'expired';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  conditions: string[];
  medical_notes: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  label: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface Survey {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SurveyAssignment {
  id: string;
  survey_id: string;
  patient_id: string;
  status: AssignmentStatus;
  assigned_at: string;
  completed_at: string | null;
  survey?: Survey;
  patient?: Profile;
}

export interface SurveyResponse {
  id: string;
  assignment_id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
  assignment?: SurveyAssignment;
}

export interface SleepRecord {
  id: string;
  patient_id: string;
  date: string;
  hours: number;
  quality: SleepQuality;
  notes: string | null;
  created_at: string;
}

export interface FoodItem {
  quantity: string;
  food: string;
}

export interface FoodEntry {
  id: string;
  patient_id: string;
  date: string;
  meal_type: MealType;
  items: FoodItem[];
  calories: number | null;
  notes: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      surveys: { Row: Survey };
      survey_assignments: { Row: SurveyAssignment };
      survey_responses: { Row: SurveyResponse };
      sleep_records: { Row: SleepRecord };
      food_entries: { Row: FoodEntry };
    };
  };
}
