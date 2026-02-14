'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';
import { SurveyQuestion, SurveyResponse } from '@/lib/supabase/types';
import { format } from 'date-fns';

interface Assignment {
  status: string;
  completed_at: string | null;
  patient: { full_name: string; email: string } | null;
  survey_responses: SurveyResponse[] | SurveyResponse | null;
}

interface SurveyExportButtonProps {
  surveyTitle: string;
  questions: SurveyQuestion[];
  assignments: Assignment[];
}

export function SurveyExportButton({ surveyTitle, questions, assignments }: SurveyExportButtonProps) {
  const handleExport = () => {
    const headers = [
      'Hasta Adı',
      'Hasta Email',
      'Durum',
      'Tamamlanma Tarihi',
      ...questions.map((q) => q.label),
    ];

    const rows = assignments.map((a) => {
      const raw = a.survey_responses;
      const response = Array.isArray(raw) ? raw[0] ?? null : raw;
      const answers = (response?.answers ?? {}) as Record<string, unknown>;

      return [
        a.patient?.full_name ?? '',
        a.patient?.email ?? '',
        a.status === 'completed' ? 'Tamamlandı' : a.status === 'pending' ? 'Bekliyor' : a.status,
        a.completed_at ? format(new Date(a.completed_at), 'dd.MM.yyyy HH:mm') : '',
        ...questions.map((q) => answers[q.id] ?? null),
      ];
    });

    downloadCSV(`${surveyTitle}-yanitlar`, headers, rows);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      CSV İndir
    </Button>
  );
}

interface SurveySummary {
  title: string;
  created_at: string;
  is_active: boolean;
  total: number;
  completed: number;
  rate: number;
}

export function SurveysExportAll({ surveys }: { surveys: SurveySummary[] }) {
  const handleExport = () => {
    const headers = ['Anket Adı', 'Oluşturulma', 'Atanan', 'Tamamlanan', 'Oran (%)', 'Durum'];
    const rows = surveys.map((s) => [
      s.title,
      format(new Date(s.created_at), 'dd.MM.yyyy'),
      s.total,
      s.completed,
      s.rate,
      s.is_active ? 'Aktif' : 'Pasif',
    ]);
    downloadCSV('anketler-ozet', headers, rows);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Tümünü Dışa Aktar
    </Button>
  );
}
