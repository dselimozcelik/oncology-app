'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyQuestion } from '@/lib/supabase/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { QuestionBuilder } from './question-builder';
import { createClient } from '@/lib/supabase/client';

export function SurveyForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (questions.length === 0) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        doctor_id: user.id,
        title,
        description: description || null,
        questions: questions as unknown as Record<string, unknown>[],
      })
      .select('id')
      .single();

    if (error || !data) {
      setSaving(false);
      return;
    }

    // Tüm hastalara otomatik ata
    const { data: patients } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'patient');

    if (patients && patients.length > 0) {
      const rows = patients.map((p) => ({
        survey_id: data.id,
        patient_id: p.id,
      }));
      await supabase.from('survey_assignments').insert(rows);
    }

    setSaving(false);
    router.push(`/surveys/${data.id}`);
  }

  return (
    <>
      <form onSubmit={handleCreate} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Anket Bilgileri</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Başlık"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ör. Haftalık Sağlık Değerlendirmesi"
              required
            />
            <Textarea
              id="description"
              label="Açıklama (isteğe bağlı)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anketin amacı hakkında kısa bir açıklama"
            />
          </CardContent>
        </Card>

        <QuestionBuilder questions={questions} onChange={setQuestions} />

        <div className="flex gap-3">
          <Button type="submit" disabled={saving || questions.length === 0}>
            {saving ? 'Oluşturuluyor...' : 'Anket Oluştur'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            İptal
          </Button>
        </div>
      </form>
    </>
  );
}
