'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { Study, StudyPeriod, StudyPeriodSurvey, Survey, SurveyAssignment, SurveyResponse } from '@/lib/supabase/types';

interface PeriodWithSurveys extends StudyPeriod {
  study_period_surveys: (StudyPeriodSurvey & { survey: Survey })[];
}

interface StudyWithPeriods extends Study {
  study_periods: PeriodWithSurveys[];
}

interface PatientStudyData {
  id: string;
  study: StudyWithPeriods;
}

interface Props {
  patientStudies: PatientStudyData[];
  assignments: (SurveyAssignment & { survey_responses: SurveyResponse[] | SurveyResponse | null })[];
}

export function StudiesTab({ patientStudies, assignments }: Props) {
  if (patientStudies.length === 0) {
    return <p className="text-gray-500 text-center py-8">Atanmış çalışma yok</p>;
  }

  const assignmentMap = new Map<string, SurveyAssignment & { survey_responses: SurveyResponse[] | SurveyResponse | null }>();
  assignments.forEach((a) => assignmentMap.set(a.survey_id, a));

  return (
    <div className="space-y-4">
      {patientStudies.map((ps) => (
        <StudyCard key={ps.id} study={ps.study} assignmentMap={assignmentMap} />
      ))}
    </div>
  );
}

function StudyCard({
  study,
  assignmentMap,
}: {
  study: StudyWithPeriods;
  assignmentMap: Map<string, SurveyAssignment & { survey_responses: SurveyResponse[] | SurveyResponse | null }>;
}) {
  const [expanded, setExpanded] = useState(true);

  const totalSurveys = study.study_periods.reduce(
    (sum, p) => sum + (p.study_period_surveys?.length ?? 0),
    0
  );

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <div>
            <span className="font-medium text-gray-900">{study.name}</span>
            <span className="text-xs text-gray-500 ml-2">{totalSurveys} anket</span>
          </div>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-6 pb-4 space-y-4">
          {study.study_periods
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((period) => (
              <PeriodFolder key={period.id} period={period} assignmentMap={assignmentMap} />
            ))}
        </div>
      )}
    </Card>
  );
}

function PeriodFolder({
  period,
  assignmentMap,
}: {
  period: PeriodWithSurveys;
  assignmentMap: Map<string, SurveyAssignment & { survey_responses: SurveyResponse[] | SurveyResponse | null }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const surveys = period.study_period_surveys ?? [];

  const completedCount = surveys.filter((sps) => {
    const assignment = assignmentMap.get(sps.survey_id);
    return assignment?.status === 'completed';
  }).length;

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-900">{period.name}</span>
          <Badge variant="info">{surveys.length} anket</Badge>
          {completedCount > 0 && (
            <Badge variant="success">{completedCount} tamamlandı</Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {surveys.length === 0 ? (
            <p className="text-xs text-gray-400">Bu dönemde anket yok</p>
          ) : (
            surveys.map((sps) => {
              const assignment = assignmentMap.get(sps.survey_id);
              const status = assignment?.status ?? 'not_assigned';
              return (
                <div key={sps.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-900">{sps.survey?.title}</span>
                  {status === 'completed' ? (
                    <Badge variant="success">Tamamlandı</Badge>
                  ) : status === 'pending' ? (
                    <Badge variant="warning">Bekliyor</Badge>
                  ) : (
                    <Badge variant="default">Atanmamış</Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
