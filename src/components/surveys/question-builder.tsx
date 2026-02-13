'use client';

import { SurveyQuestion, QuestionType } from '@/lib/supabase/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'boolean', label: 'Evet/Hayır' },
  { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
  { value: 'scale', label: 'Ölçek' },
];

interface Props {
  questions: SurveyQuestion[];
  onChange: (questions: SurveyQuestion[]) => void;
}

export function QuestionBuilder({ questions, onChange }: Props) {
  function addQuestion() {
    onChange([
      ...questions,
      { id: `q${Date.now()}`, type: 'text', label: '' },
    ]);
  }

  function updateQuestion(index: number, updates: Partial<SurveyQuestion>) {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function removeQuestion(index: number) {
    onChange(questions.filter((_, i) => i !== index));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options ?? [])];
    opts[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: opts };
    onChange(updated);
  }

  function addOption(qIndex: number) {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], options: [...(updated[qIndex].options ?? []), ''] };
    onChange(updated);
  }

  function removeOption(qIndex: number, oIndex: number) {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], options: (updated[qIndex].options ?? []).filter((_, i) => i !== oIndex) };
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Sorular</h3>
        <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4" />
          Soru Ekle
        </Button>
      </div>

      {questions.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-gray-300 mt-2 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Soru metni"
                      value={q.label}
                      onChange={(e) => updateQuestion(i, { label: e.target.value })}
                    />
                  </div>
                  <Select
                    options={questionTypes}
                    value={q.type}
                    onChange={(e) => updateQuestion(i, { type: e.target.value as QuestionType, options: e.target.value === 'multiple_choice' ? [''] : undefined })}
                    className="w-44"
                  />
                </div>

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2 pl-2">
                    {(q.options ?? []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <Input
                          placeholder={`Seçenek ${oi + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(i, oi, e.target.value)}
                          className="flex-1"
                        />
                        <button type="button" onClick={() => removeOption(i, oi)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={() => addOption(i)}>
                      <Plus className="h-3 w-3" /> Seçenek ekle
                    </Button>
                  </div>
                )}

                {q.type === 'scale' && (
                  <div className="flex items-center gap-3 pl-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={q.min ?? 1}
                      onChange={(e) => updateQuestion(i, { min: parseInt(e.target.value) })}
                      className="w-24"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Maks"
                      value={q.max ?? 10}
                      onChange={(e) => updateQuestion(i, { max: parseInt(e.target.value) })}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => removeQuestion(i)} className="text-gray-400 hover:text-red-500 mt-2">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && (
        <p className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
          Henüz soru yok. Anketinizi oluşturmak için &quot;Soru Ekle&quot; butonuna tıklayın.
        </p>
      )}
    </div>
  );
}
