'use client';

import { useState } from 'react';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createPatient } from '@/app/(dashboard)/patients/actions';
import { UserPlus } from 'lucide-react';

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const result = await createPatient({
      username: fd.get('username') as string,
      password: fd.get('password') as string,
      full_name: fd.get('full_name') as string,
      date_of_birth: fd.get('date_of_birth') as string,
      gender: fd.get('gender') as string,
      phone: fd.get('phone') as string,
      conditions: fd.get('conditions') as string,
      medical_notes: fd.get('medical_notes') as string,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Hasta Ekle
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">Yeni Hasta Oluştur</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kullanıcı adı ve şifre ile hasta hesabı oluşturun.
          </p>
        </DialogHeader>

        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="username"
                name="username"
                label="Kullanıcı Adı"
                placeholder="hasta123"
                required
              />
              <Input
                id="password"
                name="password"
                label="Şifre"
                type="text"
                placeholder="Hastaya verilecek şifre"
                required
                minLength={6}
              />
            </div>

            <Input
              id="full_name"
              name="full_name"
              label="Ad Soyad"
              placeholder="Ahmet Yılmaz"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="date_of_birth"
                name="date_of_birth"
                label="Doğum Tarihi"
                type="date"
              />
              <Select
                id="gender"
                name="gender"
                label="Cinsiyet"
                options={[
                  { value: '', label: 'Seçiniz' },
                  { value: 'male', label: 'Erkek' },
                  { value: 'female', label: 'Kadın' },
                  { value: 'other', label: 'Diğer' },
                ]}
              />
            </div>

            <Input
              id="phone"
              name="phone"
              label="Telefon"
              placeholder="05XX XXX XX XX"
            />

            <Input
              id="conditions"
              name="conditions"
              label="Tanılar"
              placeholder="Diyabet, Hipertansiyon (virgülle ayırın)"
            />

            <Textarea
              id="medical_notes"
              name="medical_notes"
              label="Tıbbi Notlar"
              placeholder="Ek notlar..."
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
