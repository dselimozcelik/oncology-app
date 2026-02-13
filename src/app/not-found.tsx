import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <p className="text-gray-500 mb-4">Sayfa bulunamadı</p>
        <Link href="/dashboard">
          <Button>Panele Dön</Button>
        </Link>
      </div>
    </div>
  );
}
