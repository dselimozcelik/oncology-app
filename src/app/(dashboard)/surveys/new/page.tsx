import { SurveyForm } from '@/components/surveys/survey-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSurveyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/surveys" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Anket Oluştur</h1>
      </div>
      <SurveyForm />
    </div>
  );
}
