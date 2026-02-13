'use client';

import { useState } from 'react';
import { SurveyQuestion, SurveyResponse } from '@/lib/supabase/types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { statusLabel } from '@/components/ui/badge';

interface Props {
  patientName: string;
  questions: SurveyQuestion[];
  response: SurveyResponse | null;
  completedAt: string | null;
  status: string;
}

export function ResponseViewer({ patientName, questions, response, completedAt, status }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-900">{patientName}</span>
        </div>
        <div className="flex items-center gap-3">
          {completedAt && (
            <span className="text-xs text-gray-500">{format(new Date(completedAt), 'dd.MM.yyyy')}</span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {statusLabel(status)}
          </span>
        </div>
      </button>

      {expanded && response && (
        <div className="px-10 pb-4 space-y-3">
          {questions.map((q) => {
            const answer = (response.answers as Record<string, unknown>)[q.id];
            return (
              <div key={q.id} className="grid grid-cols-2 gap-4 text-sm">
                <p className="text-gray-500">{q.label}</p>
                <p className="font-medium text-gray-900">
                  {answer === true ? 'Evet' : answer === false ? 'Hayır' : String(answer ?? '—')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {expanded && !response && (
        <p className="px-10 pb-4 text-sm text-gray-500">Henüz yanıt gönderilmedi</p>
      )}
    </div>
  );
}
