'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyQuestion } from '@/lib/supabase/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { QuestionBuilder } from './question-builder';
import { createClient } from '@/lib/supabase/client';
import { ImagePlus, X } from 'lucide-react';

export function SurveyForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleImageSelect(file: File) {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function uploadImage(surveyId: string): Promise<string | null> {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${surveyId}.${ext}`;

    const { error } = await supabase.storage
      .from('survey-images')
      .upload(path, imageFile, { upsert: true });

    if (error) return null;

    const { data } = supabase.storage
      .from('survey-images')
      .getPublicUrl(path);

    return data.publicUrl;
  }

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

    const imageUrl = await uploadImage(data.id);
    if (imageUrl) {
      await supabase
        .from('surveys')
        .update({ image_url: imageUrl })
        .eq('id', data.id);
    }

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kapak Fotoğrafı (isteğe bağlı)
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Anket kapak fotoğrafı"
                    className="h-48 w-full max-w-md rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-sm">Fotoğraf yükle</span>
                  </button>
                </>
              )}
            </div>
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
