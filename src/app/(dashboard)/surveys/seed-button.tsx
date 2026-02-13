'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { seedSurveys } from './seed-action';

export function SeedSurveysButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSeed() {
    setLoading(true);
    const result = await seedSurveys();
    setLoading(false);

    if (result.success) {
      setDone(true);
    }
  }

  if (done) return null;

  return (
    <Button variant="secondary" onClick={handleSeed} disabled={loading}>
      <Database className="h-4 w-4" />
      {loading ? 'Yükleniyor...' : 'Hazır Anketleri Yükle'}
    </Button>
  );
}
