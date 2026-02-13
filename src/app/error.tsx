'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button onClick={reset}>Tekrar Dene</Button>
      </div>
    </div>
  );
}
