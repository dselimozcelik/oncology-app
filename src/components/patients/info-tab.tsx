'use client';

import { useState } from 'react';
import { Profile } from '@/lib/supabase/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const statusOptions = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' },
  { value: 'critical', label: 'Kritik' },
  { value: 'discharged', label: 'Taburcu' },
];

const genderOptions = [
  { value: '', label: 'Belirtilmemiş' },
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'other', label: 'Diğer' },
];

export function InfoTab({ patient }: { patient: Profile }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const conditionsRaw = form.get('conditions') as string;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.get('full_name') as string,
        date_of_birth: (form.get('date_of_birth') as string) || null,
        gender: (form.get('gender') as string) || null,
        phone: (form.get('phone') as string) || null,
        email: form.get('email') as string,
        conditions: conditionsRaw ? conditionsRaw.split(',').map((s) => s.trim()) : [],
        medical_notes: (form.get('medical_notes') as string) || null,
        status: form.get('status') as string,
      })
      .eq('id', patient.id);

    setSaving(false);
    if (error) {
      setMessage('Kaydetme hatası oluştu');
    } else {
      setMessage('Değişiklikler kaydedildi');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="full_name" label="Ad Soyad" name="full_name" defaultValue={patient.full_name} required />
        <Input id="email" label="E-posta" name="email" type="email" defaultValue={patient.email} required />
        <Input id="date_of_birth" label="Doğum Tarihi" name="date_of_birth" type="date" defaultValue={patient.date_of_birth ?? ''} />
        <Select id="gender" label="Cinsiyet" name="gender" options={genderOptions} defaultValue={patient.gender ?? ''} />
        <Input id="phone" label="Telefon" name="phone" defaultValue={patient.phone ?? ''} />
        <Select id="status" label="Durum" name="status" options={statusOptions} defaultValue={patient.status} />
      </div>

      <div>
        <Input
          id="conditions"
          label="Tanılar (virgülle ayırın)"
          name="conditions"
          defaultValue={patient.conditions.join(', ')}
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {patient.conditions.map((c) => (
            <Badge key={c} variant="info">{c}</Badge>
          ))}
        </div>
      </div>

      <Textarea
        id="medical_notes"
        label="Tıbbi Notlar"
        name="medical_notes"
        defaultValue={patient.medical_notes ?? ''}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </form>
  );
}
