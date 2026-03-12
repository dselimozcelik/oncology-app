'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createStudy } from '@/app/(dashboard)/studies/actions';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Check } from 'lucide-react';

interface PeriodDraft {
  name: string;
  surveyIds: string[];
}

interface Props {
  surveys: { id: string; title: string }[];
}

export function StudyForm({ surveys }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [periods, setPeriods] = useState<PeriodDraft[]>([
    { name: '0. Ay', surveyIds: [] },
  ]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function addPeriod() {
    const nextMonth = periods.length * 3;
    setPeriods([...periods, { name: `${nextMonth}. Ay`, surveyIds: [] }]);
  }

  function removePeriod(idx: number) {
    setPeriods(periods.filter((_, i) => i !== idx));
  }

  function updatePeriodName(idx: number, val: string) {
    const next = [...periods];
    next[idx] = { ...next[idx], name: val };
    setPeriods(next);
  }

  function toggleSurvey(periodIdx: number, surveyId: string) {
    const next = [...periods];
    const p = next[periodIdx];
    const ids = p.surveyIds.includes(surveyId)
      ? p.surveyIds.filter((id) => id !== surveyId)
      : [...p.surveyIds, surveyId];
    next[periodIdx] = { ...p, surveyIds: ids };
    setPeriods(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (periods.length === 0) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const result = await createStudy(user.id, { name, description, periods });

    setSaving(false);
    if (result.error) return;
    router.push(`/studies/${result.studyId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Çalışma Bilgileri</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="name"
            label="Çalışma Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ör. Diyabet Takip Çalışması"
            required
          />
          <Textarea
            id="description"
            label="Açıklama (isteğe bağlı)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Çalışma hakkında kısa açıklama"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Dönemler ve Anketler</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addPeriod}>
              <Plus className="h-4 w-4" />
              Dönem Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {periods.map((period, pIdx) => (
            <div key={pIdx} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  value={period.name}
                  onChange={(e) => updatePeriodName(pIdx, e.target.value)}
                  placeholder="Dönem adı"
                  className="flex-1"
                  required
                />
                {periods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePeriod(pIdx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500">Bu dönemde kullanılacak anketleri seçin:</p>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {surveys.length === 0 ? (
                  <p className="text-sm text-gray-400">Aktif anket bulunamadı</p>
                ) : (
                  surveys.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSurvey(pIdx, s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          period.surveyIds.includes(s.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {period.surveyIds.includes(s.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900">{s.title}</span>
                    </button>
                  ))
                )}
              </div>

              {period.surveyIds.length > 0 && (
                <p className="text-xs text-blue-600">{period.surveyIds.length} anket seçildi</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || periods.length === 0}>
          {saving ? 'Oluşturuluyor...' : 'Çalışma Oluştur'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  );
}
