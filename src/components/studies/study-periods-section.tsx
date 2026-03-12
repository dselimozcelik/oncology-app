'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { addPeriod, deletePeriod, addSurveyToPeriod, removeSurveyFromPeriod } from '@/app/(dashboard)/studies/actions';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Survey, StudyPeriod, StudyPeriodSurvey } from '@/lib/supabase/types';

interface PeriodWithSurveys extends StudyPeriod {
  study_period_surveys: (StudyPeriodSurvey & { survey: { id: string; title: string } })[];
}

interface Props {
  studyId: string;
  periods: PeriodWithSurveys[];
  allSurveys: { id: string; title: string }[];
}

export function StudyPeriodsSection({ studyId, periods, allSurveys }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAddPeriod(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await addPeriod(studyId, newName, periods.length);
    setNewName('');
    setShowAdd(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDeletePeriod(periodId: string) {
    await deletePeriod(periodId);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Dönemler</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Dönem Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {periods.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Henüz dönem eklenmemiş</p>
        )}

        {periods.map((period) => (
          <PeriodCard
            key={period.id}
            period={period}
            allSurveys={allSurveys}
            onDelete={() => handleDeletePeriod(period.id)}
          />
        ))}

        {showAdd && (
          <form onSubmit={handleAddPeriod} className="flex items-end gap-3 border border-dashed border-gray-300 rounded-lg p-4">
            <Input
              label="Dönem Adı"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ör. 6. Ay"
              required
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading}>Ekle</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>İptal</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PeriodCard({
  period,
  allSurveys,
  onDelete,
}: {
  period: PeriodWithSurveys;
  allSurveys: { id: string; title: string }[];
  onDelete: () => void;
}) {
  const [showSurveyPicker, setShowSurveyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const assignedIds = new Set(period.study_period_surveys.map((s) => s.survey_id));
  const availableSurveys = allSurveys.filter((s) => !assignedIds.has(s.id));

  async function handleAddSurvey(surveyId: string) {
    setLoading(true);
    await addSurveyToPeriod(period.id, surveyId);
    setLoading(false);
    router.refresh();
  }

  async function handleRemoveSurvey(surveyId: string) {
    await removeSurveyFromPeriod(period.id, surveyId);
    router.refresh();
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{period.name}</h3>
          <Badge variant="info">{period.study_period_surveys.length} anket</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowSurveyPicker(true)}>
            <Plus className="h-3 w-3" />
            Anket Ekle
          </Button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {period.study_period_surveys.length > 0 && (
        <div className="space-y-1">
          {period.study_period_surveys.map((sps) => (
            <div key={sps.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-900">{sps.survey?.title}</span>
              <button
                onClick={() => handleRemoveSurvey(sps.survey_id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showSurveyPicker} onClose={() => setShowSurveyPicker(false)}>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">Anket Ekle — {period.name}</h2>
          <p className="text-sm text-gray-500">Eklemek istediğiniz anketleri seçin</p>
        </DialogHeader>
        <DialogContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {availableSurveys.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Eklenebilecek anket kalmadı</p>
            ) : (
              availableSurveys.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAddSurvey(s.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-900">{s.title}</span>
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end pt-3 border-t mt-3">
            <Button variant="secondary" onClick={() => setShowSurveyPicker(false)}>Kapat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
