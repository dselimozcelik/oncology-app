import { createClient } from '@/lib/supabase/server';
import { StudyForm } from '@/components/studies/study-form';

export default async function NewStudyPage() {
  const supabase = await createClient();
  const { data: surveys } = await supabase
    .from('surveys')
    .select('id, title')
    .eq('is_active', true)
    .order('title');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yeni Çalışma Oluştur</h1>
      <StudyForm surveys={surveys ?? []} />
    </div>
  );
}
