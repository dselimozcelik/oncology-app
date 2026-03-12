'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteStudy } from '@/app/(dashboard)/studies/actions';
import { Trash2 } from 'lucide-react';

export function DeleteStudyButton({ studyId, studyName }: { studyId: string; studyName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await deleteStudy(studyId);
    if (result.error) { setLoading(false); return; }
    router.push('/studies');
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Çalışmayı Sil
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">Çalışmayı Sil</h2>
          <p className="text-sm text-gray-500 mt-1">
            <strong>{studyName}</strong> çalışmasını silmek istediğinize emin misiniz? Tüm dönemler ve hasta atamaları da silinecektir.
          </p>
        </DialogHeader>
        <DialogContent>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>İptal</Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
