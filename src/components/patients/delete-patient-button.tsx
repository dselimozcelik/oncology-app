'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deletePatient } from '@/app/(dashboard)/patients/actions';
import { Trash2 } from 'lucide-react';

export function DeletePatientButton({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError('');

    const result = await deletePatient(patientId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/patients');
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Hastayı Sil
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">Hastayı Sil</h2>
          <p className="text-sm text-gray-500 mt-1">
            <strong>{patientName}</strong> adlı hastayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
        </DialogHeader>

        <DialogContent>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
