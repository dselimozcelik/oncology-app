'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' },
  { value: 'critical', label: 'Kritik' },
  { value: 'discharged', label: 'Taburcu' },
];

export function PatientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/patients?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Hasta ara..."
          className="pl-9"
          defaultValue={search}
          onChange={(e) => updateParams('search', e.target.value)}
        />
      </div>
      <Select
        options={statusOptions}
        value={status}
        onChange={(e) => updateParams('status', e.target.value)}
        className="w-full sm:w-48"
      />
    </div>
  );
}
