'use client';

import { useState } from 'react';
import { SurveyAssignment, SurveyResponse, Survey, SurveyQuestion } from '@/lib/supabase/types';
import { Badge, statusBadgeVariant, statusLabel } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';
import { format } from 'date-fns';

interface AssignmentWithDetails extends SurveyAssignment {
  survey: Survey;
  survey_responses: SurveyResponse[] | SurveyResponse | null;
}

export function SurveysTab({ assignments }: { assignments: AssignmentWithDetails[] }) {
  if (assignments.length === 0) {
    return <p className="text-gray-500 text-center py-8">Atanmış anket yok</p>;
  }

  const handleExport = () => {
    const headers = ['Anket Adı', 'Soru', 'Yanıt', 'Durum', 'Gönderilme Tarihi'];
    const rows: unknown[][] = [];

    assignments.forEach((a) => {
      const questions = (a.survey?.questions ?? []) as SurveyQuestion[];
      const raw = a.survey_responses;
      const response = Array.isArray(raw) ? raw[0] : raw;
      const answers = (response?.answers ?? {}) as Record<string, unknown>;
      const status = a.status === 'completed' ? 'Tamamlandı' : a.status === 'pending' ? 'Bekliyor' : a.status;
      const date = response?.submitted_at ? format(new Date(response.submitted_at), 'dd.MM.yyyy HH:mm') : '';

      questions.forEach((q) => {
        rows.push([a.survey?.title ?? '', q.label, answers[q.id] ?? null, status, date]);
      });
    });

    downloadCSV('hasta-anket-yanitlari', headers, rows);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          CSV İndir
        </Button>
      </div>
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: AssignmentWithDetails }) {
  const [expanded, setExpanded] = useState(false);
  const raw = assignment.survey_responses;
  const response = Array.isArray(raw) ? raw[0] : raw;
  const questions = (assignment.survey?.questions ?? []) as SurveyQuestion[];

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <div>
            <span className="font-medium text-gray-900">{assignment.survey?.title}</span>
            <span className="text-xs text-gray-500 ml-2">
              Atanma: {format(new Date(assignment.assigned_at), 'dd.MM.yyyy')}
            </span>
          </div>
        </div>
        <Badge variant={statusBadgeVariant(assignment.status)}>{statusLabel(assignment.status)}</Badge>
      </button>

      {expanded && response && (
        <div className="px-6 pb-4 border-t border-gray-100 pt-4 space-y-3">
          {questions.map((q) => {
            const answer = (response.answers as Record<string, unknown>)[q.id];
            return (
              <div key={q.id} className="text-sm">
                <p className="text-gray-500">{q.label}</p>
                <p className="font-medium text-gray-900 mt-0.5">
                  {answer === true ? 'Evet' : answer === false ? 'Hayır' : String(answer ?? '—')}
                </p>
              </div>
            );
          })}
          <p className="text-xs text-gray-400">
            Gönderilme: {format(new Date(response.submitted_at), 'dd.MM.yyyy HH:mm')}
          </p>
        </div>
      )}

      {expanded && !response && (
        <div className="px-6 pb-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            {assignment.status === 'completed' ? 'Yanıt kaydı bulunamadı' : 'Hastadan yanıt bekleniyor'}
          </p>
        </div>
      )}
    </Card>
  );
}
